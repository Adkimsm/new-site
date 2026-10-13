# Next.js → Astro 重构计划

> 本文是 `new-site`（Adkinsm 个人站点）从 Next.js 15 App Router 迁移到 Astro 的执行计划。
> 面向「新开一个对话按本文执行」的场景，因此写得尽量自包含：每一处改动都给出目标文件与要点。
> 建议执行时逐阶段推进（见 §13），每阶段结束跑一次验收命令。

---

## 0. 目标与范围

### 动机（来自站主）

1. **降低心智负担**：摆脱 RSC / App Router 约定 / Metadata API 整体替换等概念。
2. **更好的内容体验**：MDX、frontmatter 校验、代码高亮、RSS、sitemap 希望是框架内建能力。
3. **摆脱 Vercel 绑定**：产物要是纯静态目录，能丢到任意静态托管。

### 结论

选择 **Astro**（`output: "static"`）：

- Content Collections 内置 zod 校验 + `render()`，几乎 1:1 对应现有 `lib/content/*`。
- 内置 shiki 双主题、rehype 生态（`rehype-slug` / `rehype-external-links`），可删掉一大段手写后处理。
- `<ClientRouter />` 原生替代手写的 View Transitions 拦截逻辑。
- 静态产物 + 无 adapter，可部署到 Cloudflare Pages / Netlify / GitHub Pages / 自建。

### 明确的取舍

- **保留 React 交互组件作为 island**（搜索浮层、目录、主题切换、移动菜单、灯箱、友链头像）。用 `@astrojs/react`。
- 页面外壳与布局用 `.astro` 重写；`lib/` 下的纯逻辑尽量原样保留。
- **不追求逐字节复制现有 HTML**，但要求视觉与交互等价、URL 不变、SEO 元数据等价。

### 非目标

- 不换 React 之外的 UI 语言（不重写为 Vue/Svelte/原生）。
- 不引入数据库、后端、环境变量。
- 不改设计（`docs/DESIGN.md` 的视觉规范保持不变）。

---

## 1. 目标架构总览

```
框架         Astro（静态输出）
渲染         服务端构建期生成静态 HTML；少量 React island 做交互
内容         Content Collections（glob loader）+ zod schema
MDX          @astrojs/mdx（内建 shiki 双主题 / GFM / 脚注）
路由         文件路由 src/pages/**
客户端路由    <ClientRouter />（astro:transitions）替代手写 view-transition
跨岛状态      nanostores（替代 React Context）
样式         原样迁移，仍是原生 CSS + 分层 @import
图片         <img>（public/ 静态资源）；后续可选 astro:assets 优化
部署         astro build → dist/，无 adapter
```

### 目标目录结构

```
new-site/
├── astro.config.mjs
├── package.json
├── tsconfig.json
├── eslint.config.mjs
├── vitest.config.ts
├── public/                      # 原样保留
│   ├── fonts/
│   ├── images/                  # avatar.jpg / og-default.png / posts/
│   ├── icon.svg                 # 由 app/icon.svg 迁来
│   ├── apple-touch-icon.png     # 由 app/apple-icon.tsx 预生成
│   └── _redirects               # 旧路径 301（替代 next.config redirects）
├── src/
│   ├── content.config.ts        # 集合定义（原 lib/content 的 schema）
│   ├── env.d.ts                 # astro/client 类型引用
│   ├── layouts/
│   │   └── BaseLayout.astro     # 原 app/layout.tsx
│   ├── pages/
│   │   ├── index.astro          # 原 app/page.tsx
│   │   ├── 404.astro            # 原 app/not-found.tsx
│   │   ├── posts/
│   │   │   ├── index.astro      # 原 app/posts/page.tsx
│   │   │   └── [slug].astro     # 原 app/posts/[slug]/page.tsx
│   │   ├── about.astro          # 原 app/about/page.tsx
│   │   ├── privacy.astro
│   │   ├── copyright.astro
│   │   ├── disclaimer.astro
│   │   ├── links.astro          # 原 app/links/page.tsx
│   │   ├── rss.xml.ts           # 原 app/rss.xml/route.ts
│   │   ├── search-index.json.ts # 原 app/search-index.json/route.ts
│   │   ├── sitemap.xml.ts       # 原 app/sitemap.ts
│   │   └── robots.txt.ts        # 原 app/robots.ts
│   ├── components/
│   │   ├── SiteNav.tsx          # 原 components/site-nav.tsx
│   │   ├── MenuButton.tsx
│   │   ├── ThemeToggle.tsx
│   │   ├── SearchDialog.tsx
│   │   ├── ReadingTools.tsx
│   │   ├── FriendAvatar.tsx
│   │   ├── icons.tsx
│   │   └── ContentPage.astro    # 原 components/content-page.tsx（改用 Astro）
│   ├── lib/
│   │   ├── site-config.ts       # 原样
│   │   ├── metadata.ts          # 去 Next 类型，保留结构
│   │   ├── search.ts            # 原样
│   │   ├── theme.ts             # 原样
│   │   ├── motion.ts            # 原样
│   │   ├── presence.ts          # 原样
│   │   ├── word-count.ts        # 从 lib/content/posts.ts 抽出 countWords
│   │   ├── posts.ts             # 集合查询 + 纯函数（groupPosts / filterPublished / getSeriesPosts）
│   │   ├── search-store.ts      # 新增：nanostores 搜索开关
│   │   └── friend-links.ts      # 原 lib/content/links.ts（改为读集合）
│   ├── content/                 # ← 由项目根 content/ 迁移
│   │   ├── posts/
│   │   └── pages/
│   └── styles/                  # ← 由根 styles/ 迁移（内容不变）
│       ├── tokens.css
│       ├── base.css
│       ├── motion.css
│       ├── layout.css
│       ├── components.css
│       ├── prose.css
│       ├── reading.css
│       └── fonts.css
└── tests/                       # 原样目录，部分用例改写（见 §11）
```

