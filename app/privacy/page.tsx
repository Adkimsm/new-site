import { buildMetadata } from "@/lib/metadata";
import { getPageMeta } from "@/lib/content/pages";
import { loadPageBody } from "@/lib/mdx/load";
import { renderContent } from "@/lib/mdx/render";
import { ContentPage } from "@/components/content-page";

const meta = getPageMeta("privacy");
export const metadata = buildMetadata({ title: meta.title, description: meta.description, path: "/privacy" });

export default async function Privacy() {
  const html = await renderContent(await loadPageBody("privacy", meta.ext));
  return <ContentPage meta={meta} html={html} />;
}
