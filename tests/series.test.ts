import { describe, expect, it } from "vitest";
import { getSeriesPosts, type Post } from "@/lib/content/posts";

const post = (overrides: Partial<Post> & { slug: string }): Post => ({
  title: overrides.slug,
  date: "2026-01-01",
  description: "摘要",
  tags: [],
  featured: false,
  draft: false,
  content: "",
  wordCount: 0,
  ...overrides
});

describe("getSeriesPosts", () => {
  it("returns an empty list when the post is not part of a series", () => {
    const solo = post({ slug: "solo" });
    expect(getSeriesPosts(solo, [solo])).toEqual([]);
  });

  it("returns an empty list when the series has a single entry", () => {
    const only = post({ slug: "only", series: "孤独系列" });
    expect(getSeriesPosts(only, [only])).toEqual([]);
  });

  it("orders the series by seriesOrder, not by date", () => {
    const third = post({ slug: "c", series: "S", seriesOrder: 3, date: "2026-01-01" });
    const first = post({ slug: "a", series: "S", seriesOrder: 1, date: "2026-03-01" });
    const second = post({ slug: "b", series: "S", seriesOrder: 2, date: "2026-02-01" });
    expect(getSeriesPosts(first, [third, second, first]).map((item) => item.slug)).toEqual(["a", "b", "c"]);
  });

  it("falls back to date when seriesOrder is missing", () => {
    const older = post({ slug: "old", series: "S", date: "2026-01-01" });
    const newer = post({ slug: "new", series: "S", date: "2026-05-01" });
    expect(getSeriesPosts(older, [newer, older]).map((item) => item.slug)).toEqual(["old", "new"]);
  });

  it("ignores posts from other series", () => {
    const a = post({ slug: "a", series: "S", seriesOrder: 1 });
    const b = post({ slug: "b", series: "S", seriesOrder: 2 });
    const other = post({ slug: "x", series: "T", seriesOrder: 1 });
    expect(getSeriesPosts(a, [a, b, other]).map((item) => item.slug)).toEqual(["a", "b"]);
  });
});
