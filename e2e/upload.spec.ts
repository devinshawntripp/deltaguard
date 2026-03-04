import { test, expect } from '@playwright/test';
import path from 'path';

const tinyBin = path.join(__dirname, 'fixtures', 'tiny.bin');

/**
 * E2E tests for the upload flow.
 * Verifies that uploading a file creates a scan job.
 * Cleans up created jobs after each test.
 */
test.describe('Upload flow', () => {
  let jobId: string | null = null;

  test.afterEach(async ({ page }) => {
    if (jobId) {
      // Clean up the scan job created during the test
      try {
        await page.request.delete(`/api/jobs/${jobId}`);
      } catch {
        // Best-effort cleanup — ignore errors
      }
      jobId = null;
    }
  });

  test('upload flow creates a scan job', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // Select the test binary file
    await page.locator('input[type="file"]').setInputFiles(tinyBin);

    // Click the "Upload & Scan" button
    await page.getByRole('button', { name: /upload & scan/i }).click();

    // Wait for the success message "Job queued: <uuid>"
    const messageLocator = page.locator('text=/Job queued:/');
    await expect(messageLocator).toBeVisible({ timeout: 30_000 });

    const messageText = await messageLocator.textContent();
    const uuidMatch = messageText?.match(
      /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i
    );

    expect(uuidMatch).toBeTruthy();
    jobId = uuidMatch![0];
    expect(jobId).toBeTruthy();
  });
});
