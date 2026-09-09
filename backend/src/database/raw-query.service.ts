import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pool } from 'pg';

@Injectable()
export class RawQueryService {
  private pool: Pool;

  constructor(private configService: ConfigService) {
    const databaseUrl = this.configService.get('DATABASE_URL');
    this.pool = new Pool({
      connectionString: databaseUrl,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    // Handle pool errors
    this.pool.on('error', (err) => {
      console.error('Unexpected error on idle client', err);
    });
  }

  async query(sql: string, params: any[] = []): Promise<any> {
    const client = await this.pool.connect();
    try {
      const result = await client.query(sql, params);
      return result.rows;
    } finally {
      client.release();
    }
  }

  async queryOne(sql: string, params: any[] = []): Promise<any> {
    const rows = await this.query(sql, params);
    return rows.length > 0 ? rows[0] : null;
  }

  async queryExists(sql: string, params: any[] = []): Promise<boolean> {
    const result = await this.queryOne(sql, params);
    return result !== null;
  }

  async execute(sql: string, params: any[] = []): Promise<number> {
    const client = await this.pool.connect();
    try {
      const result = await client.query(sql, params);
      return result.rowCount || 0;
    } finally {
      client.release();
    }
  }

  async close(): Promise<void> {
    await this.pool.end();
  }
}
