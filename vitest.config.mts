import { defineConfig } from "vitest/config";
import path from "node:path";

const dirname = import.meta.dirname;

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
  },
  resolve: {
    alias: {
      "@": path.resolve(dirname, "./src"),
      // See src/test/noop-module.ts for why these are stubbed in tests.
      "server-only": path.resolve(dirname, "./src/test/noop-module.ts"),
      "client-only": path.resolve(dirname, "./src/test/noop-module.ts"),
    },
  },
});
