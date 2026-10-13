import { getPosts } from "@/lib/posts";
import { buildSitemapXml } from "@/lib/feed";

/**
 * 自定义 sitemap 端点。
 *
 * 刻意不用 `@astrojs/sitemap`：那个集成会产出 `/sitemap-index.xml` + `/sitemap-0.xml`，
 * 与站点既有约定（`/sitemap.xml`）和 robots 里的声明不符。这里手工拼 XML，
 * 保持 URL 与结构不变。
 */
export const prerender = true;

export async function GET() {
  return new Response(buildSitemapXml(await getPosts()), {
    headers: { "Content-Type": "application/xml; charset=utf-8" }
  });
}
