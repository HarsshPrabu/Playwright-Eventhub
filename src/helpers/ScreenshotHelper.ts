import { Locator, Page } from '@playwright/test';

/** Screenshot operations kept outside page objects. */
export class ScreenshotHelper {
  constructor(private readonly page: Page) {}

  async pageScreenshot(name?: string, options?: { fullPage?: boolean; clip?: { x: number; y: number; width: number; height: number } }): Promise<Buffer> {
    return this.page.screenshot({
      path: name ? `screenshots/${name}.png` : undefined,
      fullPage: options?.fullPage ?? true,
      clip: options?.clip,
    });
  }

  async elementScreenshot(locator: Locator, name?: string): Promise<Buffer> {
    return locator.screenshot({ path: name ? `screenshots/${name}.png` : undefined });
  }
}
