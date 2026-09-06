import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

type RawEnvironment = Record<string, string>;
const supportedEnvironments = ['dev', 'qa', 'staging', 'prod'] as const;
type EnvironmentName = typeof supportedEnvironments[number];
export type DiagnosticsMode = 'off' | 'failure' | 'always';

function readEnvFile(filePath: string): RawEnvironment {
  return fs.existsSync(filePath) ? dotenv.parse(fs.readFileSync(filePath)) : {};
}

const baseValues = readEnvFile(path.resolve(process.cwd(), '.env'));
const environment = (process.env.TEST_ENV || baseValues.TEST_ENV || 'dev') as EnvironmentName;

if (!supportedEnvironments.includes(environment)) {
  throw new Error(`Unsupported TEST_ENV "${environment}". Use: ${supportedEnvironments.join(', ')}.`);
}

const environmentPath = path.resolve(process.cwd(), `.env.${environment}`);
const environmentValues = readEnvFile(environmentPath);

if (environment !== 'dev' && !fs.existsSync(environmentPath) && (!process.env.BASE_URL || !process.env.API_URL)) {
  throw new Error(`Missing ${environmentPath}. Provide the environment file or explicit BASE_URL and API_URL variables.`);
}

// CI/process variables always win over environment files; environment files win over .env.
const values: RawEnvironment = {
  ...baseValues,
  ...environmentValues,
  ...Object.fromEntries(Object.entries(process.env).filter((entry): entry is [string, string] => entry[1] !== undefined)),
};

const isCI = values.CI === 'true' || values.CI === '1';

function requiredUrl(name: string, fallback?: string): string {
  const value = values[name] || fallback;
  if (!value) throw new Error(`${name} must be configured for ${environment} execution.`);
  try {
    return new URL(value).toString().replace(/\/$/, '');
  } catch {
    throw new Error(`${name} must be a valid absolute URL.`);
  }
}

function booleanValue(name: string, fallback: boolean): boolean {
  const value = values[name];
  if (value === undefined) return fallback;
  if (value === 'true') return true;
  if (value === 'false') return false;
  throw new Error(`${name} must be either true or false.`);
}

function positiveInteger(name: string, fallback: number): number {
  const parsed = Number(values[name] ?? fallback);
  if (!Number.isInteger(parsed) || parsed <= 0) throw new Error(`${name} must be a positive integer.`);
  return parsed;
}

function diagnosticsModeValue(name: string): DiagnosticsMode {
  const value = values[name] ?? 'failure';
  if (value === 'off' || value === 'failure' || value === 'always') return value;
  throw new Error(`${name} must be one of: off, failure, always.`);
}

const defaultBaseUrl = isCI ? undefined : 'https://eventhub.rahulshettyacademy.com';
const defaultApiUrl = isCI ? undefined : 'https://api.eventhub.rahulshettyacademy.com/api';

export interface EnvironmentConfig {
  env: EnvironmentName;
  isCI: boolean;
  baseUrl: string;
  apiUrl: string;
  headless: boolean;
  incognito: boolean;
  debugApi: boolean;
  uiDiagnostics: DiagnosticsMode;
  apiDiagnostics: DiagnosticsMode;
  ignoreHTTPSErrors: boolean;
  workers?: number;
  timeout: { default: number; navigation: number; action: number; expect: number };
  credentials: { userName?: string; password?: string };
  database: {
    host?: string;
    port: number;
    database?: string;
    user?: string;
    password?: string;
    poolMax: number;
    ssl: boolean;
  };
}

export const envConfig: EnvironmentConfig = {
  env: environment,
  isCI,
  baseUrl: requiredUrl('BASE_URL', defaultBaseUrl),
  apiUrl: requiredUrl('API_URL', defaultApiUrl),
  headless: booleanValue('HEADLESS', true),
  incognito: booleanValue('INCOGNITO', false),
  debugApi: booleanValue('DEBUG_API', false),
  uiDiagnostics: diagnosticsModeValue('UI_DIAGNOSTICS'),
  apiDiagnostics: diagnosticsModeValue('API_DIAGNOSTICS'),
  ignoreHTTPSErrors: booleanValue('IGNORE_HTTPS_ERRORS', false),
  workers: values.WORKERS ? positiveInteger('WORKERS', 1) : undefined,
  timeout: {
    default: positiveInteger('DEFAULT_TIMEOUT', 30000),
    navigation: positiveInteger('NAVIGATION_TIMEOUT', 30000),
    action: positiveInteger('ACTION_TIMEOUT', 15000),
    expect: positiveInteger('EXPECT_TIMEOUT', 10000),
  },
  credentials: { userName: values.USER_NAME, password: values.USER_PASSWORD },
  database: {
    host: values.DB_HOST,
    port: positiveInteger('DB_PORT', 5432),
    database: values.DB_NAME,
    user: values.DB_USER,
    password: values.DB_PASSWORD,
    poolMax: positiveInteger('DB_POOL_MAX', 5),
    ssl: booleanValue('DB_SSL', false),
  },
};

export const baseUrl = envConfig.baseUrl;
export const apiUrl = envConfig.apiUrl;
