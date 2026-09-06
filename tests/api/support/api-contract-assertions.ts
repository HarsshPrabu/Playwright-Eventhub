import { expect } from '@playwright/test';
import {
  BOOKING_STATUSES,
  Booking,
  Event,
  EVENT_CATEGORIES,
  PaginatedResponse,
} from '../../../src/api/models/EventHubModels';

export function expectPagination<T>(response: PaginatedResponse<T>): void {
  expect(response.success).toBe(true);
  expect(Array.isArray(response.data)).toBe(true);
  expect(response.pagination).toEqual(expect.objectContaining({
    total: expect.any(Number),
    page: expect.any(Number),
    limit: expect.any(Number),
    totalPages: expect.any(Number),
  }));
  expect(response.pagination.page).toBeGreaterThanOrEqual(1);
  expect(response.pagination.limit).toBeGreaterThan(0);
  expect(response.pagination.total).toBeGreaterThanOrEqual(response.data.length);
  expect(response.pagination.totalPages).toBeGreaterThanOrEqual(0);
}

export function expectEventContract(event: Event): void {
  expect(event).toEqual(expect.objectContaining({
    id: expect.any(Number),
    title: expect.any(String),
    description: expect.any(String),
    category: expect.any(String),
    venue: expect.any(String),
    city: expect.any(String),
    eventDate: expect.any(String),
    price: expect.any(String),
    totalSeats: expect.any(Number),
    availableSeats: expect.any(Number),
  }));
  expect(EVENT_CATEGORIES).toContain(event.category);
}

export function expectBookingContract(booking: Booking): void {
  expect(booking).toEqual(expect.objectContaining({
    id: expect.any(Number),
    eventId: expect.any(Number),
    customerName: expect.any(String),
    customerEmail: expect.any(String),
    customerPhone: expect.any(String),
    quantity: expect.any(Number),
    totalPrice: expect.any(String),
    status: expect.any(String),
    bookingRef: expect.any(String),
  }));
  expect(BOOKING_STATUSES).toContain(booking.status);
}
