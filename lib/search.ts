/** 站内搜索的纯逻辑：过滤、排序、关键词高亮与命中片段。
 *  从原 components/search-form.tsx 抽出，便于浮层组件复用并单独测试。 */

export type SearchPost = {
  slug: string;
  title: string;
  description: string;
  date: string;
  content: string;
  tags: string[];
  wordCount: number;
};

/** 结果上限：避免命中过多时一次渲染整站文章。 */
export const SEARCH_RESULT_LIMIT = 20;

export function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** 把查询词在文本中反白；调用方负责以 HTML 方式渲染。 */
export function highlight(text: string, query: string) {
  const terms = query.trim().split(/\s+/).filter(Boolean).map(escapeRegExp);
  return terms.length ? text.replace(new RegExp(`(${terms.join("|")})`, "gi"), "<mark>$1</mark>") : text;
}

/** 取正文中第一个命中词附近的片段，作为结果摘要。 */
export function getSnippet(post: SearchPost, query: string) {
  const source = `${post.description} ${post.content.replace(/[#*_`>\[\]()]/g, "")}`;
  const term = query.trim().split(/\s+/).find(Boolean);
  const index = term ? source.toLocaleLowerCase().indexOf(term.toLocaleLowerCase()) : 0;
  const start = Math.max(0, index - 55);
  return `${start > 0 ? "…" : ""}${source.slice(start, start + 150)}${start + 150 < source.length ? "…" : ""}`;
}

/** 标题、摘要、正文、标签任一命中即计入结果，空查询返回空数组。 */
export function searchPosts(posts: SearchPost[], query: string): SearchPost[] {
  const normalized = query.trim().toLocaleLowerCase();
  if (!normalized) return [];
  return posts
    .filter((post) => `${post.title} ${post.description} ${post.content} ${post.tags.join(" ")}`.toLocaleLowerCase().includes(normalized))
    .slice(0, SEARCH_RESULT_LIMIT);
}
