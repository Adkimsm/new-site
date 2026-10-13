"use client";

import { useEffect, useState } from "react";
import { MenuButton } from "@/components/MenuButton";
import { ThemeToggle } from "@/components/ThemeToggle";
import { SearchIcon } from "@/components/icons";
import { searchOpen } from "@/lib/search-store";

const NAV_LINKS = [
  { href: "/posts", label: "文章" },
  { href: "/about", label: "关于" },
  { href: "/links", label: "链接" },
  { href: "/rss.xml", label: "RSS" }
] as const;

/** RSS 是订阅端点而非页面，不参与当前页高亮。 */
const LINK_PAGES = NAV_LINKS.filter(({ href }) => href !== "/rss.xml");

export function SiteNav() {
  const [scrolled, setScrolled] = useState(false);
  const [pathname, setPathname] = useState("");

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 12);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  // 框架无关的当前页高亮：Astro 里没有 usePathname，直接读 location，
  // 并在 ClientRouter 每次换页后（含首屏加载）重新同步。
  useEffect(() => {
    const update = () => setPathname(window.location.pathname);
    update();
    document.addEventListener("astro:page-load", update);
    return () => document.removeEventListener("astro:page-load", update);
  }, []);

  const isCurrent = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className={`nav ${scrolled ? "scrolled" : ""}`}>
      <div className="nav-inner">
        <a className="brand" href="/" aria-label="Adkinsm 首页">Adkinsm</a>
        <div className="nav-actions">
          <nav className="nav-links desktop-links" aria-label="主导航">
            {NAV_LINKS.map(({ href, label }) => (
              <a
                key={href}
                href={href}
                aria-current={LINK_PAGES.some((link) => link.href === href) && isCurrent(href) ? "page" : undefined}
              >
                {label}
              </a>
            ))}
          </nav>
          <button type="button" className="search-trigger" aria-label="搜索" title="搜索" onClick={() => searchOpen.set(true)}><SearchIcon /></button>
          <ThemeToggle />
          <MenuButton />
        </div>
      </div>
    </header>
  );
}
