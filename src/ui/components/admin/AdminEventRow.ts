import { Locator } from '@playwright/test';

/** Table-row component for one admin-managed event. */
export class AdminEventRow {
  readonly title: Locator;
  readonly editButton: Locator;
  readonly deleteButton: Locator;
  readonly readOnlyLabel: Locator;

  constructor(readonly root: Locator, eventTitle: string) {
    this.title = root.getByText(eventTitle, { exact: true });
    this.editButton = root.getByTestId('edit-event-btn');
    this.deleteButton = root.getByTestId('delete-event-btn');
    this.readOnlyLabel = root.getByText('Read-only', { exact: true });
  }

  async edit(): Promise<void> {
    await this.editButton.click();
  }

  async delete(): Promise<void> {
    await this.deleteButton.click();
  }

  async isReadOnly(): Promise<boolean> {
    return this.readOnlyLabel.isVisible();
  }
}
