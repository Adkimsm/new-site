import { describe, expect, it } from "vitest";
import { SEARCH_RESULT_LIMIT, getSnippet, highlight, searchPosts, type SearchPost } from "@/lib/search";

const post = (overrides: Partial<SearchPost> & { slug: string }): SearchPost => ({
  title: "默认标题",
  description: "默认摘要",
  date: "2026-08-30",
  content: "默认正文内容",
  tags: [],
  wordCount: 100,
  ...overrides
});

describe("searchPosts", () => {
  const posts = [
    post({ slug: "a", title: "静态搜索实现", tags: ["Next.js"] }),
    post({ slug: "b", title: "阅读笔记", content: "关于设计与写作的思考" }),
    post({ slug: "c", title: "无关文章", content: "完全不同的内容" })
  ];

  it("returns nothing for an empty or whitespace query", () => {
    expect(searchPosts(posts, "")).toHaveLength(0);
    expect(searchPosts(posts, "   ")).toHaveLength(0);
  });

  it("matches title, content and tags case-insensitively", () => {
    expect(searchPosts(posts, "静态").map((p) => p.slug)).toEqual(["a"]);
    expect(searchPosts(posts, "设计").map((p) => p.slug)).toEqual(["b"]);
    expect(searchPosts(posts, "next.js").map((p) => p.slug)).toEqual(["a"]);
  });

  it("caps the number of results", () => {
    const many = Array.from({ length: SEARCH_RESULT_LIMIT + 5 }, (_, index) => post({ slug: `p${index}`, content: "共同关键词" }));
    expect(searchPosts(many, "共同关键词")).toHaveLength(SEARCH_RESULT_LIMIT);
  });
});

describe("highlight", () => {
  it("wraps matched terms in mark tags", () => {
    expect(highlight("静态搜索", "搜索")).toBe("静态<mark>搜索</mark>");
  });

  it("treats the query as literal text, not a pattern", () => {
    expect(highlight("a.b", "a.")).toBe("<mark>a.</mark>b");
  });

  it("returns the text unchanged for an empty query", () => {
    expect(highlight("原文", "  ")).toBe("原文");
  });
});

describe("getSnippet", () => {
  it("centers the snippet on the first matched term", () => {
    const target = post({ slug: "x", description: "", content: "前言".repeat(60) + "命中词" + "后记".repeat(60) });
    const snippet = getSnippet(target, "命中词");
    expect(snippet).toContain("命中词");
    expect(snippet.startsWith("…")).toBe(true);
  });
});
