import { Locator, Page } from '@playwright/test';
import { ApiWaitHelper } from '../../../helpers/ApiWaitHelper';
import { BasePage } from '../BasePage';

/** Page object for viewing and managing the authenticated user's bookings. */
export class MyBookingsPage extends BasePage {
  readonly pageHeading: Locator;
  readonly pageDescription: Locator;
  readonly bookingCards: Locator;
  readonly clearAllBookingsButton: Locator;
  readonly emptyBookingsMessage: Locator;
  private readonly apiWaitHelper: ApiWaitHelper;

  constructor(page: Page) {
    super(page);

    const main = page.getByRole('main');
    this.pageHeading = main.getByRole('heading', { name: 'My Bookings', exact: true });
    this.pageDescription = main.getByText('View and manage all your ticket bookings', { exact: true });
    this.bookingCards = main.getByTestId('booking-card');
    this.clearAllBookingsButton = main.getByRole('button', { name: 'Clear all bookings', exact: true });
    this.emptyBookingsMessage = main.getByText(/No bookings(?: found| available)?|You have no bookings/i);
    this.apiWaitHelper = new ApiWaitHelper(page);
  }

  async navigate(): Promise<void> {
    await Promise.all([
      this.apiWaitHelper.forResponse(response =>
        response.url().includes('/api/bookings') &&
        response.request().method() === 'GET' &&
        (response.ok() || response.status() === 304)
      ),
      this.navigateTo('/bookings'),
    ]);
  }

  bookingCard(bookingReference: string): Locator {
    return this.bookingCards.filter({ hasText: bookingReference });
  }

  async getBookingCount(): Promise<number> {
    return this.bookingCards.count();
  }

  async getBookingReferences(): Promise<string[]> {
    const references = await this.bookingCards.locator('.booking-ref').allTextContents();
    return references.map(reference => reference.trim());
  }

  async getBookingId(bookingReference: string): Promise<string> {
    return (await this.bookingCard(bookingReference).getByTestId('booking-id').textContent())?.trim() ?? '';
  }

  async getBookingStatus(bookingReference: string): Promise<string> {
    const card = this.bookingCard(bookingReference);
    return (await card.getByText(/^(confirmed|cancelled)$/, { exact: true }).textContent())?.trim() ?? '';
  }

  async viewBookingDetails(bookingReference: string): Promise<void> {
    await this.bookingCard(bookingReference).getByRole('button', { name: 'View Details', exact: true }).click();
  }

  async cancelBooking(bookingReference: string): Promise<void> {
    const responsePromise = this.apiWaitHelper.forResponse(response =>
      response.url().includes('/api/bookings/') &&
      response.request().method() === 'DELETE' &&
      response.ok()
    );
    await this.bookingCard(bookingReference).getByTestId('cancel-booking-btn').click();
    await this.page
      .getByRole('dialog')
      .getByRole('button', { name: 'Yes, cancel it', exact: true })
      .click();
    await responsePromise;
  }

  async clearAllBookings(): Promise<void> {
    await this.clearAllBookingsButton.click();
  }

  async isBookingVisible(bookingReference: string): Promise<boolean> {
    return this.bookingCard(bookingReference).isVisible();
  }

  async isEmpty(): Promise<boolean> {
    return (await this.getBookingCount()) === 0;
  }

  async isEmptyMessageVisible(): Promise<boolean> {
    return this.emptyBookingsMessage.isVisible();
  }
}
