import { Locator, Page } from '@playwright/test';

/** Details modal component displayed when an admin views a booking. */
export class AdminBookingDetailsModal {
  readonly root: Locator;
  readonly closeButton: Locator;
  readonly reference: Locator;
  readonly status: Locator;
  readonly eventTitle: Locator;
  readonly eventDate: Locator;
  readonly eventCity: Locator;
  readonly customerName: Locator;
  readonly customerEmail: Locator;
  readonly customerPhone: Locator;
  readonly tickets: Locator;
  readonly total: Locator;
  readonly bookedOn: Locator;

  constructor(page: Page) {
    this.root = page.getByRole('dialog');
    this.closeButton = this.root.getByRole('button', { name: 'Close', exact: true });
    this.reference = this.valueForLabel('Reference');
    this.status = this.valueForLabel('Status');
    this.eventTitle = this.valueForLabel('Title');
    this.eventDate = this.valueForLabel('Date');
    this.eventCity = this.valueForLabel('City');
    this.customerName = this.valueForLabel('Name');
    this.customerEmail = this.valueForLabel('Email');
    this.customerPhone = this.valueForLabel('Phone');
    this.tickets = this.valueForLabel('Tickets');
    this.total = this.valueForLabel('Total');
    this.bookedOn = this.valueForLabel('Booked on');
  }

  async close(): Promise<void> {
    await this.closeButton.click();
  }

  private valueForLabel(label: string): Locator {
    return this.root.getByText(label, { exact: true }).locator('..').locator('span + span');
  }
}
