import type { Metadata } from "next";
import Link from "next/link";
import { SiteNav } from "@/components/site-nav";
import { siteConfig } from "@/lib/site-config";
import { themeInitScript } from "@/lib/theme";
import "./globals.css";

export const metadata: Metadata = { metadataBase: new URL(siteConfig.url), title: { default: siteConfig.name, template: `%s · ${siteConfig.name}` }, description: siteConfig.description, alternates: { canonical: siteConfig.url, types: { "application/rss+xml": `${siteConfig.url}/rss.xml` } }, openGraph: { title: siteConfig.name, description: siteConfig.description, url: siteConfig.url, type: "website", images: [{ url: `${siteConfig.url}/images/avatar.jpg`, alt: "Adkinsm" }] }, twitter: { card: "summary_large_image", title: siteConfig.name, description: siteConfig.description, images: [`${siteConfig.url}/images/avatar.jpg`] } };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const person = { "@context": "https://schema.org", "@type": "Person", name: siteConfig.name, url: siteConfig.url, image: `${siteConfig.url}${siteConfig.avatar}`, sameAs: [siteConfig.github] };
  const website = { "@context": "https://schema.org", "@type": "WebSite", name: siteConfig.name, url: siteConfig.url, description: siteConfig.description, publisher: { "@type": "Person", name: siteConfig.author } };

  return <html lang="zh-CN"><body>
    {/* 防闪烁：作为 body 第一个子节点在解析期同步执行，先于首次绘制写入 data-theme */}
    <script dangerouslySetInnerHTML={{ __html: themeInitScript() }} />
    {/* 只预载 latin 切片；CJK 切片体积大且按需命中，预载反而拖慢首屏 */}
    <link rel="preload" href="/fonts/noto-serif-sc-latin.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify([person, website]) }} />
    <a className="skip" href="#content">跳到正文</a><SiteNav />
    <main id="content" className="main">{children}</main>
    <footer>
      <div className="footer-inner">
        <div className="footer-brand">
          <span className="footer-copy">© {new Date().getFullYear()} Adkinsm</span>
          <span>{siteConfig.description}</span>
        </div>
        <div className="footer-groups">
          <div className="footer-group">
            <span className="footer-group__title">内容</span>
            <Link href="/posts">文章</Link><Link href="/about">关于</Link><Link href="/links">链接</Link>
          </div>
          <div className="footer-group">
            <span className="footer-group__title">许可</span>
            <Link href="/copyright">{siteConfig.contentLicense}</Link><Link href="/privacy">隐私</Link><Link href="/disclaimer">免责声明</Link>
          </div>
          <div className="footer-group">
            <span className="footer-group__title">联系</span>
            <a href={siteConfig.github}>GitHub</a><a href={`mailto:${siteConfig.email}`}>邮箱</a><Link href="/rss.xml">RSS</Link>
          </div>
        </div>
      </div>
    </footer>
  </body></html>;
}
