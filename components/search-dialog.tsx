"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { CloseIcon, SearchIcon } from "@/components/icons";
import { getSnippet, highlight, searchPosts, type SearchPost } from "@/lib/search";

type Status = "idle" | "loading" | "ready" | "error";

/** 打开动画时长，与 CSS 的 --duration-normal 保持一致，用于卸载前等待淡出。 */
const CLOSE_DELAY = 240;

export function SearchDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [posts, setPosts] = useState<SearchPost[]>([]);
  const [status, setStatus] = useState<Status>("idle");
  const [mounted, setMounted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const restoreRef = useRef<HTMLElement | null>(null);
  const loadedRef = useRef(false);

  // 关闭后延迟卸载，保留淡出过渡
  useEffect(() => {
    if (open) {
      setMounted(true);
      return;
    }
    if (!mounted) return;
    const timer = window.setTimeout(() => setMounted(false), CLOSE_DELAY);
    return () => window.clearTimeout(timer);
  }, [open, mounted]);

  // 首次打开时按需拉取静态索引；用 ref 记录是否已加载，避免把 status 放进依赖
  // 导致「设为 loading → 依赖变化 → cleanup 取消自己」的竞态
  useEffect(() => {
    if (!open || loadedRef.current) return;
    loadedRef.current = true;
    setStatus("loading");
    fetch("/search-index.json")
      .then((response) => {
        if (!response.ok) throw new Error(`search index ${response.status}`);
        return response.json() as Promise<SearchPost[]>;
      })
      .then((data) => {
        setPosts(data);
        setStatus("ready");
      })
      .catch(() => {
        // 失败后允许下次打开重试
        loadedRef.current = false;
        setStatus("error");
      });
  }, [open]);

  // 打开期间：聚焦输入框、锁定滚动、Escape 关闭、Tab 焦点陷阱、关闭后归还焦点
  useEffect(() => {
    if (!open) return;
    restoreRef.current = document.activeElement as HTMLElement | null;
    const raf = requestAnimationFrame(() => inputRef.current?.focus());

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab" || !panelRef.current) return;
      const focusable = [...panelRef.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), input, [tabindex]:not([tabindex="-1"])')];
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
      restoreRef.current?.focus();
    };
  }, [open, onClose]);

  if (!mounted) return null;

  const results = searchPosts(posts, query);
  const hasQuery = query.trim().length > 0;
  const statusText = status === "loading" ? "正在加载搜索索引…" : status === "error" ? "搜索索引加载失败，请稍后重试。" : hasQuery ? `找到 ${results.length} 篇文章` : "";

  return (
    <div className={`search-overlay ${open ? "open" : "closing"}`} onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <div ref={panelRef} className="search-panel search" role="dialog" aria-modal="true" aria-label="站内搜索">
        <div className="search-field">
          <SearchIcon />
          <label className="sr-only" htmlFor="site-search">搜索文章</label>
          <input
            ref={inputRef}
            id="site-search"
            className="field search-input"
            type="search"
            autoComplete="off"
            placeholder="输入关键词…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <button type="button" className="search-close" aria-label="关闭搜索" title="关闭搜索" onClick={onClose}><CloseIcon size={18} /></button>
        </div>

        {/* aria-live 常驻，只在有关键词时播报结果数 */}
        <p className="meta search-status" aria-live="polite">{statusText}</p>

        {status === "error" && <div className="empty-state"><p>搜索索引加载失败，请稍后重试。</p></div>}

        {status !== "error" && hasQuery && <ul className="post-list search-results">
          {results.map((post) => <li className="post-item" key={post.slug}>
            <div className="post-date">
              <time dateTime={post.date}>{post.date}</time>
              <span className="post-length">{post.wordCount} 字</span>
            </div>
            <div className="post-content">
              <Link className="post-title" href={`/posts/${post.slug}`} onClick={onClose} dangerouslySetInnerHTML={{ __html: highlight(post.title, query) }} />
              <p className="post-description" dangerouslySetInnerHTML={{ __html: highlight(getSnippet(post, query), query) }} />
            </div>
          </li>)}
        </ul>}

        {status === "ready" && hasQuery && !results.length && <div className="empty-state"><p>没有找到相关文章，请换一个关键词。</p></div>}
      </div>
    </div>
  );
}
