"use client";

import { useEffect, useRef, useState } from "react";
import { runExit } from "@/lib/motion";

export type PresenceDirection = "in" | "out";

/** 管理「条件挂载 + 进出场动画」的浮层生命周期，返回当前是否需要挂载。
 *
 *  与 `element.animate()` 配套：`open` 变 true 时挂载并播进场，变 false 时播退场，
 *  等 `animation.finished` 再卸载。刻意**不在关闭态预挂载**——预挂载会多出一帧
 *  `mounted && !open`，让退场动画（`fill: both`）在挂载那一帧就把元素钉到终态，
 *  表现为「打开时闪一下」。
 *
 *  `animate(direction)` 在对应时机被调用，读取各元素的 ref 并返回动画列表；
 *  用 ref 保存最新的回调，避免把它放进 effect 依赖。 */
export function usePresence(
  open: boolean,
  animate: (direction: PresenceDirection) => (Animation | null)[]
): boolean {
  const [mounted, setMounted] = useState(false);
  const animateRef = useRef(animate);
  animateRef.current = animate;

  // 打开：挂载浮层
  useEffect(() => {
    if (open) setMounted(true);
  }, [open]);

  // 进场：命令式播放，调用即执行，不依赖 class 触发过渡
  useEffect(() => {
    if (!mounted || !open) return;
    animateRef.current("in");
  }, [mounted, open]);

  // 退场：动画全部结束后再卸载，时长由动画本身决定（不用 setTimeout 猜）
  useEffect(() => {
    if (open || !mounted) return;
    const animations = animateRef.current("out").filter((animation): animation is Animation => animation !== null);
    return runExit(animations, () => setMounted(false));
  }, [open, mounted]);

  return mounted;
}
