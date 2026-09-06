import { Locator, Page } from '@playwright/test';
import { ApiWaitHelper } from '../../../helpers/ApiWaitHelper';
import { BasePage } from '../BasePage';
import { EventSummary } from '../../components/events/EventSummary';
import { TicketBookingForm } from '../../components/events/TicketBookingForm';
import { BookingConfirmation } from '../../components/events/BookingConfirmation';

/** Page object for viewing an event and booking its tickets. */
export class EventDetailsPage extends BasePage {
  readonly eventSummary: EventSummary;
  readonly bookingForm: TicketBookingForm;
  readonly bookingConfirmation: BookingConfirmation;
  readonly backToEventsLink: Locator;
  private readonly apiWaitHelper: ApiWaitHelper;

  constructor(page: Page) {
    super(page);

    const main = page.getByRole('main');
    this.eventSummary = new EventSummary(main);
    this.bookingForm = new TicketBookingForm(page);
    this.bookingConfirmation = new BookingConfirmation(page);
    this.backToEventsLink = main
      .getByRole('navigation')
      .getByRole('link', { name: 'Events', exact: true });
    this.apiWaitHelper = new ApiWaitHelper(page);
  }

  async navigate(eventId: number): Promise<void> {
    await Promise.all([
      this.apiWaitHelper.forResponse(response =>
        response.url().includes(`/api/events/${eventId}`) &&
        response.request().method() === 'GET' &&
        (response.ok() || response.status() === 304)
      ),
      this.navigateTo(`/events/${eventId}`),
    ]);
  }

  async backToEvents(): Promise<void> {
    await this.backToEventsLink.click();
  }
}
