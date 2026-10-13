# 维护指南

新增文章前运行 `pnpm test` 和 `pnpm build`。Frontmatter 错误会在 `astro build` / `astro check` 阶段直接失败（Content Collections 的 zod 校验）。文章文件名发布后尽量保持不变，因为它决定永久 URL。

草稿（`draft: true`）由 `src/lib/post-utils.ts` 的 `filterPublished()` 在生产构建过滤，开发环境保留以便预览。由于 sitemap、RSS、搜索索引与 `getStaticPaths` 都复用 `src/lib/posts.ts` 的 `getPosts()`，草稿会自动从这些输出中消失；要发布时删掉 `draft` 即可。

系列（`series` / `seriesOrder`）只是文章页顶部的一块内嵌列表，没有独立页面。`getSeriesPosts()` 负责排序，单篇系列不渲染。

## 内容层（Content Collections）

集合定义在 `src/content.config.ts`，schema 在 `src/lib/content-schemas.ts`（用 `astro/zod`，即 Zod 4）。schema 单独成文件是为了能在 node 环境的 vitest 里直接 `safeParse` —— `astro:content` 是构建期虚拟模块，测试环境无法解析。

- `posts` 集合：`src/content/posts/**`，glob loader 用 `generateId` 去掉扩展名，保持「文件名即 URL」。
- `pages` 集合：`src/content/pages/**`，共用 `pageSchema`，`/links` 页额外带 `friendsTitle` / `links`。

`src/lib/posts.ts` 的 `getPosts()` 是唯一的文章查询入口：读取集合、过滤草稿、按日期倒序，并附带 `slug` / `wordCount` / 正文原文；同时校验站内封面存在（以 `/` 开头且文件不存在时报错）。纯函数（`groupPosts` / `getSeriesPosts` / `filterPublished` / `validatePostSlugs`）在 `src/lib/post-utils.ts`，可被单测。

## 内容页面

`src/content/pages/` 存放五个内容页：`about.mdx`、`privacy.md`、`copyright.md`、`disclaimer.md`、`links.md`。文件名即页面 slug，与 `src/pages/{slug}.astro` 一一对应。

frontmatter 字段：`title`（必填，页面标题与 metadata）、`heading`（可选，页面 h1，缺省回退 `title`，如「关于」→「关于我」）、`eyebrow`（可选，页首英文标签）、`description`（可选，覆盖 metadata 描述）。字段非法会让构建失败；`about.mdx` 里的 `import { siteConfig } from "@/lib/site-config"` 由 `@astrojs/mdx` 直接支持。

## 正文渲染：md 与 mdx

正文由 Astro Content Collections + `@astrojs/mdx` 编译。`.md` 与 `.mdx` 共用 `astro.config.mjs` 里 `markdown.processor` 配置的同一套管线（`@astrojs/markdown-remark` 的 `unified` 处理器）：

- `rehype-slug`：给 h2/h3 生成 id（github-slugger），供文章目录锚点使用。
- `rehype-external-links`：给站外链接补 `target="_blank" rel="noopener noreferrer"`，站内相对链接与锚点不动。
- `shikiConfig`：`themes: { light: "github-light", dark: "github-dark" }` + `defaultColor: false`，产出 `--shiki-light` / `--shiki-dark` 变量，由 `src/styles/prose.css` 消费。

Astro 7 默认的 Sätteri 处理器不跑 remark/rehype 插件，因此这里显式使用 `unified()`；`@astrojs/mdx` 会继承 `markdown.processor`，`.mdx` 无需单独配置。另外 Astro 默认开启 SmartyPants（智能标点），这里显式关掉以保持与迁移前一致。

- `.md`：CommonMark + GFM（标题、列表、表格、引用、脚注、代码块、GFM 自动链接）。**不支持**原始 HTML（会被剥离）、JSX、`import`。
- `.mdx`：在 markdown 之上支持 JSX、`import` / `export`、表达式 `{}` 与原始 HTML。例如 `about.mdx` 直接 `import { siteConfig }` 后写 `{siteConfig.name}`。

文章页 `src/pages/posts/[slug].astro` 用 `render(entry)` 得到 `<Content />` 组件直接输出（不再渲染成 HTML 字符串），`ReadingTools` island 在 `useEffect` 里从 `#article-content` 取 DOM 做命令式增强。

## 友情链接

友链数据在 `src/content/pages/links.md` 的 frontmatter 里，除通用页面字段（`title` 作为页面 h1、`eyebrow`）外，还有 `friendsTitle`（友链区块 h2，默认「友情链接」）与 `links`。单条友链字段：`name`（必填）、`url`（必填，完整地址）、`avatar`（可选，本地 `/images/friends/xxx.png` 或远程 `https://` 地址）、`description`（可选，一句话介绍）。列表顺序即页面渲染顺序。

`src/lib/friend-links.ts` 的 `getFriendLinks()` 负责读取与校验：本地头像必须存在于 `public/`，否则构建失败；远程头像不做校验。远程头像在页面里用原生 `<img>` 加载，第三方挂掉或防盗链时会回退为首字母块，不会出现破图。文件不存在或 `links` 为空时，页面显示空状态而不是报错。

依赖升级后运行 `pnpm install`、`pnpm typecheck`、`pnpm lint`、`pnpm test` 和 `pnpm build`。字体、搜索索引和图片资源保持本地化，不在页面中引入不必要的第三方请求。

## 样式

样式全部是原生 CSS，没有 CSS 框架。`src/styles/globals.css` 只负责按固定顺序 `@import` 同目录下的各层文件（tokens → base → motion → layout → components → prose → reading → fonts），由 `src/layouts/BaseLayout.astro` 引入。