---

## 2. 依赖变更（`package.json`）

### 移除

```
next
@next/mdx
react-dom/server 相关的 RSC 依赖不需要显式声明
eslint-config-next
@types/mdx（Astro MDX 自带类型；如需可保留）
remark-frontmatter（Astro 原生处理 frontmatter）
```

> `react` / `react-dom` **保留**（island 需要）。
> `shiki` 可移除（Astro 内建 shiki；仅当测试仍直接调用 shiki 时保留）。
> `unified` / `remark-parse` / `remark-html` / `@mdx-js/loader` 移除（不再需要手写管线）。
> `gray-matter` 移除（Astro 解析 frontmatter）；`zod` 改用 `astro/zod`（Zod 4），因此顶层 `zod` 依赖可移除（若测试仍直接 import 则保留）。

### 新增

```
astro
@astrojs/react
@astrojs/mdx
@astrojs/sitemap        # 可选：若不保留自定义 sitemap.xml.ts 才需要
nanostores              # 跨 island 共享搜索开关
@nanostores/react       # React 绑定
```

### 开发依赖

```
@astrojs/check          # astro check（类型/内容校验）
typescript
vitest
eslint + eslint-plugin-astro + typescript-eslint（替代 eslint-config-next）
```

### scripts

```jsonc
{
  "dev": "astro dev",
  "build": "astro build",
  "preview": "astro preview",
  "lint": "eslint .",
  "typecheck": "astro check",
  "test": "vitest run"
}
```

---

## 3. 配置文件

### `astro.config.mjs`

```js
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import mdx from "@astrojs/mdx";

export default defineConfig({
  site: "https://adk.bot.cd", // 与 src/lib/site-config.ts 的 siteConfig.url 保持一致
  output: "static",
  trailingSlash: "ignore",
  integrations: [react(), mdx()],
  markdown: {
    // GFM 默认开启（表格 / 任务列表 / 删除线 / 脚注 / 自动链接）
    rehypePlugins: [
      "rehype-slug",                                  // h2/h3 id（中文标题保留中文）
      ["rehype-external-links", { target: "_blank", rel: ["noopener", "noreferrer"] }]
    ],
    shikiConfig: {
      themes: { light: "github-light", dark: "github-dark" },
      defaultColor: false                             // 产出 --shiki-light/--shiki-dark 变量
    }
  },
  vite: { /* 默认即可；别名用 tsconfig paths */ }
});
```

> ⚠️ `site` 必须填真实域名（`https://adk.bot.cd`），`@astrojs/sitemap` 与 canonical 都依赖它。
> 现有 `next.config.ts` 里的 5 条 redirect 不在 Astro 配置里做（Astro 的 `redirects` 只生成 meta-refresh 页，不是真 301），改用 `public/_redirects`（见 §8.4）。

### `tsconfig.json`

```jsonc
{
  "extends": "astro/tsconfigs/strict",
  "compilerOptions": {
    "jsx": "react-jsx",
    "baseUrl": ".",
    "paths": { "@/*": ["src/*"] }
  },
  "include": [".astro/types.d.ts", "**/*"],
  "exclude": ["dist"]
}
```

### `src/env.d.ts`

```ts
/// <reference types="astro/client" />
```

### `vitest.config.ts`

保持纯逻辑单测的轻量配置即可：

```ts
import { defineConfig } from "vitest/config";
export default defineConfig({
  resolve: { alias: { "@": new URL("./src", import.meta.url).pathname } },
  esbuild: { jsx: "automatic" },
  test: { environment: "node" }
});
```

> 若需要让测试直接调用 `getCollection()`（`astro:content`），再引入 `astro/config` 的 `getViteConfig`。
> **本计划的默认策略是不依赖它**：把可测逻辑抽成纯函数（见 §11），内容 schema 用导出的 zod schema 直接测。

### `eslint.config.mjs`

用 `eslint-plugin-astro` 的 flat config，替换 `eslint-config-next`：

