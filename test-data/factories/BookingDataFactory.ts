import { Booking, CreateBookingInput } from '../../src/api/models/EventHubModels';
import { TestDataUtil } from '../../src/helpers/TestDataUtil';
import { TEST_DATA_LIMITS, TEST_DATA_VALUES } from '../test-data.constants';

export class BookingDataFactory {
  static build(eventId: number, overrides: Partial<CreateBookingInput> = {}): CreateBookingInput {
    return {
      eventId,
      customerName: `Automation Customer ${TestDataUtil.randomString(8)}`,
      customerEmail: `automation-${TestDataUtil.randomString(10)}@example.com`,
      customerPhone: TEST_DATA_VALUES.phone,
      quantity: TEST_DATA_LIMITS.standardTicketQuantity,
      ...overrides,
    };
  }
}

export type CreatedBooking = Booking;
