import { defineConfig, devices } from '@playwright/test';
import { envConfig } from './src/config/env.config';

const isCI = !!process.env.CI;

export default defineConfig({
  testDir: './tests',
  testMatch: '**/*.spec.ts',
  timeout: envConfig.timeout.default,
  expect: {
    timeout: 10000,
  },
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: isCI ? 2 : undefined,

  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['list'],
  ],

  use: {
    baseURL: envConfig.baseUrl,
    actionTimeout: envConfig.timeout.action,
    navigationTimeout: envConfig.timeout.navigation,
    trace: isCI ? 'retain-on-failure' : 'on-first-retry',
    video: 'retain-on-failure',
    screenshot: 'only-on-failure',
    ignoreHTTPSErrors: true,
  },

  projects: [
    // 🌐 UI Cross-Browser Projects (Runs UI / E2E test specs)
    {
      name: 'chromium',
      testDir: './tests/e2e',
      use: {
        ...devices['Desktop Chrome'],
        headless: envConfig.headless,
        launchOptions: {
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-web-security',
          ],
        },
      },
    },
    {
      name: 'firefox',
      testDir: './tests/e2e',
      use: {
        ...devices['Desktop Firefox'],
        headless: envConfig.headless,
      },
    },
    {
      name: 'webkit',
      testDir: './tests/e2e',
      use: {
        ...devices['Desktop Safari'],
        headless: envConfig.headless,
      },
    },

    // ⚡ Pure API Project (Runs API test specs ultra-fast without browser overhead)
    {
      name: 'api',
      testDir: './tests/api',
      use: {
        baseURL: envConfig.apiUrl,
      },
    },
  ],
});
