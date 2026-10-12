import type { NextConfig } from "next";
import createMDX from "@next/mdx";

const nextConfig: NextConfig = {
  // `md` / `mdx` 加入 pageExtensions，Next 才会用 @next/mdx 的 loader 处理它们。
  // content/ 不在 app/ 下，所以这些文件不会变成路由，只会作为模块被 import。
  pageExtensions: ["ts", "tsx", "js", "jsx", "md", "mdx"],
  poweredByHeader: false,
  redirects: async () => [
    { source: "/pages/about", destination: "/about", permanent: true },
    { source: "/pages/links", destination: "/links", permanent: true },
    { source: "/rss", destination: "/rss.xml", permanent: true },
    { source: "/sitemap", destination: "/sitemap.xml", permanent: true },
    { source: "/pages/tweets", destination: "/", permanent: true }
  ]
};

/**
 * 内容统一走 MDX：`content/**\/*.md|mdx` 由 @next/mdx 编译成 React 组件。
 *
 * `extension` 覆盖 `.md` 与 `.mdx` 两种后缀，底层 @mdx-js/loader 会按扩展名
 * 自动判定格式（`.md` = CommonMark，`.mdx` = 可写 JSX/import 的 MDX）。
 * 插件用字符串名（而不是 import 的函数）传递，Turbopack 下才能序列化。
 * remark-frontmatter 负责把 frontmatter 从渲染中剥离（元数据由 fs 侧读取）。
 */
const withMDX = createMDX({
  extension: /\.(md|mdx)$/,
  options: {
    remarkPlugins: ["remark-gfm", "remark-frontmatter"]
  }
});

export default withMDX(nextConfig);
