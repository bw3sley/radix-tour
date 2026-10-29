import { defineConfig, devices } from "@playwright/test";

// The test app imports the built package, so run `npm run build` before `npx playwright test`.
export default defineConfig({
  testDir: "./test/tests",
  timeout: 30_000,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: "html",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "webkit", use: { ...devices["Desktop Safari"] } },
  ],
  webServer: {
    command: "npm run dev -w radix-tour-test",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
  },
});
