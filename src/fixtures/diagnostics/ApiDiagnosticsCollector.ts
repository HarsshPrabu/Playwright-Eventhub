import { TestInfo } from '@playwright/test';
import { ApiRequestObserver, ApiResponseDiagnostic, ApiTransportErrorDiagnostic } from '../../api/BaseAPI';
import { envConfig } from '../../config/env.config';
import { shouldAttachDiagnostics } from './diagnosticsMode';

const MAX_API_CALLS = 50;
const MAX_ERROR_LENGTH = 1_000;
const SENSITIVE_VALUE = /((?:authorization|password|token|secret|api[_-]?key)\s*[:=]\s*(?:Bearer\s+)?)[^\s,;"'}]+/gi;
/** Test-scoped, secret-safe summary of API traffic for failed API tests. */
export class ApiDiagnosticsCollector implements ApiRequestObserver {
  private readonly entries: string[] = [];

  onResponse(details: ApiResponseDiagnostic): void {
    const correlationId = details.correlationId ? ` correlationId=${details.correlationId}` : '';
    this.add(`${details.method} ${details.url} → ${details.status} (${details.durationMs}ms)${correlationId}`);
  }

  onTransportError(details: ApiTransportErrorDiagnostic): void {
    this.add(
      `${details.method} ${details.url} → transport error (${details.durationMs}ms): ${this.truncate(this.sanitizeError(details.error))}`,
    );
  }

  async attach(testInfo: TestInfo): Promise<void> {
    if (!shouldAttachDiagnostics(envConfig.apiDiagnostics, testInfo.status === testInfo.expectedStatus)) return;

    await testInfo.attach('api-call-summary', {
      body: this.entries.length ? this.entries.join('\n') : 'No API calls were recorded before the test failed.',
      contentType: 'text/plain',
    });
  }

  private add(entry: string): void {
    if (this.entries.length < MAX_API_CALLS) {
      this.entries.push(this.truncate(entry));
    }
  }

  private truncate(value: string): string {
    return value.length <= MAX_ERROR_LENGTH ? value : `${value.slice(0, MAX_ERROR_LENGTH)}…`;
  }

  private sanitizeError(value: string): string {
    return value.replace(SENSITIVE_VALUE, '$1[REDACTED]');
  }
}
