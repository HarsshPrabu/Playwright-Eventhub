import { Page, Locator, expect, BrowserContext, APIRequestContext, Request, Response } from "@playwright/test";
import { BaseAPI } from "../api/BaseAPI";

export abstract class BasePage {
  protected page: Page;
  protected readonly context: BrowserContext;
  protected readonly request: APIRequestContext;
  public readonly api: BaseAPI;

  constructor(page: Page) {
    this.page = page;
    this.context = page.context();
    this.request = page.request;
    this.api = new BaseAPI(page);
  }

  async navigateTo(url: string): Promise<void> {
    await this.page.goto(url);
  }

  async navigateBack(): Promise<void> {
    await this.page.goBack();
  }

  async navigateForward(): Promise<void> {
    await this.page.goForward();
  }

  async reload(): Promise<void> {
    await this.page.reload();
  }

  // Wait methods
  async waitForLoadState(
    state: "load" | "domcontentloaded" | "networkidle" = "load"
  ): Promise<void> {
    await this.page.waitForLoadState(state);
  }

  async waitForTimeout(timeout: number): Promise<void> {
    await this.page.waitForTimeout(timeout);
  }

  // Element Interactions

  async click(locator: Locator): Promise<void> {
    await locator.click();
  }

  async forceClick(locator: Locator): Promise<void> {
    await locator.click({ force: true });
  }

  protected async doubleClick(locator: Locator): Promise<void> {
    await expect(locator).toBeVisible();
    await locator.dblclick();
  }

  protected async rightClick(locator: Locator): Promise<void> {
    await expect(locator).toBeVisible();
    await locator.click({ button: "right" });
  }

  protected async hover(locator: Locator): Promise<void> {
    await expect(locator).toBeVisible();
    await locator.hover();
  }

  protected async clear(locator: Locator): Promise<void> {
    await locator.clear();
  }

  protected async selectOption(
    locator: Locator,
    value: string | string[]
  ): Promise<void> {
    await expect(locator).toBeVisible();
    await locator.selectOption(value);
  }

  protected async check(locator: Locator): Promise<void> {
    await expect(locator).toBeVisible();
    await locator.check();
  }

  protected async unCheck(locator: Locator): Promise<void> {
    await expect(locator).toBeVisible();
    await locator.uncheck();
  }

  protected async uploadFile(
    locator: Locator,
    filePath: string | string[]
  ): Promise<void> {
    await expect(locator).toBeVisible();
    await locator.setInputFiles(filePath);
  }

  async fillInput(locator: Locator, text: string): Promise<void> {
    await locator.clear();
    await locator.fill(text);
  }

  // Element queries
  protected async getText(locator: Locator): Promise<string> {
    await expect(locator).toBeVisible();
    return (await locator.textContent()) || "";
  }

  protected async getInnerText(locator: Locator): Promise<string> {
    await expect(locator).toBeVisible();
    return await locator.innerText();
  }

  protected async getValue(locator: Locator): Promise<string> {
    await expect(locator).toBeVisible();
    return await locator.inputValue();
  }

  protected async getAttribute(
    locator: Locator,
    name: string
  ): Promise<string> {
    await expect(locator).toBeVisible();
    return (await locator.getAttribute(name)) || "";
  }

  protected async getAllTexts(locator: Locator): Promise<string[]> {
    return await locator.allTextContents();
  }

  protected async getAllInnerTexts(locator: Locator): Promise<string[]> {
    return await locator.allInnerTexts();
  }

  protected async getCount(locator: Locator): Promise<number> {
    return await locator.count();
  }

  // Element State Checks
  protected async isVisible(locator: Locator): Promise<boolean> {
    return await locator.isVisible();
  }

  protected async isHidden(locator: Locator): Promise<boolean> {
    return await locator.isHidden();
  }

  protected async isEnabled(locator: Locator): Promise<boolean> {
    return await locator.isEnabled();
  }

  protected async isDisabled(locator: Locator): Promise<boolean> {
    return await locator.isDisabled();
  }

  protected async isChecked(locator: Locator): Promise<boolean> {
    return await locator.isChecked();
  }

  protected async isEditable(locator: Locator): Promise<boolean> {
    return await locator.isEditable();
  }

  // Assertions

  protected async expectVisible(
    locator: Locator,
    timeout?: number
  ): Promise<void> {
    await expect(locator).toBeVisible({ timeout });
  }

