import js from "@eslint/js";
import ts from "typescript-eslint";
import astro from "eslint-plugin-astro";

export default [
  { ignores: ["dist/**", ".astro/**", "src/env.d.ts"] },
  js.configs.recommended,
  ...ts.configs.recommended,
  ...astro.configs.recommended
];
