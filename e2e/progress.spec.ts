import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

const tinyBin = path.join(__dirname, 'fixtures', 'tiny.bin');

/**
 * E2E test for scan progress UI.
 * Uploads tiny.bin via the dashboard UI, then navigates to the job page
 * and verifies the progress/status component renders.
 * Cleans up the job after the test.
 */
test.describe('Scan progress', () => {
  let jobId: string | null = null;

  test.beforeAll(async ({ browser }) => {
    // Create a page with the stored auth state to upload a file
    const context = await browser.newContext({
      storageState: 'playwright/.auth/user.json',
      baseURL: process.env.E2E_BASE_URL || 'https://scanrook.io',
    });
    const page = await context.newPage();

    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    await page.locator('input[type="file"]').setInputFiles(tinyBin);
    await page.getByRole('button', { name: /upload & scan/i }).click();

    const messageLocator = page.locator('text=/Job queued:/');
    await expect(messageLocator).toBeVisible({ timeout: 30_000 });

    const messageText = await messageLocator.textContent();
    const uuidMatch = messageText?.match(
      /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i
    );
    jobId = uuidMatch?.[0] ?? null;

    await context.close();
  });

  test.afterAll(async ({ request }) => {
    if (jobId) {
      try {
        await request.delete(`/api/jobs/${jobId}`);
      } catch {
        // Best-effort cleanup
      }
    }
  });

  test('scan progress UI renders on job page', async ({ page }) => {
    expect(jobId).toBeTruthy();

    await page.goto(`/dashboard/${jobId}`);
    await page.waitForLoadState('networkidle');

    // The job detail page renders JobLiveStatus — look for the status area
    // or the pipeline/log viewer component.
    // We verify that progress-related content is visible.
    // Accept any of: a progress indicator, status badge, or the log viewer section.
    const progressIndicators = page.locator([
      '[data-testid="job-live-status"]',
      'text=/queued|running|done|failed/i',
      'text=/Live status/i',
    ].join(', '));

    await expect(progressIndicators.first()).toBeVisible({ timeout: 30_000 });
  });
});
