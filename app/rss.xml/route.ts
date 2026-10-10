import { getPosts } from "@/lib/content/posts";
import { siteConfig } from "@/lib/site-config";

/** 构建期生成静态 feed；避免请求期再读文件系统。 */
export const dynamic = "force-static";

function escapeXml(value: string) {
  return value.replace(/[<>&'"]/g, (character) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" })[character] ?? character);
}

/**
 * RSS 只输出标题、摘要与链接，不再内嵌全文。
 *
 * 早期版本把每篇文章渲染成 HTML 放进 `<content:encoded>`，feed 会随文章数量
 * 线性变胖；这里改为只给 `<description>` 摘要，读者点击进入站点阅读。
 */
export function GET() {
  const items = getPosts().map((post) => {
    const url = `${siteConfig.url}/posts/${post.slug}`;
    return `<item><title><![CDATA[${post.title}]]></title><description><![CDATA[${post.description}]]></description><link>${url}</link><guid isPermaLink="true">${url}</guid><pubDate>${new Date(`${post.date}T00:00:00Z`).toUTCString()}</pubDate><dc:creator>${escapeXml(siteConfig.author)}</dc:creator>${post.tags.map((tag) => `<category>${escapeXml(tag)}</category>`).join("")}</item>`;
  });
  const xml = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/"><channel><title>${escapeXml(siteConfig.name)}</title><link>${siteConfig.url}</link><atom:link href="${siteConfig.url}/rss.xml" rel="self" type="application/rss+xml"/><description>${escapeXml(siteConfig.description)}</description><language>zh-CN</language>${items.join("")}</channel></rss>`;
  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8", "Cache-Control": "public, max-age=3600" } });
}
