# 设计规范

## 1. 设计基调

中性灰阶、中文衬线、大留白、克制的单色体系。层级只靠三档文字的明度差、发丝细线和留白表达，不使用卡片阴影、不使用大面积透明玻璃、不使用强调色。首屏为居中的极简人物页，其余页面为居中的单列编辑排版。

## 2. 颜色

全部色值集中在 `styles/tokens.css`。亮色为默认，暗色有两条等价入口：系统偏好（`prefers-color-scheme: dark`）与手动选择（`html[data-theme="dark"]`）。

亮色：

```text
纸面      --paper       #FFFFFF
内容表面  --surface     #FAFAFA
主要文字  --ink         #1B1B1B
正文文字  --body        #2C2C2C
次要文字  --muted       #8F8F8F
细线      --line        #ECECEC
加强细线  --line-strong #D6D6D6
弱化表面  --soft        #F5F5F5
表单底色  --field       #FAFAFA
```

暗色：

```text
纸面      --paper       #121212
内容表面  --surface     #1A1A1A
主要文字  --ink         #E8E8E8
正文文字  --body        #CFCFCF
次要文字  --muted       #8A8A8A
细线      --line        #2A2A2A
加强细线  --line-strong #3A3A3A
弱化表面  --soft        #1E1E1E
表单底色  --field       #1A1A1A
```

约束：

- 正文与次要文字在两套主题下的对比度都不低于 4.5:1。
- 不新增强调色。链接、焦点环、阅读进度环都在墨色体系内取色。
- 早期文档里记的暖纸色值（如 `#FAF9F5` / `#1A1D20`）已废弃，改版后统一为上面的中性灰阶。

## 3. 字体

- 正文与标题：Noto Serif SC，自托管切片（`styles/fonts.css` + `public/fonts/`）。
- 回退链：`'Noto Serif SC Local', 'Noto Serif SC', 'Songti SC', STSong, serif`。
- 界面元素、元信息、日期、标签行：`system-ui` 系统无衬线。
- 代码：系统等宽字体，不引入体积过大的中文等宽字体。
- 切片：`latin` 与 `cjk-common` 两个 `unicode-range` 切片，可变字重 400–700，`font-display: swap`，只预载 latin 切片。

## 4. 排版

```text
桌面正文    17px（--text-md），行高 1.8
移动正文    16px（--text-base），行高 1.75
正文宽度    640px（--measure-prose）
列表页宽度  720px（--measure-page）
日期列      6.5rem（--date-col）
```

- 标题字距 `-0.02em` 至 `-0.04em`，`text-wrap: balance`。
- eyebrow 标签行：`0.16em` 字距 + 大写，无装饰短线。
- 正文段落间距 `--space-5`，h2 上方 `--space-8`。

## 5. 间距、圆角、阴影

```text
间距  --space-1 … --space-11   4px 起步，倍增至 6rem
圆角  --radius-xs/sm/md/lg/pill   2 / 4 / 6 / 8 / 999px
阴影  --shadow-1/2/3           三级但极轻；列表、导航、卡片均不使用阴影
外壳  --shell-max 1080px   --gutter 1.5rem（≤420px 为 1.25rem）   --nav-height 72px
```

页首留白由导航高度推导（`--page-pad-top` / `--page-pad-top-mobile`），调整导航高度不需要再改正文留白。

## 6. 组件规则

