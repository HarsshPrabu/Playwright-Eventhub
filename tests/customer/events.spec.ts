import { expect, test } from '../../src/fixtures/base.fixture';

test.describe('EventHub Events page', () => {
  test.beforeEach(async ({ eventsPage }) => {
    await eventsPage.navigate();
  });

  test('displays the event browsing controls', async ({ eventsPage }) => {
    await expect(eventsPage.pageHeading).toBeVisible();
    await expect(eventsPage.pageDescription).toBeVisible();
    await expect(eventsPage.searchInput).toBeVisible();
    await expect(eventsPage.categorySelect).toBeVisible();
    await expect(eventsPage.citySelect).toBeVisible();
  });

  test('filters events and clears the selected filters', async ({ eventsPage }) => {
    await eventsPage.searchEvents('tech');
    await expect(eventsPage.searchInput).toHaveValue('tech');

    await eventsPage.filterByCategory('Conference');
    await expect(eventsPage.categorySelect).toHaveValue('Conference');

    await eventsPage.filterByCity('Hyderabad');
    await expect(eventsPage.citySelect).toHaveValue('Hyderabad');

    await eventsPage.clearFilters();
    await expect(eventsPage.searchInput).toHaveValue('');
    await expect(eventsPage.categorySelect).toHaveValue('');
    await expect(eventsPage.citySelect).toHaveValue('');
  });

  test('opens a newly created event details page', async ({
    page,
    eventsPage,
    authenticatedEventHubApi,
  }) => {
    const title = `Automation Event ${Date.now()}`;
    const created = await authenticatedEventHubApi.createEvent({
      title,
      category: 'Conference',
      city: 'Hyderabad',
      venue: 'Automation Venue',
      eventDate: new Date(Date.now() + 86_400_000).toISOString(),
      price: 100,
      totalSeats: 50,
    });
    const eventId = created.data.data.id;

    try {
      await eventsPage.navigate();
      await eventsPage.openEventDetails(title);
      await expect(page).toHaveURL(new RegExp(`/events/${eventId}`));
    } finally {
      await authenticatedEventHubApi.deleteEvent(eventId);
    }
  });
});
