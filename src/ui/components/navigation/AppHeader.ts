import { Locator, Page } from '@playwright/test';
import { AdminNavigation } from '../admin/AdminNavigation';

export type AppSection = 'home' | 'events' | 'bookings';

/** Shared application header and authenticated navigation. */
export class AppHeader {
  readonly navbar: Locator;
  readonly navHome: Locator;
  readonly navEvents: Locator;
  readonly navBookings: Locator;
  readonly apiDocsLink: Locator;
  readonly adminButton: Locator;
  readonly mobileMenuButton: Locator;
  readonly userEmailDisplay: Locator;
  readonly logoutButton: Locator;
  readonly adminNavigation: AdminNavigation;

  constructor(page: Page) {
    this.navbar = page.getByRole('navigation');
    this.navHome = this.navbar.getByRole('link', { name: 'Home', exact: true });
    this.navEvents = this.navbar.getByRole('link', { name: 'Events', exact: true });
    this.navBookings = this.navbar.getByRole('link', { name: 'My Bookings', exact: true });
    this.apiDocsLink = page.getByRole('link', { name: 'API Docs', exact: true });
    this.adminButton = page.getByRole('button', { name: 'Admin', exact: true });
    this.mobileMenuButton = page.getByRole('button', { name: 'Toggle menu', exact: true });
    this.userEmailDisplay = page.getByTestId('user-email-display');
    this.logoutButton = page.getByTestId('logout-btn');
    this.adminNavigation = new AdminNavigation(page);
  }

  navLocator(section: AppSection): Locator {
    return {
      home: this.navHome,
      events: this.navEvents,
      bookings: this.navBookings,
    }[section];
  }

  async logout(): Promise<void> {
    await this.logoutButton.click();
  }
}
