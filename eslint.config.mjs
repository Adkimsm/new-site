import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { FlatCompat } from "@eslint/eslintrc";
const root = dirname(fileURLToPath(import.meta.url));
const compat = new FlatCompat({ baseDirectory: root });
const config = [...compat.extends("next/core-web-vitals", "next/typescript")];
const ignores = [{ ignores: [".next/**", "next-env.d.ts"] }];
const fullConfig = [...ignores, ...config];
export default fullConfig;
