import { getPosts } from "@/lib/posts";
import type { SearchPost } from "@/lib/search";

/** 构建期生成的静态搜索索引；只在浮层首次打开时由前端按需拉取。 */
export const prerender = true;

export async function GET() {
  const posts: SearchPost[] = (await getPosts()).map(({ slug, title, description, date, body, tags, wordCount }) => ({ slug, title, description, date, content: body, tags, wordCount }));
  return new Response(JSON.stringify(posts), { headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "public, max-age=3600" } });
}
