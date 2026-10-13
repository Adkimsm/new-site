import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { pageSchema, postSchema } from "@/lib/content-schemas";

/**
 * 内容集合定义。
 *
 * schema 放在 `src/lib/content-schemas.ts`（可被 vitest 直接测），这里只做
 * 「loader + schema」的绑定。
 */

const posts = defineCollection({
  loader: glob({
    base: "./src/content/posts",
    pattern: "**/*.{md,mdx}",
    // 保持「文件名即 URL」：glob loader 默认会把 id 转成 slug，这里只去掉扩展名，
    // 确保 `/posts/{filename}` 与迁移前完全一致。
    generateId: ({ entry }) => entry.replace(/\.(md|mdx)$/, "")
  }),
  schema: postSchema
});

const pages = defineCollection({
  loader: glob({ base: "./src/content/pages", pattern: "**/*.{md,mdx}" }),
  schema: pageSchema
});

export const collections = { posts, pages };
