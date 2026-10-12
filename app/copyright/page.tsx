import { buildMetadata } from "@/lib/metadata";
import { getPageMeta } from "@/lib/content/pages";
import { loadPageBody } from "@/lib/mdx/load";
import { renderContent } from "@/lib/mdx/render";
import { ContentPage } from "@/components/content-page";

const meta = getPageMeta("copyright");
export const metadata = buildMetadata({ title: meta.title, description: meta.description, path: "/copyright" });

export default async function Copyright() {
  const html = await renderContent(await loadPageBody("copyright", meta.ext));
  return <ContentPage meta={meta} html={html} />;
}
