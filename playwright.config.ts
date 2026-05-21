import { defineConfig, devices } from "@playwright/test";
import "dotenv/config";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: 1,
  reporter: [
    ["list"],
    ["html", { outputFolder: "playwright/report" }],
  ],
  timeout: 60000,
  expect: {
    timeout: 10000,
  },
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    headless: true,
  },
  projects: [
    {
      name: "setup",
      testMatch: /auth\.setup\.ts/,
    },
    {
      name: "unauthenticated",
      testMatch: "landing.spec.ts",
      dependencies: [],
    },
    {
      name: "authenticated",
      testMatch: /^(?!.*(?:landing|logout)\.spec\.ts).*\.spec\.ts$/,
      dependencies: ["setup"],
      use: {
        storageState: "playwright/.auth/user.json",
      },
    },
    {
      name: "post-auth",
      testMatch: /logout\.spec\.ts/,
      dependencies: ["authenticated"],
      use: {
        storageState: "playwright/.auth/user.json",
      },
    },
  ],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: true,
    timeout: 120000,
    cwd: ".",
  },
});
