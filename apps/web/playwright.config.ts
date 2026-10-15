import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: false,
  workers: 1,
  timeout: 30000,
  use: {
    baseURL: "http://localhost:3180",
    trace: "retain-on-failure",
  },
  projects: [
    { name: "chrome", use: { channel: "chrome" } },
    {
      name: "firefox-ui",
      testMatch: [
        "ui.spec.ts",
        "landing.spec.ts",
        "demo.spec.ts",
        "motion.spec.ts",
      ],
      use: { browserName: "firefox" },
    },
    {
      name: "webkit-ui",
      testMatch: [
        "ui.spec.ts",
        "landing.spec.ts",
        "demo.spec.ts",
        "motion.spec.ts",
      ],
      use: { browserName: "webkit" },
    },
  ],
  reporter: [["list"]],
});
