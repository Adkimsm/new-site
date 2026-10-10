import type { Metadata } from "next";
import Link from "next/link";
import { SiteNav } from "@/components/site-nav";
import { SearchProvider } from "@/components/search-provider";
import { siteConfig } from "@/lib/site-config";
import { themeInitScript } from "@/lib/theme";
import "./globals.css";

// 只保留全局默认值：标题模板、站点描述与 metadataBase。
// canonical、RSS 链接与 OG/Twitter 卡片由各页面的 buildMetadata() 提供，
// 因为页面级 metadata 会整体替换这些键而不是深合并。
export const metadata: Metadata = { metadataBase: new URL(siteConfig.url), title: { default: siteConfig.name, template: `%s · ${siteConfig.name}` }, description: siteConfig.description };

type FooterLink = { href: string; label: string; external?: boolean };

/** 页脚按用途分组：站内导航 / 站内条款 / 站外联系，避免全部挤在一行。 */
const FOOTER_GROUPS: { label: string; links: FooterLink[] }[] = [
  {
    label: "导航",
    links: [
      { href: "/posts", label: "文章" },
      { href: "/about", label: "关于" },
      { href: "/links", label: "链接" }
    ]
  },
  {
    label: "条款",
    links: [
      { href: "/copyright", label: siteConfig.contentLicense },
      { href: "/privacy", label: "隐私" },
      { href: "/disclaimer", label: "免责声明" }
    ]
  },
  {
    label: "联系",
    links: [
      { href: siteConfig.github, label: "GitHub", external: true },
      { href: `mailto:${siteConfig.email}`, label: "邮箱", external: true },
      { href: "/rss.xml", label: "RSS" }
    ]
  }
];

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const person = { "@context": "https://schema.org", "@type": "Person", name: siteConfig.name, url: siteConfig.url, image: `${siteConfig.url}${siteConfig.avatar}`, sameAs: [siteConfig.github] };
  const website = { "@context": "https://schema.org", "@type": "WebSite", name: siteConfig.name, url: siteConfig.url, description: siteConfig.description, publisher: { "@type": "Person", name: siteConfig.author } };

  return <html lang="zh-CN"><body>
    {/* 防闪烁：作为 body 第一个子节点在解析期同步执行，先于首次绘制写入 data-theme */}
    <script dangerouslySetInnerHTML={{ __html: themeInitScript() }} />
    {/* 只预载 latin 切片；CJK 切片体积大且按需命中，预载反而拖慢首屏 */}
    <link rel="preload" href="/fonts/noto-serif-sc-latin.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify([person, website]) }} />
    <SearchProvider>
      <a className="skip" href="#content">跳到正文</a><SiteNav />
      <main id="content" className="main">{children}</main>
    </SearchProvider>
    <footer>
      <div className="footer-inner">
        <p className="footer-copy">© {new Date().getFullYear()} Adkinsm</p>
        <div className="footer-groups">
          {FOOTER_GROUPS.map((group) => (
            <nav key={group.label} className="footer-group" aria-label={group.label}>
              <p className="footer-group-title">{group.label}</p>
              <ul>
                {group.links.map((link) => (
                  <li key={link.href}>
                    {link.external ? (
                      <a href={link.href} target={link.href.startsWith("http") ? "_blank" : undefined} rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined}>{link.label}</a>
                    ) : (
                      <Link href={link.href}>{link.label}</Link>
                    )}
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
      </div>
    </footer>
  </body></html>;
}
