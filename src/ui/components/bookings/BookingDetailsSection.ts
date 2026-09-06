import { Locator } from '@playwright/test';

/** Reusable labeled-value section used by the booking details page. */
export class BookingDetailsSection {
  constructor(readonly root: Locator) {}

  value(label: string): Locator {
    return this.root.getByText(label, { exact: true }).locator('..').locator('span + span');
  }
}
