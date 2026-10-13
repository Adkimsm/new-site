import { z } from "astro/zod";

/**
 * 内容集合的 zod schema（Zod 4，经 `astro/zod` 导出）。
 *
 * 独立于 `src/content.config.ts` 存在，是为了让 schema 能在 node 环境的 vitest
 * 里直接 `safeParse` —— `astro:content` 是构建期虚拟模块，测试环境无法解析，
 * 而 `astro/zod` 是真实模块，两边都能用。`content.config.ts` 只负责把 schema
 * 绑定到 loader。
 */

/** 文章 frontmatter。 */
export const postSchema = z.object({
  title: z.string().min(1),
  date: z.iso.date(),
  updated: z.iso.date().optional(),
  description: z.string().min(1),
  tags: z.array(z.string()).default([]),
  featured: z.boolean().default(false),
  canonical: z.url().optional(),
  cover: z.string().optional(),
  draft: z.boolean().default(false),
  series: z.string().min(1).optional(),
  seriesOrder: z.number().int().optional()
});

export type PostData = z.infer<typeof postSchema>;

/** 单条友链：站点名与地址必填，头像与一句话介绍可选。 */
export const linkSchema = z.object({
  name: z.string().min(1),
  url: z.url(),
  avatar: z.string().optional(),
  description: z.string().optional()
});

export type FriendLink = z.infer<typeof linkSchema>;

/**
 * 内容页 frontmatter：`title` 必填，其余可选。
 *
 * `friendsTitle` / `links` 是 `/links` 页专属字段，其余页面留空；带默认值是为了
 * 让同一份 schema 同时校验普通内容页与友链页。
 */
export const pageSchema = z.object({
  title: z.string().min(1),
  /** 页面 h1；省略时回退到 `title`（如「关于」→「关于我」）。 */
  heading: z.string().min(1).optional(),
  /** 页首 eyebrow 标签行（如 `About`）。 */
  eyebrow: z.string().min(1).optional(),
  /** 覆盖 metadata description；省略时用站点默认描述。 */
  description: z.string().min(1).optional(),
  friendsTitle: z.string().min(1).default("友情链接"),
  links: z.array(linkSchema).default([])
});

export type PageMeta = z.infer<typeof pageSchema>;

/** 检测重复的友链地址（同一站点只应出现一次）。 */
export function validateFriendLinkUrls(links: FriendLink[]) {
  const urls = links.map((link) => link.url);
  return new Set(urls).size === urls.length;
}
