import { expect, test } from '../../src/fixtures/base.fixture';
import { envConfig } from '../../src/config/env.config';
import { TestDataUtil } from '../../src/helpers/TestDataUtil';

test.describe('EventHub My Bookings page', () => {
  test('displays and opens a newly created booking', async ({
    page,
    myBookingsPage,
    authenticatedEventHubApi,
  }) => {
    const eventTitle = `Automation Booking Event ${TestDataUtil.randomUuid()}`;
    let eventId: number | undefined;
    let bookingId: number | undefined;

    try {
      const createdEvent = await authenticatedEventHubApi.createEvent({
        title: eventTitle,
        description: 'Event created for the My Bookings UI test.',
        category: 'Conference',
        venue: 'Automation Venue',
        city: 'Hyderabad',
        eventDate: new Date(Date.now() + 86_400_000).toISOString(),
        price: 100,
        totalSeats: 50,
      });
      eventId = createdEvent.data.data.id;

      const createdBooking = await authenticatedEventHubApi.createBooking({
        eventId,
        customerName: 'Playwright Automation',
        customerEmail: envConfig.credentials.userName ?? 'automation@example.com',
        customerPhone: '9999999999',
        quantity: 1,
      });
      bookingId = createdBooking.data.data.id;
      const bookingReference = createdBooking.data.data.bookingRef;

      await myBookingsPage.navigate();

      await expect(myBookingsPage.bookingCard(bookingReference)).toBeVisible();
      await expect(myBookingsPage.bookingCard(bookingReference)).toContainText(eventTitle);
      await expect(myBookingsPage.bookingCard(bookingReference)).toContainText('confirmed');
      await expect(myBookingsPage.bookingCard(bookingReference).getByTestId('booking-id')).toContainText(
        String(bookingId)
      );
      const bookingCount = await myBookingsPage.getBookingCount();
      expect(bookingCount).toBeGreaterThan(0);
      const bookingStatus = await myBookingsPage.getBookingStatus(bookingReference);
      expect(bookingStatus).toBe('confirmed');

      await myBookingsPage.viewBookingDetails(bookingReference);
      await expect(page).toHaveURL(new RegExp(`/bookings/${bookingId}`));
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
