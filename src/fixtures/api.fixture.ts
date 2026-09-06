import { expect, test as base } from './base.fixture';
import { BaseAPI } from '../api/BaseAPI';
import { EventHubAPI } from '../api/services/EventHubAPI';
import { envConfig } from '../config/env.config';
import { ApiDiagnosticsCollector } from './diagnostics/ApiDiagnosticsCollector';

/** API-only fixture with automatic, sanitized failure diagnostics. */
export const test = base.extend<{ apiDiagnostics: ApiDiagnosticsCollector }>({
  apiDiagnostics: [async ({}, use, testInfo) => {
    const diagnostics = new ApiDiagnosticsCollector();
    try {
      await use(diagnostics);
    } finally {
      try {
        await diagnostics.attach(testInfo);
      } catch (error) {
        console.warn('Unable to attach API failure diagnostics.', error);
      }
    }
  }, { auto: true }],

  baseApi: async ({ request, apiDiagnostics }, use) => {
    await use(new BaseAPI(request, undefined, apiDiagnostics));
  },

  publicEventHubApi: async ({ request, apiDiagnostics }, use) => {
    await use(new EventHubAPI(request, undefined, apiDiagnostics));
  },

  authenticatedEventHubApi: async ({ request, apiDiagnostics }, use) => {
    const username = envConfig.credentials.userName;
    const password = envConfig.credentials.password;
    if (!username || !password) {
      throw new Error('USER_NAME and USER_PASSWORD must be configured for authenticated API tests.');
    }

    const publicApi = new EventHubAPI(request, undefined, apiDiagnostics);
    const loginResult = await publicApi.login({ email: username, password });
    await use(new EventHubAPI(request, loginResult.data.token, apiDiagnostics));
  },
});

export { expect };
