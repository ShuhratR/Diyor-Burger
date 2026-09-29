import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/browser",
  testMatch: "cart-unavailable.spec.ts",
  timeout: 45_000,
  expect: { timeout: 12_000 },
  retries: 1,
  workers: 1,
  reporter: [["list"], ["html", { outputFolder: "artifacts/cart-drinks-report", open: "never" }]],
  outputDir: "artifacts/cart-drinks-results",
  use: {
    baseURL: "http://127.0.0.1:3104",
    ...devices["Desktop Chrome"],
    viewport: { width: 390, height: 844 },
    locale: "ru-RU",
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
  },
  webServer: {
    command: "npm run dev -- --hostname 127.0.0.1 --port 3104",
    url: "http://127.0.0.1:3104/checkout",
    timeout: 150_000,
    reuseExistingServer: false,
    env: { NEXT_TELEMETRY_DISABLED: "1", NEXT_PUBLIC_SUPABASE_URL: "", NEXT_PUBLIC_SUPABASE_ANON_KEY: "" },
  },
});
