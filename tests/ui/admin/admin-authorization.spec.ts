import { expect, test } from '../../../src/fixtures/ui.fixture';

test.describe('P0 Admin authorization', { tag: '@p0' }, () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test('ADM-EVT-002: Deny non-admin access to Manage Events', async ({ page }) => {
    await test.step('Open Manage Events without an authenticated admin session', () => page.goto('/admin/events'));
    await test.step('Verify administrative content is not exposed', async () => {
      await expect(page).not.toHaveURL(/\/admin\/events/);
      await expect(page.getByRole('heading', { name: 'All Events', exact: true })).toBeHidden();
    });
  });
});
