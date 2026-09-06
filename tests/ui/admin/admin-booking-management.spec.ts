import { expect, test } from '../../../src/fixtures/base.fixture';
import { envConfig } from '../../../src/config/env.config';
import { ApiRequestError } from '../../../src/api/errors/ApiRequestError';
import { TestDataManager } from '../../../test-data/TestDataManager';
import { adminBookingScenarios } from '../../../test-data/scenarios/admin-bookings.data';

test.describe('P0 Admin booking cancellation', { tag: '@p0' }, () => {
  test(`${adminBookingScenarios.cancellableBooking.testCaseId}: Allow an administrator to cancel a confirmed booking`, async ({
    adminBookingsPage,
    authenticatedEventHubApi,
  }) => {
    const data = new TestDataManager();
    try {
      const event = await test.step('Prepare an isolated event', () => data.createEvent(authenticatedEventHubApi));
      const booking = await test.step('Prepare an isolated confirmed booking', () => data.createBooking(authenticatedEventHubApi, event.id, {
        ...adminBookingScenarios.cancellableBooking,
        customerEmail: envConfig.credentials.userName!,
      }));
      await test.step('Open Manage Bookings', () => adminBookingsPage.navigate());
      await test.step('Cancel the exact booking from the admin table', () => adminBookingsPage.cancelBooking(booking.bookingRef));
      await test.step('Verify the booking is no longer available through the API', async () => {
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
