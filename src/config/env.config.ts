import dotenv from 'dotenv';
import path from 'path';

// Load base .env first, then optionally override with .env.<env> if it exists
dotenv.config();

const environment = process.env.TEST_ENV || 'dev';
dotenv.config({ path: path.resolve(process.cwd(), `.env.${environment}`) });

export interface EnvironmentConfig {
  env: string;
  baseUrl: string;
  apiUrl: string;
  headless: boolean;
  browser: string;
  timeout: {
    default: number;
    navigation: number;
    action: number;
  };
  credentials: {
    userName?: string;
    password?: string;
  };
  database: {
    host?: string;
    port?: number;
    database?: string;
    user?: string;
    password?: string;
  };
}

export const envConfig: EnvironmentConfig = {
  env: environment,
  baseUrl: process.env.BASE_URL || 'https://demo.playwright.dev/todomvc',
  apiUrl: process.env.API_URL || 'https://jsonplaceholder.typicode.com',
  headless: process.env.HEADLESS !== 'false',
  browser: process.env.BROWSER || 'chromium',
  timeout: {
    default: parseInt(process.env.DEFAULT_TIMEOUT || '30000', 10),
    navigation: parseInt(process.env.NAVIGATION_TIMEOUT || '30000', 10),
    action: parseInt(process.env.ACTION_TIMEOUT || '15000', 10),
  },
  credentials: {
    userName: process.env.USER_NAME || '',
    password: process.env.USER_PASSWORD || '',
  },
  database: {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  },
};

export const baseUrl = envConfig.baseUrl;
export const apiUrl = envConfig.apiUrl;
