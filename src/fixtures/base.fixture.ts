import { test as baseTest, expect } from './incognito.fixture';
import { LoginPage } from '../ui/pages/auth/LoginPage';
import { RegisterPage } from '../ui/pages/auth/RegisterPage';
import { HomePage } from '../ui/pages/customer/HomePage';
import { EventsPage } from '../ui/pages/customer/EventsPage';
import { MyBookingsPage } from '../ui/pages/customer/MyBookingsPage';
import { AdminEventsPage } from '../ui/pages/admin/AdminEventsPage';
import { AdminBookingsPage } from '../ui/pages/admin/AdminBookingsPage';
import { BookingDetailsPage } from '../ui/pages/customer/BookingDetailsPage';
import { EventDetailsPage } from '../ui/pages/customer/EventDetailsPage';
import { BaseAPI } from '../api/BaseAPI';
import { EventHubAPI } from '../api/services/EventHubAPI';
import { envConfig } from '../config/env.config';
import { DatabasePool } from '../db/DatabasePool';
import { getDatabaseConfig } from '../db/databaseConfig';
import { UiActions } from '../helpers/UiActions';
import { WaitHelper } from '../helpers/WaitHelper';
import { ApiWaitHelper } from '../helpers/ApiWaitHelper';
import { StorageHelper } from '../helpers/StorageHelper';
import { DialogHelper } from '../helpers/DialogHelper';
import { ScreenshotHelper } from '../helpers/ScreenshotHelper';

type FrameworkFixtures = {
  loginPage: LoginPage;
  registerPage: RegisterPage;
  homePage: HomePage;
  eventsPage: EventsPage;
  myBookingsPage: MyBookingsPage;
  adminEventsPage: AdminEventsPage;
  adminBookingsPage: AdminBookingsPage;
  bookingDetailsPage: BookingDetailsPage;
  eventDetailsPage: EventDetailsPage;
  baseApi: BaseAPI;
  pageApi: BaseAPI;
  publicEventHubApi: EventHubAPI;
  authenticatedEventHubApi: EventHubAPI;
  uiActions: UiActions;
  waitHelper: WaitHelper;
  apiWaitHelper: ApiWaitHelper;
  storageHelper: StorageHelper;
  dialogHelper: DialogHelper;
  screenshotHelper: ScreenshotHelper;
};

type FrameworkWorkerFixtures = {
  dbPool: DatabasePool;
};

export const test = baseTest.extend<FrameworkFixtures, FrameworkWorkerFixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },

  registerPage: async ({ page }, use) => {
    await use(new RegisterPage(page));
  },

  homePage: async ({ page }, use) => {
    await use(new HomePage(page));
  },

  eventsPage: async ({ page }, use) => {
    await use(new EventsPage(page));
  },

  myBookingsPage: async ({ page }, use) => {
    await use(new MyBookingsPage(page));
  },

  adminEventsPage: async ({ page }, use) => {
    await use(new AdminEventsPage(page));
  },

  adminBookingsPage: async ({ page }, use) => {
    await use(new AdminBookingsPage(page));
  },

  bookingDetailsPage: async ({ page }, use) => {
    await use(new BookingDetailsPage(page));
  },

  eventDetailsPage: async ({ page }, use) => {
    await use(new EventDetailsPage(page));
  },

  // Standalone BaseAPI wrapping Playwright's native request fixture
  baseApi: async ({ request }, use) => {
    await use(new BaseAPI(request));
  },

  // UI-Bound BaseAPI client (shares active browser session & cookies)
  pageApi: async ({ page }, use) => {
    await use(new BaseAPI(page));
  },

  publicEventHubApi: async ({ request }, use) => {
    await use(new EventHubAPI(request));
  },

  authenticatedEventHubApi: async ({ request }, use) => {
    const username = envConfig.credentials.userName;
    const password = envConfig.credentials.password;
    if (!username || !password) {
      throw new Error('USER_NAME and USER_PASSWORD must be configured for authenticated API tests.');
    }

    const publicApi = new EventHubAPI(request);
    const loginResult = await publicApi.login({ email: username, password });
    await use(new EventHubAPI(request, loginResult.data.token));
  },

  dbPool: [async ({}, use) => {
    const dbPool = new DatabasePool(getDatabaseConfig());
    await dbPool.healthCheck();

    try {
      await use(dbPool);
    } finally {
      await dbPool.close();
    }
  }, { scope: 'worker' }],

  uiActions: async ({}, use) => {
    await use(new UiActions());
  },

  waitHelper: async ({ page }, use) => {
    await use(new WaitHelper(page));
  },

  apiWaitHelper: async ({ page }, use) => {
    await use(new ApiWaitHelper(page));
  },

  storageHelper: async ({ page, context }, use) => {
    await use(new StorageHelper(page, context));
  },

  dialogHelper: async ({ page }, use) => {
    await use(new DialogHelper(page));
  },

  screenshotHelper: async ({ page }, use) => {
    await use(new ScreenshotHelper(page));
  },
});

export { expect };
