import { describe, expect, it } from "vitest";
import { filterPublished } from "@/lib/post-utils";
import { entry } from "./helpers";

/** 仓库里特意保留了一篇草稿，用来验证过滤逻辑（slug 见 content/posts）。 */
const DRAFT_SLUG = "reading-queue-2026";

describe("filterPublished", () => {
  const entries = [entry("published-a", false), entry(DRAFT_SLUG, true), entry("published-b", false)];

  it("hides drafts in production builds", () => {
    const visible = filterPublished(entries, true);
    expect(visible.some((item) => item.id === DRAFT_SLUG)).toBe(false);
    expect(visible).toHaveLength(2);
  });

  it("keeps drafts visible outside production for preview", () => {
    const visible = filterPublished(entries, false);
    expect(visible.some((item) => item.id === DRAFT_SLUG)).toBe(true);
    expect(visible).toHaveLength(3);
  });

  it("does not mutate the input array", () => {
    const before = [...entries];
    filterPublished(entries, true);
    expect(entries).toEqual(before);
  });
});
