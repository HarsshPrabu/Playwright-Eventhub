import { TEST_DATA_VALUES } from '../test-data.constants';

export const adminBookingScenarios = {
  cancellableBooking: {
    testCaseId: 'ADM-BKG-004',
    customerEmail: 'configured-customer',
    customerPhone: TEST_DATA_VALUES.phone,
    quantity: 1,
  },
} as const;
