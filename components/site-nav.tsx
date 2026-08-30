"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { MenuButton } from "@/components/menu-button";
export function SiteNav() { const [scrolled, setScrolled] = useState(false); useEffect(() => { const update = () => setScrolled(window.scrollY > 12); update(); window.addEventListener("scroll", update, { passive: true }); return () => window.removeEventListener("scroll", update); }, []); return <header className={`nav ${scrolled ? "scrolled" : ""}`}><div className="nav-inner"><Link className="brand" href="/" aria-label="Adkinsm 首页">Adkinsm</Link><nav className="nav-links desktop-links" aria-label="主导航"><Link href="/posts">文章</Link><Link href="/about">关于</Link><Link href="/links">链接</Link><Link href="/search">搜索</Link><Link href="/rss.xml">RSS</Link></nav><MenuButton /></div></header>; }
