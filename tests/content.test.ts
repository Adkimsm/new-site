import { describe, expect, it } from "vitest";
import { countWords, getPosts, groupPosts, validatePostSlugs } from "@/lib/content/posts";
describe("content", () => { it("loads valid posts sorted newest first", () => { const posts = getPosts(); expect(posts.length).toBe(7); expect(posts.every((post, index) => index === 0 || posts[index - 1].date >= post.date)).toBe(true); }); it("groups posts by year and month", () => { const groups = groupPosts(getPosts()); expect(groups["2026"]["09"]).toHaveLength(4); expect(groups["2026"]["08"]).toHaveLength(2); expect(groups["2026"]["07"]).toHaveLength(1); }); it("does not contain duplicate URLs", () => { expect(validatePostSlugs(getPosts())).toBe(true); }); });

describe("countWords", () => {
  it("counts CJK characters individually and Latin runs as words", () => {
    expect(countWords("你好世界 hello world")).toBe(6);
  });

  it("ignores fenced and inline code", () => {
    expect(countWords("正文\n\n```js\nconst a = 1;\n```\n\n`code`")).toBe(2);
  });

  it("ignores markdown markers but keeps link text", () => {
    expect(countWords("**粗体** [链接](https://example.com)")).toBe(4);
  });

  it("reports a realistic count for real Chinese posts", () => {
    const [first] = getPosts();
    expect(first.wordCount).toBeGreaterThan(10);
  });
});
