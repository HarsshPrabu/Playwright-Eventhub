import { expect, test } from '../../src/fixtures/base.fixture';
import { envConfig } from '../../src/config/env.config';
import { TestDataManager } from '../../test-data/TestDataManager';
import { eventBookingScenarios } from '../../test-data/scenarios/event-booking.data';

test.describe('P0 Booking validation API', { tag: '@p0' }, () => {
  test(`${eventBookingScenarios.insufficientSeats.apiTestCaseId}: Reject a booking that exceeds available capacity`, async ({
    authenticatedEventHubApi,
  }) => {
    const data = new TestDataManager();
    const scenario = eventBookingScenarios.insufficientSeats;

    try {
      const event = await test.step('Prepare an isolated event with one available seat', () =>
        data.createEvent(authenticatedEventHubApi, scenario.event)
      );

      const response = await test.step('Submit a booking exceeding the available capacity', () =>
        authenticatedEventHubApi.post('/bookings', {
          eventId: event.id,
          customerName: `${scenario.customer.name} ${event.id}`,
          customerEmail: envConfig.credentials.userName!,
          customerPhone: scenario.customer.phone,
          quantity: scenario.booking.quantity,
        }, {
          expectedStatus: [400, 409, 422],
        })
      );

      await test.step('Verify the API rejects the booking', async () => {
        expect([400, 409, 422]).toContain(response.status());
        const bookings = await authenticatedEventHubApi.getBookingsForEvent(event.id);
        expect(bookings.data.data.filter(item => item.eventId === event.id)).toHaveLength(0);
      });
    } finally {
      await test.step('Clean up the test event', () => data.cleanup(authenticatedEventHubApi));
    }
  });
});
