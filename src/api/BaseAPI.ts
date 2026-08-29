import { APIRequestContext, APIResponse, Page, request } from '@playwright/test';
import { apiUrl } from '../config/env.config';

export interface RequestOptions {
  headers?: Record<string, string>;
  params?: Record<string, string | number | boolean>;
  data?: any;
  timeout?: number;
}

export interface ApiResponseResult<T = any> {
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
    return await context.get(url, {
      headers: { ...this.defaultHeaders, ...options.headers },
      params: options.params,
      timeout: options.timeout,
    });
  }

  /**
   * Generic POST Request
   */
  async post(endpoint: string, data?: any, options: RequestOptions = {}): Promise<APIResponse> {
    const context = await this.getContext();
    const url = endpoint.startsWith('http') ? endpoint : `${this.baseUrl}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
    return await context.post(url, {
      data: data ?? options.data,
      headers: { ...this.defaultHeaders, ...options.headers },
      params: options.params,
      timeout: options.timeout,
    });
  }

  /**
   * Generic PUT Request
   */
  async put(endpoint: string, data?: any, options: RequestOptions = {}): Promise<APIResponse> {
    const context = await this.getContext();
    const url = endpoint.startsWith('http') ? endpoint : `${this.baseUrl}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
    return await context.put(url, {
      data: data ?? options.data,
      headers: { ...this.defaultHeaders, ...options.headers },
      params: options.params,
      timeout: options.timeout,
    });
  }

  /**
   * Generic PATCH Request
   */
  async patch(endpoint: string, data?: any, options: RequestOptions = {}): Promise<APIResponse> {
    const context = await this.getContext();
    const url = endpoint.startsWith('http') ? endpoint : `${this.baseUrl}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
    return await context.patch(url, {
      data: data ?? options.data,
      headers: { ...this.defaultHeaders, ...options.headers },
      params: options.params,
      timeout: options.timeout,
    });
  }

  /**
   * Generic DELETE Request
   */
  async delete(endpoint: string, options: RequestOptions = {}): Promise<APIResponse> {
    const context = await this.getContext();
    const url = endpoint.startsWith('http') ? endpoint : `${this.baseUrl}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
    return await context.delete(url, {
      headers: { ...this.defaultHeaders, ...options.headers },
      params: options.params,
      timeout: options.timeout,
    });
  }

  /**
   * Helper: Execute GET and parse typed JSON body with duration
   */
  async getJson<T = any>(endpoint: string, options: RequestOptions = {}): Promise<ApiResponseResult<T>> {
    const start = Date.now();
    const response = await this.get(endpoint, options);
    const durationMs = Date.now() - start;
    const data = await response.json();
    return { response, status: response.status(), data, durationMs };
  }

  /**
   * Helper: Execute POST and parse typed JSON body with duration
   */
  async postJson<T = any>(endpoint: string, data?: any, options: RequestOptions = {}): Promise<ApiResponseResult<T>> {
    const start = Date.now();
    const response = await this.post(endpoint, data, options);
    const durationMs = Date.now() - start;
    const responseData = await response.json();
    return { response, status: response.status(), data: responseData, durationMs };
  }

  /**
   * Helper: Execute PUT and parse typed JSON body with duration
   */
  async putJson<T = any>(endpoint: string, data?: any, options: RequestOptions = {}): Promise<ApiResponseResult<T>> {
    const start = Date.now();
    const response = await this.put(endpoint, data, options);
    const durationMs = Date.now() - start;
    const responseData = await response.json();
    return { response, status: response.status(), data: responseData, durationMs };
  }

  /**
   * Helper: Execute PATCH and parse typed JSON body with duration
   */
  async patchJson<T = any>(endpoint: string, data?: any, options: RequestOptions = {}): Promise<ApiResponseResult<T>> {
    const start = Date.now();
    const response = await this.patch(endpoint, data, options);
    const durationMs = Date.now() - start;
    const responseData = await response.json();
    return { response, status: response.status(), data: responseData, durationMs };
  }

  /**
   * Helper: Execute DELETE and parse typed JSON body with duration
   */
  async deleteJson<T = any>(endpoint: string, options: RequestOptions = {}): Promise<ApiResponseResult<T>> {
    const start = Date.now();
    const response = await this.delete(endpoint, options);
    const durationMs = Date.now() - start;
    let responseData: any = null;
    try {
      responseData = await response.json();
    } catch {
      responseData = null;
    }
    return { response, status: response.status(), data: responseData, durationMs };
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

