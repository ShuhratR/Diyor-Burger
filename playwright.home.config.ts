import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/browser",
  testMatch: "home-search.spec.ts",
  timeout: 45_000,
  expect: { timeout: 12_000 },
  retries: 1,
  workers: 2,
  reporter: [["list"], ["html", { outputFolder: "artifacts/home-search-qa", open: "never" }]],
  outputDir: "artifacts/home-search-results",
  use: {
    baseURL: "http://127.0.0.1:3102",
    ...devices["Desktop Chrome"],
    locale: "ru-RU",
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
  },
  webServer: {
    command: "npm run dev -- --hostname 127.0.0.1 --port 3102",
    url: "http://127.0.0.1:3102/menu",
    timeout: 150_000,
    reuseExistingServer: false,
    env: {
      NEXT_TELEMETRY_DISABLED: "1",
      NEXT_PUBLIC_SUPABASE_URL: "",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "",
    },
  },
});
