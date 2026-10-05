/**
 * 主题偏好：纯函数与常量，刻意不依赖 DOM，便于在 node 环境的 vitest 中直接单测。
 *
 * 三个状态：
 *   system  跟随系统偏好（默认，不写入存储）
 *   light   强制浅色
 *   dark    强制深色
 */

export const THEME_STORAGE_KEY = "theme";

export type ThemePreference = "system" | "light" | "dark";
export type ResolvedTheme = "light" | "dark";

/** 循环顺序：跟随系统 → 浅色 → 深色 → 跟随系统 */
const CYCLE: readonly ThemePreference[] = ["system", "light", "dark"];

const LABELS: Record<ThemePreference, string> = {
  system: "跟随系统",
  light: "浅色",
  dark: "深色"
};

/** 把任意存储值解析为合法偏好；无法识别的值一律视为「跟随系统」。 */
export function parseThemePreference(value: string | null | undefined): ThemePreference {
  return value === "light" || value === "dark" ? value : "system";
}

/** 读取存储值；读取抛错（Safari 隐私模式等）时降级为「跟随系统」。 */
export function readStoredTheme(read: (key: string) => string | null): ThemePreference {
  try {
    return parseThemePreference(read(THEME_STORAGE_KEY));
  } catch {
    return "system";
  }
}

/** 把偏好与系统偏好解析为最终生效的主题。 */
export function resolveTheme(preference: ThemePreference, prefersDark: boolean): ResolvedTheme {
  if (preference === "system") return prefersDark ? "dark" : "light";
  return preference;
}

/** 取下一个偏好。 */
export function cycleTheme(preference: ThemePreference): ThemePreference {
  const index = CYCLE.indexOf(preference);
  return CYCLE[(index + 1) % CYCLE.length];
}

/** 偏好的中文名称。 */
export function themeLabel(preference: ThemePreference): string {
  return LABELS[preference];
}

/**
 * 切换按钮的可读标签，同时说明当前状态与下一步动作。
 * 例如：「外观：跟随系统（点击切换为浅色）」
 */
export function themeToggleLabel(preference: ThemePreference): string {
  return `外观：${themeLabel(preference)}（点击切换为${themeLabel(cycleTheme(preference))}）`;
}

/**
 * 防闪烁内联脚本：在 <body> 解析期同步执行，先于首次绘制写入 data-theme。
 * 只处理显式的浅色/深色；「跟随系统」不写属性，交给 CSS 媒体查询。
 */
export function themeInitScript(): string {
  const key = JSON.stringify(THEME_STORAGE_KEY);
  return `(function(){try{var t=localStorage.getItem(${key});if(t==="light"||t==="dark"){document.documentElement.setAttribute("data-theme",t);}}catch(e){}})();`;
}
