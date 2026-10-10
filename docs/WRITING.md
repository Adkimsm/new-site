# 写作指南

在 `content/posts/` 新建 `.md` 文件。文件名使用小写英文和连字符，发布后尽量不要修改。

Frontmatter 必须包含 `title`、`date`、`description`，可选 `updated`、`tags`、`featured`、`cover`、`canonical`、`draft`、`series` 和 `seriesOrder`。正文支持 GFM 表格、任务列表、删除线、引用、脚注与代码块。

`draft: true` 的文章只在开发环境可见：`next dev` 可以预览，生产构建会自动排除，也不会进入归档、搜索、RSS、sitemap 与静态路由，直接访问其 URL 会 404。文章写好后删掉 `draft` 即可发布。

`series` 给文章归入一个系列（字符串），`seriesOrder` 指定它在系列中的顺序（整数，缺省排到末尾、再按日期）。文章页顶部会内嵌同系列文章的列表，系列只有一篇时不显示。

文章字数按「CJK 字符数 + 拉丁词数」统计，围栏代码块与行内代码不计入。

`cover` 用于站内封面；只有当它是位图（`.png` / `.jpg` / `.webp`）时才会作为分享卡片，SVG 封面会被社交平台忽略，此时回退到默认卡片 `public/images/og-default.png`。
