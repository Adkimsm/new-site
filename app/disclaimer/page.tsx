import { buildMetadata } from "@/lib/metadata";
import { getPageMeta } from "@/lib/content/pages";
import { loadPageBody } from "@/lib/mdx/load";
import { renderContent } from "@/lib/mdx/render";
import { ContentPage } from "@/components/content-page";

const meta = getPageMeta("disclaimer");
export const metadata = buildMetadata({ title: meta.title, description: meta.description, path: "/disclaimer" });

export default async function Disclaimer() {
  const html = await renderContent(await loadPageBody("disclaimer", meta.ext));
  return <ContentPage meta={meta} html={html} />;
}
