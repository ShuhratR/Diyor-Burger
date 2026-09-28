import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 45_000,
  expect: { timeout: 10_000 },
  retries: 1,
  workers: 2,
  reporter: [["list"], ["html", { outputFolder: "artifacts/e2e-report", open: "never" }]],
  outputDir: "artifacts/e2e-results",
  use: {
    baseURL: process.env.QA_BASE_URL || "https://diyor-nine.vercel.app",
    ...devices["Desktop Chrome"],
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 1,
    locale: "ru-RU",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
});
