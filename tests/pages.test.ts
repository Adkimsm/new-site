import { describe, expect, it } from "vitest";
import { getPageMeta, pageSchema } from "@/lib/content/pages";

describe("content pages", () => {
  it("parses every content page's frontmatter", () => {
    for (const slug of ["about", "privacy", "copyright", "disclaimer"]) {
      const meta = getPageMeta(slug);
      expect(meta.title.length).toBeGreaterThan(0);
      expect(meta.eyebrow).toBeTruthy();
    }
  });

  it("keeps the about page's distinct h1", () => {
    const about = getPageMeta("about");
    expect(about.title).toBe("关于");
    expect(about.heading).toBe("关于我");
    expect(about.ext).toBe("mdx");
  });

  it("uses plain markdown for the text-only pages", () => {
    expect(getPageMeta("privacy").ext).toBe("md");
    expect(getPageMeta("copyright").ext).toBe("md");
    expect(getPageMeta("disclaimer").ext).toBe("md");
  });

  it("rejects frontmatter without a title", () => {
    expect(pageSchema.safeParse({}).success).toBe(false);
    expect(pageSchema.safeParse({ title: "关于" }).success).toBe(true);
  });

  it("throws for a missing page", () => {
    expect(() => getPageMeta("does-not-exist")).toThrow();
  });
});
