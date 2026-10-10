import { describe, expect, it } from "vitest";
import { DEFAULT_OG_IMAGE, buildMetadata } from "@/lib/metadata";
import { siteConfig } from "@/lib/site-config";

describe("buildMetadata", () => {
  it("points the canonical at the page itself, not the home page", () => {
    const metadata = buildMetadata({ title: "关于", path: "/about" });
    expect(metadata.alternates?.canonical).toBe(`${siteConfig.url}/about`);
  });

  it("keeps the RSS alternate link on every page", () => {
    const metadata = buildMetadata({ path: "/links" });
    expect(metadata.alternates?.types?.["application/rss+xml"]).toBe(`${siteConfig.url}/rss.xml`);
  });

  it("falls back to the default share card", () => {
    const metadata = buildMetadata({ path: "/privacy" });
    expect(metadata.openGraph?.images).toEqual([{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630, alt: siteConfig.name }]);
    expect(metadata.twitter?.images).toEqual([DEFAULT_OG_IMAGE]);
    expect((metadata.twitter as { card?: string } | undefined)?.card).toBe("summary_large_image");
  });

  it("uses a bitmap cover as the share card", () => {
    const metadata = buildMetadata({ path: "/posts/a", image: "/images/posts/a/cover.png", type: "article" });
    expect(metadata.openGraph?.images).toEqual([{ url: "/images/posts/a/cover.png", width: 1200, height: 630, alt: siteConfig.name }]);
  });

  it("ignores an SVG cover because social cards only accept bitmaps", () => {
    const metadata = buildMetadata({ path: "/posts/a", image: "/images/posts/a/cover.svg", type: "article" });
    expect(metadata.openGraph?.images).toEqual([{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630, alt: siteConfig.name }]);
  });

  it("honours an explicit canonical override", () => {
    const metadata = buildMetadata({ path: "/posts/a", canonical: "https://elsewhere.example/a" });
    expect(metadata.alternates?.canonical).toBe("https://elsewhere.example/a");
  });
});
