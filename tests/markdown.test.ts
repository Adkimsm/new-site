import { describe, expect, it } from "vitest";
import { highlightCodeBlocks } from "@/lib/mdx/render";

describe("markdown code blocks", () => {
  it("highlights supported languages with Shiki", async () => {
    const html = await highlightCodeBlocks('<pre><code class="language-ts">const greeting: string = &#x27;你好&#x27;;</code></pre>');
    expect(html).toContain("shiki");
    expect(html).toContain("greeting");
    expect(html).toContain("--shiki-light");
  });

  it("falls back for unsupported languages", async () => {
    const html = await highlightCodeBlocks('<pre><code class="language-that-does-not-exist">plain code</code></pre>');
    expect(html).toContain("plain code");
    expect(html).toContain("<pre><code>");
  });
});
