import { BrowserContext, Page } from '@playwright/test';

/** Browser storage and cookie operations. */
export class StorageHelper {
  constructor(
    private readonly page: Page,
    private readonly context: BrowserContext = page.context()
  ) {}

  async setLocalStorage(key: string, value: string): Promise<void> {
    await this.page.evaluate(({ key, value }) => localStorage.setItem(key, value), { key, value });
  }

  async getLocalStorage(key: string): Promise<string | null> {
    return this.page.evaluate(key => localStorage.getItem(key), key);
  }

  async clearLocalStorage(): Promise<void> {
    await this.page.evaluate(() => localStorage.clear());
  }

  async addCookie(cookie: Parameters<BrowserContext['addCookies']>[0][number]): Promise<void> {
    await this.context.addCookies([cookie]);
  }

  async getCookies(): ReturnType<BrowserContext['cookies']> {
    return this.context.cookies();
  }

  async clearCookies(): Promise<void> {
    await this.context.clearCookies();
  }
}
