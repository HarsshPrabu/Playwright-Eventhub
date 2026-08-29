import { test as baseTest, expect } from './incognito.fixture';
import { LoginPage } from '../pages/LoginPage';
import { HomePage } from '../pages/HomePage';
import { BaseAPI } from '../api/BaseAPI';
import { SampleUserAPI } from '../api/services/SampleUserAPI';
import { DatabaseUtil } from '../helper/utils/DatabaseUtil';

type FrameworkFixtures = {
  loginPage: LoginPage;
  homePage: HomePage;
  baseApi: BaseAPI;
  pageApi: BaseAPI;
  userApi: SampleUserAPI;
  dbClient: typeof DatabaseUtil;
};

export const test = baseTest.extend<FrameworkFixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },

  homePage: async ({ page }, use) => {
    await use(new HomePage(page));
  },

  // Standalone BaseAPI wrapping Playwright's native request fixture
  baseApi: async ({ request }, use) => {
    await use(new BaseAPI(request));
  },

  // UI-Bound BaseAPI client (shares active browser session & cookies)
  pageApi: async ({ page }, use) => {
    await use(new BaseAPI(page));
  },

  // Sample API Service fixture wrapping Playwright's native request fixture
  userApi: async ({ request }, use) => {
    await use(new SampleUserAPI(request));
  },

  dbClient: async ({}, use) => {
    await use(DatabaseUtil);
  },
});

export { expect };
