import { APIRequestContext, APIResponse, Page, request } from '@playwright/test';
import { apiUrl, envConfig } from '../config/env.config';
import { ApiRequestError } from './errors/ApiRequestError';

export interface RequestOptions<TBody = unknown> {
  headers?: Record<string, string>;
  params?: Record<string, string | number | boolean>;
  data?: TBody;
  timeout?: number;
  expectedStatus?: number | number[];
}

export interface ApiResponseResult<T = unknown> {
  response: APIResponse;
  status: number;
  data: T;
  durationMs: number;
}

export interface ApiResponseDiagnostic {
  method: string;
  url: string;
  status: number;
  durationMs: number;
  correlationId?: string;
}

export interface ApiTransportErrorDiagnostic {
  method: string;
  url: string;
  durationMs: number;
  error: string;
}

/** Optional test-observer hook. It receives only sanitized request metadata. */
export interface ApiRequestObserver {
  onResponse(details: ApiResponseDiagnostic): void;
  onTransportError(details: ApiTransportErrorDiagnostic): void;
}

/**
 * BaseAPI: Foundation class for API testing and API-assisted UI testing.
 *
 * Supports two operational modes:
 * 1. Standalone Mode: initialized with a pure APIRequestContext (or auto-created) for fast, headless API testing.
 * 2. UI-Bound Mode: initialized with a Playwright `Page` (using `page.request`), automatically sharing browser cookies and session state.
 */
export class BaseAPI {
  protected requestContext?: APIRequestContext;
  protected baseUrl: string;
  protected defaultHeaders: Record<string, string>;
  private isExternalContext: boolean = false;
  private readonly requestObserver?: ApiRequestObserver;

  constructor(target?: APIRequestContext | Page | string, baseUrl: string = apiUrl, requestObserver?: ApiRequestObserver) {
    this.requestObserver = requestObserver;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };

