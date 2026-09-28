import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/live",
  testMatch: "product-preview-live.spec.ts",
  timeout: 45_000,
  expect: { timeout: 12_000 },
  retries: 1,
  workers: 1,
  reporter: [["list"], ["html", { outputFolder: "artifacts/live-preview-report", open: "never" }]],
  outputDir: "artifacts/live-preview-results",
  use: {
    baseURL: "https://diyor-nine.vercel.app",
    ...devices["Desktop Chrome"],
    viewport: { width: 390, height: 844 },
    locale: "ru-RU",
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
  },
});
