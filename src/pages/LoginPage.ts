import { Page } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  constructor(page: Page) {
    this.page = page;
  }

  async goto() {
    await this.page.goto(process.env.BASE_URL ? process.env.BASE_URL + '/login' : '/login');
  }

  async login(username: string, password: string): Promise<boolean> {
  // Fill username/email
  const form = this.page.locator('form').first();
  await form.getByPlaceholder(/username|email/i).fill(username);
  // Fill password
  await form.getByPlaceholder(/password/i).fill(password);
  // Click only the submit button inside the form
  await form.locator('button[type="submit"], input[type="submit"]').first().click();

    const expectedPath = process.env.DASHBOARD_PATH || '';

    // Wait for navigation or dashboard heading
    const movedOffLogin = await this.page
      .waitForURL((u: URL) => {
        const href = u.toString();
        if (/\/login/i.test(href)) return false;
        if (expectedPath) return href.includes(expectedPath);
        return true;
      }, { timeout: 30000 })
      .then(() => true)
      .catch(() => false);

    if (movedOffLogin) return true;

    const successMarkers = [
      this.page.getByRole('heading', { name: /dashboard/i }),
      this.page.getByRole('navigation').first(),
      this.page.getByRole('button', { name: /log ?out/i }),
    ];

    for (const m of successMarkers) {
      const visible = await m.isVisible().catch(() => false);
      if (visible) return true;
    }

    const errors = [
      this.page.locator('[role="alert"]'),
      this.page.locator('.MuiAlert-message'),
      this.page.locator('.MuiFormHelperText-root'),
      this.page.getByText(/invalid|incorrect|unauthorized|try again/i),
    ];
    for (const e of errors) {
      const t = (await e.first().textContent().catch(() => ''))?.trim();
      if (t) console.warn('Login error message:', t);
    }
    return false;
  }
}
