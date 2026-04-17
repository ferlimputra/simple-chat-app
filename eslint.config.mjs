import js from "@eslint/js";
import tseslint from "typescript-eslint";

export default [
  {
    ignores: [
      "dist",
      "public",
      "node_modules",
      "*.config.mjs",
      "vitest.config.ts",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.strict,
  {
    files: ["src/**/*.ts", "tests/**/*.ts"],
    languageOptions: {
      globals: {
        document: "readonly",
        window: "readonly",
        console: "readonly",
        fetch: "readonly",
        ReadableStream: "readonly",
        Uint8Array: "readonly",
      },
    },
  },
];
