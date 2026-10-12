import type { ComponentType } from "react";
import { codeToHtml } from "shiki";

/**
 * 把 React 元素渲染成静态 HTML 字符串。
 *
 * 用动态 import 载入 `react-dom/server`：App Router 的 RSC 转换会拦截对该模块
 * 的静态 import（「render or return the content directly as a Server Component」），
 * 但内容页需要 HTML 字符串来复用字符串版的后处理（shiki / 标题锚点 / 外链）。
 * 这里只在服务端构建期调用，不会进入客户端包。
 */
async function renderToHtml(node: React.ReactElement) {
  const { renderToStaticMarkup } = await import("react-dom/server");
  return renderToStaticMarkup(node);
}

const entities: Record<string, string> = { "&amp;": "&", "&lt;": "<", "&gt;": ">", "&quot;": '"', "&#x27;": "'", "&#39;": "'" };

function decodeHtml(value: string) {
  return value.replace(/&amp;|&lt;|&gt;|&quot;|&#x27;|&#39;/g, (entity) => entities[entity]);
}

/**
 * 生成标题锚点 id：保留中英文与数字，去掉标点，空白转连字符。
 * 中文标题会得到中文 id（如 #为什么写作），与浏览器地址栏一致。
 */
function slugifyHeading(value: string) {
  return value
    .replace(/<[^>]*>/g, "")
    .trim()
    .toLocaleLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\p{L}\p{N}-]/gu, "")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * 给正文的 h2 / h3 补上 id，供文章目录锚点与滚动高亮使用。
 *
 * 只匹配「没有属性」的 h2 / h3，因此不会覆盖 GFM 脚注小节自带的带属性标题
 * （`<h2 id="footnote-label">`）。React 会在相邻文本节点间插入 `<!-- -->`
 * 分隔注释，`renderContent` 会先把它清掉，避免干扰这里的匹配与最终输出。
 */
export function addHeadingIds(html: string) {
  const used = new Map<string, number>();

  return html.replace(/<h([23])>([\s\S]*?)<\/h\1>/g, (match, level: string, inner: string) => {
    const base = slugifyHeading(inner) || "section";
    const seen = used.get(base) ?? 0;
    used.set(base, seen + 1);
    return `<h${level} id="${seen === 0 ? base : `${base}-${seen}`}">${inner}</h${level}>`;
  });
}

/**
 * 用 Shiki 给代码块上双主题高亮，替换掉 React 输出的 `<pre><code>`。
 *
 * React 会把 `className="language-x"` 渲染成 `class="language-x"`，且会转义
 * 代码里的 `&`/`<`/`>`/`"`/`'`，因此这里先 decode 再交给 Shiki；不支持的语言
 * 回退为原始代码块。
 */
export async function highlightCodeBlocks(html: string) {
  const pattern = /<pre><code(?: class="language-([\w-]+)")?>([\s\S]*?)<\/code><\/pre>/g;
  const blocks = [...html.matchAll(pattern)];
  let highlighted = html;
  for (const block of blocks) {
    const language = block[1] ?? "text";
    const source = decodeHtml(block[2]);
    let replacement: string;
    try {
      replacement = await codeToHtml(source, { lang: language, themes: { light: "github-light", dark: "github-dark" }, defaultColor: false });
    } catch {
      replacement = `<pre><code>${block[2]}</code></pre>`;
    }
    highlighted = highlighted.replace(block[0], replacement);
  }
  return highlighted;
}

/** 正文里的站外链接补上 target/rel，站内锚点与相对链接不动。 */
export function hardenExternalLinks(html: string) {
  return html.replace(/<a href="(https?:\/\/[^" ]+)"/g, '<a target="_blank" rel="noopener noreferrer" href="$1"');
}

/** React 用空注释分隔相邻文本节点，对 HTML 输出没有意义，清掉以免污染正文。 */
function stripTextSeparators(html: string) {
  return html.replace(/<!--\s*-->/g, "");
}

/**
 * 把编译后的 MDX 组件渲染成可交给 `ReadingTools` / 内容页的 HTML 字符串。
 *
 * 为什么绕一圈字符串：站点的排版、目录、代码高亮与复制按钮都是围绕 HTML
 * 字符串调好的（shiki 的字符串 style、标题 id 后处理、外链正则），保留这条
 * 后处理链路可以让样式与交互完全不变，只是把「markdown → HTML」的前半段从
 * 手写 unified 管线换成了 MDX 编译器。
 */
export async function renderContent(Content: ComponentType) {
  const html = stripTextSeparators(await renderToHtml(<Content />));
  return hardenExternalLinks(addHeadingIds(await highlightCodeBlocks(html)));
}
