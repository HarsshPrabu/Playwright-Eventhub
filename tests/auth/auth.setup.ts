import fs from 'node:fs';
import path from 'node:path';
import { test as setup, expect } from '@playwright/test';
import { envConfig } from '../../src/config/env.config';

const authFile = path.resolve('playwright', '.auth', 'user.json');

setup('authenticate EventHub user', async ({ page }) => {
  const username = envConfig.credentials.userName;
  const password = envConfig.credentials.password;

  if (!username || !password) {
    throw new Error('USER_NAME and USER_PASSWORD must be configured for authentication setup.');
  }

  await page.goto('/login');
  await page.getByLabel('Email', { exact: true }).fill(username);
  await page.getByLabel('Password', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'Sign In', exact: true }).click();

  await expect(page.getByTestId('user-email-display')).toBeVisible();
  fs.mkdirSync(path.dirname(authFile), { recursive: true });
  await page.context().storageState({ path: authFile });
});
