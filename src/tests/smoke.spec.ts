import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';

test('can log in and see dashboard/nav', async ({ page }) => {
  const login = new LoginPage(page);
  await login.goto();

  const ok = await login.login(process.env.TEST_USERNAME || '', process.env.TEST_PASSWORD || '');

  // Gather diagnostics on failure
  if (!ok) {
    const url = page.url();
    const alertText =
      (await page.locator('[role="alert"], .MuiAlert-message, .MuiFormHelperText-root')
        .first()
        .textContent()
        .catch(() => ''))?.trim() || '(no visible error message)';

    // Helpful output in the test log
    console.error('Login failed. URL:', url);
    console.error('Any error banner/helper:', alertText);

    // Force a failing assertion with context
    expect(ok, `Login failed, still on ${url}. Error UI: ${alertText}`).toBeTruthy();
  }

  // Post-login sanity (any of these is fine)
  const expectedPath = process.env.DASHBOARD_PATH || '';
  const offLogin = !/\/login/i.test(page.url());
  const pathMatches = expectedPath ? page.url().includes(expectedPath) : false;
  const hasDash = await page.getByRole('heading', { name: /dashboard/i }).isVisible().catch(() => false);
  const hasNav = await page.getByRole('navigation').first().isVisible().catch(() => false);
  const hasLogout = await page.getByRole('button', { name: /log ?out/i }).isVisible().catch(() => false);

  expect(offLogin || pathMatches || hasDash || hasNav || hasLogout).toBeTruthy();
});
