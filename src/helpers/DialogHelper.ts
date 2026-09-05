import { expect, Page } from '@playwright/test';

/** Native browser dialog handling. Register before triggering the dialog. */
export class DialogHelper {
  constructor(private readonly page: Page) {}

  accept(expectedMessage?: string): void {
    this.page.once('dialog', async dialog => {
      if (expectedMessage !== undefined) expect(dialog.message()).toBe(expectedMessage);
      await dialog.accept();
    });
  }

  dismiss(expectedMessage?: string): void {
    this.page.once('dialog', async dialog => {
      if (expectedMessage !== undefined) expect(dialog.message()).toBe(expectedMessage);
      await dialog.dismiss();
    });
  }
}
