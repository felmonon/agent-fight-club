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
    exclude: [...configDefaults.exclude, "tests/e2e/**/*"]
  }
});
