import { getPosts } from "@/lib/content/posts";
import type { SearchPost } from "@/lib/search";

/** 构建期生成的静态搜索索引；只在浮层首次打开时由前端按需拉取。 */
export const dynamic = "force-static";

export function GET() {
  const posts: SearchPost[] = getPosts().map(({ slug, title, description, date, content, tags, wordCount }) => ({ slug, title, description, date, content, tags, wordCount }));
  return new Response(JSON.stringify(posts), { headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "public, max-age=3600" } });
}
