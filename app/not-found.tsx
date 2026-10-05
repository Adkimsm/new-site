import Link from "next/link";
export const metadata = { title: "页面未找到", robots: { index: false, follow: false } };
export default function NotFound() { return <section className="page"><header className="page-header"><span className="eyebrow">404</span><h1>这一页没有找到</h1></header><div className="empty-state"><p>地址可能已经改变，或者它从未存在。</p><Link className="button" href="/">回到首页</Link></div></section>; }
