import { defineConfig } from "vitest/config";
import nextEnv from "@next/env";
import path from "node:path";

// Next skips .env.local when NODE_ENV is "test", so load it as in development.
const env = process.env as Record<string, string | undefined>;
const nodeEnv = env.NODE_ENV;
env.NODE_ENV = "development";
const { combinedEnv } = nextEnv.loadEnvConfig(process.cwd(), true, undefined, true);
env.NODE_ENV = nodeEnv;

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
      // `server-only` throws outside Next's server build; tests run on the server anyway.
      "server-only": path.resolve(import.meta.dirname, "tests/server-only-stub.ts"),
    },
  },
  test: { env: combinedEnv as Record<string, string>, include: ["tests/**/*.test.ts"], testTimeout: 20_000 },
});
