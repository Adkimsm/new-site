import fs from "node:fs";
import path from "node:path";
import { getCollection, type CollectionEntry } from "astro:content";
import { countWords } from "@/lib/word-count";
import { filterPublished, type Post } from "@/lib/post-utils";

export type PostEntry = CollectionEntry<"posts">;
export type { Post };

// 纯函数从 post-utils 透出，页面只需从 "@/lib/posts" 一处导入。
export { filterPublished, getSeriesPosts, groupPosts, validatePostSlugs } from "@/lib/post-utils";

/**
 * 读取全部（已过滤）文章，按日期倒序，附带 slug / 字数 / 原文。
 *
 * 正文支持 `.md` 与 `.mdx` 两种后缀，二者共用同一套 frontmatter schema 与
 * Astro 的渲染管线。`slug` 取 `entry.id`，由 content.config.ts 的 `generateId`
 * 保证等于「去掉扩展名的文件名」，因此 URL 与迁移前一致。
 *
 * 封面存在性校验：frontmatter 里的站内封面（以 `/` 开头）必须存在于 `public/`，
 * 否则构建失败，避免线上破图。原 `getPosts` 里的 `fs.existsSync` 校验保留于此，
 * 所有输出（页面 / RSS / sitemap / 搜索索引）都会经过这里。
 */
export async function getPosts(isProd = import.meta.env.PROD): Promise<Post[]> {
  const entries = filterPublished(await getCollection("posts"), isProd);
  const posts = entries
    .map((entry) => ({
      ...entry.data,
      slug: entry.id,
      body: entry.body ?? "",
      wordCount: countWords(entry.body ?? "")
    }))
    .sort((a, b) => b.date.localeCompare(a.date));

  for (const post of posts) {
    if (post.cover?.startsWith("/") && !fs.existsSync(path.join(process.cwd(), "public", post.cover))) {
      throw new Error(`Cover image not found: ${post.cover}`);
    }
  }

  return posts;
}
