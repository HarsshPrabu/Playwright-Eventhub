import { test, expect } from '../../src/fixtures/base.fixture';

test.describe('EventHub login and home page sanity', () => {
  test.describe('Unauthenticated login page', () => {
    test.use({ storageState: { cookies: [], origins: [] } });

    test('login page exposes the required controls', async ({ loginPage }) => {
      await loginPage.navigate();

      await expect(loginPage.loginHeading).toBeVisible();
      await expect(loginPage.emailInput).toBeVisible();
      await expect(loginPage.passwordInput).toBeVisible();
      await expect(loginPage.loginButton).toBeVisible();
      await expect(loginPage.registerLink).toBeVisible();
      await expect(loginPage.loginButton).toBeEnabled();
    });
  });

  test('authenticated user sees the home page event content', async ({ page, homePage }) => {
    await page.goto('/');

    await expect(homePage.eventCards.first()).toBeVisible();

    await expect(homePage.header.navbar).toBeVisible();
    await expect(homePage.header.navEvents).toHaveCount(1);
    await expect(homePage.header.userEmailDisplay).toBeVisible();
    await expect(homePage.header.logoutButton).toBeVisible();

    const eventCount = await homePage.getEventCount();
    expect(eventCount).toBeGreaterThan(0);

    const titles = await homePage.getEventTitles();
    expect(titles).toHaveLength(eventCount);
    expect(titles.every(title => title.length > 0)).toBe(true);

    const firstTitle = titles[0];
    await expect(homePage.eventCard(firstTitle).root).toHaveCount(1);
    await expect(homePage.eventCard(firstTitle).title).toHaveCount(1);
    await expect(homePage.eventCard(firstTitle).detailsLink).toHaveCount(1);
    await expect(homePage.eventCard(firstTitle).title).toBeVisible();
    await expect(homePage.eventCard(firstTitle).bookNowButton).toBeVisible();

    await homePage.openEventDetail(firstTitle);
    await expect(page).toHaveURL(/\/events\/[^/?#]+(?:[/?#].*)?$/);
  });

  test('authenticated user can navigate between Events and Bookings', async ({ homePage, page }) => {
    await page.goto('/');

    await homePage.navigateToSection('events');
    await expect(page).toHaveURL(/\/events(?:\/)?(?:\?.*)?$/);

    await homePage.navigateToSection('bookings');
    await expect(page).toHaveURL(/\/bookings(?:\/)?(?:\?.*)?$/);
  });
});
