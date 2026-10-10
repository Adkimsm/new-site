import { siteConfig } from "@/lib/site-config";
import { buildMetadata } from "@/lib/metadata";
export const metadata = buildMetadata({ title: "链接", path: "/links" });
export default function Links() { return <section className="page prose"><header className="page-header"><span className="eyebrow">Links</span><h1>链接</h1></header><h2>联系</h2><ul className="link-list"><li><span className="link-list__label">GitHub</span><a href={siteConfig.github}>Adkimsm</a></li><li><span className="link-list__label">Email</span><a href={`mailto:${siteConfig.email}`}>发送邮件</a></li><li><span className="link-list__label">RSS</span><a href="/rss.xml">订阅更新</a></li></ul><h2>友情链接</h2><p>示例链接，待补充。这里不代表真实推荐。</p></section>; }
