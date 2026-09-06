import { Locator, Page } from '@playwright/test';
import { BookingDetailsSection } from '../../components/bookings/BookingDetailsSection';
import { ApiWaitHelper } from '../../../helpers/ApiWaitHelper';
import { BasePage } from '../BasePage';

/** Page object for the customer-facing booking details page. */
export class BookingDetailsPage extends BasePage {
  readonly bookingReference: Locator;
  readonly status: Locator;
  readonly eventDetails: BookingDetailsSection;
  readonly customerDetails: BookingDetailsSection;
  readonly paymentSummary: BookingDetailsSection;
  readonly bookingInformation: BookingDetailsSection;
  readonly cancelBookingButton: Locator;
  readonly checkRefundButton: Locator;
  readonly refundSection: Locator;
  readonly refundLoadingMessage: Locator;
  readonly refundResult: Locator;
  readonly backToBookingsLink: Locator;
  private readonly apiWaitHelper: ApiWaitHelper;

  constructor(page: Page) {
    super(page);

    const main = page.getByRole('main');
    this.bookingReference = main
      .getByRole('navigation')
      .getByText(/[A-Z0-9]+-[A-Z0-9]+/);
    this.status = main.getByText(/^(confirmed|cancelled)$/, { exact: true });
    this.eventDetails = new BookingDetailsSection(main.getByRole('heading', { name: 'Event Details', exact: true }).locator('..'));
    this.customerDetails = new BookingDetailsSection(main.getByRole('heading', { name: 'Customer Details', exact: true }).locator('..'));
    this.paymentSummary = new BookingDetailsSection(main.getByRole('heading', { name: 'Payment Summary', exact: true }).locator('..'));
    this.bookingInformation = new BookingDetailsSection(main.getByRole('heading', { name: 'Booking Information', exact: true }).locator('..'));
    this.cancelBookingButton = main.getByRole('button', { name: 'Cancel Booking', exact: true });
    this.checkRefundButton = main.getByTestId('check-refund-btn');
    this.refundSection = main.getByRole('heading', { name: 'Refund', exact: true }).locator('..');
    this.refundLoadingMessage = this.refundSection.getByText('Checking your refund eligibility…', { exact: true });
    this.refundResult = this.refundSection.locator('strong');
    this.backToBookingsLink = main.getByRole('link', { name: /Back to My Bookings/, exact: true });
    this.apiWaitHelper = new ApiWaitHelper(page);
  }

  async navigate(bookingId: number): Promise<void> {
    await Promise.all([
      this.apiWaitHelper.forResponse(response =>
        response.url().includes(`/api/bookings/${bookingId}`) &&
        response.request().method() === 'GET' &&
        (response.ok() || response.status() === 304)
      ),
      this.navigateTo(`/bookings/${bookingId}`),
    ]);
  }

  async cancelBooking(): Promise<void> {
    await Promise.all([
      this.apiWaitHelper.forResponse(response =>
        response.url().includes('/api/bookings/') &&
        response.request().method() === 'DELETE' &&
        response.ok()
      ),
      this.cancelBookingButton.click(),
    ]);
  }

  async checkRefundEligibility(): Promise<void> {
    await this.checkRefundButton.click();
  }

  async waitForRefundEligibility(): Promise<void> {
    await this.refundResult.waitFor({ state: 'visible' });
  }

  async getRefundEligibilityMessage(): Promise<string> {
    await this.waitForRefundEligibility();
    return (await this.refundResult.textContent())?.trim() ?? '';
  }

  async backToMyBookings(): Promise<void> {
    await this.backToBookingsLink.click();
  }
}
