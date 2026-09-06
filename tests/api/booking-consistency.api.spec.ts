import { expect, test } from '../../src/fixtures/base.fixture';
import { envConfig } from '../../src/config/env.config';
import { TestDataManager } from '../../test-data/TestDataManager';

test.describe('P0 Booking consistency', { tag: '@p0' }, () => {
  test('API-006: Keep UI and API consistent after booking cancellation', async ({
    myBookingsPage,
    authenticatedEventHubApi,
  }) => {
    const data = new TestDataManager();
    try {
      const event = await test.step('Prepare an isolated event', () => data.createEvent(authenticatedEventHubApi));
      const booking = await test.step('Prepare an isolated confirmed booking', () => data.createBooking(authenticatedEventHubApi, event.id, {
        customerEmail: envConfig.credentials.userName!,
      }));
      await test.step('Open the customer bookings page', () => myBookingsPage.navigate());
      await test.step('Cancel the booking from the UI', () => myBookingsPage.cancelBooking(booking.bookingRef));
      await test.step('Verify the UI and API show the same cancelled state', async () => {
        await expect(myBookingsPage.bookingCard(booking.bookingRef)).toContainText('cancelled');
        const persisted = await authenticatedEventHubApi.getBooking(booking.id);
        expect(persisted.data.data.status).toBe('cancelled');
      });
      await test.step('Verify event availability remains consistent', async () => {
        const persistedEvent = await authenticatedEventHubApi.getEvent(event.id);
        expect(persistedEvent.data.data.availableSeats).toBe(event.totalSeats);
      });
    } finally {
      await test.step('Clean up the booking and event', () => data.cleanup(authenticatedEventHubApi));
    }
  });
});
