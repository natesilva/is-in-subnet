import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["src/**/*.test.ts"],
    exclude: [
      ...configDefaults.exclude,
      "test/fixtures/**/*.ts",
      "src/types/**/*.ts",
      "test/**/*.legacy.ts",
      "**/*.bench.ts",
    ],
    coverage: {
      include: ["src/**/*.ts"],
      exclude: ["**/__tests__", "**/__benchmarks__"],
    },
  },
});
