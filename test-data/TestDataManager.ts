import { test } from '@playwright/test';
import { CreateBookingInput, CreateEventInput, Event } from '../src/api/models/EventHubModels';
import { EventHubAPI } from '../src/api/services/EventHubAPI';
import { ApiRequestError } from '../src/api/errors/ApiRequestError';
import { BookingDataFactory, CreatedBooking } from './factories/BookingDataFactory';
import { EventDataFactory } from './factories/EventDataFactory';

/** Test-owned records. Always clean bookings before their parent events. */
export class TestDataManager {
  private readonly eventIds = new Set<number>();
  private readonly bookingIds = new Set<number>();

  async createEvent(api: EventHubAPI, input: Partial<CreateEventInput> = {}): Promise<Event> {
    const result = await api.createEvent(EventDataFactory.build(input));
    const event = result.data.data;
    this.eventIds.add(event.id);
    await this.log('Created event', { id: event.id, title: event.title });
    return event;
  }

  async createBooking(api: EventHubAPI, eventId: number, input: Partial<CreateBookingInput> = {}): Promise<CreatedBooking> {
    const result = await api.createBooking(BookingDataFactory.build(eventId, input));
    const booking = result.data.data;
    this.bookingIds.add(booking.id);
    await this.log('Created booking', { id: booking.id, reference: booking.bookingRef });
    return booking;
  }

  trackBooking(bookingId: number): void {
    this.bookingIds.add(bookingId);
  }

  async cleanup(api: EventHubAPI): Promise<void> {
    for (const bookingId of this.bookingIds) {
      try {
        await api.cancelBooking(bookingId);
        await this.log('Cleaned up booking', { id: bookingId });
      } catch (error) {
        if (error instanceof ApiRequestError && error.status === 404) {
          await this.log('Booking already removed during test; cleanup complete', { id: bookingId });
          continue;
        }
        console.warn(`Test-data cleanup failed for booking ${bookingId}.`, error);
      }
    }

    for (const eventId of this.eventIds) {
      try {
        await api.deleteEvent(eventId);
        await this.log('Cleaned up event', { id: eventId });
      } catch (error) {
        console.warn(`Test-data cleanup failed for event ${eventId}.`, error);
      }
    }
  }

  private async log(message: string, details: Record<string, number | string>): Promise<void> {
    await test.info().attach('test-data', {
      body: `${message}: ${JSON.stringify(details)}`,
      contentType: 'text/plain',
    });
  }
}
