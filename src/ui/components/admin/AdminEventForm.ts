import { Locator, Page } from '@playwright/test';
import { CreateEventInput } from '../../../api/models/EventHubModels';

/** Form component for creating and editing admin-managed events. */
export class AdminEventForm {
  readonly root: Locator;
  readonly titleInput: Locator;
  readonly descriptionInput: Locator;
  readonly categorySelect: Locator;
  readonly cityInput: Locator;
  readonly venueInput: Locator;
  readonly dateInput: Locator;
  readonly priceInput: Locator;
  readonly totalSeatsInput: Locator;
  readonly imageUrlInput: Locator;
  readonly submitButton: Locator;

  constructor(page: Page) {
    this.root = page.getByTestId('admin-event-form');
    this.titleInput = this.root.getByTestId('event-title-input');
    this.descriptionInput = this.root.getByPlaceholder('Describe the event…', { exact: true });
    this.categorySelect = this.root.locator('#category');
    this.cityInput = this.root.locator('#city');
    this.venueInput = this.root.locator('#venue');
    this.dateInput = this.root.locator('[id="event-date-&-time"]');
    this.priceInput = this.root.locator('[id="price-($)"]');
    this.totalSeatsInput = this.root.locator('#total-seats');
    this.imageUrlInput = this.root.locator('[id="image-url-(optional)"]');
    // The application keeps this test ID for both create and edit modes.
    this.submitButton = this.root.getByTestId('add-event-btn');
  }

  async fill(input: CreateEventInput): Promise<void> {
    await this.titleInput.fill(input.title);
    await this.descriptionInput.fill(input.description ?? '');
    await this.categorySelect.selectOption(input.category);
    await this.cityInput.fill(input.city);
    await this.venueInput.fill(input.venue);
    await this.dateInput.fill(input.eventDate.slice(0, 16));
    await this.priceInput.fill(String(input.price));
    await this.totalSeatsInput.fill(String(input.totalSeats));
    await this.imageUrlInput.fill(input.imageUrl ?? '');
  }

  async submit(): Promise<void> {
    await this.submitButton.click();
  }
}
