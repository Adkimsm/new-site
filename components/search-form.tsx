"use client";

import Link from "next/link";
import { useState } from "react";
import { SearchIcon } from "@/components/icons";

type SearchPost = { slug: string; title: string; description: string; date: string; content: string; tags: string[]; wordCount: number };

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

  return <div className="search" role="search">
    <label className="sr-only" htmlFor="site-search">搜索文章</label>
    <div className="search-field">
      <SearchIcon />
      <input id="site-search" className="field search-input" type="search" aria-label="搜索文章" placeholder="输入关键词…" value={query} onChange={(event) => setQuery(event.target.value)} />
    </div>

    {/* aria-live 常驻，只在有关键词时播报结果数 */}
    <p className="meta search-status" aria-live="polite">{query ? `找到 ${results.length} 篇文章` : ""}</p>

    <ul className="post-list search-results">
      {query && results.map((post) => <li className="post-item" key={post.slug}>
        <div className="post-date">
          <time dateTime={post.date}>{post.date}</time>
          <span className="post-length">{post.wordCount} 字</span>
        </div>
        <div className="post-content">
          <Link className="post-title" href={`/posts/${post.slug}`} dangerouslySetInnerHTML={{ __html: highlight(post.title, query) }} />
          <p className="post-description" dangerouslySetInnerHTML={{ __html: highlight(getSnippet(post, query), query) }} />
        </div>
      </li>)}
    </ul>

    {query && !results.length && <div className="empty-state"><p>没有找到相关文章，请换一个关键词。</p></div>}
  </div>;
}
