import { Locator } from '@playwright/test';
import { EventCategory } from '../../../api/models/EventHubModels';

/** Event information section displayed on the event details page. */
export class EventSummary {
  readonly root: Locator;
  readonly title: Locator;
  readonly description: Locator;

  constructor(root: Locator) {
    this.root = root;
    this.title = root.getByRole('heading', { level: 1 });
    this.description = root.getByRole('heading', { name: 'About this event', exact: true })
      .locator('..').getByRole('paragraph');
  }

  category(category: EventCategory): Locator {
    return this.root.getByText(category, { exact: true });
  }

  value(label: string): Locator {
    return this.root.getByText(label, { exact: true }).locator('..')
      .getByRole('paragraph').filter({ hasNotText: label });
  }
}
