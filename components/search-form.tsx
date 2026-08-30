"use client";

import Link from "next/link";
import { useState } from "react";

type SearchPost = { slug: string; title: string; description: string; date: string; content: string; tags: string[] };

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function highlight(text: string, query: string) {
  const terms = query.trim().split(/\s+/).filter(Boolean).map(escapeRegExp);
  return terms.length ? text.replace(new RegExp(`(${terms.join("|")})`, "gi"), "<mark>$1</mark>") : text;
}

function getSnippet(post: SearchPost, query: string) {
  const source = `${post.description} ${post.content.replace(/[#*_`>\[\]()]/g, "")}`;
  const term = query.trim().split(/\s+/).find(Boolean);
  const index = term ? source.toLocaleLowerCase().indexOf(term.toLocaleLowerCase()) : 0;
  const start = Math.max(0, index - 55);
  return `${start > 0 ? "…" : ""}${source.slice(start, start + 150)}${start + 150 < source.length ? "…" : ""}`;
}

export function SearchForm({ posts }: { posts: SearchPost[] }) {
  const [query, setQuery] = useState("");
  const normalized = query.trim().toLocaleLowerCase();
  const results = posts.filter((post) => `${post.title} ${post.description} ${post.content} ${post.tags.join(" ")}`.toLocaleLowerCase().includes(normalized)).slice(0, 20);

  return <div role="search"><label className="sr-only" htmlFor="site-search">搜索文章</label><input id="site-search" type="search" aria-label="搜索文章" placeholder="输入关键词…" value={query} onChange={(event) => setQuery(event.target.value)} style={{ width: "100%", padding: "1rem", border: "1px solid var(--line)", background: "var(--surface)", color: "var(--ink)", font: "inherit" }} /><p className="meta" aria-live="polite">{query ? `找到 ${results.length} 篇文章` : "支持中文关键词、标题、摘要、正文和标签"}</p><ul className="post-list search-results" style={{ marginTop: "1rem" }}>{query && results.map((post) => <li className="post-item" key={post.slug}><time className="post-date">{post.date}</time><div><Link className="post-title" href={`/posts/${post.slug}`} dangerouslySetInnerHTML={{ __html: highlight(post.title, query) }} /><p className="post-description" dangerouslySetInnerHTML={{ __html: highlight(getSnippet(post, query), query) }} /></div></li>)}{query && !results.length && <p className="meta">没有找到相关文章，请换一个关键词。</p>}</ul></div>;
}
