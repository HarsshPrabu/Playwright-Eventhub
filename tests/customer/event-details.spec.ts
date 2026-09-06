import { expect, test } from '../../src/fixtures/base.fixture';
import { envConfig } from '../../src/config/env.config';
import { TestDataUtil } from '../../src/helpers/TestDataUtil';

test.describe('EventHub event details and booking page', () => {
  test('displays event details and booking controls', async ({
    eventDetailsPage,
    authenticatedEventHubApi,
  }) => {
    let eventId: number | undefined;

    try {
      const createdEvent = await authenticatedEventHubApi.createEvent({
        title: `Details Automation Event ${TestDataUtil.randomUuid()}`,
        description: 'Event created for event details coverage.',
        category: 'Conference',
        city: 'Hyderabad',
        venue: 'Details Automation Venue',
        eventDate: new Date(Date.now() + 86_400_000).toISOString(),
        price: 125,
        totalSeats: 50,
      });
      eventId = createdEvent.data.data.id;
      const event = createdEvent.data.data;

      await eventDetailsPage.navigate(event.id);

      await expect(eventDetailsPage.eventSummary.title).toHaveText(event.title);
      await expect(eventDetailsPage.eventSummary.category(event.category)).toHaveText(event.category);
      await expect(eventDetailsPage.eventSummary.value('City')).toHaveText(event.city);
      await expect(eventDetailsPage.bookingForm.root).toBeVisible();
      await expect(eventDetailsPage.bookingForm.ticketCount).toHaveText('1');
      await expect(eventDetailsPage.bookingForm.confirmBookingButton).toBeVisible();
      await expect(eventDetailsPage.backToEventsLink).toBeVisible();
    } finally {
      if (eventId !== undefined) {
        try {
          await authenticatedEventHubApi.deleteEvent(eventId);
        } catch (error) {
          console.warn(`Test cleanup failed for event ${eventId}.`, error);
        }
      }
    }
  });

  test('books tickets and displays the booking confirmation', async ({
    eventDetailsPage,
    authenticatedEventHubApi,
  }) => {
    let eventId: number | undefined;

    try {
      const createdEvent = await authenticatedEventHubApi.createEvent({
        title: `Booking Automation Event ${TestDataUtil.randomUuid()}`,
        description: 'Event created for booking confirmation coverage.',
        category: 'Conference',
        city: 'Hyderabad',
        venue: 'Booking Automation Venue',
        eventDate: new Date(Date.now() + 86_400_000).toISOString(),
        price: 150,
        totalSeats: 50,
      });
      eventId = createdEvent.data.data.id;

      await eventDetailsPage.navigate(eventId);
      await eventDetailsPage.bookingForm.setTicketQuantity(2);
      await eventDetailsPage.bookingForm.fillCustomerDetails({
        name: 'Playwright Automation',
        email: envConfig.credentials.userName ?? 'automation@example.com',
        phone: '9999999999',
      });

      await expect(eventDetailsPage.bookingForm.confirmBookingButton).toBeEnabled();
      await eventDetailsPage.bookingForm.confirmBooking();

      await expect(eventDetailsPage.bookingConfirmation.heading).toContainText('Booking Confirmed');
      await expect(eventDetailsPage.bookingConfirmation.bookingReference).toBeVisible();
      await expect(eventDetailsPage.bookingConfirmation.customer).toHaveText('Playwright Automation');
      await expect(eventDetailsPage.bookingConfirmation.tickets).toHaveText('2');
      await expect(eventDetailsPage.bookingConfirmation.total).toHaveText('$300');
      await expect(eventDetailsPage.bookingConfirmation.viewMyBookingsButton).toBeVisible();
      await expect(eventDetailsPage.bookingConfirmation.browseMoreEventsButton).toBeVisible();
    } finally {
      if (eventId !== undefined) {
        const bookings = await authenticatedEventHubApi.getBookingsForEvent(eventId);
        for (const booking of bookings.data.data.filter(item => item.eventId === eventId)) {
          try {
            await authenticatedEventHubApi.cancelBooking(booking.id);
          } catch (error) {
            console.warn(`Test cleanup failed for booking ${booking.id}.`, error);
          }
        }
        try {
          await authenticatedEventHubApi.deleteEvent(eventId);
        } catch (error) {
          console.warn(`Test cleanup failed for event ${eventId}.`, error);
        }
      }
    }
  });
});
