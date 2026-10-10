import { buildMetadata } from "@/lib/metadata";
export const metadata = buildMetadata({ title: "版权说明", path: "/copyright" });
export default function Copyright() { return <section className="page prose"><header className="page-header"><span className="eyebrow">Copyright</span><h1>版权说明</h1></header><p>文章和站点内容采用 CC BY-NC-SA 4.0 许可。网站源代码采用 MIT 许可。头像和个人品牌素材不自动纳入上述授权范围。</p><p>转载请注明作者 Adkinsm、原文链接，并遵守署名、非商业性使用和相同方式共享要求。</p></section>; }
