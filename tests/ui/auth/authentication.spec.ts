import { expect, test } from '../../../src/fixtures/base.fixture';
import { envConfig } from '../../../src/config/env.config';

test.describe('P0 Authentication', { tag: '@p0' }, () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test('AUTH-001: Sign in with valid credentials and establish an authenticated session', async ({ page, loginPage }) => {
    const username = envConfig.credentials.userName;
    const password = envConfig.credentials.password;
    test.skip(!username || !password, 'Valid credentials are required for AUTH-001.');

    await test.step('Open the EventHub sign-in page', () => loginPage.navigate());
    const status = await test.step('Submit valid customer credentials', () => loginPage.login(username!, password!));
    await test.step('Verify authentication succeeded', async () => {
      expect(status).toBe(200);
      await expect(page.getByTestId('user-email-display')).toHaveText(username!);
    });
  });
});
