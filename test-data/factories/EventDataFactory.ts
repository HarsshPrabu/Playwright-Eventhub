import { CreateEventInput, Event } from '../../src/api/models/EventHubModels';
import { TestDataUtil } from '../../src/helpers/TestDataUtil';
import { TEST_DATA_LIMITS, TEST_DATA_VALUES } from '../test-data.constants';

export class EventDataFactory {
  static build(overrides: Partial<CreateEventInput> = {}): CreateEventInput {
    return {
      title: `Automation Event ${TestDataUtil.randomUuid()}`,
      description: 'Automated test event.',
      category: TEST_DATA_VALUES.category,
      venue: TEST_DATA_VALUES.venue,
      city: TEST_DATA_VALUES.city,
      eventDate: new Date(Date.now() + 86_400_000).toISOString(),
      price: TEST_DATA_VALUES.price,
      totalSeats: TEST_DATA_LIMITS.standardEventSeats,
      ...overrides,
    };
  }
}

export type CreatedEvent = Event;
