import { test, expect } from '../../src/fixtures/base.fixture';
import { baseUrlUI } from '../../src/helper/config/testConfig';

test.describe('EventHub Home Page Sanity', () => {
  test('Home page loads and core UI actions work', async ({ page, loginPage, homePage }) => {
    // Navigate to the application
    await page.goto(baseUrlUI);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000)

    // Perform login
    const USER = process.env.USER_NAME ?? 'testuser@example.com';
    const PASS = process.env.USER_PASSWORD ?? 'Password123';
    await loginPage.login(USER, PASS);
    await page.waitForLoadState('domcontentloaded');

    // Verify the header is visible
    expect(await homePage.isHeaderVisible()).toBeTruthy();

    // Verify the user is logged in (profile icon visible)
    expect(await homePage.isUserLoggedIn()).toBeTruthy();

    // Check that at least one event card is displayed
    const eventCount = await homePage.getEventCount();
    expect(eventCount).toBeGreaterThan(0);

    // Grab the first event title for further checks
    const titles = await homePage.getEventTitles();
    const firstTitle = titles[0];

    // Search for the first event by name and verify it appears
    await homePage.searchEvent(firstTitle);
    expect(await homePage.isEventCardVisible(firstTitle)).toBeTruthy();

    // Apply a category filter (example category – adjust if needed)
    await homePage.filterByCategory('Conference');

    // Open the detail view of the first event
    await homePage.openEventDetail(firstTitle);
    const detailHeading = page.locator('[data-testid="event-title"]');
    await expect(detailHeading).toContainText(firstTitle);

    // Ensure any loading spinner has disappeared
    await homePage.waitForLoadingSpinner();
  });
});
