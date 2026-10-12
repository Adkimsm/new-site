import { siteConfig } from "@/lib/site-config";
import { buildMetadata } from "@/lib/metadata";
import { getFriendLinks } from "@/lib/content/links";
import { markdownToHtml } from "@/lib/markdown";
import { FriendAvatar } from "@/components/friend-avatar";

export const metadata = buildMetadata({ title: "链接", path: "/links" });

export default async function Links() {
  const { title, links, content } = getFriendLinks();
  // 说明文字与文章正文共用同一套 Markdown 渲染，外链会自动补 target/rel。
  const intro = content.trim() ? await markdownToHtml(content) : "";

  return <section className="page prose">
    <header className="page-header"><span className="eyebrow">Links</span><h1>链接</h1></header>

    <h2>联系</h2>
    <ul className="link-list">
      <li><span className="link-list__label">GitHub</span><a href={siteConfig.github}>Adkimsm</a></li>
      <li><span className="link-list__label">Email</span><a href={`mailto:${siteConfig.email}`}>发送邮件</a></li>
      <li><span className="link-list__label">RSS</span><a href="/rss.xml">订阅更新</a></li>
    </ul>

    <h2>{title}</h2>
    {intro && <div dangerouslySetInnerHTML={{ __html: intro }} />}
    {links.length === 0
      ? <div className="empty-state"><p>还没有友链。欢迎通过上方邮箱和我交换链接。</p></div>
      : <ul className="friend-list">
          {links.map((link) => <li className="friend-item" key={link.url}>
            <FriendAvatar name={link.name} src={link.avatar} />
            <div className="friend-body">
              <a className="friend-name" href={link.url} target="_blank" rel="noopener noreferrer">{link.name}</a>
              {link.description && <span className="friend-desc">{link.description}</span>}
            </div>
          </li>)}
        </ul>}
  </section>;
}
