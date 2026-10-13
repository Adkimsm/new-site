import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: { alias: { "@": new URL("./src", import.meta.url).pathname } },
  // 组件用 React 17+ 的 automatic JSX runtime（Astro 的 React island 也是这套）
  esbuild: { jsx: "automatic" },
  test: { environment: "node" }
});
