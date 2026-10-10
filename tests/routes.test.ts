import { describe, expect, it } from "vitest";
import robots from "@/app/robots";
import sitemap from "@/app/sitemap";
import { siteConfig } from "@/lib/site-config";

describe("sitemap", () => {
  it("builds every URL from siteConfig.url", () => {
    const urls = sitemap().map((entry) => entry.url);
    expect(urls.length).toBeGreaterThan(0);
    expect(urls.every((url) => url.startsWith(siteConfig.url))).toBe(true);
    expect(urls).toContain(`${siteConfig.url}/about`);
  });

  it("includes each post with a lastModified date", () => {
    const posts = sitemap().filter((entry) => entry.url.includes("/posts/"));
    expect(posts.length).toBe(3);
    expect(posts.every((entry) => Boolean(entry.lastModified))).toBe(true);
  });
});

describe("robots", () => {
  it("advertises the sitemap on the configured domain", () => {
    expect(robots().sitemap).toBe(`${siteConfig.url}/sitemap.xml`);
  });
});
