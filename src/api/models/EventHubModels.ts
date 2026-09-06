export const EVENT_CATEGORIES = [
  'Conference',
  'Concert',
  'Sports',
  'Workshop',
  'Festival',
] as const;

export type EventCategory = typeof EVENT_CATEGORIES[number];
export const BOOKING_STATUSES = [
  'confirmed',
  'cancelled',
] as const;

export type BookingStatus = typeof BOOKING_STATUSES[number];

export interface AuthInput {
  email: string;
  password: string;
}

export interface AuthUser {
  id: number;
  email: string;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: AuthUser;
}

export interface MeUser {
  userId: number;
  email: string;
}

export interface MeResponse {
  success: boolean;
  user: MeUser;
}

export interface Event {
  id: number;
  title: string;
  description: string;
  category: EventCategory;
  venue: string;
  city: string;
  eventDate: string;
  /** PostgreSQL numeric values are serialized as strings by the API. */
  price: string;
  totalSeats: number;
  availableSeats: number;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEventInput {
  title: string;
  description?: string;
  category: EventCategory;
  venue: string;
  city: string;
  eventDate: string;
  price: number;
  totalSeats: number;
  imageUrl?: string;
}

export interface Booking {
  id: number;
  eventId: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  quantity: number;
  /** PostgreSQL numeric values are serialized as strings by the API. */
  totalPrice: string;
  status: BookingStatus;
  bookingRef: string;
  createdAt: string;
  updatedAt: string;
  event: Event;
}

export interface CreateBookingInput {
  eventId: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  quantity: number;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: PaginationMeta;
}

export interface ResourceResponse<T> {
  success: boolean;
  data: T;
}

export interface ErrorResponse {
  success: false;
  error: string;
}

export interface ValidationErrorResponse extends ErrorResponse {
  details: unknown;
}

export interface HealthResponse {
  status: 'ok';
  timestamp: string;
  dbStatus: string;
}

export interface ConfigResponse {
  showExploreLinks: boolean;
}
