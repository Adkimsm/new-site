import { getPosts } from "@/lib/content/posts";
import { markdownToHtml } from "@/lib/markdown";
import { siteConfig } from "@/lib/site-config";

function escapeXml(value: string) {
  return value.replace(/[<>&'"]/g, (character) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" })[character] ?? character);
}

export async function GET() {
  const items = await Promise.all(getPosts().map(async (post) => {
    const url = `${siteConfig.url}/posts/${post.slug}`;
    const content = await markdownToHtml(post.content);
    return `<item><title><![CDATA[${post.title}]]></title><description><![CDATA[${post.description}]]></description><content:encoded><![CDATA[${content}]]></content:encoded><link>${url}</link><guid isPermaLink="true">${url}</guid><pubDate>${new Date(`${post.date}T00:00:00Z`).toUTCString()}</pubDate><dc:creator>${escapeXml(siteConfig.author)}</dc:creator>${post.tags.map((tag) => `<category>${escapeXml(tag)}</category>`).join("")}</item>`;
  }));
  const xml = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:dc="http://purl.org/dc/elements/1.1/"><channel><title>${escapeXml(siteConfig.name)}</title><link>${siteConfig.url}</link><atom:link href="${siteConfig.url}/rss.xml" rel="self" type="application/rss+xml"/><description>${escapeXml(siteConfig.description)}</description><language>zh-CN</language>${items.join("")}</channel></rss>`;
  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8", "Cache-Control": "public, max-age=3600" } });
}
