import { Locator, Page } from '@playwright/test';
import { CreateEventInput } from '../../../api/models/EventHubModels';
import { AdminEventForm } from '../../components/admin/AdminEventForm';
import { AdminEventRow } from '../../components/admin/AdminEventRow';
import { NotificationToast } from '../../components/feedback/NotificationToast';
import { ApiWaitHelper } from '../../../helpers/ApiWaitHelper';
import { BasePage } from '../BasePage';

/** Page object for the authenticated Manage Events admin page. */
export class AdminEventsPage extends BasePage {
  readonly pageHeading: Locator;
  readonly eventForm: AdminEventForm;
  readonly eventRows: Locator;
  readonly totalEventsLabel: Locator;
  readonly notificationToast: NotificationToast;
  private readonly apiWaitHelper: ApiWaitHelper;

  constructor(page: Page) {
    super(page);

    const main = page.getByRole('main');
    this.pageHeading = main.getByRole('heading', { name: 'All Events', exact: true });
    this.eventForm = new AdminEventForm(page);
    this.eventRows = main.getByTestId('event-table-row');
    this.totalEventsLabel = main.getByText(/\d+ total/, { exact: true });
    this.notificationToast = new NotificationToast(page);
    this.apiWaitHelper = new ApiWaitHelper(page);
  }

  async navigate(): Promise<void> {
    await Promise.all([
      this.apiWaitHelper.forResponse(response =>
        response.url().includes('/api/events') &&
        response.url().includes('page=1') &&
        response.url().includes('limit=10') &&
        response.request().method() === 'GET' &&
        (response.ok() || response.status() === 304)
      ),
      this.navigateTo('/admin/events'),
    ]);
  }

  eventRow(eventTitle: string): AdminEventRow {
    return new AdminEventRow(this.eventRows.filter({ hasText: eventTitle }), eventTitle);
  }

  async getEventCount(): Promise<number> {
    return this.eventRows.count();
  }

  async createEvent(input: CreateEventInput): Promise<void> {
    await this.eventForm.fill(input);
    await Promise.all([
      this.apiWaitHelper.forResponse(response =>
        response.url().endsWith('/api/events') &&
        response.request().method() === 'POST' &&
        response.ok()
      ),
      this.eventForm.submit(),
    ]);
  }

  async deleteEvent(eventTitle: string): Promise<void> {
    const row = this.eventRow(eventTitle);
    await row.delete();

    const confirmationDialog = this.page.getByRole('dialog');
    await Promise.all([
      this.apiWaitHelper.forResponse(response =>
        response.url().includes('/api/events/') &&
        response.request().method() === 'DELETE' &&
        response.ok()
      ),
      confirmationDialog
        .getByRole('button', { name: 'Delete event', exact: true })
      .click(),
    ]);
  }

  async editEvent(currentTitle: string, input: CreateEventInput): Promise<void> {
    await this.eventRow(currentTitle).edit();
    await this.eventForm.fill(input);
    await Promise.all([
      this.apiWaitHelper.forResponse(response =>
        response.url().includes('/api/events/') &&
        response.request().method() === 'PUT' &&
        response.ok()
      ),
      this.eventForm.submit(),
    ]);
  }
}
