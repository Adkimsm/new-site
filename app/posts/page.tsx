import Link from "next/link";
import { getPosts, groupPosts } from "@/lib/content/posts";
import { buildMetadata } from "@/lib/metadata";
export const metadata = buildMetadata({ title: "文章", path: "/posts" });
export default function Posts() {
  const grouped = groupPosts(getPosts());
  return <section className="page">
    <header className="page-header">
      <h1>文章</h1>
      <p className="lede">按时间记录正在发生的思考。</p>
    </header>
    <div className="archive">
      {Object.entries(grouped).map(([year, months]) => {
        const posts = Object.values(months).flat();
        return <section className="archive-year" key={year}>
          <h2 className="archive-year__title">{year}<span className="archive-year__count">{posts.length} 篇</span></h2>
          <ul className="post-list">
            {posts.map((post) => <li className={`post-item ${post.featured ? "post-item--featured" : ""}`} key={post.slug}>
              <time className="post-date" dateTime={post.date}>{post.date}</time>
              <Link className="post-title" href={`/posts/${post.slug}`}>{post.title}</Link>
            </li>)}
          </ul>
        </section>;
      })}
    </div>
  </section>;
}
