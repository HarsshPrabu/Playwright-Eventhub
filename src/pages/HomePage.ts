import { Locator, Page } from "@playwright/test";
import { BasePage } from "./BasePage";

/** Page object for the authenticated EventHub home page. */
export class HomePage extends BasePage {
  readonly navbar: Locator;
  readonly navHome: Locator;
  readonly navEvents: Locator;
  readonly navBookings: Locator;
  readonly apiDocsLink: Locator;
  readonly adminButton: Locator;
  readonly mobileMenuButton: Locator;
  readonly userEmailDisplay: Locator;
  readonly logoutButton: Locator;
  readonly browseEventsLink: Locator;
  readonly heroBookingsLink: Locator;
  readonly viewAllEventsLink: Locator;
  readonly exploreAllEventsButton: Locator;
  readonly eventCards: Locator;

  constructor(page: Page) {
    super(page);

    this.navbar = page.locator('nav');
    this.navHome = page.getByTestId('nav-home');
    this.navEvents = page.getByTestId('nav-events');
    this.navBookings = page.getByTestId('nav-bookings');
    this.apiDocsLink = page.getByRole('link', { name: 'API Docs', exact: true });
    this.adminButton = page.getByRole('button', { name: 'Admin', exact: true });
    this.mobileMenuButton = page.getByRole('button', { name: 'Toggle menu', exact: true });
    this.userEmailDisplay = page.getByTestId('user-email-display');
    this.logoutButton = page.getByTestId('logout-btn');
    this.browseEventsLink = page.getByRole('link', { name: /Browse Events/ });
    this.heroBookingsLink = page.getByRole('link', { name: 'My Bookings', exact: true });
    this.viewAllEventsLink = page.getByRole('link', { name: /View all/ });
    this.exploreAllEventsButton = page.getByRole('button', { name: 'Explore All Events', exact: true });
    this.eventCards = page.getByTestId('event-card');
  }

  private eventCardByName(name: string): Locator {
    return this.eventCards.filter({ hasText: name });
  }

  eventTitle(name: string): Locator {
    return this.eventCardByName(name).getByRole('heading', { name, exact: true });
  }

  eventLink(name: string): Locator {
    return this.eventCardByName(name).getByRole('link', { name, exact: true });
  }

  bookNowButton(name: string): Locator {
    return this.eventCardByName(name).getByTestId('book-now-btn');
  }

  private navLocator(section: 'home' | 'events' | 'bookings'): Locator {
    const locatorMap = {
      home: this.navHome,
      events: this.navEvents,
      bookings: this.navBookings,
    } as const;

    return locatorMap[section];
  }

  async navigateToSection(section: 'home' | 'events' | 'bookings'): Promise<void> {
    const apiPathBySection = {
      home: undefined,
      events: '/api/events',
      bookings: '/api/bookings',
    } as const;
    const apiPath = apiPathBySection[section];
    const navItem = this.navLocator(section);

    if (!apiPath) {
      await navItem.click();
      return;
    }

    await Promise.all([
      this.page.waitForResponse(response =>
        response.url().includes(apiPath) &&
        response.request().method() === 'GET' &&
        (response.ok() || response.status() === 304)
      ),
      navItem.click(),
    ]);
  }

  async openEventDetail(eventName: string): Promise<void> {
    await this.eventLink(eventName).click();
  }

  async getEventTitles(): Promise<string[]> {
    const titles = await this.eventCards.getByRole('heading').allTextContents();
    return titles.map(title => title.trim());
  }

  async getEventCount(): Promise<number> {
    return this.eventCards.count();
  }

  async isEventCardVisible(eventName: string): Promise<boolean> {
    return this.eventCardByName(eventName).isVisible();
  }

  async logout(): Promise<void> {
    await this.logoutButton.click();
  }

  async isHeaderVisible(): Promise<boolean> {
    return this.navHome.isVisible();
  }

  async isUserLoggedIn(): Promise<boolean> {
    return this.userEmailDisplay.isVisible();
  }
}
