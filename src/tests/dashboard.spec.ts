import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';

test.describe('UAPI QC - Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(process.env.BASE_URL ? process.env.BASE_URL + '/login' : '/login');
    const login = new LoginPage(page);
    const ok = await login.login(process.env.TEST_USERNAME || '', process.env.TEST_PASSWORD || '');
    expect(ok).toBeTruthy(); // stop early if auth fails
  });

  test('dashboard loads and shows key widgets, tabs, and footer links', async ({ page }) => {
    const dash = new DashboardPage(page);

    await test.step('loaded', async () => {
      await dash.expectLoaded();
      // Secondary signal if present
      await expect(page.locator('#__next')).toContainText(/dashboard/i);
    });

    await test.step('core chrome (tabs, left menu, footer/version)', async () => {
      await dash.expectCoreChrome();
    });

    await test.step('summary widgets (optional)', async () => {
      const hasKpis = await dash.tryExpectSummaryWidgets();
      // Keep this non-blocking; uncomment if you want to require KPIs:
      // expect(hasKpis).toBeTruthy();
    });
  });
});
