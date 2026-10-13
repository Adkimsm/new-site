# Adkinsm

Adkinsm 的中文个人主页与博客，使用 Astro（静态输出）、TypeScript、React island 和本地 Markdown 内容。

## 开发

```bash
pnpm install
pnpm dev
```

验收命令：`pnpm typecheck`、`pnpm lint`、`pnpm test`、`pnpm build`。

文章放在 `src/content/posts/`，文件名就是文章 URL。提交主分支即可发布。Frontmatter 必须包含 `title`、`date` 和 `description`，日期使用 `YYYY-MM-DD`。

正文同时支持 `.md`（CommonMark）与 `.mdx`（可写 JSX / `import`），由 Astro Content Collections + `@astrojs/mdx` 渲染。内容页（`/about`、`/privacy`、`/copyright`、`/disclaimer`）放在 `src/content/pages/`，友链在 `src/content/pages/links.md`，字段与 md/mdx 的区别见 `docs/MAINTENANCE.md`。

## 部署

`pnpm build` 产出纯静态目录 `dist/`，可托管到任意静态平台（Cloudflare Pages / Netlify / GitHub Pages / 自建）。旧路径 301 由 `public/_redirects` 提供，细节见 `docs/DEPLOYMENT.md`。项目本身不需要数据库、环境变量或后端服务。

## 许可

源码使用 MIT；文章和站点内容使用 CC BY-NC-SA 4.0。头像与个人品牌素材不包含在这两项授权中。
