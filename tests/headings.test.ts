import { describe, expect, it } from "vitest";
import { addHeadingIds, hardenExternalLinks } from "@/lib/mdx/render";

describe("heading anchors", () => {
  it("gives h2 and h3 ids so the article TOC has real targets", () => {
    const html = addHeadingIds("<h2>为什么写作</h2><p>正文。</p><h3>清单</h3>");
    expect(html).toContain('<h2 id="为什么写作">');
    expect(html).toContain('<h3 id="清单">');
  });

  it("deduplicates repeated headings", () => {
    const html = addHeadingIds("<h2>说明</h2><h2>说明</h2>");
    expect(html).toContain('<h2 id="说明">');
    expect(html).toContain('<h2 id="说明-1">');
  });

  it("strips punctuation and inline markup from the slug", () => {
    const html = addHeadingIds("<h2>数据表（一）</h2><h2>带<strong>强调</strong>的标题</h2>");
    expect(html).not.toContain('id="数据表（一）"');
    expect(html).toContain('<h2 id="数据表一">');
    expect(html).toContain('<h2 id="带强调的标题">');
  });

  it("does not clobber a heading that already carries attributes", () => {
    // GFM 脚注小节的标题自带 id，必须原样保留，否则锚点会失效。
    expect(addHeadingIds('<h2 id="footnote-label">Footnotes</h2>')).toBe('<h2 id="footnote-label">Footnotes</h2>');
  });
});

describe("external link hardening", () => {
  it("adds target/rel to external links only", () => {
    const external = hardenExternalLinks('<a href="https://example.com/page">站点</a>');
    expect(external).toContain('target="_blank"');
    expect(external).toContain('rel="noopener noreferrer"');
    expect(hardenExternalLinks('<a href="#note">锚点</a>')).toBe('<a href="#note">锚点</a>');
    expect(hardenExternalLinks('<a href="/about">站内</a>')).toBe('<a href="/about">站内</a>');
  });
});
