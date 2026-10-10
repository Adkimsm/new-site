import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { z } from "zod";

const schema = z.object({ title: z.string().min(1), date: z.string().date(), updated: z.string().date().optional(), description: z.string().min(1), tags: z.array(z.string()).default([]), featured: z.boolean().default(false), canonical: z.string().url().optional(), cover: z.string().optional() });
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

export function getPosts(): Post[] {
   if (!fs.existsSync(dir)) return [];
   return fs.readdirSync(dir).filter((file) => file.endsWith(".md")).map((file) => { const raw = fs.readFileSync(path.join(dir, file), "utf8"); const parsed = matter(raw); const data = schema.parse(parsed.data); if (data.cover?.startsWith("/") && !fs.existsSync(path.join(process.cwd(), "public", data.cover))) throw new Error(`Cover image not found: ${data.cover}`); return { ...data, slug: file.replace(/\.md$/, ""), content: parsed.content, wordCount: countWords(parsed.content) }; }).sort((a, b) => b.date.localeCompare(a.date));
}
export function getPost(slug: string) { return getPosts().find((post) => post.slug === slug); }
export function validatePostSlugs(posts: Post[]) { const slugs = posts.map((post) => post.slug); return new Set(slugs).size === slugs.length; }
export function groupPosts(posts: Post[]) { return posts.reduce<Record<string, Record<string, Post[]>>>((groups, post) => { const year = post.date.slice(0, 4); const month = post.date.slice(5, 7); groups[year] ??= {}; groups[year][month] ??= []; groups[year][month].push(post); return groups; }, {}); }