  protected async expectHidden(
    locator: Locator,
    timeout?: number
  ): Promise<void> {
    await expect(locator).toBeHidden({ timeout });
  }

  protected async expectText(
    locator: Locator,
    text: string | RegExp,
    message?: string
  ): Promise<void> {
    await expect(locator, message).toHaveText(text);
  }


  protected async expectContainsText(
    locator: Locator,
    text: string | RegExp
  ): Promise<void> {
    await expect(locator).toContainText(text);
  }

  protected async expectValue(
    locator: Locator,
    value: string | RegExp
  ): Promise<void> {
    await expect(locator).toHaveValue(value);
  }

  protected async expectAttribute(
    locator: Locator,
    name: string,
    value: string | RegExp
  ): Promise<void> {
    await expect(locator).toHaveAttribute(name, value);
  }

  protected async expectCount(locator: Locator, count: number): Promise<void> {
    await expect(locator).toHaveCount(count);
  }

  protected async expectEnabled(locator: Locator): Promise<void> {
    await expect(locator).toBeEnabled();
  }

  protected async expectDisabled(locator: Locator): Promise<void> {
    await expect(locator).toBeDisabled();
  }

  protected async expectChecked(locator: Locator): Promise<void> {
    await expect(locator).toBeChecked();
  }

  protected async expectUnchecked(locator: Locator): Promise<void> {
    await expect(locator).not.toBeChecked();
  }

  protected async expectNotToHaveText(
  locator: Locator,
  text: string,
  message: string,
  timeout?: number
): Promise<void> {
  await expect(locator, message).not.toHaveText(text, { timeout });
}

  // Page utilities
  async getTitle(): Promise<string> {
    return await this.page.title();
  }

  async getCurrentUrl(): Promise<string> {
    return this.page.url();
  }

  async getViewportSize(): Promise<{ width: number; height: number } | null> {
    return this.page.viewportSize();
  }

  // Screenshots and videos
  async takeScreenshot(
    name?: string,
    options?: {
      fullPage?: boolean;
      clip?: { x: number; y: number; width: number; height: number };
    }
  ): Promise<Buffer> {
    const screenshotOptions = {
      path: name ? `screenshots/${name}.png` : undefined,
      fullPage: options?.fullPage ?? true,
      clip: options?.clip,
    };
    return await this.page.screenshot(screenshotOptions);
  }

  async takeElementScreenshot(
    locator: Locator,
    name?: string
  ): Promise<Buffer> {
    return await locator.screenshot({
      path: name ? `screenshots/${name}.png` : undefined,
    });
  }

  // Keyboard and mouse
  async pressKey(key: string): Promise<void> {
    await this.page.keyboard.press(key);
  }

  async pressKeys(keys: string[]): Promise<void> {
    for (const key of keys) {
      await this.page.keyboard.press(key);
    }
  }

  async scrollToTop(): Promise<void> {
    await this.page.keyboard.press("Home");
  }

  async scrollToBottom(): Promise<void> {
    await this.page.keyboard.press("End");
  }

  async scrollIntoView(locator: Locator): Promise<void> {
    await locator.scrollIntoViewIfNeeded();
  }

  // Browser context
  async newPage(): Promise<Page> {
    return await this.context.newPage();
  }

  async closePage(): Promise<void> {
    await this.page.close();
  }

  // Local storage and cookies
  async setLocalStorage(key: string, value: string): Promise<void> {
    await this.page.evaluate(
      ({ key, value }) => {
        localStorage.setItem(key, value);
      },
      { key, value }
    );
  }

  async getLocalStorage(key: string): Promise<string | null> {
    return await this.page.evaluate((key) => {
      return localStorage.getItem(key);
    }, key);
  }

  async clearLocalStorage(): Promise<void> {
    await this.page.evaluate(() => localStorage.clear());
  }

  async addCookie(cookie: {
    name: string;
    value: string;
    domain?: string;
    path?: string;
  }): Promise<void> {
    await this.context.addCookies([cookie]);
  }

  async getCookies(): Promise<
    Array<{ name: string; value: string; domain: string; path: string }>
  > {
    return await this.context.cookies();
  }

  async clearCookies(): Promise<void> {
    await this.context.clearCookies();
  }

