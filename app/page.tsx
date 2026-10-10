import Link from "next/link";
import Image from "next/image";
import { getPosts } from "@/lib/content/posts";
import { siteConfig } from "@/lib/site-config";
import { buildMetadata } from "@/lib/metadata";

export const metadata = buildMetadata({ path: "" });

export default function Home() {
  const posts = getPosts().slice(0, 5);

  return <>
    <section className="hero">
      <div className="hero-copy">
        <Image src={siteConfig.avatar} alt="Adkinsm 的头像" width={112} height={112} priority />
        <h1>{siteConfig.name}</h1>
        <p>{siteConfig.description}</p>
        <nav className="hero-links" aria-label="快捷入口">
          <Link href="/posts">文章</Link>
          <Link href="/about">关于</Link>
          <Link href="/links">链接</Link>
          <a href={siteConfig.github} target="_blank" rel="noopener noreferrer">GitHub</a>
          <a href={`mailto:${siteConfig.email}`}>邮箱</a>
          <Link href="/rss.xml">RSS</Link>
        </nav>
      </div>
    </section>

    <section className="section" id="latest-posts">
      <div className="section-heading">
        <h2>最近文章</h2>
        <Link className="more" href="/posts">全部文章 →</Link>
      </div>
      <ul className="post-list">
        {posts.map((post) => <li className={`post-item ${post.featured ? "post-item--featured" : ""}`} key={post.slug}>
          <time className="post-date" dateTime={post.date}>{post.date}</time>
          <Link className="post-title" href={`/posts/${post.slug}`}>{post.title}</Link>
        </li>)}
      </ul>
    </section>
  </>;
}
