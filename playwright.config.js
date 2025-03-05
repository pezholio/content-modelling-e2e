// @ts-check
const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  timeout: 120_000,
  reporter: 'html',
  use: {
    baseURL: 'http://whitehall-admin.dev.gov.uk/',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: [
    {
      command: 'govuk-docker run whitehall-app env GOVUK_WEBSITE_ROOT=http://government-frontend.dev.gov.uk bin/dev',
      url: 'http://whitehall-admin.dev.gov.uk/',
      reuseExistingServer: !process.env.CI,
    },
    {
      command: 'govuk-docker run government-frontend-app',
      url: 'http://government-frontend.dev.gov.uk/',
      reuseExistingServer: !process.env.CI,
    },
  ],
});

