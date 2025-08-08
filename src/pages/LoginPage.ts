import { expect } from '@playwright/test';

export class LoginPage {
  // ✅ Inline type import; no top-level Page import anywhere
  constructor(private page: import('@playwright/test').Page) {}

  async goto() {
    await this.page.goto('/login');
    await expect(this.page).toHaveURL(/\/login/i);
  }

  /**
   * Attempts login and returns true on any of these:
   *  - URL not /login
   *  - URL includes DASHBOARD_PATH (if set)
   *  - A dashboard/navigation/logout marker becomes visible (SPA fallback)
   */
  async login(username: string, password: string): Promise<boolean> {
    const form = this.page.locator('form').first();

    await form.getByPlaceholder(/enter\s*username|username/i).fill(username);
    await form.getByPlaceholder(/enter\s*password|password/i).fill(password);

    const submit = form
      .locator('button[type="submit"]').first()
      .or(form.getByRole('button', { name: /log ?in/i }).first());
    await submit.click();

    const expectedPath = process.env.DASHBOARD_PATH || '';

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
