import { Locator } from '@playwright/test';

/** Table-row component for one booking in the admin booking list. */
export class AdminBookingRow {
  readonly reference: Locator;
  readonly customer: Locator;
  readonly event: Locator;
  readonly quantity: Locator;
  readonly total: Locator;
  readonly status: Locator;
  readonly date: Locator;
  readonly viewButton: Locator;
  readonly cancelButton: Locator;

  constructor(readonly root: Locator) {
    this.reference = root.getByRole('cell', { name: /^[A-Z0-9]+-[A-Z0-9]+$/, exact: true });
    this.customer = root.getByRole('cell').filter({ hasText: /@/ });
    this.event = root.getByRole('cell').filter({ hasText: /Event/ });
    this.quantity = root.getByRole('cell', { name: /^\d+$/, exact: true });
    this.total = root.getByRole('cell', { name: /^\$[\d,]+$/, exact: true });
    this.status = root.getByRole('cell', { name: /^(confirmed|cancelled)$/, exact: true });
    this.date = root.getByRole('cell').filter({ hasText: /\d{1,2} \w+ \d{4}/ });
    this.viewButton = root.getByRole('button', { name: 'View', exact: true });
    this.cancelButton = root.getByRole('button', { name: 'Cancel', exact: true });
  }

  async view(): Promise<void> {
    await this.viewButton.click();
  }

  async cancel(): Promise<void> {
    await this.cancelButton.click();
  }
}
