import { notFound } from "next/navigation";
import { getPosts } from "@/lib/content/posts";
import { markdownToHtml } from "@/lib/markdown";
import { siteConfig } from "@/lib/site-config";
import { buildMetadata } from "@/lib/metadata";
import { ReadingTools } from "@/components/reading-tools";
import Image from "next/image";

export async function generateStaticParams() { return getPosts().map(({ slug }) => ({ slug })); }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPosts().find((item) => item.slug === slug);
  if (!post) return {};
  return buildMetadata({
    title: post.title,
    description: post.description,
    path: `/posts/${post.slug}`,
    canonical: post.canonical,
    image: post.cover,
    type: "article",
    publishedTime: post.date,
    modifiedTime: post.updated ?? post.date
  });
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const posts = getPosts();
  const index = posts.findIndex((item) => item.slug === slug);
  const post = posts[index];
  if (!post) notFound();
  const html = await markdownToHtml(post.content);
  const permalink = post.canonical || `${siteConfig.url}/posts/${post.slug}`;
  const structuredData = { "@context": "https://schema.org", "@type": "BlogPosting", headline: post.title, description: post.description, datePublished: post.date, dateModified: post.updated ?? post.date, author: { "@type": "Person", name: siteConfig.author }, mainEntityOfPage: `${siteConfig.url}/posts/${post.slug}` };

  return <article className="page post-page">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />

    <header className="post-header">
      <span className="eyebrow">Essay</span>
      <h1>{post.title}</h1>
      <div className="meta">
        <time dateTime={post.date}>{post.date}</time>
        {post.updated && <> · 更新于 <time dateTime={post.updated}>{post.updated}</time></>}
        {` · ${post.wordCount} 字`}
      </div>
    </header>

    {post.cover && <figure className="post-cover-wrap">
      <Image className="post-cover" src={post.cover} alt="" width={1200} height={630} priority />
    </figure>}

    {<ReadingTools html={html} />}

    <aside className="license-card">
      <strong>{post.title}</strong>
      <p>本文作者：{siteConfig.author} · 内容采用 {siteConfig.contentLicense} 许可。</p>
      <p>原文链接：<a href={permalink}>{permalink}</a></p>
      <p><small>转载时请保留作者与原文链接，商业使用请先联系作者。</small></p>
    </aside>

    <div className="post-tags">{post.tags.map((tag) => <span className="pill" key={tag}>#{tag}</span>)}</div>

    <nav className="post-nav" aria-label="文章导航">
      {posts[index + 1] && <a className="previous-post" href={`/posts/${posts[index + 1].slug}`}><span className="post-nav-label">上一篇</span><span>{posts[index + 1].title}</span></a>}
      {posts[index - 1] && <a className="next-post" href={`/posts/${posts[index - 1].slug}`}><span className="post-nav-label">下一篇</span><span>{posts[index - 1].title}</span></a>}
    </nav>
  </article>;
}
