import { expect, test } from '../../src/fixtures/base.fixture';

test.describe('EventHub Manage Events page', () => {
  test('creates and deletes an event through the admin UI', async ({
    adminEventsPage,
    authenticatedEventHubApi,
  }) => {
    await adminEventsPage.navigate();

    await expect(adminEventsPage.pageHeading).toBeVisible();
    await expect(adminEventsPage.eventForm.root).toBeVisible();
    await expect(adminEventsPage.eventForm.submitButton).toBeVisible();

    const eventTitle = `Admin Automation Event ${Date.now()}`;
    try {
      await adminEventsPage.createEvent({
        title: eventTitle,
        description: 'Event created by the admin UI test.',
        category: 'Conference',
        city: 'Hyderabad',
        venue: 'Admin Automation Venue',
        eventDate: new Date(Date.now() + 86_400_000).toISOString(),
        price: 125,
        totalSeats: 50,
      });

      await expect(adminEventsPage.notificationToast.message('Event created!')).toHaveText('Event created!');
      await adminEventsPage.notificationToast.dismiss();

      const eventRow = adminEventsPage.eventRow(eventTitle);
      await expect(eventRow.root).toBeVisible();
      await expect(eventRow.root).toContainText(eventTitle);
      await expect(eventRow.root).toContainText('Hyderabad');

      await adminEventsPage.deleteEvent(eventTitle);
      await expect(adminEventsPage.notificationToast.message('Event deleted')).toHaveText('Event deleted');
      await adminEventsPage.notificationToast.dismiss();
      await expect(eventRow.root).toHaveCount(0);
    } finally {
      const events = await authenticatedEventHubApi.getEvents({ search: eventTitle });
      const event = events.data.data.find(candidate => candidate.title === eventTitle);
      if (event) {
        await authenticatedEventHubApi.deleteEvent(event.id);
      }
    }
  });
});
