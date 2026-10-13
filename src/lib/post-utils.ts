/**
 * 文章相关的纯函数与类型。
 *
 * 刻意**不引入 `astro:content`**：这些逻辑只做过滤 / 分组 / 排序，与内容来源
 * 无关，独立成模块后就能在 node 环境的 vitest 里直接单测（`astro:content`
 * 是构建期虚拟模块，测试环境无法解析）。集合查询见 `src/lib/posts.ts`。
 */

/** 文章在站点内的统一形态：frontmatter + slug + 正文字数 + 原文。 */
export type Post = {
  title: string;
  date: string;
  updated?: string;
  description: string;
  tags: string[];
  featured: boolean;
  canonical?: string;
  cover?: string;
  draft: boolean;
  series?: string;
  seriesOrder?: number;
  /** 文件名即 URL，不含扩展名。 */
  slug: string;
  /** `countWords(body)` 的结果。 */
  wordCount: number;
  /** frontmatter 之后的原文（markdown / mdx 源），供搜索索引使用。 */
  body: string;
};

/**
 * 草稿（`draft: true`）只在开发环境可见：`astro dev` 便于本地预览，生产构建
 * 会整体过滤掉。由于 sitemap、RSS、搜索索引与 `getStaticPaths` 都复用同一批
 * 数据，草稿会自动从这些输出中消失，直接访问草稿 slug 也会 404。
 */
export function filterPublished<T extends { data: { draft: boolean } }>(entries: T[], isProd: boolean): T[] {
  return isProd ? entries.filter((entry) => !entry.data.draft) : entries;
}

/**
 * 取同系列文章，按 `seriesOrder` 升序（缺省排到末尾，同日再按日期）。
 * 系列只有一篇时返回空数组，调用方据此整块不渲染。
 */
export function getSeriesPosts(post: Post, posts: Post[]): Post[] {
  if (!post.series) return [];
  const series = posts.filter((item) => item.series === post.series);
  if (series.length < 2) return [];
  return series.sort((a, b) => {
    const order = (a.seriesOrder ?? Number.MAX_SAFE_INTEGER) - (b.seriesOrder ?? Number.MAX_SAFE_INTEGER);
    return order || a.date.localeCompare(b.date);
  });
}

/** 按年 → 月分组，供 `/posts` 归档页渲染。 */
export function groupPosts(posts: Post[]) {
  return posts.reduce<Record<string, Record<string, Post[]>>>((groups, post) => {
    const year = post.date.slice(0, 4);
    const month = post.date.slice(5, 7);
    groups[year] ??= {};
    groups[year][month] ??= [];
    groups[year][month].push(post);
    return groups;
  }, {});
}

/** 检测重复的 slug（同一文件名不应出现两次）。 */
export function validatePostSlugs(posts: Post[]) {
  const slugs = posts.map((post) => post.slug);
  return new Set(slugs).size === slugs.length;
}
