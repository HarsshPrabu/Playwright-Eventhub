import { TEST_DATA_VALUES } from '../test-data.constants';

export const customerBookingScenarios = {
  ownedBooking: {
    testCaseId: 'BKG-CUST-001',
    customerEmail: 'configured-customer',
    customerPhone: TEST_DATA_VALUES.phone,
    quantity: 1,
  },
  cancellableBooking: {
    testCaseId: 'BKG-CUST-005',
    customerEmail: 'configured-customer',
    customerPhone: TEST_DATA_VALUES.phone,
    quantity: 1,
  },
} as const;
