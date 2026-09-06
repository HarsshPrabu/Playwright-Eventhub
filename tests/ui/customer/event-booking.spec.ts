import { expect, test } from '../../../src/fixtures/base.fixture';
import { envConfig } from '../../../src/config/env.config';
import { TestDataManager } from '../../../test-data/TestDataManager';
import { eventBookingScenarios } from '../../../test-data/scenarios/event-booking.data';

test.describe('P0 Customer event booking', { tag: '@p0' }, () => {
  test(`${eventBookingScenarios.successful.testCaseId}: Book tickets successfully and reduce event availability`, async ({
    eventDetailsPage,
    authenticatedEventHubApi,
  }) => {
    const data = new TestDataManager();
    const scenario = eventBookingScenarios.successful;
    try {
      const event = await test.step('Prepare an isolated event with sufficient capacity', () => data.createEvent(authenticatedEventHubApi, scenario.event));
      await test.step('Open the event details page', () => eventDetailsPage.navigate(event.id));
      await test.step('Select two tickets and enter valid customer details', async () => {
        await eventDetailsPage.bookingForm.setTicketQuantity(scenario.booking.quantity);
        await eventDetailsPage.bookingForm.fillCustomerDetails({
          name: `${scenario.customer.name} ${event.id}`,
          email: envConfig.credentials.userName ?? 'p0@example.com',
          phone: scenario.customer.phone,
        });
      });
      await test.step('Confirm the booking', () => eventDetailsPage.bookingForm.confirmBooking());
      await test.step('Verify booking confirmation and calculated total', async () => {
        await expect(eventDetailsPage.bookingConfirmation.heading).toContainText('Booking Confirmed');
        await expect(eventDetailsPage.bookingConfirmation.tickets).toHaveText('2');
        await expect(eventDetailsPage.bookingConfirmation.total).toHaveText(`$${event.price * 2}`);
      });
      await test.step('Verify the booking exists and availability decreased', async () => {
        const bookings = await authenticatedEventHubApi.getBookingsForEvent(event.id);
        const createdBooking = bookings.data.data.find(item => item.eventId === event.id);
        expect(createdBooking).toBeDefined();
        data.trackBooking(createdBooking!.id);
        expect((await authenticatedEventHubApi.getEvent(event.id)).data.data.availableSeats).toBe(event.totalSeats - 2);
      });
    } finally {
      await test.step('Clean up the test booking and event', () => data.cleanup(authenticatedEventHubApi));
    }
  });

  test(`${eventBookingScenarios.insufficientSeats.testCaseId}: Prevent selecting more tickets than available seats`, async ({
    eventDetailsPage,
    authenticatedEventHubApi,
  }) => {
    const data = new TestDataManager();
    const scenario = eventBookingScenarios.insufficientSeats;
    try {
      const event = await test.step('Prepare an isolated event with one available seat', () =>
        data.createEvent(authenticatedEventHubApi, scenario.event)
      );
      await test.step('Open the event details page', () => eventDetailsPage.navigate(event.id));
      await test.step('Verify the UI prevents selecting more than the available capacity', async () => {
        await expect(eventDetailsPage.bookingForm.ticketCount).toHaveText('1');
        await expect(eventDetailsPage.bookingForm.increaseTicketsButton).toBeDisabled();
      });
    } finally {
      await test.step('Clean up the test event', () => data.cleanup(authenticatedEventHubApi));
    }
  });
});
