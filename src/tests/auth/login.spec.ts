import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';

test.describe('UAPI QC - Login', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(process.env.BASE_URL ? process.env.BASE_URL + '/login' : '/login');
    await expect(page).toHaveTitle(/log ?in/i);
    await expect(page).toHaveURL(/\/login/i);
  });

  test('valid login leaves login page (and/or shows dashboard)', async ({ page }) => {
    const login = new LoginPage(page);
    await login.login(process.env.TEST_USERNAME || '', process.env.TEST_PASSWORD || '');
    const offLogin = !/\/login/i.test(page.url());
    const heading = await page.getByRole('heading', { name: /dashboard/i }).isVisible().catch(() => false);
    expect(offLogin || heading).toBeTruthy();
  });

  test.fixme('enter key submits the form', async ({ page }) => {
    // Enable once UI supports Enter-to-submit on the form.
  });

  test('empty username stays on login page', async ({ page }) => {
    const form = page.locator('form').first();
    await form.getByPlaceholder(/password/i).fill('dummy');
    await form.locator('button[type="submit"], input[type="submit"]').first().click();
    await expect(page).toHaveURL(/\/login/i);
  });

  test('empty password stays on login page', async ({ page }) => {
    const form = page.locator('form').first();
    await form.getByPlaceholder(/username|email/i).fill('someone');
    await form.locator('button[type="submit"], input[type="submit"]').first().click();
    await expect(page).toHaveURL(/\/login/i);
  });

  test('wrong password stays on login page', async ({ page }) => {
    const form = page.locator('form').first();
    await form.getByPlaceholder(/username|email/i).fill(process.env.TEST_USERNAME || '');
    await form.getByPlaceholder(/password/i).fill('definitely-wrong-password');
    await form.locator('button[type="submit"], input[type="submit"]').first().click();
    await expect(page).toHaveURL(/\/login/i);
  });

  test('password field is masked', async ({ page }) => {
    const type = await page.locator('input[type="password"]').first().getAttribute('type');
    expect(type).toBe('password');
  });
});
