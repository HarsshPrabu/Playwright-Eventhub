import { expect, test } from '../../src/fixtures/base.fixture';
import { envConfig } from '../../src/config/env.config';
import { TestDataUtil } from '../../src/helpers/TestDataUtil';

test.describe('EventHub booking details page', () => {
  test('displays booking details and refund action', async ({
    bookingDetailsPage,
    authenticatedEventHubApi,
  }) => {
    let eventId: number | undefined;
    let bookingId: number | undefined;

    try {
      const createdEvent = await authenticatedEventHubApi.createEvent({
        title: `Booking Details Event ${TestDataUtil.randomUuid()}`,
        description: 'Event created for booking details coverage.',
        category: 'Conference',
        venue: 'Booking Details Venue',
        city: 'Hyderabad',
        eventDate: new Date(Date.now() + 86_400_000).toISOString(),
        price: 110,
        totalSeats: 50,
      });
      eventId = createdEvent.data.data.id;

      const createdBooking = await authenticatedEventHubApi.createBooking({
        eventId,
        customerName: `Booking Details ${TestDataUtil.randomString(6)}`,
        customerEmail: envConfig.credentials.userName ?? 'automation@example.com',
        customerPhone: '9999999999',
        quantity: 1,
      });
      bookingId = createdBooking.data.data.id;
      const booking = createdBooking.data.data;

      await bookingDetailsPage.navigate(booking.id);

      await expect(bookingDetailsPage.bookingReference).toContainText(booking.bookingRef);
      await expect(bookingDetailsPage.status).toHaveText(booking.status);
      await expect(bookingDetailsPage.eventDetails.value('Event')).toHaveText(booking.event.title);
      await expect(bookingDetailsPage.eventDetails.value('City')).toHaveText(booking.event.city);
      await expect(bookingDetailsPage.customerDetails.value('Email')).toHaveText(booking.customerEmail);
      await expect(bookingDetailsPage.paymentSummary.value('Tickets')).toHaveText(String(booking.quantity));
      await expect(bookingDetailsPage.checkRefundButton).toBeVisible();
      await expect(bookingDetailsPage.backToBookingsLink).toBeVisible();
    } finally {
      if (bookingId !== undefined) {
        try {
          await authenticatedEventHubApi.cancelBooking(bookingId);
        } catch (error) {
          console.warn(`Test cleanup failed for booking ${bookingId}.`, error);
        }
      }
      if (eventId !== undefined) {
        try {
          await authenticatedEventHubApi.deleteEvent(eventId);
        } catch (error) {
          console.warn(`Test cleanup failed for event ${eventId}.`, error);
        }
      }
    }
  });
});
