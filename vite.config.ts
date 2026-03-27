import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  server: {
    host: "0.0.0.0",
    port: 3000
  },
  plugins: [react(), tailwindcss()],
  test: {
    exclude: [...configDefaults.exclude, "tests/e2e/**/*"],
    projects: [
      {
        extends: true,
        test: {
          name: { label: "core", color: "green" },
          include: ["src/**/*.test.ts", "scripts/**/*.test.ts"],
          exclude: ["src/app/**/*.test.tsx", "tests/e2e/**/*"],
          environment: "node"
        }
      },
      {
        extends: true,
        test: {
          name: { label: "ui-smoke", color: "cyan" },
          include: ["src/app/**/*.test.tsx"],
          environment: "node"
        }
      }
    ]
  }
});
