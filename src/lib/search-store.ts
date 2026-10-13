import { atom } from "nanostores";

/**
 * 站内搜索浮层的开关。
 *
 * 为什么用 nanostores 而不是 React Context：Astro 里每个 island 都是**独立的
 * React root**，不共享 Context。`SiteNav`（搜索按钮）与 `SearchDialog`（浮层）
 * 是两个 island，只能通过模块级状态通信 —— nanostores 正是 Astro 官方推荐的做法。
 */
export const searchOpen = atom(false);