```js
import js from "@eslint/js";
import ts from "typescript-eslint";
import astro from "eslint-plugin-astro";

export default [
  { ignores: ["dist/**", ".astro/**"] },
  js.configs.recommended,
  ...ts.configs.recommended,
  ...astro.configs.recommended
];
```

---

## 4. 内容层：Content Collections

### 4.1 `src/content.config.ts`

把现有 `lib/content/posts.ts` / `pages.ts` / `links.ts` 里的 zod schema 搬进来。

```ts
import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const posts = defineCollection({
  loader: glob({
    base: "./src/content/posts",
    pattern: "**/*.{md,mdx}",
    // 保持「文件名即 URL」，不额外 slugify（当前文件名已是小写连字符，行为一致）
    generateId: ({ entry }) => entry.replace(/\.(md|mdx)$/, "")
  }),
  schema: z.object({
    title: z.string().min(1),
    date: z.string().date(),
    updated: z.string().date().optional(),
    description: z.string().min(1),
    tags: z.array(z.string()).default([]),
    featured: z.boolean().default(false),
    canonical: z.string().url().optional(),
    cover: z.string().optional(),
    draft: z.boolean().default(false),
    series: z.string().min(1).optional(),
    seriesOrder: z.number().int().optional()
  })
});

const pageSchema = z.object({
  title: z.string().min(1),
  heading: z.string().min(1).optional(),
  eyebrow: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  // links 页专属（其余页面留空）
  friendsTitle: z.string().min(1).default("友情链接"),
  links: z
    .array(z.object({
      name: z.string().min(1),
      url: z.string().url(),
      avatar: z.string().optional(),
      description: z.string().optional()
    }))
    .default([])
});

const pages = defineCollection({
  loader: glob({ base: "./src/content/pages", pattern: "**/*.{md,mdx}" }),
  schema: pageSchema
});

export const collections = { posts, pages };
```

> `z` 从 `astro:content`（或 `astro/zod`）导入，是 Zod 4。注意 Zod 4 的 `.url()` / `.date()` API 与 Zod 3 兼容（`z.string().url()` 仍可用）。

### 4.2 `src/lib/posts.ts`（集合查询 + 纯函数）

```ts
import { getCollection, type CollectionEntry } from "astro:content";

export type PostEntry = CollectionEntry<"posts">;
export type Post = PostEntry["data"] & { slug: string; wordCount: number; body: string };

/** 生产构建过滤草稿；开发保留以便预览。纯函数，便于单测。 */
export function filterPublished<T extends { data: { draft: boolean } }>(entries: T[], isProd: boolean): T[] {
  return isProd ? entries.filter((entry) => !entry.data.draft) : entries;
}

/** 读取全部（已过滤）文章，按日期倒序，附带 slug / 字数 / 原文。 */
export async function getPosts(isProd = import.meta.env.PROD): Promise<Post[]> {
  const entries = filterPublished(await getCollection("posts"), isProd);
  return entries
    .map((entry) => ({
      ...entry.data,
      slug: entry.id,
      body: entry.body ?? "",
      wordCount: countWords(entry.body ?? "")
    }))
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function getSeriesPosts(post: Post, posts: Post[]): Post[] { /* 原逻辑照搬 */ }
export function groupPosts(posts: Post[]) { /* 原逻辑照搬 */ }
export function validatePostSlugs(posts: Post[]) { /* 原逻辑照搬 */ }
```

- `countWords` 移到 `src/lib/word-count.ts`（原样搬运，含 CJK 统计与代码块剔除），保持可单测。
- 封面存在性校验（原来 `getPosts` 里 `fs.existsSync(public/cover)`）改为在 `src/lib/cover.ts` 或构建期用一个 Astro 页面/端点做一次校验；更简单：在 `[slug].astro` 渲染封面时若文件缺失，Astro 的 `<img>` 会 404，**建议保留一次构建期校验**（放在 `src/pages/sitemap.xml.ts` 或专门的 `astro:build:start` 集成钩子里）。见 §14 风险。

### 4.3 草稿过滤的调用点

所有依赖「生产隐藏草稿」的输出都改用 `getPosts()`（已内置过滤）：

- `posts/index.astro`、`index.astro`（首页最近文章）
- `posts/[slug].astro` 的 `getStaticPaths`
- `rss.xml.ts`、`search-index.json.ts`、`sitemap.xml.ts`

---

## 5. 页面迁移（逐文件）

### 5.1 `src/layouts/BaseLayout.astro`（原 `app/layout.tsx`）

要点：

- `<head>` 内：`<meta charset>`、viewport、`<title>`、description、canonical、RSS alternate、OG/Twitter（由 `metadata.ts` 产出的对象展开）、`<link rel="icon" href="/icon.svg">`、`<link rel="apple-touch-icon" href="/apple-touch-icon.png">`、字体 preload、`<ClientRouter />`。
- **防闪烁脚本**必须内联且同步执行：

  ```astro
  <script is:inline set:html={themeInitScript()} />
  ```

  > ⚠️ 必须用 `is:inline`：Astro 默认把 `<script>` 打包成 defer 的 module，那样会晚于首屏绘制，深色模式会闪白。
