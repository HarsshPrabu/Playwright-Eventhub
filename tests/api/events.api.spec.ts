import { expect, test } from '../../src/fixtures/api.fixture';
import { EventCategory } from '../../src/api/models/EventHubModels';
import { expectEventContract, expectPagination } from './support/api-contract-assertions';

test.describe('Event API contract', { tag: '@api' }, () => {
  test('API-003: Return correctly shaped paginated event data', async ({ authenticatedEventHubApi }) => {
    const queries = [
      { name: 'default page', query: {} },
      { name: 'custom page and limit', query: { page: 1, limit: 5 } },
      { name: 'category filter', query: { category: 'Conference' as EventCategory } },
      { name: 'city filter', query: { city: 'Hyderabad' } },
      { name: 'search filter', query: { search: 'Automation' } },
    ];

    for (const scenario of queries) {
      await test.step(`Verify ${scenario.name} response contract`, async () => {
        const result = await authenticatedEventHubApi.getEvents(scenario.query);
        expect(result.status).toBe(200);
        expectPagination(result.data);
        result.data.data.forEach(expectEventContract);
      });
    }
  });

  test('API-003-EMPTY: Return a valid empty result for an unmatched event search', async ({ authenticatedEventHubApi }) => {
    const result = await test.step('Search for a unique nonexistent event', () =>
      authenticatedEventHubApi.getEvents({ search: `no-event-${Date.now()}` })
    );

    await test.step('Verify the empty paginated contract', async () => {
      expect(result.status).toBe(200);
      expectPagination(result.data);
      expect(result.data.data).toHaveLength(0);
    });
  });
});
