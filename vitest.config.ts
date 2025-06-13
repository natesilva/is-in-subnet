import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["test/**/*.ts"],
    exclude: [
      ...configDefaults.exclude,
      "test/fixtures/**/*.ts",
      "src/types/**/*.ts",
      "test/**/*.legacy.ts",
      "test/**/*.bench.ts",
    ],
    coverage: {
      include: ["src/**/*.ts"],
      exclude: ["src/types/**/*.ts"],
    },
  },
});
