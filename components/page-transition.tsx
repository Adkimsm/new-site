"use client";

import { useEffect } from "react";
import { canViewTransition, useViewTransitionNavigate } from "@/lib/view-transition";

/** 带扩展名的路径（/rss.xml、/sitemap.xml 等）不是页面，交回浏览器默认跳转。 */
const ASSET_PATH = /\.[a-z0-9]+$/i;

/** 站内跳转的原生 View Transitions 集成。
 *
 *  在 window 的捕获阶段拦截站内链接点击：先 `preventDefault()`，让 next/link 自身的
 *  onClick 因 `defaultPrevented` 直接返回（见 next/dist/client/app-dir/link.js），
 *  再用 `document.startViewTransition()` 包住 `router.push()`。必须走捕获阶段，
 *  否则 React 的事件委托会先一步完成跳转，拦截就来不及了。
 *
 *  跳转逻辑与键盘导航共用 `useViewTransitionNavigate`（见 lib/view-transition）。
 *  不支持该 API 或用户偏好减少动效时，组件不拦截，走默认跳转。 */
export function PageTransition() {
  const navigate = useViewTransitionNavigate();

  useEffect(() => {
    if (!canViewTransition()) return;

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
      navigate(`${url.pathname}${url.search}${url.hash}`);
    };

    window.addEventListener("click", onClick, true);
    return () => window.removeEventListener("click", onClick, true);
  }, [navigate]);

  return null;
}
