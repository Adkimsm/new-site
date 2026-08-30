# 维护指南

新增文章前运行 `pnpm test` 和 `pnpm build`。Frontmatter 错误会在构建阶段直接失败。文章文件名发布后尽量保持不变，因为它决定永久 URL。

依赖升级后运行 `pnpm install`、`pnpm typecheck`、`pnpm lint`、`pnpm test` 和 `pnpm build`。字体、搜索索引和图片资源应优先保持本地化，不在页面中引入不必要的第三方请求。
