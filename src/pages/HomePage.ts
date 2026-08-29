import { Page, Locator, expect } from "@playwright/test";
import { BasePage } from "./BasePage";

/**
 * HomePage Page Object Model reflecting the EventHub UI.
 * Utilizes stable data-testid attributes for reliable locators.
 */
export class HomePage extends BasePage {
  // Primary navigation tabs
  readonly navHome: Locator;
  readonly navEvents: Locator;
  readonly navBookings: Locator;

  // User profile and logout
  readonly userProfile: Locator;
  readonly logoutButton: Locator;

  // Event cards collection
  readonly eventCards: Locator; // all cards
  readonly eventTitle: (name: string) => Locator; // title within a specific card

  constructor(page: Page) {
    super(page);
    // Navigation
    // Use Playwright's getByTestId for stable navigation locators
    this.navHome = page.getByTestId('nav-home');
    this.navEvents = page.getByTestId('nav-events');
    this.navBookings = page.getByTestId('nav-bookings');

    // User actions
    // User actions using getByTestId / getByRole for clarity
    this.userProfile = page.getByTestId('user-profile');
    // Assuming the logout control is a button with visible text 'Logout'
    this.logoutButton = page.getByRole('button', { name: /Logout/i });

    // Event cards
    // Event cards collection using getByTestId
    this.eventCards = page.getByTestId('event-card');
    // Helper that finds an event title within a card by text
    this.eventTitle = (name: string) =>
      this.eventCards.filter({ hasText: name }).locator('[data-testid="event-title"]');
  }

  /** Navigate to a specific section using the top navigation */
  async navigateToSection(section: "home" | "events" | "bookings"): Promise<void> {
    const locatorMap = {
      home: this.navHome,
      events: this.navEvents,
      bookings: this.navBookings,
    } as const;
    await this.click(locatorMap[section]);
  }

  /** Click on an event card by its visible name */
  async clickEventByName(name: string): Promise<void> {
    const card = this.eventTitle(name);
    await this.click(card);
  }

  /** Retrieve all visible event titles on the page */
  async getEventTitles(): Promise<string[]> {
    const titles = await this.eventCards.locator('[data-testid="event-title"]').allTextContents();
    return titles.map(t => t.trim());
  }

  /** Verify a specific event card is visible */
  async isEventCardVisible(eventName: string): Promise<boolean> {
    const card = this.eventTitle(eventName);
    return await this.isVisible(card);
  }

  /** Perform logout using the profile dropdown */
  async logout(): Promise<void> {
    await this.click(this.userProfile);
    await this.click(this.logoutButton);
  }

  /** Example utility to check header visibility (kept for backward compatibility) */
  async isHeaderVisible(): Promise<boolean> {
    const header = this.page.getByTestId('nav-home');
    await expect(header).toBeVisible({ timeout: 3000 });
    return true;
  }

  /** Search events by name using the search input */
  async searchEvent(name: string): Promise<void> {
    const searchInput = this.page.getByPlaceholder('Search events');
    await this.fillInput(searchInput, name);
    await this.pressKey('Enter');
  }

  /** Filter events by category using a dropdown */
  async filterByCategory(category: string): Promise<void> {
    const dropdown = this.page.getByLabel('Category');
    await dropdown.selectOption({ label: category });
  }

  /** Return the total number of event cards displayed */
  async getEventCount(): Promise<number> {
    return await this.eventCards.count();
  }

  /** Open the detail view of an event by its title */
  async openEventDetail(eventName: string): Promise<void> {
    const card = this.eventTitle(eventName);
    await this.click(card);
  }

  /** Verify that the user is logged in (profile icon visible) */
  async isUserLoggedIn(): Promise<boolean> {
    return await this.isVisible(this.userProfile);
  }

  /** Wait for any loading spinner to disappear */
  async waitForLoadingSpinner(): Promise<void> {
    const spinner = this.page.getByTestId('loading-spinner');
    await this.page.waitForSelector('[data-testid="loading-spinner"]', { state: 'detached' });
  }
}
