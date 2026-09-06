import { Locator, Page } from '@playwright/test';

/** Shared live-region notification/toast component. */
export class NotificationToast {
  readonly region: Locator;
  readonly dismissButton: Locator;

  constructor(page: Page) {
    this.region = page.locator('[aria-live="polite"]');
    this.dismissButton = this.region.getByRole('button', {
      name: 'Dismiss',
      exact: true,
    });
  }

  async dismiss(): Promise<void> {
    await this.dismissButton.click();
  }

  message(text: string | RegExp): Locator {
    return this.region.locator('p').filter({ hasText: text });
  }
}
