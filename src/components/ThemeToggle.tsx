"use client";

import { useEffect, useRef, useState } from "react";
import { MonitorIcon, MoonIcon, SunIcon } from "@/components/icons";
import { THEME_STORAGE_KEY, cycleTheme, parseThemePreference, resolveTheme, themeToggleLabel, type ThemePreference } from "@/lib/theme";

/** 读取持久化偏好；存储不可用（隐私模式等）时降级为「跟随系统」。 */
function readPreference(): ThemePreference {
  try {
    return parseThemePreference(window.localStorage.getItem(THEME_STORAGE_KEY));
  } catch {
    return "system";
  }
}

/**
 * 写入 html[data-theme] 并持久化。
 * 「跟随系统」既不留属性也不留存储值 —— 属性缺失正是 CSS 媒体查询生效的条件。
 */
function applyTheme(preference: ThemePreference, prefersDark: boolean) {
  const root = document.documentElement;

  if (preference === "system") root.removeAttribute("data-theme");
  else root.setAttribute("data-theme", resolveTheme(preference, prefersDark));

  try {
    if (preference === "system") window.localStorage.removeItem(THEME_STORAGE_KEY);
    else window.localStorage.setItem(THEME_STORAGE_KEY, resolveTheme(preference, prefersDark));
  } catch {
    /* 存储不可用时静默降级：本次会话内切换依然生效 */
  }
}

export function ThemeToggle() {
  // 首屏统一按「跟随系统」渲染，挂载后再同步真实偏好，避免 hydration 不一致
  const [preference, setPreference] = useState<ThemePreference>("system");
  const mounted = useRef(false);

  useEffect(() => {
    const media = window.matchMedia?.("(prefers-color-scheme: dark)");
    setPreference(readPreference());

    if (!media) return;

    // 只在「跟随系统」时响应系统主题变化
    const sync = () => {
      if (readPreference() === "system") applyTheme("system", media.matches);
    };

    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    // 跳过挂载后的首次执行：此时 html 上的状态已由 layout 里的防闪烁脚本写好，
    // 再按初始的 "system" 应用一次反而会把已持久化的深色抹掉，造成一次闪白。
    if (!mounted.current) {
      mounted.current = true;
      return;
    }

    const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)")?.matches ?? false;
    applyTheme(preference, prefersDark);
  }, [preference]);

  const label = themeToggleLabel(preference);

  return (
    <button
      type="button"
      className="theme-toggle"
      aria-label={label}
      title={label}
      onClick={() => setPreference(cycleTheme(preference))}
    >
      {preference === "light" ? <SunIcon /> : preference === "dark" ? <MoonIcon /> : <MonitorIcon />}
    </button>
  );
}
