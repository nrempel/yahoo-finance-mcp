import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: ["src/**/*.ts"],
      exclude: ["src/**/*.test.ts", "src/**/*.e2e.test.ts", "src/index.ts"],
      thresholds: {
        statements: 80,
        branches: 70,
        functions: 85,
        lines: 80,
      },
    },
  },
});
