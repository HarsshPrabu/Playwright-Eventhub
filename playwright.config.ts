import { defineConfig, devices } from '@playwright/test';
import { envConfig } from './src/config/env.config';

const isCI = envConfig.isCI;

export default defineConfig({
  testDir: './tests',
  testMatch: '**/*.spec.ts',
  timeout: envConfig.timeout.default,
  expect: {
    timeout: envConfig.timeout.expect,
  },
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: envConfig.workers,

  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['list'],
  ],

  use: {
    baseURL: envConfig.baseUrl,
    actionTimeout: envConfig.timeout.action,
    navigationTimeout: envConfig.timeout.navigation,
    trace: isCI ? 'retain-on-failure' : 'on',
    video: 'retain-on-failure',
    screenshot: 'only-on-failure',
    ignoreHTTPSErrors: envConfig.ignoreHTTPSErrors,
  },

  projects: [
    {
      name: 'setup',
      testMatch: /auth\.setup\.ts/,
    },

    // 🌐 UI Cross-Browser Projects (Runs UI / E2E test specs)
    {
      name: 'chromium',
      testDir: './tests',
      testIgnore: ['**/api/**', '**/auth/**'],
      dependencies: ['setup'],
      use: {
        ...devices['Desktop Chrome'],
        headless: envConfig.headless,
        storageState: 'playwright/.auth/user.json',
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
      testDir: './tests',
      testIgnore: ['**/api/**', '**/auth/**'],
      dependencies: ['setup'],
      use: {
        ...devices['Desktop Firefox'],
        headless: envConfig.headless,
        storageState: 'playwright/.auth/user.json',
      },
    },
    {
      name: 'webkit',
      testDir: './tests',
      testIgnore: ['**/api/**', '**/auth/**'],
      dependencies: ['setup'],
      use: {
        ...devices['Desktop Safari'],
        headless: envConfig.headless,
        storageState: 'playwright/.auth/user.json',
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
