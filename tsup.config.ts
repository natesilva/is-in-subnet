import { defineConfig } from "tsup";

export default defineConfig([
  {
    entry: ["src/index.ts"],
    splitting: false,
    sourcemap: true,
    dts: true,
    clean: true,
    format: ["cjs", "esm"],
  },
  {
    entry: ["src/index.ts"],
    splitting: false,
    sourcemap: true,
    clean: true,
    format: ["iife"],
    target: "es2015",
    globalName: "isInSubnet",
  },
]);
