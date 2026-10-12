import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { z } from "zod";
import { pageSchema } from "@/lib/content/pages";
import type { ContentExt } from "@/lib/mdx/load";

/** 单条友链：站点名与地址必填，头像与一句话介绍可选。 */
export const linkSchema = z.object({ name: z.string().min(1), url: z.string().url(), avatar: z.string().optional(), description: z.string().optional() });
export type FriendLink = z.infer<typeof linkSchema>;

/** 友链页 frontmatter：在通用内容页字段上追加友链区块标题与列表。 */
const schema = pageSchema.extend({
  friendsTitle: z.string().min(1).default("友情链接"),
  links: z.array(linkSchema).default([])
});
export type FriendLinks = z.infer<typeof schema> & { ext: ContentExt; content: string };

const file = path.join(process.cwd(), "content/pages/links.md");

/**
 * 读取友链页数据。
 *
 * 与其余内容页统一放在 `content/pages/` 下，frontmatter 复用 `pageSchema`
 * 再扩展友链字段。文件不存在时返回空列表而不是抛错 —— 友链是可选内容，缺失
 * 不应让构建失败。本地头像（以 `/` 开头）必须存在于 `public/`，避免线上出现
 * 破图；远程头像交给前端在加载失败时回退首字母块，这里不做校验。
 */
export function getFriendLinks(): FriendLinks {
  if (!fs.existsSync(file)) return { title: "链接", friendsTitle: "友情链接", links: [], ext: "md", content: "" };
  const parsed = matter(fs.readFileSync(file, "utf8"));
  const data = schema.parse(parsed.data);
  for (const link of data.links) {
    if (link.avatar?.startsWith("/") && !fs.existsSync(path.join(process.cwd(), "public", link.avatar))) throw new Error(`Friend link avatar not found: ${link.avatar}`);
  }
  return { ...data, ext: "md", content: parsed.content };
}

/** 检测重复的友链地址（同一站点只应出现一次）。 */
export function validateFriendLinkUrls(links: FriendLink[]) {
  const urls = links.map((link) => link.url);
  return new Set(urls).size === urls.length;
}
