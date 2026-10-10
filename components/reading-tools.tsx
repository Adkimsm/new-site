"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { ArrowUpIcon, ListIcon } from "@/components/icons";
import { animateElement } from "@/lib/motion";
import { usePresence } from "@/lib/presence";

type Heading = { id: string; text: string };

/** 进度环几何：半径 22 的圆周长，用于把百分比换算为 stroke-dashoffset。 */
const PROGRESS_RADIUS = 22;
const PROGRESS_CIRCUMFERENCE = 2 * Math.PI * PROGRESS_RADIUS;

export function ReadingTools({ html }: { html: string }) {
  const contentRef = useRef<HTMLDivElement>(null);
  const toolsRef = useRef<HTMLDivElement>(null);
  /**
   * 必须 memo 住 dangerouslySetInnerHTML 的对象：
   * React 按对象身份判断是否需要重写 innerHTML，每次渲染新建一个对象会让它
   * 反复重设内容，把「代码复制按钮」「标题 tabindex」这类命令式注入的 DOM 抹掉。
   * 文章页一旦滚动就会 setState 重渲，不 memo 的话复制按钮会立即消失。
   */
  const content = useMemo(() => ({ __html: html }), [html]);
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [active, setActive] = useState("");
  const [progress, setProgress] = useState(0);
  const [tocOpen, setTocOpen] = useState(false);
  const [lightboxSrc, setLightboxSrc] = useState("");
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const tocRef = useRef<HTMLElement>(null);
  const lightboxRef = useRef<HTMLButtonElement>(null);
  const lightboxImgRef = useRef<HTMLImageElement>(null);

  // 条件挂载 + 开合动画（WAAPI 命令式驱动，退场等 animation.finished 再卸载）
  const tocMounted = usePresence(tocOpen, (direction) => [
    animateElement(tocRef.current, direction === "in"
      ? [{ opacity: 0, transform: "translateY(8px)" }, { opacity: 1, transform: "translateY(0)" }]
      : [{ opacity: 1, transform: "translateY(0)" }, { opacity: 0, transform: "translateY(8px)" }])
  ]);
  const lightboxMounted = usePresence(lightboxOpen, (direction) => direction === "in"
    ? [
        animateElement(lightboxRef.current, [{ opacity: 0 }, { opacity: 1 }]),
        animateElement(lightboxImgRef.current, [{ transform: "scale(.97)" }, { transform: "scale(1)" }])
      ]
    : [
        animateElement(lightboxRef.current, [{ opacity: 1 }, { opacity: 0 }]),
        animateElement(lightboxImgRef.current, [{ transform: "scale(1)" }, { transform: "scale(.97)" }])
      ]);

  useEffect(() => {
    const root = contentRef.current;
    if (!root) return;
    // 脚注小节的标题属于元信息，不进目录
    const elements = [...root.querySelectorAll<HTMLHeadingElement>("h2, h3")].filter((heading) => !heading.closest(".footnotes"));
    setHeadings(elements.filter((heading) => heading.id).map((heading) => ({ id: heading.id, text: heading.textContent ?? "" })));
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? Math.min(100, Math.max(0, (window.scrollY / max) * 100)) : 0);
      const current = elements.filter((heading) => heading.getBoundingClientRect().top <= 140).at(-1);
      if (current) setActive(current.id);
    };
    const copyCode = async (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const block = target.closest("pre");
      if (!block || target.closest("button")) return;

      // 把 pre 包进一层不滚动的容器，按钮挂在这一层上。
      // 如果按钮留在 pre 里，作为滚动容器的绝对定位子元素，它会跟着代码
      // 一起横向滚走（pre 自己是 overflow: auto 的滚动容器）。
      let wrapper: HTMLElement | null = block.parentElement?.classList.contains("code-block") ? block.parentElement : null;
      if (!wrapper) {
        const created = document.createElement("div");
        created.className = "code-block";
        block.replaceWith(created);
        created.append(block);
        wrapper = created;
      }
      if (wrapper.querySelector("button")) return;
      const button = document.createElement("button");
      button.className = "copy-code";
      button.setAttribute("aria-label", "复制代码");
      button.title = "复制代码";
      button.innerHTML = '<svg aria-hidden="true" focusable="false" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>';
      button.onclick = async () => { await navigator.clipboard?.writeText(block.innerText); button.setAttribute("aria-label", "代码已复制"); button.title = "代码已复制"; button.innerHTML = '<svg aria-hidden="true" focusable="false" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12 4 4L19 6"/></svg>'; window.setTimeout(() => { button.setAttribute("aria-label", "复制代码"); button.title = "复制代码"; button.innerHTML = '<svg aria-hidden="true" focusable="false" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>'; }, 1400); };
      wrapper.append(button);
    };
    elements.forEach((heading) => heading.setAttribute("tabindex", "-1"));
    root.querySelectorAll("pre").forEach((pre) => { if (!pre.parentElement?.classList.contains("code-block")) copyCode({ target: pre } as unknown as MouseEvent); });
    const images = [...root.querySelectorAll<HTMLImageElement>("img")];
    const openImage = (image: HTMLImageElement) => () => { setLightboxSrc(image.currentSrc || image.src); setLightboxOpen(true); };
    const imageHandlers = images.map((image) => { const handler = openImage(image); const keyboardHandler = (event: KeyboardEvent) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); handler(); } }; image.addEventListener("click", handler); image.addEventListener("keydown", keyboardHandler); image.tabIndex = 0; image.setAttribute("role", "button"); image.setAttribute("aria-label", "打开图片预览"); return [image, handler, keyboardHandler] as const; });
    window.addEventListener("scroll", onScroll, { passive: true }); onScroll();
    return () => { window.removeEventListener("scroll", onScroll); imageHandlers.forEach(([image, handler, keyboardHandler]) => { image.removeEventListener("click", handler); image.removeEventListener("keydown", keyboardHandler); }); };
  }, []);
  useEffect(() => { if (!lightboxOpen) return; const previous = document.activeElement as HTMLElement | null; const close = (event: KeyboardEvent) => { if (event.key === "Escape") setLightboxOpen(false); }; window.addEventListener("keydown", close); document.body.style.overflow = "hidden"; return () => { window.removeEventListener("keydown", close); document.body.style.overflow = ""; previous?.focus(); }; }, [lightboxOpen]);
  // 目录浮层：Esc 或点击浮层外部关闭
  useEffect(() => {
    if (!tocOpen) return;
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") setTocOpen(false); };
    const onPointer = (event: MouseEvent) => { if (!toolsRef.current?.contains(event.target as Node)) setTocOpen(false); };
    window.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onPointer);
    return () => { window.removeEventListener("keydown", onKey); document.removeEventListener("mousedown", onPointer); };
  }, [tocOpen]);
  const closeLightbox = () => setLightboxOpen(false);
  const backToTop = () => { setTocOpen(false); window.scrollTo({ top: 0, behavior: "smooth" }); };

  return <>
    <div className="post-body">
      <div ref={contentRef} id="article-content" className="prose" dangerouslySetInnerHTML={content} />
    </div>
    <div className="reading-tools" ref={toolsRef}>
      {tocMounted && <aside ref={tocRef} id="article-toc" className="toc" style={{ pointerEvents: tocOpen ? "auto" : "none" }} aria-label="文章目录">
        <strong>目录</strong>
        <button type="button" className="toc-top" onClick={backToTop}><ArrowUpIcon size={16} />回到顶部</button>
        {headings.map((heading) => <a className={active === heading.id ? "active" : ""} href={`#${heading.id}`} key={heading.id} onClick={() => setTocOpen(false)}>{heading.text}</a>)}
      </aside>}
      <button className="reading-fab" type="button" onClick={() => setTocOpen(!tocOpen)} aria-expanded={tocOpen} aria-controls="article-toc" aria-label={`文章目录 · 阅读进度 ${Math.round(progress)}%`} title="文章目录">
        <svg className="reading-fab__ring" aria-hidden="true" focusable="false" viewBox="0 0 48 48" fill="none">
          <circle className="reading-fab__track" cx="24" cy="24" r={PROGRESS_RADIUS} strokeWidth="2" />
          <circle className="reading-fab__value" cx="24" cy="24" r={PROGRESS_RADIUS} strokeWidth="2" strokeLinecap="round" strokeDasharray={PROGRESS_CIRCUMFERENCE} strokeDashoffset={PROGRESS_CIRCUMFERENCE * (1 - progress / 100)} transform="rotate(-90 24 24)" />
        </svg>
        <ListIcon />
      </button>
    </div>
    {lightboxMounted && <button ref={lightboxRef} autoFocus className="lightbox" aria-label="关闭图片预览" onClick={closeLightbox}><Image ref={lightboxImgRef} src={lightboxSrc} alt="放大预览" width={1200} height={800} unoptimized /></button>}
  </>;
}
