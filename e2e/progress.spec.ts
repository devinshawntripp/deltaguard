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

    // Wait for the upload input to be ready (dashboard has persistent SSE
    // connections so networkidle never fires)
    const fileInput = page.locator('input[type="file"]');
    await fileInput.waitFor({ state: 'attached', timeout: 15_000 });

    await fileInput.setInputFiles(tinyBin);
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

  test.afterAll(async ({ browser }) => {
    if (!jobId) return;
    const context = await browser.newContext({
      storageState: 'playwright/.auth/user.json',
      baseURL: process.env.E2E_BASE_URL || 'https://scanrook.io',
    });
    const page = await context.newPage();
    try {
      const resp = await page.request.delete(`/api/jobs/${jobId}`);
      if (!resp.ok()) {
        console.warn(`[E2E cleanup] DELETE /api/jobs/${jobId} returned HTTP ${resp.status()}`);
      }
    } catch (err) {
      console.warn(`[E2E cleanup] DELETE /api/jobs/${jobId} threw: ${err}`);
    } finally {
      await context.close();
    }
  });

  test('scan progress UI renders on job page', async ({ page }) => {
    expect(jobId).toBeTruthy();

    await page.goto(`/dashboard/${jobId}`);

    // The job detail page renders JobLiveStatus — look for the status area
    // or the pipeline/log viewer component.
    // Accept any of: a progress indicator, status badge, or the log viewer section.
    const progressIndicators = page.locator('[data-testid="job-live-status"]')
      .or(page.getByText(/queued|running|done|failed/i).first())
      .or(page.getByText(/Live status/i));

    await expect(progressIndicators.first()).toBeVisible({ timeout: 30_000 });
  });
});
