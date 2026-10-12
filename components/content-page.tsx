import type { PageMeta } from "@/lib/content/pages";

/**
 * 内容页统一外壳：eyebrow 标签行 + h1 + 正文。
 *
 * 正文由 `renderContent` 把 MDX 组件渲染成 HTML 字符串后传入，与文章页共用
 * 同一套排版（`.prose`）与后处理（代码高亮、标题锚点、外链硬化）。
 */
export function ContentPage({ meta, html }: { meta: PageMeta; html: string }) {
  return <section className="page prose">
    <header className="page-header">
      {meta.eyebrow && <span className="eyebrow">{meta.eyebrow}</span>}
      <h1>{meta.heading ?? meta.title}</h1>
    </header>
    <div dangerouslySetInnerHTML={{ __html: html }} />
  </section>;
}
