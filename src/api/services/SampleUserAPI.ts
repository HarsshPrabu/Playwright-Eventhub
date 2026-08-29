import { BaseAPI, ApiResponseResult } from '../BaseAPI';

export interface UserPayload {
  name: string;
  email: string;
  username?: string;
}

export interface UserResponse extends UserPayload {
  id: number;
}

/**
 * Sample API Service Object extending BaseAPI.
 * Encapsulates backend endpoints and data contracts for user management.
 */
export class SampleUserAPI extends BaseAPI {
  async getUser(id: number | string): Promise<ApiResponseResult<UserResponse>> {
    return await this.getJson<UserResponse>(`/users/${id}`);
  }

  async createUser(payload: UserPayload): Promise<ApiResponseResult<UserResponse>> {
    return await this.postJson<UserResponse>('/users', payload);
  }

  async updateUser(id: number | string, payload: Partial<UserPayload>): Promise<ApiResponseResult<UserResponse>> {
    return await this.putJson<UserResponse>(`/users/${id}`, payload);
  }

  async deleteUser(id: number | string) {
    return await this.delete(`/users/${id}`);
  }
}
