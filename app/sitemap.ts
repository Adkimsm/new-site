import type { MetadataRoute } from "next";
import { getPosts } from "@/lib/content/posts";
import { siteConfig } from "@/lib/site-config";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteConfig.url;
  const pages = ["", "/posts", "/about", "/links", "/privacy", "/copyright", "/disclaimer"].map((url) => ({ url: base + url }));
  return [...pages, ...getPosts().map((post) => ({ url: `${base}/posts/${post.slug}`, lastModified: post.updated ?? post.date }))];
}
