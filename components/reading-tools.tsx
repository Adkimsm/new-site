"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ArrowUpIcon, CheckIcon, CopyIcon, ListIcon } from "@/components/icons";

type Heading = { id: string; text: string };
export function ReadingTools({ html }: { html: string }) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [active, setActive] = useState("");
  const [progress, setProgress] = useState(0);
  const [tocOpen, setTocOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [lightbox, setLightbox] = useState("");
  const [lightboxMounted, setLightboxMounted] = useState(false);
  useEffect(() => {
    const root = contentRef.current;
    if (!root) return;
    const elements = [...root.querySelectorAll<HTMLHeadingElement>("h2, h3")];
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
      const button = document.createElement("button");
      button.className = "copy-code";
      button.setAttribute("aria-label", "复制代码");
      button.title = "复制代码";
      button.innerHTML = '<svg aria-hidden="true" focusable="false" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>';
      button.onclick = async () => { await navigator.clipboard?.writeText(block.innerText); button.setAttribute("aria-label", "代码已复制"); button.title = "代码已复制"; button.innerHTML = '<svg aria-hidden="true" focusable="false" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12 4 4L19 6"/></svg>'; window.setTimeout(() => { button.setAttribute("aria-label", "复制代码"); button.title = "复制代码"; button.innerHTML = '<svg aria-hidden="true" focusable="false" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>'; }, 1400); };
      block.append(button);
    };
    elements.forEach((heading) => heading.setAttribute("tabindex", "-1"));
    root.querySelectorAll("pre").forEach((pre) => { if (!pre.querySelector("button")) copyCode({ target: pre } as unknown as MouseEvent); });
    const images = [...root.querySelectorAll<HTMLImageElement>("img")];
    const openImage = (image: HTMLImageElement) => () => { setLightboxMounted(true); requestAnimationFrame(() => setLightbox(image.currentSrc || image.src)); };
    const imageHandlers = images.map((image) => { const handler = openImage(image); const keyboardHandler = (event: KeyboardEvent) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); handler(); } }; image.addEventListener("click", handler); image.addEventListener("keydown", keyboardHandler); image.tabIndex = 0; image.setAttribute("role", "button"); image.setAttribute("aria-label", "打开图片预览"); return [image, handler, keyboardHandler] as const; });
    window.addEventListener("scroll", onScroll, { passive: true }); onScroll();
    return () => { window.removeEventListener("scroll", onScroll); imageHandlers.forEach(([image, handler, keyboardHandler]) => { image.removeEventListener("click", handler); image.removeEventListener("keydown", keyboardHandler); }); };
  }, []);
  useEffect(() => { if (!lightbox) return; const previous = document.activeElement as HTMLElement | null; const close = (event: KeyboardEvent) => { if (event.key === "Escape") setLightbox(""); }; window.addEventListener("keydown", close); document.body.style.overflow = "hidden"; return () => { window.removeEventListener("keydown", close); document.body.style.overflow = ""; previous?.focus(); }; }, [lightbox]);
  useEffect(() => { if (lightbox || !lightboxMounted) return; const timer = window.setTimeout(() => setLightboxMounted(false), 240); return () => window.clearTimeout(timer); }, [lightbox, lightboxMounted]);
  const copyLink = async () => { await navigator.clipboard?.writeText(window.location.href); setCopied(true); window.setTimeout(() => setCopied(false), 1600); };
  const closeLightbox = () => setLightbox("");
  return <><div ref={contentRef} id="article-content" className="prose" dangerouslySetInnerHTML={{ __html: html }} /><aside id="article-toc" className={`toc ${tocOpen ? "toc-open" : ""}`} aria-label="文章目录"><strong>目录</strong>{headings.map((heading) => <a className={active === heading.id ? "active" : ""} href={`#${heading.id}`} key={heading.id} onClick={() => setTocOpen(false)}>{heading.text}</a>)}</aside><div className="reading-tools"><button aria-label={`阅读进度 ${Math.round(progress)}%`} title={`阅读进度 ${Math.round(progress)}%`}>{Math.round(progress)}%</button><button onClick={() => setTocOpen(!tocOpen)} aria-expanded={tocOpen} aria-controls="article-toc" aria-label="打开文章目录" title="文章目录"><ListIcon /></button><button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} aria-label="返回顶部" title="返回顶部"><ArrowUpIcon /></button><button onClick={copyLink} aria-label={copied ? "链接已复制" : "复制文章链接"} title={copied ? "链接已复制" : "复制文章链接"}>{copied ? <CheckIcon /> : <CopyIcon />}</button></div>{lightboxMounted && <button autoFocus className={`lightbox ${lightbox ? "open" : "closing"}`} aria-label="关闭图片预览" onClick={closeLightbox}><Image src={lightbox} alt="放大预览" width={1200} height={800} unoptimized /></button>}</>;
}
