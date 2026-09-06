import { Locator } from '@playwright/test';

/** Reusable event-card component used by Home and Events pages. */
export class EventCard {
  readonly root: Locator;
  readonly title: Locator;
  readonly detailsLink: Locator;
  readonly bookNowButton: Locator;

  constructor(eventCards: Locator, eventName: string) {
    this.root = eventCards.filter({ hasText: eventName });
    this.title = this.root.getByRole('heading', { name: eventName, exact: true });
    this.detailsLink = this.root
      .locator('a[href^="/events/"]')
      .filter({ hasText: eventName });
    this.bookNowButton = this.root.getByRole('link', {
      name: 'Book Now',
      exact: true,
    });
  }

  async openDetails(): Promise<void> {
    await this.detailsLink.click();
  }
}
