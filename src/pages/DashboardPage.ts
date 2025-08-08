import { expect } from '@playwright/test';

export class DashboardPage {
  constructor(private page: import('@playwright/test').Page) {}

  // We’re on the Dashboard if the heading or Dashboard tab is visible.
  async expectLoaded() {
    const heading = this.page.getByRole('heading', { name: /dashboard/i });
    const tab = this.page.getByRole('tab', { name: /dashboard/i });
    await expect(heading.or(tab)).toBeVisible({ timeout: 15000 });
  }

  async openServicesTab() {
    await this.page.getByRole('tab', { name: /^services$/i }).click();
  }
  async openDashboardTab() {
    await this.page.getByRole('tab', { name: /^dashboard$/i }).click();
  }

  // Validate key, stable chrome that appears across tenants and zero-data states
  async expectCoreChrome() {
    // Tabs should be visible
    await expect(this.page.getByRole('tab', { name: /^services$/i })).toBeVisible();
    await expect(this.page.getByRole('tab', { name: /^dashboard$/i })).toBeVisible();

    // Left navigation (zero-state still shows menu labels)
    const leftMenuLabels = [
      /sub account/i,
      /my packages/i,
      /my invoices/i,
      /roles?\s*&\s*permissions/i,
      /user management/i,
      /reports?/i,
    ];
    for (const re of leftMenuLabels) {
      await expect(this.page.getByText(re).first()).toBeVisible({ timeout: 15000 });
    }

    // Footer & version text (version number may change, keep flexible)
    await expect(
      this.page.getByText(/UAPI PORTAL\s*\(Version\s*:\s*[\d.]+\)/i).first()
    ).toBeVisible({ timeout: 15000 });

    const footerItems = [
      /api documentation/i,
      /developer forum/i,
      /terms of use/i,
      /api status/i,
      /support/i,
    ];
    for (const re of footerItems) {
      // Find the first visible element among button, link, or text
      const candidates = [
        this.page.getByRole('button', { name: re }),
        this.page.getByRole('link', { name: re }),
        this.page.getByText(re)
      ];
      let found = false;
      for (const c of candidates) {
        const visible = await c.first().isVisible().catch(() => false);
        if (visible) {
          await expect(c.first()).toBeVisible();
          found = true;
          break;
        }
      }
      if (!found) {
        throw new Error(`Footer item not visible: ${re}`);
      }
    }
  }

  /**
   * Optional KPI tiles check. Returns true if any KPI/summary block is found,
   * otherwise logs context and returns false (so tests can continue).
   */
  async tryExpectSummaryWidgets(): Promise<boolean> {
    const patterns: RegExp[][] = [
      [/total\s*apis/i],
      [/api\s*call.*24/i, /24\s*hr/i],
      [/number\s*of\s*active\s*annual\s*package/i, /active\s*annual\s*package\s*number/i],
      [/number\s*of\s*active\s*service\s*package/i, /active\s*service\s*package\s*number/i],
      [/no data to display/i], // zero-state indicator also acceptable
    ];

    let foundAny = false;

    for (const alts of patterns) {
      for (const re of alts) {
        const candidate = this.page
          .getByRole('link', { name: re })
          .or(this.page.getByText(re));
        const visible = await candidate.first().isVisible().catch(() => false);
        if (visible) {
          foundAny = true;
          break;
        }
      }
    }

    if (!foundAny) {
      const snippet = (await this.page.locator('body').innerText().catch(() => ''))?.slice(0, 500);
      console.warn('KPI tiles not detected on this tenant/role. This is non-fatal.');
      console.warn('Body snippet:', snippet);
    }
    return foundAny;
  }
}
