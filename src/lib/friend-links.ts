import fs from "node:fs";
import path from "node:path";
import { getEntry } from "astro:content";
import { linkSchema, validateFriendLinkUrls, type FriendLink, type PageMeta } from "@/lib/content-schemas";

export { linkSchema, validateFriendLinkUrls };
export type { FriendLink };

export type FriendLinks = PageMeta;

/**
 * 读取友链页数据。
 *
 * 友链页与其余内容页统一放在 `src/content/pages/` 下，frontmatter 复用
 * `pageSchema` 并带上友链字段。条目缺失时返回空列表而不是抛错 —— 友链是可选
 * 内容，缺失不应让构建失败。
 *
 * 本地头像（以 `/` 开头）必须存在于 `public/`，避免线上出现破图；远程头像交给
 * 前端在加载失败时回退首字母块，这里不做校验。
 */
export async function getFriendLinks(): Promise<FriendLinks> {
  const entry = await getEntry("pages", "links");
  if (!entry) return { title: "链接", friendsTitle: "友情链接", links: [] };

  for (const link of entry.data.links) {
    if (link.avatar?.startsWith("/") && !fs.existsSync(path.join(process.cwd(), "public", link.avatar))) {
      throw new Error(`Friend link avatar not found: ${link.avatar}`);
    }
  }

  return entry.data;
}
