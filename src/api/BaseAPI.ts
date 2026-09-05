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

  constructor(target?: APIRequestContext | Page | string, baseUrl: string = apiUrl) {
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
    const context = await this.getContext();
    const url = endpoint.startsWith('http') ? endpoint : `${this.baseUrl}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
    const startedAt = Date.now();
    const response = await context.get(url, {
      headers: { ...this.defaultHeaders, ...options.headers },
      params: options.params,
      timeout: options.timeout,
    });
    this.logResponse('GET', url, response, startedAt);
    await this.validateExpectedStatus(response, 'GET', url, options.expectedStatus);
    return response;
  }

  /**
   * Generic POST Request
   */
  async post<TBody = unknown>(endpoint: string, data?: TBody, options: RequestOptions<TBody> = {}): Promise<APIResponse> {
    const context = await this.getContext();
    const url = endpoint.startsWith('http') ? endpoint : `${this.baseUrl}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
    const startedAt = Date.now();
    const response = await context.post(url, {
      data: data ?? options.data,
      headers: { ...this.defaultHeaders, ...options.headers },
      params: options.params,
      timeout: options.timeout,
    });
    this.logResponse('POST', url, response, startedAt);
    await this.validateExpectedStatus(response, 'POST', url, options.expectedStatus);
    return response;
  }

  /**
   * Generic PUT Request
   */
  async put<TBody = unknown>(endpoint: string, data?: TBody, options: RequestOptions<TBody> = {}): Promise<APIResponse> {
    const context = await this.getContext();
    const url = endpoint.startsWith('http') ? endpoint : `${this.baseUrl}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
    const startedAt = Date.now();
    const response = await context.put(url, {
      data: data ?? options.data,
      headers: { ...this.defaultHeaders, ...options.headers },
      params: options.params,
      timeout: options.timeout,
    });
    this.logResponse('PUT', url, response, startedAt);
    await this.validateExpectedStatus(response, 'PUT', url, options.expectedStatus);
    return response;
  }

  /**
   * Generic PATCH Request
   */
  async patch<TBody = unknown>(endpoint: string, data?: TBody, options: RequestOptions<TBody> = {}): Promise<APIResponse> {
    const context = await this.getContext();
    const url = endpoint.startsWith('http') ? endpoint : `${this.baseUrl}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
    const startedAt = Date.now();
    const response = await context.patch(url, {
      data: data ?? options.data,
      headers: { ...this.defaultHeaders, ...options.headers },
      params: options.params,
      timeout: options.timeout,
    });
    this.logResponse('PATCH', url, response, startedAt);
    await this.validateExpectedStatus(response, 'PATCH', url, options.expectedStatus);
    return response;
  }

  /**
   * Generic DELETE Request
   */
  async delete(endpoint: string, options: RequestOptions = {}): Promise<APIResponse> {
    const context = await this.getContext();
    const url = endpoint.startsWith('http') ? endpoint : `${this.baseUrl}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
    const startedAt = Date.now();
    const response = await context.delete(url, {
      headers: { ...this.defaultHeaders, ...options.headers },
      params: options.params,
      timeout: options.timeout,
    });
    this.logResponse('DELETE', url, response, startedAt);
    await this.validateExpectedStatus(response, 'DELETE', url, options.expectedStatus);
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

  private logResponse(method: string, url: string, response: APIResponse, startedAt: number): void {
    if (!envConfig.debugApi) {
      return;
    }

    const correlationId = this.getCorrelationId(response);
    const suffix = correlationId ? ` correlationId=${correlationId}` : '';
    console.debug(`[API] ${method} ${url} -> ${response.status()} (${Date.now() - startedAt}ms)${suffix}`);
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