- eyebrow：所有子页面顶部统一的标签行。
- 按钮：墨底纸字，悬停反转为透明底墨字；最小高度 44px。
- 胶囊 pill：标签与计数，1px 细线 + 全圆角。
- 导航：未滚动时完全透明、与页面融合；滚动后只留一条 `--line` 底边与轻模糊（`backdrop-filter`），不使用纸张背景块、不加阴影。
- 导航右侧图标按钮（搜索 `.search-trigger`、深浅色切换 `.theme-toggle`、移动端菜单 `.menu`）：统一静止态 `--muted`、悬停 `--ink` + `--soft` 底，避免颜色分叉。搜索按钮在桌面和移动端都常驻显示（移动端与深浅色切换并列，不再收进菜单）。
- 首页首屏：居中的头像（112px，1px 细线圆环）+ 名字 + 一句自述 + 一行文字入口。不使用分隔线、下箭头或网格装饰。
- 页脚：单行——左侧版权，右侧一行灰字链接，无分组标题与卡片。
- 文章列表：日期列 6.5rem（灰色小字）+ 标题列。悬停时标题加下划线、日期加深；不使用背景条带与卡片边框。触屏不给 hover 反馈（hover 规则包在 `@media (hover: hover)` 里），键盘用 `:focus-within`。
- 正文列表：`list-style-position: outside` 的列表必须保留 `padding-left`（1.4em）。**不要**给 `.contains-task-list` 清零缩进：remark-gfm 给“只要含任务项”的整个列表加这个类，清零会把普通项的 disc 标记画到盒子外，实测落在 x≈2px。
- 代码块复制按钮：`ReadingTools` 会把 `pre` 包进一层 `.code-block`（`position: relative`），按钮挂在这一层、作为 `pre` 的兄弟。**不能**把按钮放进 `pre`，也不能给 `.prose pre` 加 `position: relative`：`pre` 是 `overflow: auto` 的滚动容器，一旦按钮的包含块落在滚动容器内，横向滚动代码时它就会跟着跑。按钮绝对定位在卡片右上角（不参与布局；早先用 float 时它会落在流的末尾、掉到代码下方并把卡片撑高约 36px），默认 `opacity: 0`，在 `.code-block:hover`（仅 hover 设备）、`.code-block:focus-within` 或按钮 `:focus-visible` 时显形。用 opacity 而不是 `visibility/display`，保证仍可 Tab 到达。
- 精选文章：标题前一个小圆点，不使用徽章与左侧竖线。
- 归档（`/posts`）：按年份分组，年份标题 + 文章数；组内是日期 + 标题的纯文字行。不使用时间轴竖线与节点。
- 授权卡：顶部一条细线的说明块（不是卡片），说明作者、许可与原文链接。
- 系列（文章页顶部）：标题上方一块上下各一条 `--line` 发丝线的定位区，无卡片无背景。系列名用无衬线小字 + `--tracking-label` 字距；条目为等宽编号列（`tabular-nums`）+ 标题列，当前篇为墨色、标题前一个小圆点（与首页精选标记同一套做法）并加 `aria-current="page"`，其余为链接。系列只有一篇时整块不渲染。
- 草稿标记：`draft` 文章仅在开发环境预览，标题上方 eyebrow 内追加一个 `草稿` 胶囊；生产构建不会渲染草稿，因此线上看不到。
- 目录：右下角浮层，锚定在阅读按钮上方，由该按钮开合（全尺寸一致，不再有宽屏常驻粘性轨）；浮层首项是「回到顶部」，其后是各标题。
- 阅读工具：右下角单个圆形按钮，圆环边框显示阅读进度，圆内是目录图标；点击开合目录浮层。Esc 或点击浮层外部关闭。
- 搜索：全站浮层（导航搜索图标 / 快捷键 `/` 与 `⌘K`·`Ctrl+K`），不再是独立页面。浮层**条件挂载**，开合动画由 **Web Animations API 命令式驱动**（`lib/motion` 的 `animateElement` / `runExit`）：`element.animate()` 调用即执行，退场等 `animation.finished` 再卸载，不依赖「class 变化触发 CSS 过渡」，也避免了常驻大图层反复显隐掉帧。**不用 `backdrop-filter`**：实测只要浮层（或其子层）带背景模糊，同层 opacity 动画就会被合成器拖成 pending、开合没有过渡，故背景用不透明纸面。居中大号衬线输入框（文字居中），下方是结果列（标题 + 2 行摘要 + 日期），底部键盘提示；索引 `/search-index.json` 首次打开才拉取。结果项支持 `↑`/`↓` 选择、`Enter` 打开，`Esc` / 点击背景 / 右上角按钮关闭；打开时锁定滚动、聚焦输入框并支持 Tab 焦点陷阱，关闭后归还焦点。输入框隐藏 WebKit 原生清除按钮，避免与关闭入口重复出现两个 X。移动菜单同样用这套 WAAPI 机制开合。

## 7. 主题机制

- 令牌三层：`:root` 亮色 → `@media (prefers-color-scheme: dark) :root:not([data-theme="light"])` → `:root[data-theme="dark"]`。
- 防闪烁：`app/layout.tsx` 中 `<body>` 的第一个内联脚本在解析期写入 `data-theme`。
- 手动切换：跟随系统 → 浅色 → 深色循环，持久化在 `localStorage["theme"]`；「跟随系统」不写存储值也不写属性。
- 代码高亮必须同时命中媒体查询与属性选择器，否则「系统浅色 + 手动深色」时页面深、代码块浅。

## 8. 动效

- 令牌：`--duration-instant/fast/normal/slow` 与 `--ease-standard`。
- 只做 6–12px 位移、透明度与颜色过渡；不做缩放或视差特效。
- `prefers-reduced-motion: reduce` 下所有动画与过渡时长归零。该模式下刻意**不**写 `transform: none`：那会让以 `scaleX(0)` 表达隐藏态的导航下划线、目录浮层反而全部显现。

## 9. 响应式断点

```text
所有宽度   单列正文；目录为右下角浮层
≤700px     移动布局、全屏菜单
≤420px     阅读按钮贴安全区
```

验收宽度：360 / 390 / 768 / 1024 / 1440。

## 10. 样式文件结构

`app/globals.css` 只是入口，按固定顺序引入各层，顺序不可调整：

```text
tokens.css      设计令牌
base.css        reset、文档、链接、选区、焦点、辅助类、减少动效
layout.css      版心、页首、分节、导航、移动菜单、首屏、页脚
components.css  eyebrow、按钮、胶囊、表单、空状态、链接列表、文章列表、归档
prose.css       正文排版、代码块、表格、脚注、图片
reading.css     文章页版式、目录、阅读工具、授权卡、灯箱
fonts.css       自托管字体切片
```
