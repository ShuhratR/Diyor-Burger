import { defineConfig, devices } from "@playwright/test";

// Admin QA is intentionally isolated: it never publishes screenshots, traces,
// videos, authenticated browser storage, or test credentials.
export default defineConfig({
  testDir: "./tests/e2e",
  testMatch: "admin-auth.spec.ts",
  timeout: 60_000,
  expect: { timeout: 12_000 },
  retries: 0,
  workers: 1,
  reporter: [["list"]],
  use: {
    baseURL: process.env.QA_BASE_URL || "https://diyor-nine.vercel.app",
    ...devices["Desktop Chrome"],
    viewport: { width: 390, height: 844 },
    locale: "ru-RU",
    trace: "off",
    screenshot: "off",
    video: "off",
  },
});
