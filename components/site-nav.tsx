"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { MenuButton } from "@/components/menu-button";
import { ThemeToggle } from "@/components/theme-toggle";

const NAV_LINKS = [
  { href: "/posts", label: "文章" },
  { href: "/about", label: "关于" },
  { href: "/links", label: "链接" },
  { href: "/search", label: "搜索" },
  { href: "/rss.xml", label: "RSS" }
] as const;

/** RSS 是订阅端点而非页面，不参与当前页高亮。 */
const LINK_PAGES = NAV_LINKS.filter(({ href }) => href !== "/rss.xml");

export function SiteNav() {
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 12);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  const isCurrent = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className={`nav ${scrolled ? "scrolled" : ""}`}>
      <div className="nav-inner">
        <Link className="brand" href="/" aria-label="Adkinsm 首页">Adkinsm</Link>
        <div className="nav-actions">
          <nav className="nav-links desktop-links" aria-label="主导航">
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                aria-current={LINK_PAGES.some((link) => link.href === href) && isCurrent(href) ? "page" : undefined}
              >
                {label}
              </Link>
            ))}
          </nav>
          <ThemeToggle />
          <MenuButton />
        </div>
      </div>
    </header>
  );
}
