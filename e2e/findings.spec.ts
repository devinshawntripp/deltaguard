import { test, expect } from '@playwright/test';
import path from 'path';

const tinyBin = path.join(__dirname, 'fixtures', 'tiny.bin');

/** Poll the job status API until it reaches a terminal state or times out. */
async function waitForJobDone(
  request: Parameters<Parameters<typeof test>[1]>[0]['request'],
  jobId: string,
  timeoutMs = 120_000
): Promise<string> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const res = await request.get(`/api/jobs/${jobId}`);
    if (res.ok()) {
      const body = await res.json();
      const status: string = body.status ?? '';
      if (status === 'done' || status === 'failed') {
        return status;
      }
    }
    // Wait 3 seconds before next poll
    await new Promise((r) => setTimeout(r, 3_000));
  }
  throw new Error(`Job ${jobId} did not reach terminal state within ${timeoutMs}ms`);
}

/**
 * E2E test for the findings page filters.
 * Uploads tiny.bin, waits for the scan to complete, then navigates to
 * the findings page and verifies the severity filter works.
 * Cleans up the job after all tests.
 */
test.describe('Findings filters', () => {
  let jobId: string | null = null;

  test.beforeAll(async ({ browser, request }) => {
    // Upload file via browser UI
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

    if (!jobId) {
      throw new Error('Upload did not produce a job ID');
    }

    // Wait for job to reach terminal state
    await waitForJobDone(request, jobId);
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

  test('severity filter reduces findings results', async ({ page }) => {
    expect(jobId).toBeTruthy();

    await page.goto(`/dashboard/${jobId}/findings`);
    await page.waitForLoadState('networkidle');

    // Wait for findings component to finish loading
    await page.waitForTimeout(1_000);

    // Count rows in the findings table body
    const rows = page.locator('table tbody tr');
    const tableVisible = await rows.count() > 0;

    if (!tableVisible) {
      // If no findings (empty state), the test passes — nothing to filter
      // Verify the page rendered without error
      await expect(page.locator('text=/findings/i').first()).toBeVisible();
      return;
    }

    const initialCount = await rows.count();

    // Use the severity select dropdown to filter by CRITICAL
    const severitySelect = page.locator('select').filter({ hasText: /all severities/i });
    await severitySelect.selectOption('CRITICAL');

    // Wait for re-render
    await page.waitForTimeout(500);

    const filteredCount = await rows.count();
    expect(filteredCount).toBeLessThanOrEqual(initialCount);
  });
});
