"use client";

import { useState } from "react";

/** 取名称首个字符作为回退字母块：中文取首字，英文取首字母。 */
function monogram(name: string) {
  return name.trim().charAt(0) || "?";
}

/**
 * 友链头像。
 *
 * 用原生 `img` 而不是 `next/image`：远程头像无法预知域名，`next/image`
 * 需要在 `next.config` 里逐个配置白名单并在构建期抓取，与站点「资源本地化」
 * 的约定相悖。第三方挂掉或防盗链导致加载失败时回退为首字母块，避免破图。
 */
export function FriendAvatar({ name, src }: { name: string; src?: string }) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) return <span className="friend-avatar friend-avatar--monogram" aria-hidden="true">{monogram(name)}</span>;

  return (
    <img className="friend-avatar" src={src} alt="" width={40} height={40} loading="lazy" decoding="async" referrerPolicy="no-referrer" onError={() => setFailed(true)} />
  );
}
