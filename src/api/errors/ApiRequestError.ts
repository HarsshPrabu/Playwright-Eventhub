export interface ApiErrorDetails {
  status: number;
  method: string;
  url: string;
  body: unknown;
  correlationId?: string;
}

export class ApiRequestError extends Error {
  readonly status: number;
  readonly method: string;
  readonly url: string;
  readonly body: unknown;
  readonly correlationId?: string;

  constructor(details: ApiErrorDetails) {
    super(`API request failed with status ${details.status}: ${details.method} ${details.url}`);
    this.name = 'ApiRequestError';
    this.status = details.status;
    this.method = details.method;
    this.url = details.url;
    this.body = details.body;
    this.correlationId = details.correlationId;
  }
}
