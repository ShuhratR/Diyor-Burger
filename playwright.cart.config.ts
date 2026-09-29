import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/browser",
  testMatch: "cart-unavailable.spec.ts",
  timeout: 45_000,
  expect: { timeout: 12000 },
  retries: 1,
  workers: 2,
  reporter: [["list"], ["html", { outputFolder: "artifacts/cart-qa", open: "never" }]],
  outputDir: "artifacts/cart-qa-results",
  use: { baseURL: "http://127.0.0.1:3103", ...devices["Desktop Chrome"],
    viewport: { width: 390, height: 844 }, locale: "ru-RU",
    screenshot: "only-on-failure", trace: "retain-on-failure" },
  webServer: { command: "npm run dev -- --hostname 127.0.0.1 --port 3103",
    url: "http://127.0.0.1:3103/menu", timeout: 150000,
    reuseExistingServer: false,
    env: { NEXT_TELEMETRY_DISABLED:"1", NEXT_PUBLIC_SUPABASE_URL:"", NEXT_PUBLIC_SUPABASE_ANON_KEY:"" } },
});
