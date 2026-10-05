import { describe, expect, it } from "vitest";
import { markdownToHtml } from "@/lib/markdown";

describe("heading anchors", () => {
  it("gives h2 and h3 ids so the article TOC has real targets", async () => {
    const html = await markdownToHtml("## 为什么写作\n\n正文。\n\n### 清单\n");
    expect(html).toContain('<h2 id="为什么写作">');
    expect(html).toContain('<h3 id="清单">');
  });

  it("deduplicates repeated headings", async () => {
    const html = await markdownToHtml("## 说明\n\n## 说明\n");
    expect(html).toContain('<h2 id="说明">');
    expect(html).toContain('<h2 id="说明-1">');
  });

  it("strips punctuation and inline markup from the slug", async () => {
    const html = await markdownToHtml("## 数据表（一）\n\n## 带**强调**的标题\n");
    expect(html).not.toContain('id="数据表（一）"');
    expect(html).toContain('<h2 id="数据表一">');
    expect(html).toContain('<h2 id="带强调的标题">');
  });

  it("does not clobber the footnote section heading from GFM", async () => {
    const html = await markdownToHtml("脚注可以补充说明[^note]。\n\n[^note]: 这是脚注示例。\n");
    expect(html).toContain('id="user-content-footnote-label"');
  });

  it("leaves existing external-link hardening intact", async () => {
    const html = await markdownToHtml("参考 [站点](https://example.com/page)。\n");
    expect(html).toContain('target="_blank"');
    expect(html).toContain('rel="noopener noreferrer"');
  });
});
