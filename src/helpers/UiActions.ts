import { expect, Locator } from '@playwright/test';

/** Reusable, user-facing UI interactions. */
export class UiActions {
  async click(locator: Locator): Promise<void> {
    await locator.click();
  }

  async forceClick(locator: Locator): Promise<void> {
    await locator.click({ force: true });
  }

  async fill(locator: Locator, value: string): Promise<void> {
    await locator.fill(value);
  }

  async clear(locator: Locator): Promise<void> {
    await locator.clear();
  }

  async hover(locator: Locator): Promise<void> {
    await expect(locator).toBeVisible();
    await locator.hover();
  }

  async selectOption(locator: Locator, value: string | string[]): Promise<void> {
    await expect(locator).toBeVisible();
    await locator.selectOption(value);
  }

  async uploadFile(locator: Locator, filePath: string | string[]): Promise<void> {
    await expect(locator).toBeVisible();
    await locator.setInputFiles(filePath);
  }
}
