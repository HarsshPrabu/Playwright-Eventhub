import { expect, test } from '../../../src/fixtures/ui.fixture';
import { envConfig } from '../../../src/config/env.config';
import { TestDataManager } from '../../../test-data/TestDataManager';
import { customerBookingScenarios } from '../../../test-data/scenarios/customer-bookings.data';

test.describe('P0 Customer bookings', { tag: '@p0' }, () => {
  test(`${customerBookingScenarios.ownedBooking.testCaseId}: Display only bookings belonging to the authenticated customer`, async ({
    myBookingsPage,
    authenticatedEventHubApi,
  }) => {
    const data = new TestDataManager();
    try {
      const event = await test.step('Prepare an isolated event', () => data.createEvent(authenticatedEventHubApi));
      const booking = await test.step('Prepare an isolated customer booking', () => data.createBooking(authenticatedEventHubApi, event.id, {
        ...customerBookingScenarios.ownedBooking,
        customerEmail: envConfig.credentials.userName!,
      }));
      await test.step('Open My Bookings', () => myBookingsPage.navigate());
      await test.step('Verify the owned booking is displayed', async () => {
        await expect(myBookingsPage.bookingCard(booking.bookingRef)).toBeVisible();
        expect(await myBookingsPage.getBookingReferences()).toContain(booking.bookingRef);
      });
      await test.step('Verify the API result is scoped to the authenticated customer', async () => {
        const result = await authenticatedEventHubApi.getBookings();
        expect(result.data.data.every(item => item.customerEmail === envConfig.credentials.userName)).toBe(true);
      });
    } finally {
      await test.step('Clean up the booking and event', () => data.cleanup(authenticatedEventHubApi));
    }
  });

  test(`${customerBookingScenarios.cancellableBooking.testCaseId}: Cancel a confirmed customer booking`, async ({
    myBookingsPage,
    authenticatedEventHubApi,
  }) => {
    const data = new TestDataManager();
    try {
      const event = await test.step('Prepare an isolated event', () => data.createEvent(authenticatedEventHubApi));
      const booking = await test.step('Prepare an isolated confirmed booking', () => data.createBooking(authenticatedEventHubApi, event.id, {
        ...customerBookingScenarios.cancellableBooking,
        customerEmail: envConfig.credentials.userName!,
      }));
      await test.step('Open My Bookings', () => myBookingsPage.navigate());
      await test.step('Cancel the exact booking reference', () => myBookingsPage.cancelBooking(booking.bookingRef));
      await test.step('Refresh My Bookings after cancellation', () => myBookingsPage.navigate());
      await test.step('Verify the booking is removed from the customer view and API', async () => {
        expect(await myBookingsPage.isBookingVisible(booking.bookingRef)).toBe(false);
        const response = await authenticatedEventHubApi.get(`/bookings/${booking.id}`, {
          expectedStatus: 404,
        });
        expect(response.status()).toBe(404);
      });
    } finally {
      await test.step('Clean up the booking and event', () => data.cleanup(authenticatedEventHubApi));
    }
  });
});
