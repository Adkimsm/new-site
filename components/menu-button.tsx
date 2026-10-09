"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { CloseIcon, MenuIcon } from "@/components/icons";
import { useSearch } from "@/components/search-provider";

export function MenuButton() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { setOpen: setSearchOpen } = useSearch();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLElement>(null);
  const firstLinkRef = useRef<HTMLAnchorElement>(null);
  const previousBodyStyles = useRef({ overflow: "", paddingRight: "" });

  useEffect(() => {
    if (!open) return;
    firstLinkRef.current?.focus();
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
        return;
      }
      if (event.key === "Tab" && menuRef.current) {
        const focusable = [...menuRef.current.querySelectorAll<HTMLElement>("a, button")];
        const first = focusable[0];
        const last = focusable.at(-1);
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }
    };
    const outside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node) && event.target !== buttonRef.current) setOpen(false);
    };
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    previousBodyStyles.current = { overflow: document.body.style.overflow, paddingRight: document.body.style.paddingRight };
    document.body.style.overflow = "hidden";
    document.body.style.paddingRight = `${scrollbarWidth}px`;
    window.addEventListener("keydown", close);
    document.addEventListener("click", outside);
    return () => {
      document.body.style.overflow = previousBodyStyles.current.overflow;
      document.body.style.paddingRight = previousBodyStyles.current.paddingRight;
      window.removeEventListener("keydown", close);
      document.removeEventListener("click", outside);
    };
  }, [open]);

  const close = () => setOpen(false);
  const openSearch = () => { close(); setSearchOpen(true); };
  const toggle = () => {
    if (open) close();
    else {
      setMounted(true);
      requestAnimationFrame(() => setOpen(true));
    }
  };
  useEffect(() => {
    if (open || !mounted) return;
    const timer = window.setTimeout(() => setMounted(false), 240);
    return () => window.clearTimeout(timer);
  }, [open, mounted]);
  return <><button ref={buttonRef} className={`menu ${open ? "is-open" : ""}`} aria-label={open ? "关闭菜单" : "打开菜单"} aria-expanded={open} aria-controls="mobile-nav" onClick={toggle}><span className="menu-icon menu-icon-open"><MenuIcon /></span><span className="menu-icon menu-icon-close"><CloseIcon /></span></button>{mounted && <nav ref={menuRef} id="mobile-nav" className={`mobile-menu ${open ? "open" : "closing"}`} aria-label="移动端导航" onClick={(event) => { if (event.target === event.currentTarget) close(); }}><div className="mobile-menu-inner"><Link ref={firstLinkRef} onClick={close} href="/posts">文章</Link><Link onClick={close} href="/about">关于</Link><Link onClick={close} href="/links">链接</Link><button type="button" onClick={openSearch}>搜索</button><Link onClick={close} href="/rss.xml">RSS</Link></div></nav>}</>;
}
