import { expect, Page } from '@playwright/test';

/** Explicit waiting and retry utilities. Prefer locator assertions where possible. */
export class WaitHelper {
  constructor(private readonly page: Page) {}

  async forLoadState(state: 'load' | 'domcontentloaded' | 'networkidle' = 'load'): Promise<void> {
    await this.page.waitForLoadState(state);
  }

  async until(condition: () => Promise<boolean>, timeout = 30000, interval = 1000): Promise<void> {
    await expect.poll(condition, { timeout, intervals: [interval] }).toBe(true);
  }

  async retry<T>(action: () => Promise<T>, maxRetries = 3, delay = 1000): Promise<T> {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await action();
      } catch (error) {
        if (attempt === maxRetries - 1) throw error;
        await this.page.waitForTimeout(delay);
      }
    }
    throw new Error('Maximum retries exceeded.');
  }
}
