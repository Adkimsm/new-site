"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export function MenuButton() {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    const outside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node) && event.target !== buttonRef.current) setOpen(false);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", close);
    document.addEventListener("click", outside);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", close);
      document.removeEventListener("click", outside);
    };
  }, [open]);

  const close = () => setOpen(false);
  return <><button ref={buttonRef} className="menu" aria-label={open ? "关闭菜单" : "打开菜单"} aria-expanded={open} aria-controls="mobile-nav" onClick={() => setOpen((value) => !value)}>菜单</button>{open && <nav ref={menuRef} id="mobile-nav" className="nav-links open" aria-label="移动端导航"><Link onClick={close} href="/posts">文章</Link><Link onClick={close} href="/about">关于</Link><Link onClick={close} href="/links">链接</Link><Link onClick={close} href="/search">搜索</Link><Link onClick={close} href="/rss.xml">RSS</Link></nav>}</>;
}
