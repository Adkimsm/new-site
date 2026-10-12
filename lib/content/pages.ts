import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { z } from "zod";
import type { ContentExt } from "@/lib/mdx/load";

/** 内容页 frontmatter：`title` 必填，其余可选。 */
export const pageSchema = z.object({
  title: z.string().min(1),
  /** 页面 h1；省略时回退到 `title`（如「关于」→「关于我」）。 */
  heading: z.string().min(1).optional(),
  /** 页首 eyebrow 标签行（如 `About`）。 */
  eyebrow: z.string().min(1).optional(),
  /** 覆盖 metadata description；省略时用站点默认描述。 */
  description: z.string().min(1).optional()
});
export type PageMeta = z.infer<typeof pageSchema>;
export type PageFile = PageMeta & { ext: ContentExt };

const dir = path.join(process.cwd(), "content/pages");

/**
 * 解析内容页的 frontmatter 元数据。
 *
 * 与 posts/links 同一套模式：gray-matter 解析 + zod 校验。内容页是站点结构的
 * 一部分，缺失或字段非法都应让构建失败（不像友链可以缺省）。同一 slug 同时
 * 存在 `.md` 与 `.mdx` 时也直接报错，避免正文扩展名与元数据来源不一致。
 */
export function getPageMeta(slug: string): PageFile {
  const md = path.join(dir, `${slug}.md`);
  const mdx = path.join(dir, `${slug}.mdx`);
  const hasMd = fs.existsSync(md);
  const hasMdx = fs.existsSync(mdx);
  if (hasMd && hasMdx) throw new Error(`Page has both .md and .mdx: ${slug}`);
  if (!hasMd && !hasMdx) throw new Error(`Page not found: content/pages/${slug}.{md,mdx}`);
  const ext: ContentExt = hasMdx ? "mdx" : "md";
  const parsed = matter(fs.readFileSync(hasMdx ? mdx : md, "utf8"));
  return { ...pageSchema.parse(parsed.data), ext };
}
