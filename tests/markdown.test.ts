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
