import { siteConfig } from "@/lib/site-config";
export const metadata = { title: "关于" };
export default function About() { return <section className="page prose"><header className="page-header"><span className="eyebrow">About</span><h1>关于我</h1></header><p>你好，我是 {siteConfig.name}。这里是我的个人主页，也是一个安静记录的地方。</p><p>我关注前端开发、全栈开发与独立开发，也对产品和设计保持兴趣。这里会记录技术教程、项目复盘、阅读笔记与生活观察。</p><p>目前只分享可以公开确认的内容，不在这里虚构履历。你可以通过 <a href={siteConfig.github}>GitHub</a> 或 <a href={`mailto:${siteConfig.email}`}>邮箱</a> 联系我。</p></section>; }
