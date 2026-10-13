import { describe, expect, it } from "vitest";
import { countWords } from "@/lib/word-count";

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

  it("ignores MDX imports and JSX tags", () => {
    expect(countWords('import { siteConfig } from "@/lib/site-config";\n\n你好 <kbd>Ctrl</kbd>')).toBe(3);
  });
});
