import { test as setup, expect } from '@playwright/test';
import path from 'path';

const authFile = 'playwright/.auth/user.json';

setup('authenticate', async ({ page }) => {
  const email = process.env.E2E_TEST_EMAIL;
  const password = process.env.E2E_TEST_PASSWORD;

  if (!email || !password) {
    throw new Error(
      'E2E_TEST_EMAIL and E2E_TEST_PASSWORD environment variables must be set'
    );
  }

  await page.goto('/signin');

  await page.getByLabel(/email/i).fill(email);
  await page.getByLabel(/password/i).fill(password);
  await page.getByRole('button', { name: /sign in/i }).click();

  await page.waitForURL('**/dashboard');
  await expect(page).toHaveURL(/\/dashboard/);

  await page.context().storageState({ path: authFile });
});
