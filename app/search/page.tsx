import { getPosts } from "@/lib/content/posts";
import { SearchForm } from "@/components/search-form";
export const metadata = { title: "搜索" };
export default function Search() { return <section className="page"><span className="eyebrow">Search</span><h1>搜索</h1><SearchForm posts={getPosts().map(({ slug, title, description, date, content, tags }) => ({ slug, title, description, date, content, tags }))} /></section>; }
