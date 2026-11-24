// End-to-end tests for RoviSoft.net.
//
// The site is served by `wrangler pages dev`, which applies src/_headers
// (CSP, HSTS, ...) and src/404.html the same way Cloudflare Pages does in
// production, so the tests also catch CSP violations.
//
// Environment variables:
//   PORT           Port of the local server (default 8788).
//   CHROMIUM_PATH  Use an installed Chromium instead of the one downloaded
//                  by `npx playwright install chromium`.

import { defineConfig, devices } from "@playwright/test";

const PORT = Number(process.env.PORT || 8788);
const BASE_URL = `http://127.0.0.1:${PORT}`;
const launchOptions = process.env.CHROMIUM_PATH
  ? { executablePath: process.env.CHROMIUM_PATH }
  : {};

export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI
    ? [["github"], ["html", { open: "never" }]]
    : [["list"]],
  use: {
    baseURL: BASE_URL,
    trace: "retain-on-failure",
    launchOptions,
  },
  projects: [
    {
      name: "desktop",
      testIgnore: /mobile\.spec/,
      use: { ...devices["Desktop Chrome"], launchOptions },
    },
    {
      name: "mobile",
      testMatch: /mobile\.spec/,
      use: { ...devices["Pixel 7"], launchOptions },
    },
  ],
  webServer: {
    command: `npx wrangler pages dev src --ip 127.0.0.1 --port ${PORT}`,
    url: `${BASE_URL}/`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: { WRANGLER_SEND_METRICS: "false" },
  },
});
