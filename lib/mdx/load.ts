import type { ComponentType } from "react";

/** 内容文件的扩展名：`.md` 走 CommonMark，`.mdx` 额外支持 JSX 与 import。 */
export type ContentExt = "md" | "mdx";

/**
 * 按 slug + 扩展名动态载入文章正文组件。
 *
 * 两个静态前缀（`content/posts/xxx.md` 与 `xxx.mdx`）让 webpack 各自生成一个
 * context module，构建期即可把所有正文打进产物；`@next/mdx` 的 loader 负责
 * 按扩展名把 `.md` 当 markdown、把 `.mdx` 当 MDX 编译。
 */
export async function loadPostBody(slug: string, ext: ContentExt): Promise<ComponentType> {
  if (ext === "mdx") return (await import(`@/content/posts/${slug}.mdx`)).default;
  return (await import(`@/content/posts/${slug}.md`)).default;
}

/** 内容页（about / privacy / copyright / disclaimer / links）正文组件。 */
export async function loadPageBody(slug: string, ext: ContentExt): Promise<ComponentType> {
  if (ext === "mdx") return (await import(`@/content/pages/${slug}.mdx`)).default;
  return (await import(`@/content/pages/${slug}.md`)).default;
}