- `<body>` 内：`SearchDialog` island（常驻，`client:load`）、`SiteNav` island、`<slot />`、footer。
- 页脚三组链接（导航 / 条款 / 联系）直接用 Astro 模板渲染（原来是 JSX 常量 + `next/link`）。站内链接用普通 `<a>`，`<ClientRouter />` 会自动接管。
- JSON-LD（Person + WebSite）用 `<script type="application/ld+json" set:html={JSON.stringify([...])} />`。
- **视图过渡命名**：给固定导航、页脚加 `transition:name="site-nav"` / `transition:name="site-footer"`，给搜索浮层、移动菜单加各自名字，避免被卷进 root 快照（对应 `docs/DESIGN.md` §8 的做法）。

布局 props（由各页面传入）：

```ts
interface Props {
  title?: string;
  description?: string;
  canonical?: string;
  image?: string;
  type?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
}
```

### 5.2 `src/lib/metadata.ts`（去 Next 类型）

- 删除 `import type { Metadata } from "next"`。
- **保留返回对象的结构**（`title` / `description` / `alternates.canonical` / `alternates.types` / `openGraph` / `twitter`），这样 `tests/metadata.test.ts` 几乎不用改。
- 新增一个 `toHeadProps(meta)` 或让 `BaseLayout` 直接消费该结构。
- `DEFAULT_OG_IMAGE`、`BITMAP` 逻辑原样保留。

### 5.3 `src/pages/index.astro`（原 `app/page.tsx`）

- `const posts = (await getPosts()).slice(0, 5);`
- 头像：`next/image` → `<img src={siteConfig.avatar} alt="Adkinsm 的头像" width={112} height={112} />`。
- 其余标记与 class 原样搬运。

### 5.4 `src/pages/posts/index.astro`（原 `app/posts/page.tsx`）

- `const grouped = groupPosts(await getPosts());`
- `next/link` → `<a>`。

### 5.5 `src/pages/posts/[slug].astro`（原 `app/posts/[slug]/page.tsx`）

```astro
---
import { getPosts, getSeriesPosts } from "@/lib/posts";
import { render } from "astro:content";
export async function getStaticPaths() {
  const posts = await getPosts();
  return posts.map((post, index) => ({ params: { slug: post.slug }, props: { post, index, posts } }));
}
const { post, index, posts } = Astro.props;
const entry = await getEntry("posts", post.slug);
const { Content } = await render(entry);
const series = getSeriesPosts(post, posts);
---
```

- 正文：`<div id="article-content" class="prose"><Content /></div>`（**不再**渲染成 HTML 字符串）。
- `<ReadingTools client:load />`（去掉 `html` prop，见 §7.5）。
- 封面：`<img class="post-cover" src={post.cover} alt="" width={1200} height={630} />`。
- 上一篇/下一篇、系列块、授权卡、标签、JSON-LD 逻辑原样搬运。
- `generateMetadata` → 改为在 frontmatter 计算 `metadata` 并传 `BaseLayout`。

### 5.6 内容页 `about / privacy / copyright / disclaimer`

保持「一页一文件」，与现有 `app/{slug}/page.tsx` 一一对应：

```astro
---
// src/pages/about.astro
import { getEntry, render } from "astro:content";
import BaseLayout from "@/layouts/BaseLayout.astro";
import ContentPage from "@/components/ContentPage.astro";
import { buildMetadata } from "@/lib/metadata";
const entry = await getEntry("pages", "about");
const { Content } = await render(entry);
const meta = buildMetadata({ title: entry.data.title, description: entry.data.description, path: "/about" });
---
<BaseLayout {...meta}>
  <ContentPage eyebrow={entry.data.eyebrow} heading={entry.data.heading ?? entry.data.title}>
    <Content />
  </ContentPage>
</BaseLayout>
```

- `src/components/ContentPage.astro` 用 `<slot />` 接收正文。
- `about.mdx` 里的 `import { siteConfig } from "@/lib/site-config"` 在 Astro MDX 下可用（路径别名同 tsconfig）。

### 5.7 `src/pages/links.astro`（原 `app/links/page.tsx`）

- 从 `pages` 集合取 `links` 条目；`friendsTitle` / `links` 来自 frontmatter，正文（intro）用 `<Content />` 渲染。
- 友链列表、`FriendAvatar` island（`client:load`）、空状态原样搬运。
- 本地头像存在性校验：保留 `lib/friend-links.ts` 的校验逻辑（读 frontmatter 后 `fs.existsSync(public/...)`）。

### 5.8 `src/pages/404.astro`

- 用 `BaseLayout`，`robots` 用 `<meta name="robots" content="noindex, nofollow">`（或 Astro 的 `Astro.response`/head 直接写）。保持 `title: "页面未找到"`。

---

## 6. 端点迁移

### 6.1 `src/pages/rss.xml.ts`

