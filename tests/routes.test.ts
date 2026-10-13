import { describe, expect, it } from "vitest";
import { GET as robotsGet } from "@/pages/robots.txt";
import { buildRssXml, buildSitemapXml, SITEMAP_PAGES } from "@/lib/feed";
import { siteConfig } from "@/lib/site-config";
import { post } from "./helpers";

const posts = [
  post({ slug: "a", title: "第一篇", date: "2026-09-05", description: "摘要一", tags: ["标签"] }),
  post({ slug: "b", title: "第二篇", date: "2026-08-18", updated: "2026-08-20", description: "摘要二" })
];

describe("sitemap", () => {
  it("builds every URL from siteConfig.url", () => {
    const xml = buildSitemapXml(posts);
    for (const path of SITEMAP_PAGES) {
      expect(xml).toContain(`<loc>${siteConfig.url}${path}</loc>`);
    }
  });

  it("includes each post with a lastmod date", () => {
    const xml = buildSitemapXml(posts);
    expect(xml).toContain(`<loc>${siteConfig.url}/posts/a</loc><lastmod>2026-09-05</lastmod>`);
    // updated 优先于 date
    expect(xml).toContain(`<loc>${siteConfig.url}/posts/b</loc><lastmod>2026-08-20</lastmod>`);
  });
});

describe("rss", () => {
  it("lists every post with a description but without the full content", () => {
    const xml = buildRssXml(posts);
    expect(xml).toContain(`<title><![CDATA[${posts[0].title}]]></title>`);
    expect(xml).toContain("<description>");
    expect(xml).toContain(`<category>标签</category>`);
    expect(xml).not.toContain("<content:encoded>");
  });
});

describe("robots", () => {
  it("advertises the sitemap on the configured domain", async () => {
    const body = await robotsGet().text();
    expect(body).toContain("User-agent: *");
    expect(body).toContain(`Sitemap: ${siteConfig.url}/sitemap.xml`);
  });
});
