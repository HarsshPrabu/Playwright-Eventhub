import { Client, ClientConfig, QueryResult } from 'pg';
import { envConfig } from '../../config/env.config';

export class DatabaseUtil {
  private static client: Client | null = null;

  static getConfig(): ClientConfig {
    const { host, port, database, user, password } = envConfig.database;
    return {
      host: host || process.env.DB_HOST || 'localhost',
      port: port || (process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432),
      database: database || process.env.DB_NAME || '',
      user: user || process.env.DB_USER || '',
      password: password || process.env.DB_PASSWORD || '',
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
    };
  }

  static async connect(): Promise<Client> {
    if (this.client) {
      return this.client;
    }

    const config = this.getConfig();
    this.client = new Client(config);

    try {
      await this.client.connect();
      console.log(`✅ Successfully connected to database: ${config.database}@${config.host}`);
      return this.client;
    } catch (error: any) {
      console.error(`❌ Failed to connect to database:`, error.message);
      this.client = null;
      throw new Error(`Database connection failed: ${error.message}`);
    }
  }

  static async query<T = any>(sql: string, params: any[] = []): Promise<QueryResult<T>> {
    const client = await this.connect();
    try {
      return await client.query<T>(sql, params);
    } catch (error: any) {
      console.error(`❌ Database query failed:`, error.message);
      throw error;
    }
  }

  static async disconnect(): Promise<void> {
    if (this.client) {
      try {
        await this.client.end();
        console.log(`🔌 Database connection closed`);
      } catch (error: any) {
        console.error(`❌ Error disconnecting database:`, error.message);
      } finally {
        this.client = null;
      }
    }
  }
}

// Backwards-compatible standalone helpers
export async function connectToDb(): Promise<Client> {
  return await DatabaseUtil.connect();
}

export async function disconnectFromDb(): Promise<void> {
  await DatabaseUtil.disconnect();
}