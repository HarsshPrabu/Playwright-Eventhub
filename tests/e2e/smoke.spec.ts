import { test, expect } from '../../src/fixtures/base.fixture';
import { baseUrl } from '../../src/config/env.config';

test.describe('E2E Smoke & Hybrid UI-API Suite', () => {
  test('TC-001: Should navigate to base URL and verify page loads', async ({ page }) => {
    await page.goto(baseUrl);
    await page.waitForLoadState('domcontentloaded');

    // Basic assertion that page has loaded
    expect(page.url()).toContain(new URL(baseUrl).hostname);
    await expect(page).toHaveTitle(/.+/);
  });

  test('TC-002: Screenshot capture helper works', async ({ loginPage, screenshotHelper }) => {
    await loginPage.navigate();

    const screenshotBuffer = await screenshotHelper.pageScreenshot();
    expect(screenshotBuffer).toBeDefined();
  });

  test('TC-003: Hybrid UI-API - Mock API response and verify in UI', async ({ page, loginPage }) => {
    await loginPage.navigate();

    // 1. Mock a backend endpoint on the UI page
    await page.route('**/api/mock-profile', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ user: 'Test User', status: 'Active' }),
      });
    });

    // 2. Fetch within the browser DOM (verifies page routing interceptor)
    const result = await page.evaluate(async () => {
      const res = await fetch('/api/mock-profile');
      return await res.json();
    });

    expect(result.user).toBe('Test User');
    expect(result.status).toBe('Active');

    // 3. Clean up route mocking
    await page.unroute('**/api/mock-profile');
  });
});
