
import { test as base } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';

export const test = base.extend<{ authenticated: void }>({
  authenticated: [async ({ page }, use) => {
    const login = new LoginPage(page);
    await login.goto();
    await login.login(process.env.TEST_USERNAME || '', process.env.TEST_PASSWORD || '');
    await use();
  }, { auto: false }],
});

export { expect } from '@playwright/test';