    if (typeof target === 'string') {
      this.baseUrl = target;
    } else if (target && 'request' in target && typeof (target as Page).request === 'object') {
      // Target is a Playwright Page
      this.requestContext = (target as Page).request;
      this.baseUrl = baseUrl;
      this.isExternalContext = true;
    } else if (target && typeof (target as APIRequestContext).get === 'function') {
      // Target is an APIRequestContext
      this.requestContext = target as APIRequestContext;
      this.baseUrl = baseUrl;
      this.isExternalContext = true;
    } else {
      this.baseUrl = baseUrl;
    }
  }

  /**
   * Initialize a dedicated APIRequestContext if not already provided
   */
  async init(): Promise<BaseAPI> {
    if (!this.requestContext) {
      this.requestContext = await request.newContext({
        baseURL: this.baseUrl,
        extraHTTPHeaders: this.defaultHeaders,
      });
      this.isExternalContext = false;
    }
    return this;
  }

  /**
   * Set Authorization Bearer Token
   */
  setAuthToken(token: string): this {
    this.defaultHeaders['Authorization'] = `Bearer ${token}`;
    return this;
  }

  /**
   * Set Custom Headers
   */
  setHeaders(headers: Record<string, string>): this {
    this.defaultHeaders = { ...this.defaultHeaders, ...headers };
    return this;
  }

  protected async getContext(): Promise<APIRequestContext> {
    if (!this.requestContext) {
      await this.init();
    }
    return this.requestContext!;
  }

  /**
   * Generic GET Request with execution duration tracking
   */
  async get(endpoint: string, options: RequestOptions = {}): Promise<APIResponse> {
    return this.execute('GET', endpoint, options, (context, url) => context.get(url, this.requestOptions(options)));
  }

  /**
   * Generic POST Request
   */
  async post<TBody = unknown>(endpoint: string, data?: TBody, options: RequestOptions<TBody> = {}): Promise<APIResponse> {
    return this.execute('POST', endpoint, options, (context, url) =>
      context.post(url, { ...this.requestOptions(options), data: data ?? options.data })
    );
  }

  /**
   * Generic PUT Request
   */
  async put<TBody = unknown>(endpoint: string, data?: TBody, options: RequestOptions<TBody> = {}): Promise<APIResponse> {
    return this.execute('PUT', endpoint, options, (context, url) =>
      context.put(url, { ...this.requestOptions(options), data: data ?? options.data })
    );
  }

  /**
   * Generic PATCH Request
   */
  async patch<TBody = unknown>(endpoint: string, data?: TBody, options: RequestOptions<TBody> = {}): Promise<APIResponse> {
    return this.execute('PATCH', endpoint, options, (context, url) =>
      context.patch(url, { ...this.requestOptions(options), data: data ?? options.data })
    );
  }

  /**
   * Generic DELETE Request
   */
  async delete(endpoint: string, options: RequestOptions = {}): Promise<APIResponse> {
    return this.execute('DELETE', endpoint, options, (context, url) => context.delete(url, this.requestOptions(options)));
  }

  private requestOptions(options: RequestOptions): { headers: Record<string, string>; params?: RequestOptions['params']; timeout?: number } {
    return {
      headers: { ...this.defaultHeaders, ...options.headers },
      params: options.params,
      timeout: options.timeout,
    };
  }

  private async execute(
    method: string,
    endpoint: string,
    options: RequestOptions,
    send: (context: APIRequestContext, url: string) => Promise<APIResponse>,
  ): Promise<APIResponse> {
    const context = await this.getContext();
    const url = endpoint.startsWith('http') ? endpoint : `${this.baseUrl}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
    const startedAt = Date.now();
    let response: APIResponse;

    try {
      response = await send(context, url);
    } catch (error) {
      const durationMs = Date.now() - startedAt;
      this.requestObserver?.onTransportError({
        method,
        url: this.sanitizeUrl(url),
        durationMs,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }

    const durationMs = Date.now() - startedAt;
    const diagnostic: ApiResponseDiagnostic = {
      method,
      url: this.sanitizeUrl(url),
      status: response.status(),
      durationMs,
      correlationId: this.getCorrelationId(response),
    };
    this.requestObserver?.onResponse(diagnostic);
    this.logResponse(diagnostic);
    await this.validateExpectedStatus(response, method, url, options.expectedStatus);
    return response;
  }

  /**
   * Helper: Execute GET and parse typed JSON body with duration
   */
  async getJson<T = unknown>(endpoint: string, options: RequestOptions = {}): Promise<ApiResponseResult<T>> {
    const start = Date.now();
    const response = await this.get(endpoint, options);
    const durationMs = Date.now() - start;
    await this.throwForFailedResponse(response, 'GET');
    const data = await this.parseJson<T>(response, 'GET');
    return { response, status: response.status(), data, durationMs };
  }

  /**
   * Helper: Execute POST and parse typed JSON body with duration
   */
  async postJson<TResponse = unknown, TBody = unknown>(endpoint: string, data?: TBody, options: RequestOptions<TBody> = {}): Promise<ApiResponseResult<TResponse>> {
    const start = Date.now();
    const response = await this.post(endpoint, data, options);
    const durationMs = Date.now() - start;
    await this.throwForFailedResponse(response, 'POST');
    const responseData = await this.parseJson<TResponse>(response, 'POST');
    return { response, status: response.status(), data: responseData, durationMs };
  }

  /**
   * Helper: Execute PUT and parse typed JSON body with duration
   */
  async putJson<TResponse = unknown, TBody = unknown>(endpoint: string, data?: TBody, options: RequestOptions<TBody> = {}): Promise<ApiResponseResult<TResponse>> {
    const start = Date.now();
    const response = await this.put(endpoint, data, options);
    const durationMs = Date.now() - start;
    await this.throwForFailedResponse(response, 'PUT');
    const responseData = await this.parseJson<TResponse>(response, 'PUT');
    return { response, status: response.status(), data: responseData, durationMs };
  }

  /**
   * Helper: Execute PATCH and parse typed JSON body with duration
   */
  async patchJson<TResponse = unknown, TBody = unknown>(endpoint: string, data?: TBody, options: RequestOptions<TBody> = {}): Promise<ApiResponseResult<TResponse>> {
    const start = Date.now();
    const response = await this.patch(endpoint, data, options);
    const durationMs = Date.now() - start;
    await this.throwForFailedResponse(response, 'PATCH');
    const responseData = await this.parseJson<TResponse>(response, 'PATCH');
    return { response, status: response.status(), data: responseData, durationMs };
  }

  /**
   * Helper: Execute DELETE and parse typed JSON body with duration
   */
  async deleteJson<T = unknown>(endpoint: string, options: RequestOptions = {}): Promise<ApiResponseResult<T | null>> {
    const start = Date.now();
    const response = await this.delete(endpoint, options);
    const durationMs = Date.now() - start;
    await this.throwForFailedResponse(response, 'DELETE');
    const responseData = await this.parseJson<T | null>(response, 'DELETE');
    return { response, status: response.status(), data: responseData, durationMs };
  }

  private async parseJson<T>(response: APIResponse, method: string): Promise<T> {
    if (response.status() === 204) {
      return null as T;
    }

    const body = await response.text();
    if (!body.trim()) {
      return null as T;
    }

    const contentType = response.headers()['content-type'] ?? '';
    if (!contentType.includes('json')) {
      return body as T;
    }

    try {
      return JSON.parse(body) as T;
    } catch {
      throw new ApiRequestError({
        status: response.status(),
        method,
        url: response.url(),
        body,
        correlationId: this.getCorrelationId(response),
      });
    }
  }

  private async throwForFailedResponse(response: APIResponse, method: string): Promise<void> {
    if (response.ok()) {
      return;
    }

    const body = await this.readErrorBody(response);
    throw new ApiRequestError({
      status: response.status(),
      method,
      url: response.url(),
      body,
      correlationId: this.getCorrelationId(response),
    });
  }

  private async validateExpectedStatus(
    response: APIResponse,
    method: string,
    url: string,
    expectedStatus?: number | number[],
  ): Promise<void> {
    if (expectedStatus === undefined) {
      return;
    }

    const expected = Array.isArray(expectedStatus) ? expectedStatus : [expectedStatus];
    if (expected.includes(response.status())) {
      return;
    }

    throw new ApiRequestError({
      status: response.status(),
      method,
      url,
      body: await this.readErrorBody(response),
      correlationId: this.getCorrelationId(response),
    });
  }

  private async readErrorBody(response: APIResponse): Promise<unknown> {
    if (response.status() === 204) {
      return null;
    }

    const body = await response.text();
    if (!body.trim()) {
      return null;
    }

    try {
      return JSON.parse(body) as unknown;
    } catch {
      return body;
    }
  }

  private getCorrelationId(response: APIResponse): string | undefined {
    const headers = response.headers();
    return headers['x-request-id'] ?? headers['x-correlation-id'];
  }

  private sanitizeUrl(value: string): string {
    try {
      const url = new URL(value);
      for (const key of [...url.searchParams.keys()]) {
        if (/token|authorization|password|secret|api[_-]?key/i.test(key)) {
          url.searchParams.set(key, '[REDACTED]');
        }
      }
      return url.toString();
    } catch {
      return value;
    }
  }

  private logResponse(diagnostic: ApiResponseDiagnostic): void {
    if (!envConfig.debugApi) {
      return;
    }

    const suffix = diagnostic.correlationId ? ` correlationId=${diagnostic.correlationId}` : '';
    console.debug(`[API] ${diagnostic.method} ${diagnostic.url} -> ${diagnostic.status} (${diagnostic.durationMs}ms)${suffix}`);
  }

  /**
   * Dispose context if self-managed
   */
  async dispose(): Promise<void> {
    if (this.requestContext && !this.isExternalContext) {
      await this.requestContext.dispose();
      this.requestContext = undefined;
    }
  }
}
