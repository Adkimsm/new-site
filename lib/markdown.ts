import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkHtml from "remark-html";
import rehypeSlug from "rehype-slug";
import { codeToHtml } from "shiki";

const entities: Record<string, string> = { "&amp;": "&", "&lt;": "<", "&gt;": ">", "&quot;": '"', "&#x27;": "'", "&#39;": "'" };

function decodeHtml(value: string) {
  return value.replace(/&amp;|&lt;|&gt;|&quot;|&#x27;|&#39;/g, (entity) => entities[entity]);
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
  const result = await unified().use(remarkParse).use(remarkGfm).use(remarkHtml, { allowDangerousHtml: false }).use(rehypeSlug).process(markdown);
  const html = await highlightCodeBlocks(result.toString());
  return html.replace(/<a href="(https?:\/\/[^" ]+)"/g, '<a target="_blank" rel="noopener noreferrer" href="$1"');
}
