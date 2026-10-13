import { describe, expect, it } from "vitest";
import { linkSchema, pageSchema, validateFriendLinkUrls } from "@/lib/content-schemas";

describe("friend links", () => {
  it("rejects a link without a valid URL", () => {
    expect(linkSchema.safeParse({ name: "示例", url: "not-a-url" }).success).toBe(false);
    expect(linkSchema.safeParse({ name: "示例", url: "https://example.com" }).success).toBe(true);
  });

  it("requires a name", () => {
    expect(linkSchema.safeParse({ name: "", url: "https://example.com" }).success).toBe(false);
  });

  it("accepts the optional avatar and description", () => {
    const parsed = linkSchema.safeParse({ name: "示例", url: "https://example.com", avatar: "/images/x.png", description: "一句话" });
    expect(parsed.success).toBe(true);
  });

  it("flags duplicate URLs", () => {
    const link = { name: "示例", url: "https://example.com" };
    expect(validateFriendLinkUrls([link])).toBe(true);
    expect(validateFriendLinkUrls([link, link])).toBe(false);
  });
});

describe("links page frontmatter", () => {
  it("defaults friendsTitle and links on the shared page schema", () => {
    const parsed = pageSchema.parse({ title: "链接" });
    expect(parsed.friendsTitle).toBe("友情链接");
    expect(parsed.links).toEqual([]);
  });

  it("parses a links list", () => {
    const parsed = pageSchema.parse({ title: "链接", links: [{ name: "示例", url: "https://example.com" }] });
    expect(parsed.links).toHaveLength(1);
    expect(parsed.links[0].name).toBe("示例");
  });
});
