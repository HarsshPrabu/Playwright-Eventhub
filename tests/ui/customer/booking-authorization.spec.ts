import { expect, test } from '../../../src/fixtures/base.fixture';

test.describe('P0 Booking authorization', { tag: '@p0' }, () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test('BKG-CUST-004: Deny access to a missing or unauthorized booking', async ({ page }) => {
    const nonexistentBookingId = 2147483647;
    await test.step('Open a guaranteed nonexistent booking directly', () =>
      page.goto(`/bookings/${nonexistentBookingId}`)
    );

    await test.step('Verify the booking resource is not exposed', async () => {
      await expect(page).toHaveURL(/\/login|\/bookings\/2147483647/);
      await expect(page.getByRole('alert')).toBeVisible();
    });
  });
});
