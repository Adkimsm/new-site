import { afterEach, describe, expect, it } from "vitest";
import { getPosts } from "@/lib/content/posts";

/** 仓库里特意保留了一篇草稿，用来验证过滤逻辑。 */
const DRAFT_SLUG = "reading-queue-2026";
const original = process.env.NODE_ENV;

/** `process.env.NODE_ENV` 在类型上是只读的，测试里需要一个可写的视图。 */
const env = process.env as Record<string, string | undefined>;
const setNodeEnv = (value: string | undefined) => {
  if (value === undefined) delete env.NODE_ENV;
  else env.NODE_ENV = value;
};

describe("draft posts", () => {
  afterEach(() => setNodeEnv(original));

  it("hides drafts from production builds", () => {
    setNodeEnv("production");
    expect(getPosts().some((post) => post.slug === DRAFT_SLUG)).toBe(false);
  });

  it("keeps drafts visible outside production for preview", () => {
    setNodeEnv("development");
    const draft = getPosts().find((post) => post.slug === DRAFT_SLUG);
    expect(draft?.draft).toBe(true);
  });
});
