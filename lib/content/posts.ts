import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { z } from "zod";

const schema = z.object({ title: z.string().min(1), date: z.string().date(), updated: z.string().date().optional(), description: z.string().min(1), tags: z.array(z.string()).default([]), featured: z.boolean().default(false), canonical: z.string().url().optional(), cover: z.string().optional() });
export type Post = z.infer<typeof schema> & { slug: string; content: string; wordCount: number };
const dir = path.join(process.cwd(), "content/posts");
export function getPosts(): Post[] {
   if (!fs.existsSync(dir)) return [];
   return fs.readdirSync(dir).filter((file) => file.endsWith(".md")).map((file) => { const raw = fs.readFileSync(path.join(dir, file), "utf8"); const parsed = matter(raw); const data = schema.parse(parsed.data); if (data.cover?.startsWith("/") && !fs.existsSync(path.join(process.cwd(), "public", data.cover))) throw new Error(`Cover image not found: ${data.cover}`); return { ...data, slug: file.replace(/\.md$/, ""), content: parsed.content, wordCount: parsed.content.trim().split(/\s+/).filter(Boolean).length }; }).sort((a, b) => b.date.localeCompare(a.date));
}
export function getPost(slug: string) { return getPosts().find((post) => post.slug === slug); }
export function validatePostSlugs(posts: Post[]) { const slugs = posts.map((post) => post.slug); return new Set(slugs).size === slugs.length; }
export function groupPosts(posts: Post[]) { return posts.reduce<Record<string, Record<string, Post[]>>>((groups, post) => { const year = post.date.slice(0, 4); const month = post.date.slice(5, 7); groups[year] ??= {}; groups[year][month] ??= []; groups[year][month].push(post); return groups; }, {}); }