- 逻辑照搬（`getPosts()` + CDATA + `new Response(...)`）。
- `export const prerender = true;`（静态输出下默认即预渲染，可省略）。
- `dynamic = "force-static"` 删除。

### 6.2 `src/pages/search-index.json.ts`

- 照搬，`content` 字段取 `post.body`。

### 6.3 `src/pages/sitemap.xml.ts`

**保留自定义端点**（而不是 `@astrojs/sitemap`），以维持 `/sitemap.xml` 这个确切 URL 与现有结构：

```ts
import { getPosts } from "@/lib/posts";
import { siteConfig } from "@/lib/site-config";
export async function GET() {
  const base = siteConfig.url;
  const pages = ["", "/posts", "/about", "/links", "/privacy", "/copyright", "/disclaimer"];
  const urls = [
    ...pages.map((path) => `<url><loc>${base}${path}</loc></url>`),
    ...(await getPosts()).map((post) => `<url><loc>${base}/posts/${post.slug}</loc><lastmod>${post.updated ?? post.date}</lastmod></url>`)
  ];
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.join("")}</urlset>`, {
    headers: { "Content-Type": "application/xml; charset=utf-8" }
  });
}
```

> 若改用 `@astrojs/sitemap`，URL 会变成 `/sitemap-index.xml` + `/sitemap-0.xml`，与现有测试/站点约定不符，故不采用（除非同步改测试与 `robots`）。

### 6.4 `src/pages/robots.txt.ts`

- 照搬：`User-agent: * / Allow: / / Sitemap: {siteConfig.url}/sitemap.xml`。

### 6.5 `public/_redirects`（替代 `next.config.ts` redirects）

```
/pages/about   /about      301
/pages/links   /links      301
/rss           /rss.xml    301
/sitemap       /sitemap.xml 301
/pages/tweets  /           301
```

> Cloudflare Pages / Netlify 原生支持 `_redirects`（真 301）。
> **GitHub Pages 不支持** `_redirects`，若选它需改用 Astro `redirects`（meta-refresh）或在构建后处理。

---

## 7. 组件迁移（React island）

原则：**只改框架耦合点，交互逻辑不动**。

### 7.1 `SiteNav.tsx`

- 删除 `next/link`（`<Link>` → `<a>`）、`next/navigation`（`usePathname`）。
- 当前页高亮改为**框架无关**：读 `window.location.pathname`，并监听 `astro:page-load` 事件更新。

  ```tsx
  const [pathname, setPathname] = useState("");
  useEffect(() => {
    const update = () => setPathname(window.location.pathname);
    update();
    document.addEventListener("astro:page-load", update);
    return () => document.removeEventListener("astro:page-load", update);
  }, []);
  ```

- 搜索按钮：`onClick={() => searchStore.open(true)}`（见 §7.2），不再依赖 `useSearch()` Context。

### 7.2 搜索状态：Context → nanostores

新增 `src/lib/search-store.ts`：

```ts
import { atom } from "nanostores";
export const searchOpen = atom(false);
```

- `SiteNav` 的搜索按钮：`searchOpen.set(true)`。
- `SearchDialog` 用 `useStore(searchOpen)` 读开关；关闭时 `searchOpen.set(false)`。
- **全局快捷键监听**（`⌘K` / `Ctrl+K` / `/`）从 `SearchProvider` 移到 `SearchDialog` island 的 `useEffect`（该 island 常驻 `client:load`），逻辑照搬 `search-provider.tsx`。
- `SearchProvider` 组件删除。

> 为什么不用 Context：Astro 里每个 island 是**独立的 React root**，不共享 Context。nanostores 是模块级状态，跨 island 可用，也是 Astro 官方推荐做法。

### 7.3 `SearchDialog.tsx`

- `next/link` → `<a>`（点击由 `<ClientRouter />` 接管）。
- `useViewTransitionNavigate()` → `import { navigate } from "astro:transitions/client"`，键盘 Enter 时 `navigate('/posts/' + slug)`。
- 其余（索引拉取、`usePresence`、焦点陷阱、`highlight`）原样。

### 7.4 `MenuButton.tsx`

- `next/link` → `<a>`。
- 其余（`usePresence` / WAAPI / 焦点陷阱）原样。
- 给移动菜单根节点加 `transition:name="mobile-menu"`（在 Astro 侧无法直接加 directive 到 island 内部节点；改为在 `layout.css`/`motion.css` 用类名 `::view-transition-*` 处理，或给 island 外层包一层带 `transition:name` 的 Astro 元素）。

### 7.5 `ReadingTools.tsx`（关键改动）

- 删除 `html` prop 与 `dangerouslySetInnerHTML`；改为在 `useEffect` 里查询页面 DOM：

  ```tsx
  const root = document.getElementById("article-content");
  if (!root) return;
  const elements = [...root.querySelectorAll<HTMLHeadingElement>("h2, h3")]...
  ```

  （其余「代码复制按钮注入」「图片灯箱」「进度环」逻辑照搬。）
- `next/image`（灯箱放大图）→ 原生 `<img>`（灯箱本来就是 `unoptimized`，用原生 `<img>` 等价）。
- **重新初始化**：页面跳转后正文会换成新 DOM，需要让 island 重新绑定。默认 `client:load` island 在 ClientRouter 导航后会被替换并重新 hydrate（React 重挂载 → effect 重跑）。**验证点**：客户端跳转后目录/复制按钮仍工作；若未重跑，在 `useEffect` 里同时监听 `astro:page-load`，或给 island 加 `transition:persist` 之外的 key 策略。

### 7.6 `ThemeToggle.tsx`

- 无框架耦合，原样保留（`lib/theme.ts` 不变）。

### 7.7 `FriendAvatar.tsx`

- 已是原生 `<img>`，原样保留。移除 `// eslint-disable-next-line @next/next/no-img-element` 注释。

