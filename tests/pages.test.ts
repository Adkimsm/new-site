import { describe, expect, it } from "vitest";
import { pageSchema } from "@/lib/content-schemas";

describe("pageSchema", () => {
  it("requires a title", () => {
    expect(pageSchema.safeParse({}).success).toBe(false);
    expect(pageSchema.safeParse({ title: "关于" }).success).toBe(true);
  });

  it("keeps heading and eyebrow optional", () => {
    const parsed = pageSchema.parse({ title: "关于", heading: "关于我", eyebrow: "About" });
    expect(parsed.heading).toBe("关于我");
    expect(parsed.eyebrow).toBe("About");
    expect(pageSchema.parse({ title: "隐私政策" }).heading).toBeUndefined();
  });

  it("accepts an optional description override", () => {
    expect(pageSchema.parse({ title: "链接", description: "自定义描述" }).description).toBe("自定义描述");
  });

  it("rejects empty strings for constrained fields", () => {
    expect(pageSchema.safeParse({ title: "" }).success).toBe(false);
    expect(pageSchema.safeParse({ title: "x", eyebrow: "" }).success).toBe(false);
  });
});
