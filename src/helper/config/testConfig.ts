import { envConfig, baseUrl, apiUrl } from '../../config/env.config';

export const env = envConfig.env;
export const baseUrlUI = baseUrl;
export const baseUrlApi = apiUrl;

export const TEST_TIMEOUT = {
  SHORT: 10000,
  MEDIUM: 30000,
  LONG: 60000,
  EXTENDED: 120000,
} as const;

export { envConfig };
