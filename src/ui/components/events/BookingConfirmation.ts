import { Locator, Page } from '@playwright/test';

export class BookingConfirmation {
  readonly root: Locator;
  readonly heading: Locator;
  readonly bookingReference: Locator;
  readonly customer: Locator;
  readonly tickets: Locator;
  readonly total: Locator;
  readonly viewMyBookingsButton: Locator;
  readonly browseMoreEventsButton: Locator;

  constructor(page: Page) {
    this.heading = page.getByRole('heading', { name: /Booking Confirmed/, exact: false });
    this.viewMyBookingsButton = page.getByRole('button', { name: 'View My Bookings', exact: true });
    this.browseMoreEventsButton = page.getByRole('button', { name: 'Browse More Events', exact: true });
    this.root = this.heading.locator(
      'xpath=ancestor::div[.//button[normalize-space()="View My Bookings"]][1]'
    );
    this.bookingReference = this.valueForLabel('Booking Ref');
    this.customer = this.valueForLabel('Customer');
    this.tickets = this.valueForLabel('Tickets');
    this.total = this.valueForLabel('Total');
  }

  async viewMyBookings(): Promise<void> {
    await this.viewMyBookingsButton.click();
  }

  async browseMoreEvents(): Promise<void> {
    await this.browseMoreEventsButton.click();
  }

  private valueForLabel(label: string): Locator {
    return this.root.getByText(label, { exact: true }).locator('..').locator('span + span');
  }
}
