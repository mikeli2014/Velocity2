import { defineConfig, devices } from "@playwright/test";

// Run against a deployed BASE_URL (set in Cloud Build) or fall back to a
// local `npm run dev` instance. Cloud Build sets BASE_URL to the Cloud Run
// service URL after deploy.
const baseURL = process.env.BASE_URL || "http://localhost:5173";
const useLocal = !process.env.BASE_URL;

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 30_000,
  expect: { timeout: 5_000 },
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI
    ? [["list"], ["html", { open: "never", outputFolder: "playwright-report" }]]
    : "list",
  use: {
    baseURL,
    trace: "on-first-retry",
    video: "retain-on-failure",
    screenshot: "only-on-failure"
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } }
  ],
  webServer: useLocal
    ? {
        command: "npm run dev",
        url: "http://localhost:5173",
        reuseExistingServer: !process.env.CI,
        timeout: 30_000
      }
    : undefined
});
