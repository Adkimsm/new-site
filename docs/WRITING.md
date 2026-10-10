# 写作指南

在 `content/posts/` 新建 `.md` 文件。文件名使用小写英文和连字符，发布后尽量不要修改。

Frontmatter 必须包含 `title`、`date`、`description`，可选 `updated`、`tags`、`featured`、`cover` 和 `canonical`。正文支持 GFM 表格、任务列表、删除线、引用、脚注与代码块。

文章字数按「CJK 字符数 + 拉丁词数」统计，围栏代码块与行内代码不计入。

`cover` 用于站内封面；只有当它是位图（`.png` / `.jpg` / `.webp`）时才会作为分享卡片，SVG 封面会被社交平台忽略，此时回退到默认卡片 `public/images/og-default.png`。
