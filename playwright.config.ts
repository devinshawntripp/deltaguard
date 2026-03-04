import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for ScanRook E2E tests.
 * Tests run against the deployed cluster (scanrook.io) by default.
 * Set E2E_BASE_URL to override (e.g. for staging).
 *
 * Required env vars:
 *   E2E_TEST_EMAIL    - test account email
 *   E2E_TEST_PASSWORD - test account password
 */
export default defineConfig({
  testDir: './e2e',
  timeout: 60_000,
  retries: 1,
  use: {
    baseURL: process.env.E2E_BASE_URL || 'https://scanrook.io',
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'setup',
      testMatch: /auth\.setup\.ts/,
    },
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'playwright/.auth/user.json',
      },
      dependencies: ['setup'],
    },
  ],
});
