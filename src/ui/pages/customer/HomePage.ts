import { Locator, Page } from '@playwright/test';
import { ApiWaitHelper } from '../../../helpers/ApiWaitHelper';
import { AppHeader, AppSection } from '../../components/navigation/AppHeader';
import { EventCard } from '../../components/events/EventCard';
import { BasePage } from '../BasePage';

/** Page object for the authenticated EventHub home page. */
export class HomePage extends BasePage {
  readonly header: AppHeader;
  readonly browseEventsLink: Locator;
  readonly heroBookingsLink: Locator;
  readonly viewAllEventsLink: Locator;
  readonly exploreAllEventsButton: Locator;
  readonly eventCards: Locator;
  private readonly apiWaitHelper: ApiWaitHelper;

  constructor(page: Page) {
    super(page);

    this.header = new AppHeader(page);
    this.browseEventsLink = page.getByRole('link', { name: /Browse Events/ });
    this.heroBookingsLink = page.getByRole('main').locator('a[href="/bookings"]');
    this.viewAllEventsLink = page.getByRole('link', { name: /View all/ });
    this.exploreAllEventsButton = page.getByRole('button', { name: 'Explore All Events', exact: true });
    this.eventCards = page.getByRole('article');
    this.apiWaitHelper = new ApiWaitHelper(page);
  }

  eventCard(name: string): EventCard {
    return new EventCard(this.eventCards, name);
  }

  async navigateToSection(section: AppSection): Promise<void> {
    const apiPathBySection = {
      home: undefined,
      events: '/api/events',
      bookings: '/api/bookings',
    } as const;
    const apiPath = apiPathBySection[section];
    const navItem = this.header.navLocator(section);

    if (!apiPath) {
      await navItem.click();
      return;
    }

    await Promise.all([
      this.apiWaitHelper.forResponse(response =>
        response.url().includes(apiPath) &&
        response.request().method() === 'GET' &&
        (response.ok() || response.status() === 304)
      ),
      navItem.click(),
    ]);
  }

  async openEventDetail(eventName: string): Promise<void> {
    await this.eventCard(eventName).openDetails();
  }

  async getEventTitles(): Promise<string[]> {
    const titles = await this.eventCards.getByRole('heading').allTextContents();
    return titles.map(title => title.trim());
  }

  async getEventCount(): Promise<number> {
    return this.eventCards.count();
  }

  async isEventCardVisible(eventName: string): Promise<boolean> {
    return this.eventCard(eventName).root.isVisible();
  }

  async logout(): Promise<void> {
    await this.header.logout();
  }

  async isHeaderVisible(): Promise<boolean> {
    return this.header.navbar.isVisible();
  }

  async isUserLoggedIn(): Promise<boolean> {
    return this.header.userEmailDisplay.isVisible();
  }
}
