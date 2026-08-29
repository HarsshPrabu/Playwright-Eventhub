declare module 'pg' {
  export interface ClientConfig {
    host?: string;
    port?: number;
    database?: string;
    user?: string;
    password?: string;
    ssl?: boolean | { rejectUnauthorized?: boolean };
  }

  export interface QueryResult<T = any> {
    rows: T[];
    rowCount: number;
    command: string;
    fields: any[];
  }

  export class Client {
    constructor(config?: ClientConfig | string);
    connect(): Promise<void>;
    query<T = any>(queryText: string, values?: any[]): Promise<QueryResult<T>>;
    end(): Promise<void>;
  }
}
