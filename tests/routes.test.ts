import { describe, expect, it } from "vitest";
import robots from "@/app/robots";
import sitemap from "@/app/sitemap";
import { GET as rss } from "@/app/rss.xml/route";
import { getPosts } from "@/lib/content/posts";
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
    expect(posts.length).toBe(getPosts().length);
    expect(posts.every((entry) => Boolean(entry.lastModified))).toBe(true);
  });
});

describe("rss", () => {
  it("lists every post with a description but without the full content", async () => {
    const xml = await rss().text();
    expect(xml).toContain(`<title><![CDATA[${getPosts()[0].title}]]></title>`);
    expect(xml).toContain("<description>");
    expect(xml).not.toContain("<content:encoded>");
  });
});

describe("robots", () => {
  it("advertises the sitemap on the configured domain", () => {
    expect(robots().sitemap).toBe(`${siteConfig.url}/sitemap.xml`);
  });
});
