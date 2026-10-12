import type { MDXComponents } from "mdx/types";

/**
 * App Router 下使用 @next/mdx 必需的约定文件。
 *
 * 内容页与文章的外链硬化、标题锚点、代码高亮都在 `lib/mdx/render.tsx` 里
 * 以字符串后处理的方式完成（沿用改造前 lib/markdown.ts 的行为），因此这里
 * 不需要额外映射标签，返回空对象即可。
 */
const components: MDXComponents = {};

export function useMDXComponents(): MDXComponents {
  return components;
}
