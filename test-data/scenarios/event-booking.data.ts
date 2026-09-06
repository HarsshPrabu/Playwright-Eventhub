import { TEST_DATA_LIMITS, TEST_DATA_VALUES } from '../test-data.constants';

export interface BookingCustomerData {
  name: string;
  phone: string;
  email?: string;
  emailFallback?: string;
}

export const eventBookingScenarios = {
  successful: {
    testCaseId: 'EVT-DETAIL-007',
    event: {
      price: 150,
      totalSeats: TEST_DATA_LIMITS.standardEventSeats,
    },
    booking: {
      quantity: TEST_DATA_LIMITS.successfulBookingQuantity,
    },
    customer: {
      name: 'Automation Customer',
      emailFallback: 'p0@example.com',
      phone: TEST_DATA_VALUES.phone,
    } satisfies BookingCustomerData,
  },
  insufficientSeats: {
    testCaseId: 'EVT-DETAIL-009',
    apiTestCaseId: 'API-BKG-001',
    event: {
      totalSeats: TEST_DATA_LIMITS.singleSeatEventSeats,
    },
    booking: {
      quantity: TEST_DATA_LIMITS.successfulBookingQuantity,
    },
    customer: {
      name: 'Over Capacity Customer',
      email: 'over-capacity@example.com',
      phone: TEST_DATA_VALUES.phone,
    } satisfies BookingCustomerData,
  },
} as const;
