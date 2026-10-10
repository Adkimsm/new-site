import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { z } from "zod";

const schema = z.object({ title: z.string().min(1), date: z.string().date(), updated: z.string().date().optional(), description: z.string().min(1), tags: z.array(z.string()).default([]), featured: z.boolean().default(false), canonical: z.string().url().optional(), cover: z.string().optional(), draft: z.boolean().default(false), series: z.string().min(1).optional(), seriesOrder: z.number().int().optional() });
export type Post = z.infer<typeof schema> & { slug: string; content: string; wordCount: number };
const dir = path.join(process.cwd(), "content/posts");

/**
 * 统计正文字数：CJK 逐字计，拉丁字母与数字按词计。
 *
 * 不能再用 `split(/\s+/)` —— 中文正文没有空格，整段只会算成 1。这里先剔掉
 * 围栏代码块、行内代码与 Markdown 标记，避免把语法算进字数，再分别累加
 * CJK 字符数与拉丁词数。
 */
export function countWords(markdown: string) {
  const text = markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]*`/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/^\s{0,3}#{1,6}\s+/gm, " ")
    .replace(/^\s{0,3}>\s?/gm, " ")
    .replace(/[*_~]/g, " ");
  const cjk = text.match(/[\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff]/g)?.length ?? 0;
  const latin = text.replace(/[\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff]/g, " ").match(/[A-Za-z0-9]+/g)?.length ?? 0;
  return cjk + latin;
}

/**
 * 读取并解析全部文章。
 *
 * 草稿（`draft: true`）只在开发环境可见：`next dev` 便于本地预览，生产构建
 * （含 Vercel）会整体过滤掉。由于 sitemap、RSS、搜索索引与 `generateStaticParams`
 * 都复用这里的结果，草稿会自动从这些输出中消失，直接访问草稿 slug 也会 404。
 */
export function getPosts(): Post[] {
  if (!fs.existsSync(dir)) return [];
  const posts = fs.readdirSync(dir)
    .filter((file) => file.endsWith(".md"))
    .map((file) => {
      const raw = fs.readFileSync(path.join(dir, file), "utf8");
      const parsed = matter(raw);
      const data = schema.parse(parsed.data);
      if (data.cover?.startsWith("/") && !fs.existsSync(path.join(process.cwd(), "public", data.cover))) throw new Error(`Cover image not found: ${data.cover}`);
      return { ...data, slug: file.replace(/\.md$/, ""), content: parsed.content, wordCount: countWords(parsed.content) };
    })
    .sort((a, b) => b.date.localeCompare(a.date));
  return process.env.NODE_ENV === "production" ? posts.filter((post) => !post.draft) : posts;
}

export function getPost(slug: string) { return getPosts().find((post) => post.slug === slug); }

/**
 * 取同系列文章，按 `seriesOrder` 升序（缺省排到末尾，同日再按日期）。
 * 系列只有一篇时返回空数组，调用方据此整块不渲染。
 */
export function getSeriesPosts(post: Post, posts: Post[] = getPosts()): Post[] {
  if (!post.series) return [];
  const series = posts.filter((item) => item.series === post.series);
  if (series.length < 2) return [];
  return series.sort((a, b) => {
    const order = (a.seriesOrder ?? Number.MAX_SAFE_INTEGER) - (b.seriesOrder ?? Number.MAX_SAFE_INTEGER);
    return order || a.date.localeCompare(b.date);
  });
}

export function validatePostSlugs(posts: Post[]) { const slugs = posts.map((post) => post.slug); return new Set(slugs).size === slugs.length; }
export function groupPosts(posts: Post[]) { return posts.reduce<Record<string, Record<string, Post[]>>>((groups, post) => { const year = post.date.slice(0, 4); const month = post.date.slice(5, 7); groups[year] ??= {}; groups[year][month] ??= []; groups[year][month].push(post); return groups; }, {}); }
