import { Locator, Page } from '@playwright/test';
import { EventCard } from '../../components/events/EventCard';
import { ApiWaitHelper } from '../../../helpers/ApiWaitHelper';
import { BasePage } from '../BasePage';

export const eventCategories = ['Conference', 'Concert', 'Sports', 'Workshop', 'Festival'] as const;
export type EventCategory = typeof eventCategories[number];

export const eventCities = ['Mumbai', 'Bangalore', 'Delhi', 'Hyderabad', 'Chennai', 'Pune'] as const;
export type EventCity = typeof eventCities[number];

/** Page object for browsing, filtering, and opening EventHub events. */
export class EventsPage extends BasePage {
  readonly pageHeading: Locator;
  readonly pageDescription: Locator;
  readonly searchInput: Locator;
  readonly categorySelect: Locator;
  readonly citySelect: Locator;
  readonly eventCards: Locator;
  readonly addNewEventLink: Locator;
  readonly emptyEventsMessage: Locator;
  private readonly apiWaitHelper: ApiWaitHelper;

  constructor(page: Page) {
    super(page);

    const main = page.getByRole('main');
    this.pageHeading = main.getByRole('heading', { name: 'Upcoming Events', exact: true });
    this.pageDescription = main.getByText('Find your next unforgettable experience', { exact: true });
    this.searchInput = main.getByPlaceholder('Search events, venues…', { exact: true });
    this.categorySelect = main.locator('select').filter({ has: page.locator('option[value="Conference"]') });
    this.citySelect = main.locator('select').filter({ has: page.locator('option[value="Mumbai"]') });
    this.eventCards = main.getByTestId('event-card');
    this.addNewEventLink = main.getByRole('link', { name: 'Add New Event', exact: true });
    this.emptyEventsMessage = main.getByText(/No events(?: found| available)?/i);
    this.apiWaitHelper = new ApiWaitHelper(page);
  }

  async navigate(): Promise<void> {
    await Promise.all([
      this.apiWaitHelper.forResponse(response =>
        response.url().includes('/api/events') &&
        response.request().method() === 'GET' &&
        (response.ok() || response.status() === 304)
      ),
      this.navigateTo('/events'),
    ]);
  }

  async searchEvents(searchTerm: string): Promise<void> {
    await this.searchInput.fill(searchTerm);
  }

  async filterByCategory(category: EventCategory | ''): Promise<void> {
    await this.categorySelect.selectOption(category);
  }

  async filterByCity(city: EventCity | ''): Promise<void> {
    await this.citySelect.selectOption(city);
  }

  async clearFilters(): Promise<void> {
    await this.searchEvents('');
    await this.filterByCategory('');
    await this.filterByCity('');
  }

  eventCard(eventName: string): EventCard {
    return new EventCard(this.eventCards, eventName);
  }

  async openEventDetails(eventName: string): Promise<void> {
    await this.eventCard(eventName).openDetails();
  }

  async bookEvent(eventName: string): Promise<void> {
    await this.eventCard(eventName).bookNowButton.click();
  }

  async getEventCount(): Promise<number> {
    return this.eventCards.count();
  }

  async getEventTitles(): Promise<string[]> {
    const titles = await this.eventCards.getByRole('heading').allTextContents();
    return titles.map(title => title.trim());
  }

  async isEmpty(): Promise<boolean> {
    return (await this.getEventCount()) === 0;
  }

  async isEmptyMessageVisible(): Promise<boolean> {
    return this.emptyEventsMessage.isVisible();
  }
}
