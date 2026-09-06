import { Locator, Page } from '@playwright/test';

/** Authenticated Admin dropdown navigation shared by admin pages. */
export class AdminNavigation {
  readonly adminButton: Locator;
  readonly manageEventsLink: Locator;
  readonly manageBookingsLink: Locator;

  constructor(private readonly page: Page) {
    this.adminButton = page.getByRole('button', { name: 'Admin', exact: true });
    this.manageEventsLink = page.getByRole('link', { name: 'Manage Events', exact: true });
    this.manageBookingsLink = page.getByRole('link', { name: 'Manage Bookings', exact: true });
  }

  async open(): Promise<void> {
    await this.adminButton.click();
  }

  async openManageEvents(): Promise<void> {
    await this.open();
    await this.manageEventsLink.click();
  }

  async openManageBookings(): Promise<void> {
    await this.open();
    await this.manageBookingsLink.click();
  }
}
