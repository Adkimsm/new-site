# 设计规范

## 1. 设计基调

暖纸面、中文衬线、大留白、克制的墨色体系。层级只靠三档文字的明度差、发丝细线和留白表达，不使用大面积透明玻璃、不使用鲜艳强调色。

## 2. 颜色

全部色值集中在 `styles/tokens.css`。亮色为默认，暗色有两条等价入口：系统偏好（`prefers-color-scheme: dark`）与手动选择（`html[data-theme="dark"]`）。

亮色：

```text
纸面      --paper       #FAF9F5
内容表面  --surface     #FCFBF7
主要文字  --ink         #141413
正文文字  --body        #3A362C
次要文字  --muted       #605B52
细线      --line        #DED9CF
加强细线  --line-strong #CDC7BB
弱化表面  --soft        #F3EFE7
表单底色  --field       #F6F2EA
```

暗色：

```text
纸面      --paper       #1A1D20
内容表面  --surface     #22262A
主要文字  --ink         #F2ECE2
正文文字  --body        #D8D1C5
次要文字  --muted       #BCB5A9
细线      --line        #4E555B
加强细线  --line-strong #5B636A
弱化表面  --soft        #2C3035
表单底色  --field       #262A2E
```

约束：

- 正文与次要文字在两套主题下的对比度都不低于 4.5:1。
- 不新增强调色。链接、焦点环、阅读进度环都在墨色体系内取色。
- 早期文档里记的 `#FAF8F2` / `#1E1D1A` 等色值与实现不一致，现已按实现统一为上面的取值。

## 3. 字体

- 正文与标题：Noto Serif SC，自托管切片（`styles/fonts.css` + `public/fonts/`）。
- 回退链：`'Noto Serif SC Local', 'Noto Serif SC', 'Songti SC', STSong, serif`。
- 界面元素、元信息、日期、标签行：`system-ui` 系统无衬线。
- 代码：系统等宽字体，不引入体积过大的中文等宽字体。
- 切片：`latin` 与 `cjk-common` 两个 `unicode-range` 切片，可变字重 400–700，`font-display: swap`，只预载 latin 切片。

## 4. 排版

```text
桌面正文    18px（--text-lg），行高 1.8
移动正文    17px（--text-md），行高 1.75
正文宽度    720px（--measure-prose）
列表页宽度  760px（--measure-page）
```

- 标题字距 `-0.02em` 至 `-0.04em`，`text-wrap: balance`。
- eyebrow 标签行：`0.16em` 字距 + 大写 + 2.5rem 发丝短线。
- 正文段落间距 `--space-5`，标题拥有稳定的垂直节奏（h2 上方 4rem）。

## 5. 间距、圆角、阴影

```text
间距  --space-1 … --space-11   4px 起步，倍增至 6rem
圆角  --radius-xs/sm/md/lg/pill   4 / 6 / 10 / 14 / 999px
阴影  --shadow-1/2/3           三级；亮色用墨色低透明，暗色用黑色
外壳  --shell-max 1080px   --gutter 1.5rem（≤420px 为 1.25rem）   --nav-height 72px
```

页首留白由导航高度推导（`--page-pad-top` / `--page-pad-top-mobile`），调整导航高度不需要再改正文留白。

## 6. 组件规则

- eyebrow：所有子页面顶部统一的标签行。
- 按钮：墨底纸字，悬停反转为透明底墨字；最小高度 44px。
- 胶囊 pill：标签与计数，1px 细线 + 全圆角。
- 文章列表：日期列 110px + 内容列；悬停/聚焦时用极淡墨色条带（`--wash`），向两侧外扩 `--row-bleed`（移动 .5rem / 宽屏 .75rem），文字在条带内保留真实内边距。条带是绝对定位的 `::after` + 行上的 `isolation: isolate`（负 z-index 因此只在本行内生效），**不修改行盒尺寸**，所以时间轴节点偏移无需重算。触屏不给 hover 反馈：hover 规则包在 `@media (hover: hover)` 里，键盘用 `:focus-within`，点按用 `:active`。
- 正文列表：`list-style-position: outside` 的列表必须保留 `padding-left`（1.4em）。**不要**给 `.contains-task-list` 清零缩进：remark-gfm 给“只要含任务项”的整个列表加这个类，清零会把普通项的 disc 标记画到盒子外，实测落在 x≈2px。
- 代码块复制按钮：绝对定位贴在代码卡右上角（不参与布局，否则 float 会把代码卡撑高约 36px），默认 `opacity: 0`，在 `pre:hover`（仅 hover 设备）、`pre:focus-within` 或按钮 `:focus-visible` 时显形。用 opacity 而不是 `visibility/display`，保证仍可 Tab 到达。
- 精选文章：内容列左侧 2px 墨色实线 + 「精选」徽章。
- 时间轴：统一左侧单轴 + 节点。不使用桌面中央轴 —— 中央轴会把年份标签挤进左槽、产生锯齿状留白，单轴只保留一条阅读边。
- 目录：宽屏是正文网格内的粘性轨（宽度由 `--measure-prose` 推导，不再硬编码坐标）；≤1100px 变为浮层，由阅读工具里的目录按钮开关。
- 阅读工具：固定右下；≤420px 横铺为底部工具条，触控目标不小于 44px。

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
≥1101px    正文列 + 目录轨
701–1100px 单列，目录改浮层
≤700px     移动布局、全屏菜单
≤420px     底部阅读工具条
```

验收宽度：360 / 390 / 768 / 1024 / 1440。

## 10. 样式文件结构

`app/globals.css` 只是入口，按固定顺序引入各层，顺序不可调整：

```text
tokens.css      设计令牌
base.css        reset、文档、链接、选区、焦点、辅助类、减少动效
layout.css      版心、页首、分节、导航、移动菜单、首屏、页脚
components.css  eyebrow、按钮、胶囊、表单、空状态、链接列表、文章列表、时间轴
prose.css       正文排版、代码块、表格、脚注、图片
reading.css     文章页版式、目录、阅读工具、授权卡、灯箱
fonts.css       自托管字体切片
```
