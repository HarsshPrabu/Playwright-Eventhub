import { PoolConfig } from 'pg';
import { envConfig } from '../config/env.config';

/** Builds and validates database configuration only when DB access is requested. */
export function getDatabaseConfig(): PoolConfig {
  const { host, port, database, user, password, poolMax } = envConfig.database;
  const missing = [
    ['DB_HOST', host],
    ['DB_NAME', database],
    ['DB_USER', user],
    ['DB_PASSWORD', password],
  ].filter(([, value]) => !value).map(([name]) => name);

  if (missing.length > 0) {
    throw new Error(`Database configuration is incomplete. Missing: ${missing.join(', ')}`);
  }

  return {
    host,
    port,
    database,
    user,
    password,
    max: poolMax,
    ssl: envConfig.database.ssl ? { rejectUnauthorized: false } : undefined,
  };
}
