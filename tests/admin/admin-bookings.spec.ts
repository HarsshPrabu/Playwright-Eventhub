import { expect, test } from '../../src/fixtures/base.fixture';
import { envConfig } from '../../src/config/env.config';
import { TestDataUtil } from '../../src/helpers/TestDataUtil';

test.describe('EventHub Manage Bookings page', () => {
  test('displays booking management controls and data', async ({
    adminBookingsPage,
    authenticatedEventHubApi,
  }) => {
    let eventId: number | undefined;
    let bookingId: number | undefined;

    try {
      const createdEvent = await authenticatedEventHubApi.createEvent({
        title: `Admin Booking Event ${TestDataUtil.randomUuid()}`,
        description: 'Event created for admin booking coverage.',
        category: 'Conference',
        venue: 'Admin Booking Venue',
        city: 'Hyderabad',
        eventDate: new Date(Date.now() + 86_400_000).toISOString(),
        price: 90,
        totalSeats: 50,
      });
      eventId = createdEvent.data.data.id;

      const createdBooking = await authenticatedEventHubApi.createBooking({
        eventId,
        customerName: `Admin Booking ${TestDataUtil.randomString(6)}`,
        customerEmail: envConfig.credentials.userName ?? 'automation@example.com',
        customerPhone: '9999999999',
        quantity: 1,
      });
      bookingId = createdBooking.data.data.id;
      const bookingReference = createdBooking.data.data.bookingRef;

      await adminBookingsPage.navigate();

      await expect(adminBookingsPage.pageHeading).toBeVisible();
      await expect(adminBookingsPage.statusFilter).toBeVisible();
      await expect(adminBookingsPage.totalBookingsLabel).toBeVisible();

      await adminBookingsPage.filterByStatus('confirmed');
      await expect(adminBookingsPage.statusFilter).toHaveValue('confirmed');

      await adminBookingsPage.filterByStatus('cancelled');
      await expect(adminBookingsPage.statusFilter).toHaveValue('cancelled');

      await adminBookingsPage.filterByStatus('');
      await expect(adminBookingsPage.statusFilter).toHaveValue('');

      const booking = adminBookingsPage.bookingRow(bookingReference);
      await expect(booking.root).toBeVisible();
      await expect(booking.reference).toContainText(bookingReference);
      await expect(booking.viewButton).toBeVisible();

      await booking.view();
      await expect(adminBookingsPage.bookingDetailsModal.root).toBeVisible();
      await expect(adminBookingsPage.bookingDetailsModal.reference).toContainText(bookingReference);
      await expect(adminBookingsPage.bookingDetailsModal.status).toBeVisible();

      await adminBookingsPage.bookingDetailsModal.close();
      await expect(adminBookingsPage.bookingDetailsModal.root).toBeHidden();
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
