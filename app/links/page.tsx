import { siteConfig } from "@/lib/site-config";
import { buildMetadata } from "@/lib/metadata";
import { getFriendLinks } from "@/lib/content/links";
import { loadPageBody } from "@/lib/mdx/load";
import { renderContent } from "@/lib/mdx/render";
import { FriendAvatar } from "@/components/friend-avatar";

const { title } = getFriendLinks();
export const metadata = buildMetadata({ title, path: "/links" });

export default async function Links() {
  const { title, eyebrow, friendsTitle, links, content, ext } = getFriendLinks();
  // 说明文字与内容页正文共用同一套渲染管线，外链会自动补 target/rel。
  const intro = content.trim() ? await renderContent(await loadPageBody("links", ext)) : "";

  return <section className="page prose">
    <header className="page-header">{eyebrow && <span className="eyebrow">{eyebrow}</span>}<h1>{title}</h1></header>

    <h2>联系</h2>
    <ul className="link-list">
      <li><span className="link-list__label">GitHub</span><a href={siteConfig.github}>Adkimsm</a></li>
      <li><span className="link-list__label">Email</span><a href={`mailto:${siteConfig.email}`}>发送邮件</a></li>
      <li><span className="link-list__label">RSS</span><a href="/rss.xml">订阅更新</a></li>
    </ul>

    <h2>{friendsTitle}</h2>
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
