import type { Post } from "@/lib/post-utils";

/** 构造一篇用于纯函数单测的文章；只需覆盖被测字段即可。 */
export function post(overrides: Partial<Post> & { slug: string }): Post {
  return {
    title: overrides.slug,
    date: "2026-01-01",
    description: "摘要",
    tags: [],
    featured: false,
    draft: false,
    wordCount: 0,
    body: "",
    ...overrides
  };
}

/** 构造一个形如内容集合条目的对象，用于 filterPublished。 */
export function entry(id: string, draft: boolean) {
  return { id, data: { draft } };
}
