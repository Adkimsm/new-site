# 部署说明

`pnpm build` 产出纯静态目录 `dist/`，可托管到任意静态平台：

| 平台 | 构建命令 | 产物目录 | 备注 |
|---|---|---|---|
| Cloudflare Pages（推荐） | `pnpm build` | `dist` | 支持 `_redirects`，免费，无厂商锁定 |
| Netlify | `pnpm build` | `dist` | 支持 `_redirects` |
| GitHub Pages | `pnpm build` | `dist` | 需 GH Actions + `withastro/action`；**不支持 `_redirects`**，重定向要另想办法 |
| 自建 nginx/Caddy | `pnpm build` | `dist` | 重定向写在服务器配置里 |
| S3 + CDN | `pnpm build` | `dist` | 重定向用 CDN 规则 |

旧路径 301 写在 `public/_redirects`（构建后原样复制到 `dist/_redirects`）：

```
/pages/about   /about      301
/pages/links   /links      301
/rss           /rss.xml    301
/sitemap       /sitemap.xml 301
/pages/tweets  /           301
```

Cloudflare Pages / Netlify 原生支持该文件（真 301）。**GitHub Pages 不支持**，若选它需改用 Astro 的 `redirects`（meta-refresh）或在构建后处理。

域名、DNS 和 HTTPS 在平台控制台完成配置，并把 `astro.config.mjs` 的 `site` 与 `src/lib/site-config.ts` 的 `siteConfig.url` 指向同一域名。

上线后检查首页、文章页、`/rss.xml`、`/sitemap.xml`、`/robots.txt`、canonical、旧路径重定向和社交分享元数据。
