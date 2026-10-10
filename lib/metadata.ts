import type { Metadata } from "next";
import { siteConfig } from "@/lib/site-config";

/**
 * 站点统一的 metadata 构造器。
 *
 * 为什么需要它：Next 解析 metadata 时页面的 `alternates` / `openGraph` /
 * `twitter` 会**整体替换**根布局里的同名键（不是深合并）。所以任何想自定义
 * `title` 的页面都必须显式带上 canonical、RSS 链接、OG/Twitter 卡片，否则
 * 这些字段会退回布局的默认值 —— 之前所有子页 canonical 都指向首页就是这个原因。
 */

/** 默认分享卡片；1200×630，由 ImageResponse 预生成后提交为静态资源。 */
export const DEFAULT_OG_IMAGE = "/images/og-default.png";

/** OG/Twitter 只接受位图，SVG 会被社交平台忽略，遇到 SVG 封面时回退默认卡片。 */
const BITMAP = /\.(png|jpe?g|webp)$/i;

type BuildMetadataInput = {
  /** 页面标题；省略时使用根布局的默认标题。 */
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
