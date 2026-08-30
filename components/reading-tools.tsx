"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";

type Heading = { id: string; text: string };
export function ReadingTools({ html }: { html: string }) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [active, setActive] = useState("");
  const [progress, setProgress] = useState(0);
  const [tocOpen, setTocOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [lightbox, setLightbox] = useState("");
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
      button.textContent = "复制";
      button.className = "copy-code";
      button.onclick = async () => { await navigator.clipboard?.writeText(block.innerText); button.textContent = "已复制"; window.setTimeout(() => { button.textContent = "复制"; }, 1400); };
      block.append(button);
    };
    elements.forEach((heading) => heading.setAttribute("tabindex", "-1"));
    root.querySelectorAll("pre").forEach((pre) => { if (!pre.querySelector("button")) copyCode({ target: pre } as unknown as MouseEvent); });
    const images = [...root.querySelectorAll<HTMLImageElement>("img")];
    const openImage = (image: HTMLImageElement) => () => setLightbox(image.currentSrc || image.src);
    const imageHandlers = images.map((image) => { const handler = openImage(image); const keyboardHandler = (event: KeyboardEvent) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); handler(); } }; image.addEventListener("click", handler); image.addEventListener("keydown", keyboardHandler); image.tabIndex = 0; image.setAttribute("role", "button"); image.setAttribute("aria-label", "打开图片预览"); return [image, handler, keyboardHandler] as const; });
    window.addEventListener("scroll", onScroll, { passive: true }); onScroll();
    return () => { window.removeEventListener("scroll", onScroll); imageHandlers.forEach(([image, handler, keyboardHandler]) => { image.removeEventListener("click", handler); image.removeEventListener("keydown", keyboardHandler); }); };
  }, []);
  useEffect(() => { if (!lightbox) return; const previous = document.activeElement as HTMLElement | null; const close = (event: KeyboardEvent) => { if (event.key === "Escape") setLightbox(""); }; window.addEventListener("keydown", close); document.body.style.overflow = "hidden"; return () => { window.removeEventListener("keydown", close); document.body.style.overflow = ""; previous?.focus(); }; }, [lightbox]);
  const copyLink = async () => { await navigator.clipboard?.writeText(window.location.href); setCopied(true); window.setTimeout(() => setCopied(false), 1600); };
  return <><div ref={contentRef} id="article-content" className="prose" dangerouslySetInnerHTML={{ __html: html }} /><aside id="article-toc" className={`toc ${tocOpen ? "toc-open" : ""}`} aria-label="文章目录"><strong>目录</strong>{headings.map((heading) => <a className={active === heading.id ? "active" : ""} href={`#${heading.id}`} key={heading.id} onClick={() => setTocOpen(false)}>{heading.text}</a>)}</aside><div className="reading-tools"><button aria-label="阅读进度">{Math.round(progress)}%</button><button onClick={() => setTocOpen(!tocOpen)} aria-expanded={tocOpen} aria-controls="article-toc">目录</button><button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} aria-label="返回顶部">↑</button><button onClick={copyLink}>{copied ? "已复制" : "复制链接"}</button></div>{lightbox && <button autoFocus className="lightbox" aria-label="关闭图片预览" onClick={() => setLightbox("")}><Image src={lightbox} alt="放大预览" width={1200} height={800} unoptimized /></button>}</>;
}
