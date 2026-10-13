import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import mdx from "@astrojs/mdx";
import { unified } from "@astrojs/markdown-remark";
import rehypeSlug from "rehype-slug";
import rehypeExternalLinks from "rehype-external-links";

export default defineConfig({
  // 必须与 src/lib/site-config.ts 的 siteConfig.url 一致，canonical / sitemap 依赖它
  site: "https://adk.bot.cd",
  output: "static",
  trailingSlash: "ignore",
  integrations: [react(), mdx()],
  markdown: {
    // Astro 7 默认的 Sätteri 处理器不跑 remark/rehype 插件，这里显式选回
    // unified 处理器（官方 @astrojs/markdown-remark）。@astrojs/mdx 会继承
    // `markdown.processor`，因此 .md 与 .mdx 走同一条管线。
    processor: unified({
      gfm: true,
      // Astro 默认开启 SmartyPants（直引号 → 弯引号、-- → 短破折号等）。
      // 迁移前的 @next/mdx 管线只开 remark-gfm，没有智能标点，这里关掉以保持一致。
      smartypants: false,
      rehypePlugins: [
        // h2/h3 生成 id（github-slugger，中文标题保留中文），供文章目录锚点使用
        rehypeSlug,
        // 站外链接补 target/rel；站内相对链接与锚点不受影响
        [rehypeExternalLinks, { target: "_blank", rel: ["noopener", "noreferrer"] }]
      ]
    }),
    shikiConfig: {
      // 产出 --shiki-light / --shiki-dark 变量，与 src/styles/prose.css 对齐
      themes: { light: "github-light", dark: "github-dark" },
      defaultColor: false
    }
  }
});
