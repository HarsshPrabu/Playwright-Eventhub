import { test, expect } from '../../src/fixtures/base.fixture';
import { TestDataUtil } from '../../src/helper/utils/TestDataUtil';

test.describe('API Integration Suite', () => {
  test('TC-API-001: Standalone BaseAPI - GET request with status, payload & SLA', async ({ baseApi }) => {
    const result = await baseApi.getJson<{ id: number; title: string; body: string }>('/posts/1');

    // 1. Assert status code
    expect(result.status).toBe(200);

    // 2. Assert response payload
    expect(result.data).toHaveProperty('id', 1);
    expect(result.data).toHaveProperty('title');
    expect(result.data).toHaveProperty('body');

    // 3. Response time SLA (< 3000ms)
    expect(result.durationMs).toBeLessThan(3000);
  });

  test('TC-API-002: API Service Object (UserAPI) - Create dynamic user', async ({ userApi }) => {
    const randomUser = {
      name: TestDataUtil.randomFirstName() + ' ' + TestDataUtil.randomLastName(),
      email: TestDataUtil.randomEmail(),
    };

    const result = await userApi.createUser(randomUser);
    expect([200, 201]).toContain(result.status);
    expect(result.data.email).toBe(randomUser.email);
    expect(result.data).toHaveProperty('id');
  });

  test('TC-API-003: API Service Object (UserAPI) - Fetch user by ID', async ({ userApi }) => {
    const result = await userApi.getUser(1);
    expect(result.status).toBe(200);
    expect(result.data.id).toBe(1);
    expect(result.data.email).toBeDefined();
  });
});
