import { describe, expect, it } from "vitest";
import { markdownToHtml } from "@/lib/markdown";

describe("markdown code blocks", () => {
  it("highlights supported languages with Shiki", async () => {
    const html = await markdownToHtml("```ts\nconst greeting: string = '你好';\n```");
    expect(html).toContain("shiki");
    expect(html).toContain("greeting");
    expect(html).toContain("--shiki-light");
  });

  it("falls back for unsupported languages", async () => {
    const html = await markdownToHtml("```language-that-does-not-exist\nplain code\n```");
    expect(html).toContain("plain code");
    expect(html).toContain("<pre><code>");
  });
});

describe("raw HTML passthrough", () => {
  it("keeps inline HTML instead of stripping it to text", async () => {
    const html = await markdownToHtml("普通 <kbd>Ctrl</kbd>、<sub>下</sub>、<sup>上</sup>、<mark>高亮</mark>、<abbr title=\"World Health Organization\">WHO</abbr>。");
    expect(html).toContain("<kbd>Ctrl</kbd>");
    expect(html).toContain("<sub>下</sub>");
    expect(html).toContain("<sup>上</sup>");
    expect(html).toContain("<mark>高亮</mark>");
    expect(html).toContain('<abbr title="World Health Organization">WHO</abbr>');
  });

  it("keeps block HTML such as details/summary", async () => {
    const html = await markdownToHtml("<details>\n  <summary>点击展开</summary>\n\n  折叠内容。\n</details>\n");
    expect(html).toContain("<details>");
    expect(html).toContain("<summary>点击展开</summary>");
    expect(html).toContain("折叠内容。");
  });

  it("keeps footnote anchor ids in sync with their hrefs", async () => {
    const html = await markdownToHtml("脚注可以补充说明[^note]。\n\n[^note]: 这是脚注示例。\n");
    // sanitize 会给 id 再套一层 user-content- 前缀，而 href 只带一层，导致锚点对不上；
    // 关闭净化后两者都是单层前缀，必须保持一致。
    const href = html.match(/href="#(user-content-fn-note)"/)?.[1];
    expect(href).toBe("user-content-fn-note");
    expect(html).toContain('id="user-content-fn-note"');
    expect(html).not.toContain("user-content-user-content-");
  });
});