- 新增颜色、间距、圆角、字号一律先加到 `src/styles/tokens.css`，不要在组件里写死数值。
- 改色值时要同时改「系统偏好」与「手动选择」两个暗色块，并同步 `docs/DESIGN.md`。
- 若某条规则被删除，记得同时删掉引用它的 `className`，避免留下没有定义的 class（历史问题：`.eyebrow` 与 `.button` 曾在多个页面被引用却从未定义）。

## 主题

- 偏好存在 `localStorage["theme"]`，只写 `light` / `dark`；「跟随系统」不写值，靠 `html` 上没有 `data-theme` 属性让 CSS 媒体查询生效。
- 防闪烁脚本在 `src/layouts/BaseLayout.astro`，作为 `<body>` 的第一个子节点，用 `<script is:inline set:html={themeInitScript()} />` 输出。**必须 `is:inline`**：Astro 默认把 `<script>` 打包成 defer 的 module，会晚于首屏绘制，深色模式会闪白。
- 逻辑改动后运行 `pnpm test`（`tests/theme.test.ts` 覆盖解析、降级、循环与标签文案）。

## 字体

自托管字体放在 `public/fonts/`，由 `src/styles/fonts.css` 用 `@font-face` + `unicode-range` 声明。切片按字形粒度回退，所以全部切片共用同一个族名 `'Noto Serif SC Local'`——这也是没有使用字体加载器自动生成的原因（它会为每个文件生成不同的哈希族名，切片无法归并）。

重新生成切片：

```bash
# 1. 需要 fonttools 与 brotli 以输出 woff2
sudo apt-get install -y python3-fonttools python3-brotli

# 2. 取源字体（OFL-1.1，可变字重 400–700）
curl -sL -o /tmp/NotoSerifSC-VF.ttf \
  "https://raw.githubusercontent.com/google/fonts/main/ofl/notoserifsc/NotoSerifSC%5Bwght%5D.ttf"

# 3. 生成 latin 切片
pyftsubset /tmp/NotoSerifSC-VF.ttf \
  --unicodes="U+0000-00FF,U+2000-206F,U+2190-2193,U+FEFF" \
  --layout-features='*' --flavor=woff2 \
  --output-file=public/fonts/noto-serif-sc-latin.woff2

# 4. 生成常用汉字切片（字符来自 GB2312 字符表，并补上站点内容里出现的字）
zcat /usr/share/i18n/charmaps/GB2312.gz | grep -oE '<U[0-9A-F]{4,6}>' | sort -u \
  | sed 's/[<>]//g' > /tmp/cjk-common.txt
pyftsubset /tmp/NotoSerifSC-VF.ttf \
  --unicodes-file=/tmp/cjk-common.txt --unicodes="U+3000-303F,U+FF00-FFEF" \
  --layout-features='*' --flavor=woff2 \
  --output-file=public/fonts/noto-serif-sc-cjk-common.woff2
```

注意事项：

- 切片之外的生僻字会回退到 `Songti SC / STSong / serif`。新增大量生僻字内容时重新生成切片。
- `public/fonts/OFL.txt` 是字体的许可文本，随字体一起分发，不要删除。
- 只预载 latin 切片；CJK 切片体积大且按需命中，预载会拖慢首屏。

## 常见故障

- **pnpm 无法启动，报 `libatomic.so.1`**：`sudo apt-get install -y libatomic1`。
- **手动切深色后代码块仍是浅色**：检查 `src/styles/prose.css` 里 shiki 的四组选择器是否都还在（亮色基础、媒体查询暗色、属性暗色）。注意 Astro 输出的 `<pre>` 类名是 `astro-code`（不是旧管线的 `shiki`），选择器要同时匹配两者。
- **减少动效模式下导航下划线全部出现**：说明有人又把 `transform: none !important` 加回了 `prefers-reduced-motion` 块。
- **文章目录里只有一个「Footnotes」或目录为空**：说明正文标题没有 id。标题 id 由 `astro.config.mjs` 的 `rehype-slug` 生成；脚注小节自带的带属性标题不会被覆盖。
- **客户端跳转后目录 / 复制按钮 / 灯箱失效**：`ReadingTools` island 需要在换页后重新挂载并重跑 effect。确认 `client:load` island 未被加 `transition:persist` 而跳过重挂载。
- **代码复制按钮一闪就消失**：`ReadingTools` 现在从 DOM 取正文、不再用 `dangerouslySetInnerHTML`，这条历史坑应已消失；若复现，检查是否有别处重写了 `#article-content` 的 innerHTML。
- **列表的圆点贴到屏幕左边缘**：说明有人又给 `.contains-task-list` 清零了 `padding-left`。`list-style-position: outside` 的列表必须保留缩进，否则标记会被画到盒子外。
- **触屏上点一下文章行就出现一块没有内边距的色块**：说明 hover 色带规则跑到了 `@media (hover: hover)` 外面。触屏点按会触发 `:hover`，必须把 hover 反馈关在这个媒体查询里。
- **代码块底部多出一大块空白**：`copy-code` 按钮被改回了 `float`。它必须绝对定位，否则会参与布局并把代码卡撑高。
- **横向滚动代码时复制按钮跟着跑**：按钮的包含块落到滚动容器里了。按钮必须挂在 `.code-block`（由 `ReadingTools` 注入的不滚动外层）上、作为 `pre` 的兄弟，并且 `.prose pre` 不能设 `position: relative`。
- **深色模式首屏闪白**：`BaseLayout.astro` 里的防闪烁脚本必须保留 `is:inline`，否则会被 Astro 打包成 defer module 而晚于首屏绘制。
