import { describe, expect, it } from "vitest";
import { getFriendLinks, linkSchema, validateFriendLinkUrls } from "@/lib/content/links";

describe("friend links", () => {
  it("parses content/pages/links.md into a validated shape", () => {
    const { title, friendsTitle, links } = getFriendLinks();
    expect(title.length).toBeGreaterThan(0);
    expect(friendsTitle.length).toBeGreaterThan(0);
    expect(Array.isArray(links)).toBe(true);
    for (const link of links) {
      expect(link.name.length).toBeGreaterThan(0);
      expect(() => new URL(link.url)).not.toThrow();
    }
  });

  it("rejects a link without a valid URL", () => {
    expect(linkSchema.safeParse({ name: "示例", url: "not-a-url" }).success).toBe(false);
    expect(linkSchema.safeParse({ name: "示例", url: "https://example.com" }).success).toBe(true);
  });

  it("flags duplicate URLs", () => {
    const link = { name: "示例", url: "https://example.com" };
    expect(validateFriendLinkUrls([link])).toBe(true);
    expect(validateFriendLinkUrls([link, link])).toBe(false);
  });
});