### 7.8 `icons.tsx`

- 原样保留。

### 7.9 `lib/presence.ts` / `lib/motion.ts`

- **完全不动**。

### 7.10 删除 `lib/view-transition.ts` 与 `components/page-transition.tsx`

- 拦截逻辑由 `<ClientRouter />` 内置（它自己在 `document` 上挂 click 代理，逻辑与现有手写版几乎相同）。
- `styles/motion.css` 的 `::view-transition-old/new(root)` 关键帧**保留**，但需核对选择器与 Astro 生成的 transition name 是否一致；固定导航/页脚/浮层的 `transition:name` 改在 Astro 标记上加。

---

## 8. 样式迁移

- `styles/*` → `src/styles/*`，**内容不变**。
- `app/globals.css` → `src/styles/globals.css`，保留 `@import` 顺序（tokens → base → motion → layout → components → prose → reading → fonts）。在 `BaseLayout.astro` 里 `import "@/styles/globals.css"`。
- **shiki 双主题零改动**：`prose.css` 用的 `--shiki-light` / `--shiki-light-bg` / `--shiki-dark` / `--shiki-dark-bg` 正是 Astro `shikiConfig: { themes, defaultColor: false }` 的产出变量。核对 `pre.shiki` 类名存在即可。
- 触屏 hover、`.contains-task-list` 缩进、`.code-block` 复制按钮定位等约束（见 `docs/DESIGN.md`）全部沿用。
- `fonts.css` 无需改（仍走 `public/fonts/`，`@font-face` 自托管）。

---

## 9. 待删除文件清单

```
app/                      整个目录（由 src/pages + src/layouts 取代）
components/               整个目录（迁到 src/components）
lib/                      整个目录（迁到 src/lib）
content/                  整个目录（迁到 src/content）
styles/                   整个目录（迁到 src/styles）
next.config.ts
next-env.d.ts
mdx-components.tsx        Astro MDX 不需要该约定文件
tsconfig.tsbuildinfo
.next/
pnpm-workspace.yaml       若 allowBuilds 仅服务于 next/eslint-config-next，则删除或精简
eslint.config.mjs         重写（见 §3）
vitest.config.ts          更新 alias 到 src（见 §3）
```

保留：`public/`、`tests/`、`docs/`、`README.md`、`LICENSE`、`.gitignore`。

### `app/apple-icon.tsx` 与 `app/icon.svg`

- `app/icon.svg` → `public/icon.svg`（原样复制），`BaseLayout` 里 `<link rel="icon" href="/icon.svg">`。
- `app/apple-icon.tsx`（`next/og` 的 `ImageResponse`）→ 用 `satori` 或一次性脚本**预生成** `public/apple-touch-icon.png`（180×180）并提交为静态资源；`BaseLayout` 里 `<link rel="apple-touch-icon" href="/apple-touch-icon.png">`。
- `lib/metadata.ts` 里 `DEFAULT_OG_IMAGE` 已指向 `public/images/og-default.png`，无需重生成。

---

## 10. 部署

### 产物

```
pnpm build   →   dist/   （纯静态）
pnpm preview →   本地预览 dist/
```

### 推荐落地（按「脱 Vercel」诉求）

| 平台 | 命令/配置 | 备注 |
|---|---|---|
| **Cloudflare Pages**（推荐） | build `pnpm build`，output `dist` | 支持 `_redirects`，免费，无厂商锁定 |
| Netlify | build `pnpm build`，publish `dist` | 支持 `_redirects` |
| GitHub Pages | 需 GH Actions + `withastro/action` | **不支持 `_redirects`**，重定向要另想办法 |
| 自建 nginx/Caddy | 直接托管 `dist/` | 重定向写在服务器配置里 |
| S3 + CDN | 上传 `dist/` | 重定向用 CDN 规则 |

### CI 验收命令（顺序）

```bash
pnpm install
pnpm typecheck   # astro check
pnpm lint
pnpm test
pnpm build
```

---

## 11. 测试策略

### 原样保留（纯逻辑，零改动或仅改 import 路径）

