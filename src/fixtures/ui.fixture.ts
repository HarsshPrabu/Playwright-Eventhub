import { ConsoleMessage, Request, Response } from '@playwright/test';
import { expect, test as base } from './base.fixture';
import { UiDiagnosticsCollector } from './diagnostics/UiDiagnosticsCollector';

/**
 * UI-only fixture that attaches sanitized browser and network diagnostics according to UI_DIAGNOSTICS.
 * API tests use api.fixture.ts and do not load browser diagnostics.
 */
export const test = base.extend<{ uiFailureDiagnostics: void }>({
  uiFailureDiagnostics: [async ({ page }, use, testInfo) => {
    const diagnostics = new UiDiagnosticsCollector();

    const onConsole = (message: ConsoleMessage): void => {
      if (message.type() === 'error') {
        diagnostics.recordConsoleError(message.text());
      }
    };
    const onPageError = (error: Error): void => diagnostics.recordPageError(error);
    const onRequestFailed = (request: Request): void => diagnostics.recordFailedRequest(request);
    const onResponse = (response: Response): void => diagnostics.recordHttpFailure(response);

    page.on('console', onConsole);
    page.on('pageerror', onPageError);
    page.on('requestfailed', onRequestFailed);
    page.on('response', onResponse);

    try {
      await use();
    } finally {
      page.off('console', onConsole);
      page.off('pageerror', onPageError);
      page.off('requestfailed', onRequestFailed);
      page.off('response', onResponse);

      try {
        await diagnostics.attach(testInfo, page.url());
      } catch (error) {
        console.warn('Unable to attach UI failure diagnostics.', error);
      }
    }
  }, { auto: true }],
});

export { expect };
