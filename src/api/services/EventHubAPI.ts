import { APIRequestContext } from '@playwright/test';
import { ApiResponseResult, BaseAPI } from '../BaseAPI';
import {
  AuthInput,
  AuthResponse,
  Booking,
  BookingStatus,
  ConfigResponse,
  CreateBookingInput,
  CreateEventInput,
  Event,
  EventCategory,
  HealthResponse,
  MeResponse,
  PaginatedResponse,
  ResourceResponse,
} from '../models/EventHubModels';

export interface EventQuery {
  category?: EventCategory;
  city?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface BookingQuery {
  eventId?: number;
  status?: BookingStatus;
  page?: number;
  limit?: number;
}

/** Domain API service for both public and authenticated EventHub operations. */
export class EventHubAPI extends BaseAPI {
  constructor(requestContext: APIRequestContext, token?: string) {
    super(requestContext);
    if (token) {
      this.setAuthToken(token);
    }
  }

  async login(credentials: AuthInput): Promise<ApiResponseResult<AuthResponse>> {
    return this.postJson<AuthResponse, AuthInput>('/auth/login', credentials, {
      expectedStatus: 200,
    });
  }

  async register(credentials: AuthInput): Promise<ApiResponseResult<AuthResponse>> {
    return this.postJson<AuthResponse, AuthInput>('/auth/register', credentials, {
      expectedStatus: 201,
    });
  }

  async getEvents(query: EventQuery = {}): Promise<ApiResponseResult<PaginatedResponse<Event>>> {
    this.requireAuth('getEvents');
    return this.getJson<PaginatedResponse<Event>>('/events', {
      params: { page: 1, limit: 12, ...query },
      expectedStatus: 200,
    });
  }

  async getBookings(query: BookingQuery = {}): Promise<ApiResponseResult<PaginatedResponse<Booking>>> {
    this.requireAuth('getBookings');
    return this.getJson<PaginatedResponse<Booking>>('/bookings', {
      params: { page: 1, limit: 10, ...query },
      expectedStatus: 200,
    });
  }

  async getBookingsForEvent(eventId: number): Promise<ApiResponseResult<PaginatedResponse<Booking>>> {
    return this.getBookings({ eventId, limit: 100 });
  }

  async getCurrentUser(): Promise<ApiResponseResult<MeResponse>> {
    this.requireAuth('getCurrentUser');
    return this.getJson<MeResponse>('/auth/me', { expectedStatus: 200 });
  }

  async createEvent(input: CreateEventInput): Promise<ApiResponseResult<ResourceResponse<Event>>> {
    this.requireAuth('createEvent');
    return this.postJson<ResourceResponse<Event>, CreateEventInput>('/events', input, { expectedStatus: 201 });
  }

  async getEvent(id: number): Promise<ApiResponseResult<ResourceResponse<Event>>> {
    return this.getJson<ResourceResponse<Event>>(`/events/${id}`, { expectedStatus: 200 });
  }

  async updateEvent(id: number, input: CreateEventInput): Promise<ApiResponseResult<ResourceResponse<Event>>> {
    this.requireAuth('updateEvent');
    return this.putJson<ResourceResponse<Event>, CreateEventInput>(`/events/${id}`, input, { expectedStatus: 200 });
  }

  async deleteEvent(id: number): Promise<ApiResponseResult<unknown | null>> {
    this.requireAuth('deleteEvent');
    return this.deleteJson(`/events/${id}`, { expectedStatus: 200 });
  }

  async createBooking(input: CreateBookingInput): Promise<ApiResponseResult<ResourceResponse<Booking>>> {
    this.requireAuth('createBooking');
    return this.postJson<ResourceResponse<Booking>, CreateBookingInput>('/bookings', input, { expectedStatus: 201 });
  }

  async getBooking(id: number): Promise<ApiResponseResult<ResourceResponse<Booking>>> {
    this.requireAuth('getBooking');
    return this.getJson<ResourceResponse<Booking>>(`/bookings/${id}`, { expectedStatus: 200 });
  }

  async getBookingByRef(reference: string): Promise<ApiResponseResult<ResourceResponse<Booking>>> {
    this.requireAuth('getBookingByRef');
    return this.getJson<ResourceResponse<Booking>>(`/bookings/ref/${encodeURIComponent(reference)}`, { expectedStatus: 200 });
  }

  async cancelBooking(id: number): Promise<ApiResponseResult<unknown | null>> {
    this.requireAuth('cancelBooking');
    return this.deleteJson(`/bookings/${id}`, { expectedStatus: 200 });
  }

  async getHealth(): Promise<ApiResponseResult<HealthResponse>> {
    return this.getJson<HealthResponse>('/health', { expectedStatus: 200 });
  }

  async getConfig(): Promise<ApiResponseResult<ConfigResponse>> {
    return this.getJson<ConfigResponse>('/config', { expectedStatus: 200 });
  }

  private requireAuth(operation: string): void {
    if (!this.defaultHeaders.Authorization) {
      throw new Error(`An authenticated EventHubAPI client is required for ${operation}.`);
    }
  }
}
