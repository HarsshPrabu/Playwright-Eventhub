import { Request, Response, TestInfo } from '@playwright/test';
import { envConfig } from '../../config/env.config';
import { shouldAttachDiagnostics } from './diagnosticsMode';

const MAX_DIAGNOSTIC_ENTRIES = 20;
const MAX_TEXT_LENGTH = 1_000;
const SENSITIVE_QUERY_PARAMETER = /token|authorization|password|secret|api[_-]?key/i;
const SENSITIVE_VALUE = /((?:"?(?:authorization|password|token|secret|api[_-]?key)"?\s*[:=]\s*"?)(?:Bearer\s+)?)[^\s,;"'}]+/gi;

/** Test-scoped, secret-safe browser diagnostic summary for UI test reports. */
export class UiDiagnosticsCollector {
  private readonly consoleErrors: string[] = [];
  private readonly pageErrors: string[] = [];
  private readonly failedRequests: string[] = [];
  private readonly httpFailures: string[] = [];

  recordConsoleError(message: string): void {
    this.add(this.consoleErrors, `[console.error] ${this.sanitizeText(message)}`);
  }

  recordPageError(error: Error): void {
    this.add(this.pageErrors, this.sanitizeText(error.stack ?? error.message));
  }

  recordFailedRequest(request: Request): void {
    this.add(
      this.failedRequests,
      `${request.method()} ${this.sanitizeUrl(request.url())} — ${request.failure()?.errorText ?? 'request failed'}`,
    );
  }

  recordHttpFailure(response: Response): void {
    const request = response.request();
    if (response.status() < 400 || !['document', 'fetch', 'xhr'].includes(request.resourceType())) return;

    this.add(this.httpFailures, `${request.method()} ${this.sanitizeUrl(response.url())} → ${response.status()}`);
  }

  async attach(testInfo: TestInfo, currentUrl: string): Promise<void> {
    if (!shouldAttachDiagnostics(envConfig.uiDiagnostics, testInfo.status === testInfo.expectedStatus)) return;

    await this.attachText(testInfo, 'current-url', [this.sanitizeUrl(currentUrl)]);
    await this.attachText(testInfo, 'browser-console-errors', this.consoleErrors);
    await this.attachText(testInfo, 'page-errors', this.pageErrors);
    await this.attachText(testInfo, 'failed-network-requests', this.failedRequests);
    await this.attachText(testInfo, 'http-failures', this.httpFailures);
  }

  private add(entries: string[], entry: string): void {
    if (entries.length < MAX_DIAGNOSTIC_ENTRIES) {
      entries.push(this.truncate(entry));
    }
  }

  private async attachText(testInfo: TestInfo, name: string, lines: string[]): Promise<void> {
    if (!lines.length) return;

    await testInfo.attach(name, {
      body: lines.join('\n'),
      contentType: 'text/plain',
    });
  }

  private sanitizeUrl(value: string): string {
    try {
      const url = new URL(value);
      for (const key of [...url.searchParams.keys()]) {
        if (SENSITIVE_QUERY_PARAMETER.test(key)) {
          url.searchParams.set(key, '[REDACTED]');
        }
      }
      return url.toString();
    } catch {
      return value;
    }
  }

  private sanitizeText(value: string): string {
    return value.replace(SENSITIVE_VALUE, '$1[REDACTED]');
  }

  private truncate(value: string): string {
    return value.length <= MAX_TEXT_LENGTH ? value : `${value.slice(0, MAX_TEXT_LENGTH)}…`;
  }
}
