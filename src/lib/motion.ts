/** 开合动画的统一参数与工具。
 *
 *  用 Web Animations API 命令式驱动，而不是「切换 class 触发 CSS transition」：
 *  后者依赖挂载时机与样式重算的先后，容易在部分时序/浏览器下不触发过渡；
 *  `element.animate()` 调用即执行，`animation.finished` 精确决定何时卸载。
 *  参数与设计令牌 --duration-normal / --ease-standard 对齐。 */

export const MOTION_DURATION = 320;
export const MOTION_EASING = "cubic-bezier(.2, .7, .2, 1)";

/** 播放一个元素的动画；元素为空时返回 null。 */
export function animateElement(element: Element | null, keyframes: Keyframe[]): Animation | null {
  return element?.animate(keyframes, { duration: MOTION_DURATION, easing: MOTION_EASING, fill: "both" }) ?? null;
}

/** 等待一组退场动画全部结束后回调；返回清理函数（组件卸载或重新打开时取消动画）。
 *  另设兜底定时器：万一动画被浏览器节流、`finished` 迟迟不 resolve，也按时卸载，
 *  避免浮层卡在 DOM 里。 */
export function runExit(animations: Animation[], onFinished: () => void): () => void {
  let active = true;
  const finish = () => {
    if (!active) return;
    active = false;
    window.clearTimeout(timer);
    onFinished();
  };
  const timer = window.setTimeout(finish, MOTION_DURATION + 200);
  if (animations.length) {
    Promise.all(animations.map((animation) => animation.finished)).then(finish).catch(finish);
  } else {
    finish();
  }
  return () => {
    active = false;
    window.clearTimeout(timer);
    animations.forEach((animation) => animation.cancel());
  };
}
