import { getPosts } from "@/lib/posts";
import { buildRssXml } from "@/lib/feed";

/** 构建期生成静态 feed；静态输出下默认即预渲染。 */
export const prerender = true;

export async function GET() {
  return new Response(buildRssXml(await getPosts()), {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8", "Cache-Control": "public, max-age=3600" }
  });
}