- `tests/theme.test.ts`
- `tests/search.test.ts`
- `tests/metadata.test.ts`（若 `buildMetadata` 结构保持，断言不变）
- `tests/series.test.ts`（`Post` 类型改为新定义）
- `tests/links.test.ts`（schema 从 `src/content.config.ts` 导出后测 `safeParse`；`validateFriendLinkUrls` 保留）
- `tests/pages.test.ts` → 改为测导出的 `pageSchema.safeParse(...)`（不读文件）

### 需要改写

- `tests/content.test.ts`：
  - `countWords` 部分 → import 改到 `src/lib/word-count.ts`，断言不变。
  - `getPosts()` 读取真实文件的部分 → 改为测纯函数 `groupPosts` / `filterPublished`（传入构造数据）。真实文件的 7 篇断言交给 `astro build`/`astro check` 保证。
- `tests/draft.test.ts`：改为测 `filterPublished(entries, true/false)`（纯函数，不依赖 `NODE_ENV`）。
- `tests/mdx.test.ts` / `tests/markdown.test.ts` / `tests/headings.test.ts`：这三份测的是**被删掉的手写管线**（`renderContent` / `highlightCodeBlocks` / `addHeadingIds` / `hardenExternalLinks`）。
  - **删除**，改由以下方式覆盖：
    - 代码高亮 / 标题 id / 外链：交给 Astro 的 rehype/shiki 配置，用一次 `astro build` 产物检查（例如构建后 grep `dist/posts/*/index.html` 是否含 `class="shiki"`、`<h2 id=`、`target="_blank"`）。
    - 或写一个基于 `getViteConfig` 的集成测试（可选）。
- `tests/routes.test.ts`：改为直接调用新的端点 `GET()`（`rss.xml.ts` / `sitemap.xml.ts` / `robots.txt.ts`），断言结构不变；`getPosts()` 改为 `await`。

### 建议新增

- `tests/word-count.test.ts`（从 content.test 拆出，保持纯函数覆盖）。
- `tests/filter-published.test.ts`。
- 构建产物 smoke 检查脚本（可选，纳入 CI）。

---

## 12. 文档更新

- `README.md`：开发命令改 `pnpm dev`（Astro）；「部署」改为静态托管说明。
- `docs/DEPLOYMENT.md`：从 Vercel 改为目标静态平台 + `_redirects` 说明。
- `docs/MAINTENANCE.md`：
  - 「正文渲染」段改为 Astro MDX + collections 描述；
  - 删除 `@next/mdx` / `lib/mdx/*` / `renderContent` 相关描述；
  - 更新「内容页面」「友情链接」路径为 `src/content/**`；
  - 更新「主题」里防闪烁脚本位置（`BaseLayout.astro`，`is:inline`）；
  - 更新故障排查条目（代码复制按钮消失 → 改为确认 island 在导航后重挂载）。
- `docs/WRITING.md`：`draft` 的说明从「`next dev`」改为「`astro dev`」。
- `docs/DESIGN.md`：§8「页面过渡」的 Next 专有描述（`next/link`、`router.push`、`page-transition.tsx`）改为 `<ClientRouter />` 方案。
- 新增本文件 `docs/ASTRO_MIGRATION.md`。

---

## 13. 分阶段执行顺序

> 每阶段结束都要能通过「验收命令」（§10 的 CI 命令），再进入下一阶段。

### 阶段 1：脚手架与配置（半天）

1. `pnpm add astro @astrojs/react @astrojs/mdx nanostores @nanostores/react`
2. `pnpm add -D @astrojs/check eslint-plugin-astro typescript-eslint`
3. 建 `astro.config.mjs` / `tsconfig.json` / `src/env.d.ts` / 新 `vitest.config.ts` / 新 `eslint.config.mjs`。
4. 迁移 `public/`（`icon.svg`、`apple-touch-icon.png`），加 `public/_redirects`。
5. 迁移 `styles/` → `src/styles/`。
6. 移除 Next 依赖，确认 `pnpm install` 干净。

### 阶段 2：内容层（1 天）

1. `content/` → `src/content/`。
2. 写 `src/content.config.ts`（posts + pages 集合）。
3. 写 `src/lib/word-count.ts`、`src/lib/posts.ts`、`src/lib/friend-links.ts`、`src/lib/search-store.ts`。
4. `pnpm astro sync` 生成类型；`pnpm typecheck` 通过。

### 阶段 3：布局与静态页面（1–2 天）

1. `src/lib/metadata.ts` 去 Next 类型。
2. `BaseLayout.astro`（含防闪烁脚本、JSON-LD、页脚、`<ClientRouter />`、`transition:name`）。
3. `index.astro` / `posts/index.astro` / `posts/[slug].astro` / 4 个内容页 / `links.astro` / `404.astro`。
4. `ContentPage.astro`。
5. 端点：`rss.xml.ts` / `search-index.json.ts` / `sitemap.xml.ts` / `robots.txt.ts`。

### 阶段 4：island 适配（1–2 天）

