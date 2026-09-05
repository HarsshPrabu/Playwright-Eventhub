import { test, expect } from '../../src/fixtures/base.fixture';

test.describe('EventHub API smoke suite', () => {
  test('events endpoint returns a successful paginated response', async ({ authenticatedEventHubApi }) => {
    const result = await authenticatedEventHubApi.getEvents();

    expect(result.status).toBe(200);
    expect(result.data.success).toBe(true);
    expect(Array.isArray(result.data.data)).toBe(true);
    expect(result.data.pagination.page).toBe(1);
    expect(result.data.pagination.limit).toBe(12);
    expect(result.durationMs).toBeLessThan(3000);
  });

  test('bookings endpoint returns a successful paginated response', async ({ authenticatedEventHubApi }) => {
    const result = await authenticatedEventHubApi.getBookings();

    expect(result.status).toBe(200);
    expect(result.data.success).toBe(true);
    expect(Array.isArray(result.data.data)).toBe(true);
    expect(result.data.pagination.page).toBe(1);
    expect(result.data.pagination.limit).toBe(10);
    expect(result.durationMs).toBeLessThan(3000);
  });
});
