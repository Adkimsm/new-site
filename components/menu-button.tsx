"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { CloseIcon, MenuIcon } from "@/components/icons";
import { animateElement, runExit } from "@/lib/motion";

export function MenuButton() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
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

  // 打开：挂载浮层（与搜索浮层一致，只在 open 时挂载，避免预挂载那一帧
  // 触发退场动画造成「闪一下」）
  useEffect(() => {
    if (open) setMounted(true);
  }, [open]);

  // 进场：只做淡入，不做位移（全屏菜单位移观感太强）
  useEffect(() => {
    if (!mounted || !open) return;
    animateElement(menuRef.current, [{ opacity: 0 }, { opacity: 1 }]);
  }, [mounted, open]);

  // 退场：动画全部结束后再卸载
  useEffect(() => {
    if (open || !mounted) return;
    const animations = [
      animateElement(menuRef.current, [{ opacity: 1 }, { opacity: 0 }])
    ].filter((animation): animation is Animation => animation !== null);
    return runExit(animations, () => setMounted(false));
  }, [open, mounted]);

  const close = () => setOpen(false);
  const toggle = () => setOpen((value) => !value);
  return <><button ref={buttonRef} className={`menu ${open ? "is-open" : ""}`} aria-label={open ? "关闭菜单" : "打开菜单"} aria-expanded={open} aria-controls="mobile-nav" onClick={toggle}><span className="menu-icon menu-icon-open"><MenuIcon /></span><span className="menu-icon menu-icon-close"><CloseIcon /></span></button>{mounted && <nav ref={menuRef} id="mobile-nav" className={`mobile-menu ${open ? "open" : ""}`} aria-label="移动端导航" onClick={(event) => { if (event.target === event.currentTarget) close(); }}><div className="mobile-menu-inner"><Link ref={firstLinkRef} onClick={close} href="/posts">文章</Link><Link onClick={close} href="/about">关于</Link><Link onClick={close} href="/links">链接</Link><Link onClick={close} href="/rss.xml">RSS</Link></div></nav>}</>;
}
