"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { CloseIcon } from "@/components/icons";
import { animateElement, runExit } from "@/lib/motion";
import { getSnippet, highlight, searchPosts, type SearchPost } from "@/lib/search";

type Status = "idle" | "loading" | "ready" | "error";

export function SearchDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [posts, setPosts] = useState<SearchPost[]>([]);
  const [status, setStatus] = useState<Status>("idle");
  const [active, setActive] = useState(-1);
  const [mounted, setMounted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const restoreRef = useRef<HTMLElement | null>(null);
  const loadedRef = useRef(false);
  const router = useRouter();

  const results = searchPosts(posts, query);
  const hasQuery = query.trim().length > 0;

  // 供 window 级键盘事件读取最新值，避免把 results/active 放进 effect 依赖
  const resultsRef = useRef(results);
  resultsRef.current = results;
  const activeRef = useRef(active);
  activeRef.current = active;

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

  // 打开：挂载浮层
  useEffect(() => {
    if (open) setMounted(true);
  }, [open]);

  // 进场：命令式播放，调用即执行，不依赖 class 触发过渡
  useEffect(() => {
    if (!mounted || !open) return;
    animateElement(overlayRef.current, [{ opacity: 0 }, { opacity: 1 }]);
    animateElement(panelRef.current, [{ opacity: 0, transform: "translateY(-24px)" }, { opacity: 1, transform: "translateY(0)" }]);
  }, [mounted, open]);

  // 退场：动画全部结束后再卸载，时长由动画本身决定（不用 setTimeout 猜）
  useEffect(() => {
    if (open || !mounted) return;
    const animations = [
      animateElement(overlayRef.current, [{ opacity: 1 }, { opacity: 0 }]),
      animateElement(panelRef.current, [{ opacity: 1, transform: "translateY(0)" }, { opacity: 0, transform: "translateY(-24px)" }])
    ].filter((animation): animation is Animation => animation !== null);
    return runExit(animations, () => setMounted(false));
  }, [open, mounted]);

  // 打开期间：聚焦输入框、锁定滚动、键盘操作、焦点陷阱、关闭后归还焦点
  useEffect(() => {
    if (!open) return;
    setActive(-1);
    restoreRef.current = document.activeElement as HTMLElement | null;
    const raf = requestAnimationFrame(() => inputRef.current?.focus());

    const onKey = (event: KeyboardEvent) => {
      // 中文输入法组合期间不拦截按键（Esc 先交给输入法取消候选）
      if (event.isComposing) return;

      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key === "ArrowDown") {
        event.preventDefault();
        setActive((index) => {
          const total = resultsRef.current.length;
          return total ? Math.min(index + 1, total - 1) : -1;
        });
        return;
      }
      if (event.key === "ArrowUp") {
        event.preventDefault();
        setActive((index) => Math.max(index - 1, 0));
        return;
      }
      if (event.key === "Enter") {
        const target = resultsRef.current[activeRef.current];
        if (!target) return;
        event.preventDefault();
        onClose();
        router.push(`/posts/${target.slug}`);
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
  }, [open, onClose, router]);

  // 选中项滚动到可视区域
  useEffect(() => {
    if (active < 0) return;
    document.getElementById(`search-result-${active}`)?.scrollIntoView({ block: "nearest" });
  }, [active]);

  if (!mounted) return null;

  const statusText = status === "loading" ? "正在加载搜索索引…" : hasQuery ? `找到 ${results.length} 篇文章` : "";

  return (
    <div ref={overlayRef} className="search-overlay" onMouseDown={(event) => { if (!panelRef.current?.contains(event.target as Node)) onClose(); }}>
      <button type="button" className="search-dismiss" aria-label="关闭搜索" title="关闭搜索" onClick={onClose}><CloseIcon size={20} /></button>

      <div ref={panelRef} className="search-panel search" role="dialog" aria-modal="true" aria-labelledby="search-title">
        <h2 id="search-title" className="sr-only">站内搜索</h2>

        <div className="search-field">
          <label className="sr-only" htmlFor="site-search">搜索文章</label>
          <input
            ref={inputRef}
            id="site-search"
            className="field search-input"
            type="search"
            autoComplete="off"
            placeholder="输入关键词搜索…"
            value={query}
            onChange={(event) => { setQuery(event.target.value); setActive(-1); }}
            role="combobox"
            aria-expanded={hasQuery}
            aria-controls="search-results"
            aria-activedescendant={active >= 0 ? `search-result-${active}` : undefined}
            aria-autocomplete="list"
          />
        </div>

        {/* aria-live 常驻，只在有关键词时播报结果数 */}
        <p className="meta search-status" aria-live="polite">{statusText}</p>

        {status === "error" && <div className="empty-state" role="alert"><p>搜索索引加载失败，请稍后重试。</p></div>}

        {status !== "error" && hasQuery && <ul id="search-results" className="search-results" role="listbox" aria-label="搜索结果">
          {results.map((post, index) => <li
            id={`search-result-${index}`}
            key={post.slug}
            role="option"
            aria-selected={index === active}
            className={`search-result ${index === active ? "is-selected" : ""}`}
            onMouseEnter={() => setActive(index)}
          >
            <Link className="search-result-title" href={`/posts/${post.slug}`} onClick={onClose} dangerouslySetInnerHTML={{ __html: highlight(post.title, query) }} />
            <p className="search-result-excerpt" dangerouslySetInnerHTML={{ __html: highlight(getSnippet(post, query), query) }} />
            <p className="search-result-meta"><time dateTime={post.date}>{post.date}</time> · {post.wordCount} 字</p>
          </li>)}
        </ul>}

        {status === "ready" && hasQuery && !results.length && <div className="empty-state"><p>没有找到相关文章，请换一个关键词。</p></div>}

        <div className="search-footer">
          <span><kbd>/</kbd> 打开</span>
          <span><kbd>Esc</kbd> 关闭</span>
          <span><kbd>↑</kbd> <kbd>↓</kbd> 选择</span>
          <span><kbd>Enter</kbd> 打开</span>
        </div>
      </div>
    </div>
  );
}
