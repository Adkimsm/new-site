import { describe, expect, it } from "vitest";
import { evaluate } from "@mdx-js/mdx";
import * as runtime from "react/jsx-runtime";
import remarkGfm from "remark-gfm";
import { renderContent } from "@/lib/mdx/render";

/** 用真实 MDX 编译器 + 站点后处理渲染一段内容，覆盖 md/mdx 两种格式。 */
async function render(source: string, format: "md" | "mdx" = "mdx") {
  const { default: Content } = await evaluate(source, { ...runtime, format, remarkPlugins: [remarkGfm] });
  return renderContent(Content);
}

describe("mdx rendering pipeline", () => {
  it("keeps inline and block HTML in .mdx", async () => {
    const html = await render("普通 <kbd>Ctrl</kbd> 与 <details><summary>展开</summary>内容</details>。");
    expect(html).toContain("<kbd>Ctrl</kbd>");
    expect(html).toContain("<details>");
    expect(html).toContain("内容");
  });

  it("drops raw HTML when the format is plain markdown", async () => {
    const html = await render("普通 <kbd>Ctrl</kbd>。", "md");
    expect(html).not.toContain("<kbd>");
    expect(html).toContain("Ctrl");
  });

  it("highlights fenced code blocks", async () => {
    const html = await render("```ts\nconst greeting: string = '你好';\n```");
    expect(html).toContain("shiki");
    expect(html).toContain("--shiki-light");
  });

  it("adds heading ids and hardens external links", async () => {
    const html = await render("## 为什么写作\n\n参考 [站点](https://example.com/page)。");
    expect(html).toContain('<h2 id="为什么写作">');
    expect(html).toContain('target="_blank"');
    expect(html).toContain('rel="noopener noreferrer"');
  });

  it("keeps GFM footnote ids intact", async () => {
    const html = await render("脚注可以补充说明[^note]。\n\n[^note]: 这是脚注示例。");
    expect(html).toContain('id="footnote-label"');
  });
});
