import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkHtml from "remark-html";
import { codeToHtml } from "shiki";

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
 * 说明：原先链式里的 rehype-slug 实际是空操作 —— remark-html 在 remark 阶段
 * 就把语法树编译成了字符串，后续的 rehype 插件拿不到 hast，因此标题从来没有
 * id，目录只能显示 GFM 脚注小节自带的那个标题。这里用与
 * highlightCodeBlocks 同样的后处理方式补齐，不引入新依赖。
 *
 * 只匹配「没有属性」的 h2 / h3，因此不会覆盖 GFM 脚注小节自带的带属性标题。
 */
function addHeadingIds(html: string) {
  const used = new Map<string, number>();

  return html.replace(/<h([23])>([\s\S]*?)<\/h\1>/g, (match, level: string, inner: string) => {
    const base = slugifyHeading(inner) || "section";
    const seen = used.get(base) ?? 0;
    used.set(base, seen + 1);
    return `<h${level} id="${seen === 0 ? base : `${base}-${seen}`}">${inner}</h${level}>`;
  });
}

async function highlightCodeBlocks(html: string) {
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

export async function markdownToHtml(markdown: string) {
  const result = await unified().use(remarkParse).use(remarkGfm).use(remarkHtml, { allowDangerousHtml: false }).process(markdown);
  const html = await highlightCodeBlocks(result.toString());
  return addHeadingIds(html).replace(/<a href="(https?:\/\/[^" ]+)"/g, '<a target="_blank" rel="noopener noreferrer" href="$1"');
}
