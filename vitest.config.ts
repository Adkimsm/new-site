import { defineConfig } from "vitest/config";
export default defineConfig({
  resolve: { alias: { "@": new URL(".", import.meta.url).pathname } },
  // 组件用 React 17+ 的 automatic JSX runtime（Next 也是这套），
  // 否则 vitest 走 classic 转换会要求每个文件显式 import React。
  esbuild: { jsx: "automatic" },
  test: { environment: "node" }
});
