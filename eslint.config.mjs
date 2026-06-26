import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Third-party / tooling directories
    ".claude/**",
    ".squad/**",
    ".copilot/**",
    ".github/**",
    // Submodule and its build artifacts
    "need-sport/**",
    // Untracked tooling bundles
    "aidd-framework-codex-marketplace-5.0.3/**",
  ]),
]);

export default eslintConfig;
