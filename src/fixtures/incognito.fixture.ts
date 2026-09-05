/**
 * Incognito / Isolated Browser Context Fixture
 *
 * When INCOGNITO=true, overrides default context with a fresh isolated userDataDir.
 * If credentials are provided in .env, they are passed as httpCredentials.
 */
import { test as base, chromium, BrowserContext, Page } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';
import { envConfig } from '../config/env.config';

const isIncognito = envConfig.incognito;

export const test = isIncognito
  ? base.extend<{ context: BrowserContext; page: Page }>({
      context: async ({}, use) => {
        const userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pw-temp-context-'));

        const httpCredentials =
          envConfig.credentials.userName && envConfig.credentials.password
            ? {
                username: envConfig.credentials.userName,
                password: envConfig.credentials.password,
              }
            : undefined;

        const context = await chromium.launchPersistentContext(userDataDir, {
          headless: envConfig.headless,
          ignoreHTTPSErrors: envConfig.ignoreHTTPSErrors,
          acceptDownloads: true,
          viewport: null,
          httpCredentials,
          args: [
            '--incognito',
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-web-security',
            '--allow-running-insecure-content',
            '--start-maximized',
          ],
        });

        await use(context);

        await context.close();
        fs.rmSync(userDataDir, { recursive: true, force: true });
      },

      page: async ({ context }, use) => {
        const page = context.pages()[0] || (await context.newPage());
        await use(page);
      },
    })
  : base;

export { expect } from '@playwright/test';
