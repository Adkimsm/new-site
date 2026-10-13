import type { Post } from "@/lib/post-utils";
import { siteConfig } from "@/lib/site-config";

/**
 * RSS / sitemap 的纯构造函数。
 *
 * 从端点里抽出：端点只负责 `getPosts()` + 调用这里的函数，XML 拼装是纯逻辑，
 * 因此可以在 node 环境的 vitest 里直接断言（`astro:content` 是构建期虚拟模块，
 * 测试环境无法解析，端点本身不适合直接单测）。
 */

export function escapeXml(value: string) {
  return value.replace(/[<>&'"]/g, (character) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" })[character] ?? character);
}

/**
 * RSS 只输出标题、摘要与链接，不再内嵌全文。
 *
 * 早期版本把每篇文章渲染成 HTML 放进 `<content:encoded>`，feed 会随文章数量
 * 线性变胖；这里改为只给 `<description>` 摘要，读者点击进入站点阅读。
 */
export function buildRssXml(posts: Post[]) {
  const items = posts.map((post) => {
    const url = `${siteConfig.url}/posts/${post.slug}`;
    return `<item><title><![CDATA[${post.title}]]></title><description><![CDATA[${post.description}]]></description><link>${url}</link><guid isPermaLink="true">${url}</guid><pubDate>${new Date(`${post.date}T00:00:00Z`).toUTCString()}</pubDate><dc:creator>${escapeXml(siteConfig.author)}</dc:creator>${post.tags.map((tag) => `<category>${escapeXml(tag)}</category>`).join("")}</item>`;
  });
  return `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/"><channel><title>${escapeXml(siteConfig.name)}</title><link>${siteConfig.url}</link><atom:link href="${siteConfig.url}/rss.xml" rel="self" type="application/rss+xml"/><description>${escapeXml(siteConfig.description)}</description><language>zh-CN</language>${items.join("")}</channel></rss>`;
}

/** 站点固定页面（按 URL 顺序），首页为空字符串。 */
export const SITEMAP_PAGES = ["", "/posts", "/about", "/links", "/privacy", "/copyright", "/disclaimer"];

export function buildSitemapXml(posts: Post[]) {
  const base = siteConfig.url;
  const urls = [
    ...SITEMAP_PAGES.map((path) => `<url><loc>${base}${path}</loc></url>`),
    ...posts.map((post) => `<url><loc>${base}/posts/${post.slug}</loc><lastmod>${post.updated ?? post.date}</lastmod></url>`)
  ];
  return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.join("")}</urlset>`;
}

/** robots.txt 正文。 */
export function buildRobotsTxt() {
  return `User-agent: *\nAllow: /\n\nSitemap: ${siteConfig.url}/sitemap.xml\n`;
}
