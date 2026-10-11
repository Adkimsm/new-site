"use client";

import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef } from "react";

/** 兜底时长：万一路由迟迟没有提交，也按时结束过渡，避免浮层卡住。 */
const FALLBACK_MS = 600;

/** 过渡期间挂到 <html> 上的标记：关闭页面自身的入场动画。
 *
 *  新页面的 DOM 在 `router.push` 提交后才被拍摄成快照，此刻 `.page` 的
 *  `page-enter` 动画（`fill: both`）多半还停在 opacity≈0 的起始帧，会让快照发白。
 *  这个类只加不删 —— 一旦走过前端跳转就由 View Transition 接管，重新加回动画反而
 *  会在过渡结束后再淡入一次。首屏加载时类还不存在，入场动画照常播放。 */
const NAV_FLAG = "vt-nav";

/** 是否具备原生 View Transitions 条件：API 可用且用户未要求减少动效。 */
export function canViewTransition() {
  return typeof document !== "undefined"
    && typeof document.startViewTransition === "function"
    && !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** 用原生 View Transitions 包住一次前端跳转，供链接点击与键盘导航共用。
 *
 *  「新页面快照」在路由提交后拍摄：`usePathname()` 变化时 resolve 挂起的 promise，
 *  浏览器随即捕获新状态。不具备条件时退回普通 `router.push`，页面自身的入场动画
 *  继续生效。 */
export function useViewTransitionNavigate() {
  const router = useRouter();
  const pathname = usePathname();
  const finishRef = useRef<(() => void) | null>(null);

  // 路由提交后收尾，让浏览器捕获新页面快照
  useEffect(() => {
    finishRef.current?.();
    finishRef.current = null;
  }, [pathname]);

  return useCallback((href: string) => {
    if (!canViewTransition()) {
      router.push(href);
      return;
    }

    // 快速连点：先收尾上一次过渡，再开新的
    finishRef.current?.();

    document.documentElement.classList.add(NAV_FLAG);
    document.startViewTransition(() => new Promise<void>((resolve) => {
      let settled = false;
      const finish = () => {
        if (settled) return;
        settled = true;
        window.clearTimeout(timer);
        resolve();
      };
      const timer = window.setTimeout(finish, FALLBACK_MS);
      finishRef.current = finish;
      router.push(href);
    }));
  }, [router]);
}
