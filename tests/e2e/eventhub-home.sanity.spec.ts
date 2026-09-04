import { test, expect } from '../../src/fixtures/base.fixture';

const USER = process.env.USER_NAME ?? 'testuser@example.com';
const PASS = process.env.USER_PASSWORD ?? 'Password123';

test.describe('EventHub login and home page sanity', () => {
  test('login page exposes the required controls', async ({ loginPage }) => {
    await loginPage.navigate();

    await expect(loginPage.loginHeading).toBeVisible();
    await expect(loginPage.emailInput).toBeVisible();
    await expect(loginPage.passwordInput).toBeVisible();
    await expect(loginPage.loginButton).toBeVisible();
    await expect(loginPage.registerLink).toBeVisible();
    await expect(loginPage.loginButton).toBeEnabled();
  });

  test('user can log in and the home page loads its event content', async ({
    page,
    loginPage,
    homePage,
  }) => {
    await loginPage.navigate();

    const loginStatus = await loginPage.login(USER, PASS);
    expect(loginStatus).toBe(200);

    await expect(homePage.navbar).toBeVisible();
    await expect(homePage.userEmailDisplay).toBeVisible();
    await expect(homePage.logoutButton).toBeVisible();

    const eventCount = await homePage.getEventCount();
    expect(eventCount).toBeGreaterThan(0);

    const titles = await homePage.getEventTitles();
    expect(titles).toHaveLength(eventCount);
    expect(titles.every(title => title.length > 0)).toBe(true);

    const firstTitle = titles[0];
    await expect(homePage.eventTitle(firstTitle)).toBeVisible();
    await expect(homePage.bookNowButton(firstTitle)).toBeVisible();

    await homePage.openEventDetail(firstTitle);
    await expect(page).toHaveURL(/\/events\/[^/?#]+(?:[/?#].*)?$/);
  });

  test('authenticated user can navigate between Events and Bookings', async ({
    loginPage,
    homePage,
    page,
  }) => {
    await loginPage.navigate();
    expect(await loginPage.login(USER, PASS)).toBe(200);

    await homePage.navigateToSection('events');
    await expect(page).toHaveURL(/\/events(?:\/)?(?:\?.*)?$/);

    await homePage.navigateToSection('bookings');
    await expect(page).toHaveURL(/\/bookings(?:\/)?(?:\?.*)?$/);
  });
});
