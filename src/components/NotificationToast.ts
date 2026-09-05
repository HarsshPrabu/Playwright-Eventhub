import { Locator, Page } from '@playwright/test';

/** Shared live-region notification/toast component. */
export class NotificationToast {
  readonly region: Locator;
  readonly message: Locator;
  readonly dismissButton: Locator;

  constructor(page: Page) {
    this.region = page.locator('[aria-live="polite"]');
    this.message = this.region.locator('p').first();
    this.dismissButton = this.region.getByRole('button', {
      name: 'Dismiss',
      exact: true,
    });
  }

  async dismiss(): Promise<void> {
    await this.dismissButton.click();
  }
}
