import { describe, expect, it } from "vitest";
import { groupPosts, validatePostSlugs } from "@/lib/post-utils";
import { post } from "./helpers";

describe("groupPosts", () => {
  it("groups posts by year and month, preserving input order within a month", () => {
    const posts = [
      post({ slug: "a", date: "2026-09-05" }),
      post({ slug: "b", date: "2026-09-12" }),
      post({ slug: "c", date: "2026-08-18" }),
      post({ slug: "d", date: "2025-07-01" })
    ];
    const groups = groupPosts(posts);
    // 年份/月份是整数样式的键，JS 会按数值升序枚举（与迁移前的归档页一致）
    expect(Object.keys(groups)).toEqual(["2025", "2026"]);
    expect(groups["2026"]["09"].map((item) => item.slug)).toEqual(["a", "b"]);
    expect(groups["2026"]["08"]).toHaveLength(1);
    expect(groups["2025"]["07"]).toHaveLength(1);
  });

  it("returns an empty object for no posts", () => {
    expect(groupPosts([])).toEqual({});
  });
});

describe("validatePostSlugs", () => {
  it("accepts unique slugs", () => {
    expect(validatePostSlugs([post({ slug: "a" }), post({ slug: "b" })])).toBe(true);
  });

  it("flags duplicate slugs", () => {
    expect(validatePostSlugs([post({ slug: "a" }), post({ slug: "a" })])).toBe(false);
  });
});
