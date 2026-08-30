import { siteConfig } from "@/lib/site-config";
export const metadata = { title: "链接" };
export default function Links() { return <section className="page prose"><span className="eyebrow">Links</span><h1>链接</h1><p><a href={siteConfig.github}>GitHub</a> · <a href={`mailto:${siteConfig.email}`}>Email</a> · <a href="/rss.xml">RSS</a></p><h2>友情链接</h2><p>示例链接，待补充。这里不代表真实推荐。</p></section>; }
