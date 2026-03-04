import { test, expect } from '@playwright/test';

/**
 * E2E tests for auth flows: sign-out and sign-in.
 * Credentials are read from env vars only — never hardcoded.
 */
test.describe('Auth', () => {
  test('sign out redirects to /signin', async ({ page }) => {
    // storageState from auth setup already applied via playwright.config.ts
    await page.goto('/dashboard');

    // Wait for page to load (nav is rendered client-side)
    await page.waitForLoadState('networkidle');

    // Click sign-out button
    await page.getByRole('button', { name: /sign out/i }).click();

    await page.waitForURL('**/signin');
    await expect(page).toHaveURL(/\/signin/);
  });

  test('sign in with valid credentials navigates to dashboard', async ({ page, context }) => {
    const email = process.env.E2E_TEST_EMAIL;
    const password = process.env.E2E_TEST_PASSWORD;

    if (!email || !password) {
      throw new Error(
        'E2E_TEST_EMAIL and E2E_TEST_PASSWORD environment variables must be set'
      );
    }

    // Clear all cookies to start unauthenticated
    await context.clearCookies();
    await page.goto('/signin');

    await page.locator('input[name="email"]').fill(email);
    await page.locator('input[name="password"]').fill(password);
    await page.getByRole('button', { name: /^sign in$/i }).click();

    await page.waitForURL('**/dashboard');
    await expect(page).toHaveURL(/\/dashboard/);
  });
});
