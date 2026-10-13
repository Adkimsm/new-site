import { siteConfig } from "@/lib/site-config";

/**
 * 站点统一的 metadata 构造器。
 *
 * 迁移前依赖 Next 的 `Metadata` 类型；这里改为本地定义的等价结构，字段名与
 * 层级完全保留（`title` / `description` / `alternates` / `openGraph` / `twitter`），
 * 这样 `tests/metadata.test.ts` 的断言无需改动，`BaseLayout.astro` 也能直接消费。
 *
 * 为什么要显式带上 canonical、RSS 链接与 OG/Twitter 卡片：页面级 metadata 会
 * 整体替换布局里的同名键（不是深合并），任何自定义 `title` 的页面若省略这些
 * 字段就会退回默认值 —— 之前所有子页 canonical 都指向首页就是这个原因。
 */

/** 默认分享卡片；1200×630，预生成为静态资源。 */
export const DEFAULT_OG_IMAGE = "/images/og-default.png";

/** OG/Twitter 只接受位图，SVG 会被社交平台忽略，遇到 SVG 封面时回退默认卡片。 */
const BITMAP = /\.(png|jpe?g|webp)$/i;

export type OgImage = { url: string; width: number; height: number; alt: string };

/** 与 Next `Metadata` 字段对齐的本地类型，只保留站点实际用到的部分。 */
export type Metadata = {
  title?: string;
  description?: string;
  alternates?: { canonical?: string; types?: Record<string, string> };
  openGraph?: {
    title?: string;
    description?: string;
    url?: string;
    type?: "website" | "article";
    images?: OgImage[];
    publishedTime?: string;
    modifiedTime?: string;
  };
  twitter?: { card?: string; title?: string; description?: string; images?: string[] };
};

type BuildMetadataInput = {
  /** 页面标题；省略时使用布局的默认标题。 */
  title?: string;
  description?: string;
  /** 站内路径，以 `/` 开头，首页传空字符串。 */
  path: string;
  /** 覆盖 canonical（例如正文里指定的转载原文地址）。 */
  canonical?: string;
  /** 分享卡片图片；非位图会回退到默认卡片。 */
  image?: string;
  type?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
};

export function buildMetadata({ title, description = siteConfig.description, path, canonical, image, type = "website", publishedTime, modifiedTime }: BuildMetadataInput): Metadata {
  const url = `${siteConfig.url}${path}`;
  const canonicalUrl = canonical || url;
  const ogImage = image && BITMAP.test(image) ? image : DEFAULT_OG_IMAGE;
  const images = [{ url: ogImage, width: 1200, height: 630, alt: title ?? siteConfig.name }];

  return {
    title,
    description,
    alternates: { canonical: canonicalUrl, types: { "application/rss+xml": `${siteConfig.url}/rss.xml` } },
    openGraph: {
      title: title ?? siteConfig.name,
      description,
      url: canonicalUrl,
      type,
      images,
      ...(type === "article" ? { publishedTime, modifiedTime } : {})
    },
    twitter: {
      card: "summary_large_image",
      title: title ?? siteConfig.name,
      description,
      images: [ogImage]
    }
  };
}