  // Dialogs
  async acceptDialog(message?: string): Promise<void> {
    this.page.once("dialog", async (dialog) => {
      if (message) {
        expect(dialog.message()).toBe(message);
      }
      await dialog.accept();
    });
  }

  async dismissDialog(message?: string): Promise<void> {
    this.page.once("dialog", async (dialog) => {
      if (message) {
        expect(dialog.message()).toBe(message);
      }
      await dialog.dismiss();
    });
  }

  // Polling and waiting
  async waitUntil(
    condition: () => Promise<boolean>,
    timeout: number = 30000,
    interval: number = 1000
  ): Promise<void> {
    await expect.poll(condition, { timeout, intervals: [interval] }).toBe(true);
  }

  async retryAction<T>(
    action: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000
  ): Promise<T> {
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await action();
      } catch (error) {
        if (i === maxRetries - 1) throw error;
        await this.waitForTimeout(delay);
      }
    }
    throw new Error("Max retries exceeded");
  }

  //api check

  async waitForResponseSuccess(
    urlPattern: string,
    timeout?: number
  ): Promise<void> {
    await this.page.waitForResponse(
      (response) =>
        response.url().includes(urlPattern) && response.status() === 200,
      { timeout }
    );
  }

  async waitForResponseWithEncoding(
    urlPattern: string,
    encoding: string,
    timeout?: number
  ): Promise<void> {
    await this.page.waitForResponse(
      (response) =>
        response.url().includes(urlPattern) &&
        response.status() === 200 &&
        response.headers()["content-encoding"] === encoding,
      { timeout }
    );
  }

  async waitForResponseContaining(
    urlPattern: string,
    searchString: string,
    options?: { timeout?: number; caseSensitive?: boolean }
  ): Promise<void> {
    await this.page.waitForResponse(
      async (response) => {
        if (response.url().includes(urlPattern) && response.status() === 200) {
          const responseText = await response.text();
          if (options?.caseSensitive) {
            return responseText.includes(searchString);
          }
          return responseText
            .toLowerCase()
            .includes(searchString.toLowerCase());
        }
        return false;
      },
      { timeout: options?.timeout }
    );
  }

async waitForNthResponse(urlPattern: string, count: number, timeout?: number): Promise<void> {
  let callCount = 0;
  
  await this.page.waitForResponse(response => {
    if (response.url().includes(urlPattern) && response.status() === 200) {
      callCount++;
      return callCount === count;
    }
    return false;
  }, { timeout });
}

  /**
   * Waits for an API response matching url/predicate and parses its JSON body
   */
  async waitForApiResponse<T = any>(
    urlOrPattern: string | RegExp | ((res: Response) => boolean),
    options?: { status?: number; timeout?: number }
  ): Promise<T> {
    const expectedStatus = options?.status ?? 200;
    const predicate = typeof urlOrPattern === 'function'
      ? urlOrPattern
      : (res: Response) => {
          const matchesUrl = typeof urlOrPattern === 'string'
            ? res.url().includes(urlOrPattern)
            : urlOrPattern.test(res.url());
          return matchesUrl && (options?.status === undefined || res.status() === expectedStatus);
        };

    const response = await this.page.waitForResponse(predicate, { timeout: options?.timeout });
    return await response.json();
  }

  /**
   * Waits for an outgoing API request triggered by a UI action
   */
  async waitForApiRequest(
    urlOrPattern: string | RegExp | ((req: Request) => boolean),
    options?: { timeout?: number }
  ): Promise<Request> {
    const predicate = typeof urlOrPattern === 'function'
      ? urlOrPattern
      : (req: Request) => typeof urlOrPattern === 'string'
          ? req.url().includes(urlOrPattern)
          : urlOrPattern.test(req.url());

    return await this.page.waitForRequest(predicate, { timeout: options?.timeout });
  }

  /**
   * Mocks a backend API route with synthetic data
   */
  async mockApiResponse(
    urlOrPattern: string | RegExp,
    mockData: any,
    status: number = 200
  ): Promise<void> {
    await this.page.route(urlOrPattern, async (route) => {
      await route.fulfill({
        status,
        contentType: 'application/json',
        body: JSON.stringify(mockData),
      });
    });
  }

  /**
   * Removes route mocking for a specific endpoint
   */
  async unmockApi(urlOrPattern: string | RegExp): Promise<void> {
    await this.page.unroute(urlOrPattern);
  }
}

