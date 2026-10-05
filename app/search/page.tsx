import { getPosts } from "@/lib/content/posts";
import { SearchForm } from "@/components/search-form";
export const metadata = { title: "搜索" };
export default function Search() { return <section className="page"><header className="page-header"><span className="eyebrow">Search</span><h1>搜索</h1><p className="lede">支持中文关键词、标题、摘要、正文和标签。</p></header><SearchForm posts={getPosts().map(({ slug, title, description, date, content, tags, wordCount }) => ({ slug, title, description, date, content, tags, wordCount }))} /></section>; }
