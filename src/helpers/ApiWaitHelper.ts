import { Page, Request, Response } from '@playwright/test';

/** Network synchronization utilities for UI flows that trigger API calls. */
export class ApiWaitHelper {
  constructor(private readonly page: Page) {}

  async forResponse(
    urlOrPattern: string | RegExp | ((response: Response) => boolean),
    options?: { status?: number; timeout?: number }
  ): Promise<Response> {
    const predicate = typeof urlOrPattern === 'function'
      ? urlOrPattern
      : (response: Response) => {
          const matches = typeof urlOrPattern === 'string'
            ? response.url().includes(urlOrPattern)
            : urlOrPattern.test(response.url());
          return matches && (options?.status === undefined || response.status() === options.status);
        };

    return this.page.waitForResponse(predicate, { timeout: options?.timeout });
  }

  async forRequest(
    urlOrPattern: string | RegExp | ((request: Request) => boolean),
    timeout?: number
  ): Promise<Request> {
    const predicate = typeof urlOrPattern === 'function'
      ? urlOrPattern
      : (request: Request) => typeof urlOrPattern === 'string'
          ? request.url().includes(urlOrPattern)
          : urlOrPattern.test(request.url());

    return this.page.waitForRequest(predicate, { timeout });
  }

  async forSuccessfulResponse(urlPattern: string, timeout?: number): Promise<Response> {
    return this.forResponse(
      response => response.url().includes(urlPattern) && response.ok(),
      { timeout }
    );
  }

  async json<T>(urlOrPattern: string | RegExp, options?: { status?: number; timeout?: number }): Promise<T> {
    const response = await this.forResponse(urlOrPattern, options);
    return response.json() as Promise<T>;
  }
}
