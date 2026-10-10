# 维护指南

新增文章前运行 `pnpm test` 和 `pnpm build`。Frontmatter 错误会在构建阶段直接失败。文章文件名发布后尽量保持不变，因为它决定永久 URL。

草稿（`draft: true`）由 `lib/content/posts.ts` 的 `getPosts()` 在生产环境过滤，开发环境保留以便预览。由于 sitemap、RSS、搜索索引与 `generateStaticParams` 都复用 `getPosts()`，草稿会自动从这些输出中消失；要发布时删掉 `draft` 即可。

系列（`series` / `seriesOrder`）只是文章页顶部的一块内嵌列表，没有独立页面。`getSeriesPosts()` 负责排序，单篇系列不渲染。

依赖升级后运行 `pnpm install`、`pnpm typecheck`、`pnpm lint`、`pnpm test` 和 `pnpm build`。字体、搜索索引和图片资源保持本地化，不在页面中引入不必要的第三方请求。

## 样式

样式全部是原生 CSS，没有 CSS 框架。`app/globals.css` 只负责按固定顺序 `@import` `styles/` 下的各层文件（tokens → base → layout → components → prose → reading → fonts）。

- 新增颜色、间距、圆角、字号一律先加到 `styles/tokens.css`，不要在组件里写死数值。
- 改色值时要同时改「系统偏好」与「手动选择」两个暗色块，并同步 `docs/DESIGN.md`。
- 若某条规则被删除，记得同时删掉引用它的 `className`，避免留下没有定义的 class（历史问题：`.eyebrow` 与 `.button` 曾在多个页面被引用却从未定义）。

## 主题

- 偏好存在 `localStorage["theme"]`，只写 `light` / `dark`；「跟随系统」不写值，靠 `html` 上没有 `data-theme` 属性让 CSS 媒体查询生效。
- 防闪烁脚本在 `app/layout.tsx`，作为 `<body>` 的第一个子节点，与 `lib/theme.ts` 的 `themeInitScript()` 共用同一份存储键。
- 逻辑改动后运行 `pnpm test`（`tests/theme.test.ts` 覆盖解析、降级、循环与标签文案）。

## 字体

自托管字体放在 `public/fonts/`，由 `styles/fonts.css` 用 `@font-face` + `unicode-range` 声明。切片按字形粒度回退，所以全部切片共用同一个族名 `'Noto Serif SC Local'`——这也是没有使用 `next/font/local` 的原因（它会为每个文件生成不同的哈希族名，切片无法归并）。

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
- **手动切深色后代码块仍是浅色**：检查 `styles/prose.css` 里 shiki 的四组选择器是否都还在（亮色基础、媒体查询暗色、属性暗色）。
- **减少动效模式下导航下划线全部出现**：说明有人又把 `transform: none !important` 加回了 `prefers-reduced-motion` 块。
- **文章目录里只有一个「Footnotes」**：说明正文标题没有 id。`lib/markdown.ts` 的 `addHeadingIds` 负责补 id；不要改回 `rehype-slug` —— 在 `remark-html` 之后接 rehype 插件拿不到 hast，是空操作。
- **代码复制按钮一闪就消失**：`ReadingTools` 里 `dangerouslySetInnerHTML` 必须是 memo 住的对象。React 按对象身份判断是否重写 innerHTML，写成内联对象会在每次重渲（例如滚动更新进度）时抹掉命令式注入的 DOM。
- **列表的圆点贴到屏幕左边缘**：说明有人又给 `.contains-task-list` 清零了 `padding-left`。`list-style-position: outside` 的列表必须保留缩进，否则标记会被画到盒子外。
- **触屏上点一下文章行就出现一块没有内边距的色块**：说明 hover 色带规则跑到了 `@media (hover: hover)` 外面。触屏点按会触发 `:hover`，必须把 hover 反馈关在这个媒体查询里。
- **代码块底部多出一大块空白**：`copy-code` 按钮被改回了 `float`。它必须绝对定位，否则会参与布局并把代码卡撑高。
- **横向滚动代码时复制按钮跟着跑**：按钮的包含块落到滚动容器里了。按钮必须挂在 `.code-block`（由 `ReadingTools` 注入的不滚动外层）上、作为 `pre` 的兄弟，并且 `.prose pre` 不能设 `position: relative`。
- **给正文加新的命令式 DOM（例如行号）时看不到**：同上，先确认没有触发 `#article-content` 的 innerHTML 重写。
