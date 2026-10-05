import { describe, expect, it } from "vitest";
import { THEME_STORAGE_KEY, cycleTheme, parseThemePreference, readStoredTheme, resolveTheme, themeInitScript, themeLabel, themeToggleLabel } from "@/lib/theme";

describe("theme preference", () => {
  it("accepts only light and dark, treating everything else as system", () => {
    expect(parseThemePreference("light")).toBe("light");
    expect(parseThemePreference("dark")).toBe("dark");
    expect(parseThemePreference("system")).toBe("system");
    expect(parseThemePreference(null)).toBe("system");
    expect(parseThemePreference(undefined)).toBe("system");
    expect(parseThemePreference("")).toBe("system");
    expect(parseThemePreference("Dark")).toBe("system");
    expect(parseThemePreference("blue")).toBe("system");
  });

  it("degrades to system when the storage read throws", () => {
    expect(readStoredTheme(() => "dark")).toBe("dark");
    expect(readStoredTheme(() => null)).toBe("system");
    expect(readStoredTheme(() => {
      throw new Error("storage blocked");
    })).toBe("system");
  });

  it("reads through the documented storage key", () => {
    const seen: string[] = [];
    readStoredTheme((key) => {
      seen.push(key);
      return "light";
    });
    expect(seen).toEqual([THEME_STORAGE_KEY]);
  });

  it("resolves the system preference against the media query", () => {
    expect(resolveTheme("system", true)).toBe("dark");
    expect(resolveTheme("system", false)).toBe("light");
    expect(resolveTheme("light", true)).toBe("light");
    expect(resolveTheme("dark", false)).toBe("dark");
  });

  it("cycles system to light to dark and back", () => {
    expect(cycleTheme("system")).toBe("light");
    expect(cycleTheme("light")).toBe("dark");
    expect(cycleTheme("dark")).toBe("system");
  });

  it("labels the current state and the next action", () => {
    expect(themeLabel("system")).toBe("跟随系统");
    expect(themeLabel("light")).toBe("浅色");
    expect(themeLabel("dark")).toBe("深色");
    expect(themeToggleLabel("system")).toBe("外观：跟随系统（点击切换为浅色）");
    expect(themeToggleLabel("light")).toBe("外观：浅色（点击切换为深色）");
    expect(themeToggleLabel("dark")).toBe("外观：深色（点击切换为跟随系统）");
  });

  it("keeps the anti-flash script to explicit light and dark only", () => {
    const script = themeInitScript();
    expect(script).toContain(JSON.stringify(THEME_STORAGE_KEY));
    expect(script).toContain("data-theme");
    // 「跟随系统」不写属性，交给 CSS 媒体查询处理
    expect(script).toContain('t==="light"||t==="dark"');
  });
});
