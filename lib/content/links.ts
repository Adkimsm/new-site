import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { z } from "zod";

/** 单条友链：站点名与地址必填，头像与一句话介绍可选。 */
export const linkSchema = z.object({ name: z.string().min(1), url: z.string().url(), avatar: z.string().optional(), description: z.string().optional() });
export type FriendLink = z.infer<typeof linkSchema>;
export type FriendLinks = { title: string; links: FriendLink[]; content: string };

const schema = z.object({ title: z.string().min(1).default("友情链接"), links: z.array(linkSchema).default([]) });
const file = path.join(process.cwd(), "content/links.md");

/**
 * 读取友链页数据。
 *
 * 与 `lib/content/posts.ts` 同一套模式：gray-matter 解析 frontmatter，zod 校验。
 * 文件不存在时返回空列表而不是抛错 —— 友链是可选内容，缺失不应让构建失败。
 * 本地头像（以 `/` 开头）必须存在于 `public/`，避免线上出现破图；远程头像
 * 交给前端在加载失败时回退首字母块，这里不做校验。
 */
export function getFriendLinks(): FriendLinks {
  if (!fs.existsSync(file)) return { title: "友情链接", links: [], content: "" };
  const parsed = matter(fs.readFileSync(file, "utf8"));
  const data = schema.parse(parsed.data);
  for (const link of data.links) {
    if (link.avatar?.startsWith("/") && !fs.existsSync(path.join(process.cwd(), "public", link.avatar))) throw new Error(`Friend link avatar not found: ${link.avatar}`);
  }
  return { ...data, content: parsed.content };
}

/** 检测重复的友链地址（同一站点只应出现一次）。 */
export function validateFriendLinkUrls(links: FriendLink[]) {
  const urls = links.map((link) => link.url);
  return new Set(urls).size === urls.length;
}