1. 迁移 `icons.tsx` / `ThemeToggle.tsx` / `FriendAvatar.tsx`（基本原样）。
2. `SiteNav.tsx`（`astro:page-load` + nanostores）。
3. `SearchDialog.tsx`（`astro:transitions/client` 的 `navigate`）。
4. `MenuButton.tsx`。
5. `ReadingTools.tsx`（改查 DOM）。
6. 删除 `SearchProvider` / `view-transition.ts` / `page-transition.tsx`。

### 阶段 5：清理与测试（1 天）

1. 删除 `app/` / `components/` / `lib/` / `content/` / `styles/` 旧目录与 `next.config.ts` 等。
2. 改写测试（§11）。
3. 跑通全部验收命令。
4. 更新文档（§12）。

### 阶段 6：部署切换（半天）

1. 目标平台接入仓库，构建命令 `pnpm build`，产物 `dist`。
2. 绑定 `adk.bot.cd`，核对重定向与 SEO。

**预计总量：约 5–7 个工作日。**

---

## 14. 风险与坑点（执行时重点核对）

1. **防闪烁脚本必须 `is:inline`**：否则 Astro 打包成 defer module，深色模式闪白。
2. **island 是独立 React root**：Context 不跨 island，搜索开关必须用 nanostores 或自定义事件。
3. **`<ClientRouter />` 后的 island 重挂载**：确认 `ReadingTools`（目录/复制按钮/灯箱）在客户端跳转后重新绑定到新正文；必要时监听 `astro:page-load`。
4. **视图过渡命名**：固定导航/页脚/搜索浮层/移动菜单需 `transition:name`，否则被卷入 root 快照导致「动画丢失/闪一下」（`docs/DESIGN.md` §8 有详细成因，可直接对照）。
5. **shiki 变量名**：确认 Astro 输出 `--shiki-light`/`--shiki-dark`（与 `prose.css` 一致）。若 Astro 版本改用 `--shiki-dark-bg` 以外的命名，需同步 `prose.css`。
6. **`generateId` 保持 URL 不变**：glob loader 默认会 slugify id；用 `generateId` 去掉扩展名即可，确保 `/posts/{filename}` 不变。
7. **`site` 配置**：`astro.config.mjs` 的 `site` 必须是 `https://adk.bot.cd`，否则 canonical/sitemap 出错。
8. **封面/本地头像存在性校验**：原 `getPosts` / `getFriendLinks` 有 `fs.existsSync` 校验，迁移后要保留一处构建期校验，避免线上破图。
9. **sitemap URL 不变**：坚持自定义 `sitemap.xml.ts`，不要用 `@astrojs/sitemap`（会改 URL）。
10. **重定向平台差异**：`_redirects` 在 GitHub Pages 无效。
11. **`rehype-external-links` 的判定**：确认站内相对链接与锚点不被加 `target`（默认只处理绝对外链，行为与现有 `hardenExternalLinks` 一致）。
12. **标题 id 算法差异**：`rehype-slug`（github-slugger）与现有自定义 `slugifyHeading` 对中文/标点的处理可能略有出入；目录锚点仍可用，但若有历史外链指向旧锚点需留意。
13. **`about.mdx` 的 `import`**：Astro MDX 支持 `import`，路径别名 `@/lib/site-config` 需在 tsconfig 中生效。
14. **Zod 版本**：`astro/zod` 是 Zod 4；若保留顶层 `zod@3` 依赖用于测试，注意两套 schema 的 API 差异，尽量统一用 `astro/zod`。

---

## 15. 验收清单

- [ ] `pnpm typecheck`（`astro check`）通过
- [ ] `pnpm lint` 通过
- [ ] `pnpm test` 通过
- [ ] `pnpm build` 通过，产出 `dist/`
- [ ] 首页、`/posts`、每篇文章、`/about`、`/links`、`/privacy`、`/copyright`、`/disclaimer` 正常
- [ ] `/rss.xml`、`/sitemap.xml`、`/robots.txt`、`/search-index.json` 正常
- [ ] 旧路径 301：`/pages/about`、`/pages/links`、`/rss`、`/sitemap`、`/pages/tweets`
- [ ] 每页 canonical 指向自身（非首页）
- [ ] OG / Twitter 卡片正确（含默认卡片回退与位图封面）
- [ ] 深色模式：系统偏好 + 手动切换；无首屏闪白；代码块双主题正确
- [ ] 搜索：`⌘K`/`Ctrl+K`/`/` 打开；`↑↓`/`Enter`/`Esc`；索引懒加载
- [ ] 文章页：目录、滚动高亮、阅读进度、代码复制、图片灯箱
- [ ] 客户端跳转：View Transitions 生效；导航/页脚/浮层不被卷入快照
- [ ] 移动端：菜单开合、断点 360/390/768/1024/1440 正常
- [ ] `prefers-reduced-motion: reduce` 下动画归零
- [ ] 字体切片命中（latin 预载、CJK 按需）
