import { Locator, Page } from '@playwright/test';
import { AdminBookingRow } from '../../components/admin/AdminBookingRow';
import { AdminBookingDetailsModal } from '../../components/admin/AdminBookingDetailsModal';
import { ApiWaitHelper } from '../../../helpers/ApiWaitHelper';
import { BasePage } from '../BasePage';

export type AdminBookingStatus = 'confirmed' | 'cancelled' | '';

/** Page object for the authenticated Manage Bookings admin page. */
export class AdminBookingsPage extends BasePage {
  readonly pageHeading: Locator;
  readonly statusFilter: Locator;
  readonly bookingRows: Locator;
  readonly totalBookingsLabel: Locator;
  readonly bookingDetailsModal: AdminBookingDetailsModal;
  private readonly apiWaitHelper: ApiWaitHelper;

  constructor(page: Page) {
    super(page);

    const main = page.getByRole('main');
    this.pageHeading = main.getByRole('heading', { name: 'Manage Bookings', exact: true });
    this.statusFilter = main.locator('select').filter({ has: page.locator('option[value="confirmed"]') });
    this.bookingRows = main.locator('tbody tr');
    this.totalBookingsLabel = main.getByText(/\d+ total bookings/, { exact: true });
    this.bookingDetailsModal = new AdminBookingDetailsModal(page);
    this.apiWaitHelper = new ApiWaitHelper(page);
  }

  async navigate(): Promise<void> {
    await Promise.all([
      this.apiWaitHelper.forResponse(response =>
        response.url().includes('/api/bookings') &&
        response.url().includes('page=1') &&
        response.url().includes('limit=15') &&
        response.request().method() === 'GET' &&
        (response.ok() || response.status() === 304)
      ),
      this.navigateTo('/admin/bookings'),
    ]);
  }

  async filterByStatus(status: AdminBookingStatus): Promise<void> {
    await this.statusFilter.selectOption(status);
  }

  bookingRow(bookingReference: string): AdminBookingRow {
    return new AdminBookingRow(this.bookingRows.filter({ hasText: bookingReference }));
  }

  async getBookingCount(): Promise<number> {
    return this.bookingRows.count();
  }

  async cancelBooking(bookingReference: string): Promise<void> {
    const row = this.bookingRow(bookingReference);
    const responsePromise = this.apiWaitHelper.forResponse(response =>
      response.url().includes('/api/bookings/') &&
      response.request().method() === 'DELETE' &&
      response.ok()
    );

    await row.cancel();

    const confirmationDialog = this.page.getByRole('dialog');
    if (await confirmationDialog.isVisible()) {
      await confirmationDialog
        .getByRole('button', { name: 'Yes, cancel it', exact: true })
        .click();
    }

    await responsePromise;
  }
}
