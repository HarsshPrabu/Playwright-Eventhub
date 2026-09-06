import { expect, test } from '../../src/fixtures/api.fixture';
import { envConfig } from '../../src/config/env.config';
import { TestDataManager } from '../../test-data/TestDataManager';
import { expectBookingContract, expectPagination } from './support/api-contract-assertions';

test.describe('Booking API contract', { tag: '@api' }, () => {
  test('API-004: Return correctly shaped paginated booking data with ownership filtering', async ({ authenticatedEventHubApi }) => {
    const data = new TestDataManager();

    try {
      const event = await test.step('Prepare an isolated event and booking', () => data.createEvent(authenticatedEventHubApi));
      const booking = await test.step('Create a booking for the configured customer', () =>
        data.createBooking(authenticatedEventHubApi, event.id, {
          customerEmail: envConfig.credentials.userName!,
        })
      );

      const queries = [
        { name: 'default bookings', query: {} },
        { name: 'custom page and limit', query: { page: 1, limit: 5 } },
        { name: 'event filter', query: { eventId: event.id } },
        { name: 'confirmed status filter', query: { status: 'confirmed' as const } },
      ];

      for (const scenario of queries) {
        await test.step(`Verify ${scenario.name} response contract`, async () => {
          const result = await authenticatedEventHubApi.getBookings(scenario.query);
          expect(result.status).toBe(200);
          expectPagination(result.data);
          result.data.data.forEach(expectBookingContract);
          expect(result.data.data.every(item => item.customerEmail === envConfig.credentials.userName)).toBe(true);
        });
      }

      await test.step('Verify the isolated booking is returned by the event filter', async () => {
        const result = await authenticatedEventHubApi.getBookings({ eventId: event.id });
        expect(result.data.data.map(item => item.id)).toContain(booking.id);
      });
    } finally {
      await test.step('Clean up the booking and event', () => data.cleanup(authenticatedEventHubApi));
    }
  });

  test('API-004-EMPTY: Return a valid empty result for an unmatched booking filter', async ({ authenticatedEventHubApi }) => {
    const result = await test.step('Filter bookings by an event that cannot exist', () =>
      authenticatedEventHubApi.getBookings({ eventId: 2147483647 })
    );

    await test.step('Verify the empty paginated contract', async () => {
      expect(result.status).toBe(200);
      expectPagination(result.data);
      expect(result.data.data).toHaveLength(0);
    });
  });
});
