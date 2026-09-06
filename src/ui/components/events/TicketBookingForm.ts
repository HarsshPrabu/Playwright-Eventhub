import { Locator, Page } from '@playwright/test';
import { ApiWaitHelper } from '../../../helpers/ApiWaitHelper';

export interface CustomerDetails {
  name: string;
  email: string;
  phone: string;
}

/** Ticket quantity and customer form displayed on the event details page. */
export class TicketBookingForm {
  readonly root: Locator;
  readonly decreaseTicketsButton: Locator;
  readonly increaseTicketsButton: Locator;
  readonly ticketCount: Locator;
  readonly customerNameInput: Locator;
  readonly customerEmailInput: Locator;
  readonly phoneInput: Locator;
  readonly total: Locator;
  readonly confirmBookingButton: Locator;
  private readonly apiWaitHelper: ApiWaitHelper;

  constructor(private readonly page: Page) {
    this.root = page.getByRole('heading', { name: 'Book Tickets', exact: true })
      .locator('xpath=ancestor::div[.//button[normalize-space()="Confirm Booking"]][1]');
    this.decreaseTicketsButton = this.root.getByRole('button', { name: '−', exact: true });
    this.increaseTicketsButton = this.root.getByRole('button', { name: '+', exact: true });
    this.ticketCount = this.root.locator('#ticket-count');
    this.customerNameInput = this.root.getByLabel('Full Name', { exact: false });
    this.customerEmailInput = this.root.getByTestId('customer-email');
    this.phoneInput = this.root.getByLabel('Phone Number', { exact: false });
    this.total = this.root.getByText('Total', { exact: true }).locator('..').locator('span');
    this.confirmBookingButton = this.root.getByRole('button', { name: 'Confirm Booking', exact: true });
    this.apiWaitHelper = new ApiWaitHelper(page);
  }

  async getTicketCount(): Promise<number> {
    return Number(await this.ticketCount.textContent());
  }

  async increaseTickets(quantity = 1): Promise<void> {
    for (let index = 0; index < quantity; index += 1) {
      await this.increaseTicketsButton.click();
    }
  }

  async decreaseTickets(quantity = 1): Promise<void> {
    for (let index = 0; index < quantity; index += 1) {
      await this.decreaseTicketsButton.click();
    }
  }

  async setTicketQuantity(quantity: number): Promise<void> {
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 10) {
      throw new Error('Ticket quantity must be an integer between 1 and 10.');
    }

    const currentQuantity = await this.getTicketCount();
    if (quantity > currentQuantity) {
      await this.increaseTickets(quantity - currentQuantity);
    } else {
      await this.decreaseTickets(currentQuantity - quantity);
    }
  }

  async fillCustomerDetails(details: CustomerDetails): Promise<void> {
    await this.customerNameInput.fill(details.name);
    await this.customerEmailInput.fill(details.email);
    await this.phoneInput.fill(details.phone);
  }

  async confirmBooking(): Promise<void> {
    await Promise.all([
      this.apiWaitHelper.forResponse(response =>
        response.url().endsWith('/api/bookings') &&
        response.request().method() === 'POST' &&
        response.ok()
      ),
      this.confirmBookingButton.click(),
    ]);
  }

  async isConfirmBookingEnabled(): Promise<boolean> {
    return this.confirmBookingButton.isEnabled();
  }
}
