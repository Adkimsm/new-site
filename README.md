# Adkinsm

Adkinsm 的中文个人主页与博客，使用 Next.js App Router、TypeScript 和本地 Markdown 内容。

## 开发

```bash
pnpm install
pnpm dev
```

验收命令：`pnpm typecheck`、`pnpm lint`、`pnpm test`、`pnpm build`。

文章放在 `content/posts/`，文件名就是文章 URL。提交主分支即可发布。Frontmatter 必须包含 `title`、`date` 和 `description`，日期使用 `YYYY-MM-DD`。

## 部署

将公开仓库连接到 Vercel，生产分支提交自动部署，之后在 Vercel 添加 `adk.bot.cd` 并按控制台提示配置 DNS。项目本身不需要数据库、环境变量或后端服务。

## 许可

源码使用 MIT；文章和站点内容使用 CC BY-NC-SA 4.0。头像与个人品牌素材不包含在这两项授权中。
