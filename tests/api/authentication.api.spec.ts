import { expect, test } from '../../src/fixtures/base.fixture';
import { envConfig } from '../../src/config/env.config';

test.describe('P0 Authentication API', { tag: '@p0' }, () => {
  test('API-001: Return the authenticated user from /auth/me', async ({ authenticatedEventHubApi }) => {
    const result = await test.step('Request the current authenticated user', () => authenticatedEventHubApi.getCurrentUser());
    await test.step('Verify the authenticated identity response', async () => {
      expect(result.status).toBe(200);
      expect(result.data.success).toBe(true);
      expect(result.data.user.email).toBe(envConfig.credentials.userName);
    });
  });

  test('API-002: Reject protected API requests without valid authentication', async ({ baseApi }) => {
    const response = await test.step('Request the protected current-user endpoint without a token', () => baseApi.get('/auth/me'));
    await test.step('Verify the request is rejected without exposing user data', async () => {
      expect([401, 403]).toContain(response.status());
      expect(response.ok()).toBe(false);
    });
  });
});
