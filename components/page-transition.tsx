"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

/** 兜底时长：万一路由迟迟没有提交，也按时结束过渡，避免浮层卡住。 */
const FALLBACK_MS = 600;

/** 带扩展名的路径（/rss.xml、/sitemap.xml 等）不是页面，交回浏览器默认跳转。 */
const ASSET_PATH = /\.[a-z0-9]+$/i;

/** 过渡期间挂到 <html> 上的标记：关闭页面自身的入场动画。
 *
 *  新页面的 DOM 在 `router.push` 提交后才被拍摄成快照，此刻 `.page` 的
 *  `page-enter` 动画（`fill: both`）多半还停在 opacity≈0 的起始帧，会让快照发白。
 *  这个类只加不删 —— 一旦走过前端跳转就由 View Transition 接管，重新加回动画反而
 *  会在过渡结束后再淡入一次。首屏加载时类还不存在，入场动画照常播放。 */
const NAV_FLAG = "vt-nav";

/** 站内跳转的原生 View Transitions 集成。
 *
 *  在 window 的捕获阶段拦截站内链接点击：先 `preventDefault()`，让 next/link 自身的
 *  onClick 因 `defaultPrevented` 直接返回（见 next/dist/client/app-dir/link.js），
 *  再用 `document.startViewTransition()` 包住 `router.push()`。必须走捕获阶段，
 *  否则 React 的事件委托会先一步完成跳转，拦截就来不及了。
 *
 *  「新页面快照」在路由提交后拍摄：`usePathname()` 变化时 resolve 挂起的 promise，
 *  浏览器随即捕获新状态。不支持该 API 或用户偏好减少动效时，组件不拦截，走默认跳转。 */
export function PageTransition() {
  const router = useRouter();
  const pathname = usePathname();
  const finishRef = useRef<(() => void) | null>(null);

  // 路由提交后收尾，让浏览器捕获新页面快照
  useEffect(() => {
    finishRef.current?.();
    finishRef.current = null;
  }, [pathname]);

  useEffect(() => {
    if (typeof document === "undefined" || typeof document.startViewTransition !== "function") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      if (!(event.target instanceof Element)) return;

      const anchor = event.target.closest("a");
      if (!anchor) return;
      if (anchor.target && anchor.target !== "_self") return;
      if (anchor.hasAttribute("download")) return;

      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#")) return;

      const url = new URL(anchor.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      if (ASSET_PATH.test(url.pathname)) return;
      // 同页（仅锚点或查询串差异）不接管，交给默认行为
      if (url.pathname === window.location.pathname && url.search === window.location.search) return;

      event.preventDefault();

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
        router.push(`${url.pathname}${url.search}${url.hash}`);
      }));
    };

    window.addEventListener("click", onClick, true);
    return () => window.removeEventListener("click", onClick, true);
  }, [router]);

  return null;
}
