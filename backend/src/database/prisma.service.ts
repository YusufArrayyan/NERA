import { Injectable } from '@nestjs/common';
import { RawQueryService } from './raw-query.service';

/**
 * HYBRID PRISMA STUB - Works with RawQueryService
 * Converts Prisma calls to raw SQL queries
 */
@Injectable()
export class PrismaService {
  constructor(private rawQuery: RawQueryService) {}

  private createDelegate(tableName: string) {
    return {
      findFirst: async ({ where = {}, orderBy = {} }: any = {}) => {
        try {
          const whereEntries = Object.entries(where);
          let query = `SELECT * FROM ${tableName}`;
          const params: any[] = [];
          let paramIndex = 1;

          if (whereEntries.length > 0) {
            const conditions = whereEntries.map(([key, value]) => {
              params.push(value);
              return `${key} = $${paramIndex++}`;
            });
            query += ` WHERE ${conditions.join(' AND ')}`;
          }

          if (Object.keys(orderBy).length > 0) {
            const order = Object.entries(orderBy).map(([key, val]: any) => 
              `${key} ${val === 'desc' ? 'DESC' : 'ASC'}`
            ).join(', ');
            query += ` ORDER BY ${order}`;
          }

          query += ` LIMIT 1`;
          const result = await this.rawQuery.queryOne(query, params);
          return result || null;
        } catch (error) {
          console.error(`findFirst failed on ${tableName}:`, error);
          throw error;
        }
      },

      findUnique: async ({ where }: any) => {
        try {
          const [key, value] = Object.entries(where)[0];
          const query = `SELECT * FROM ${tableName} WHERE ${key} = $1 LIMIT 1`;
          const result = await this.rawQuery.queryOne(query, [value]);
          return result || null;
        } catch (error) {
          console.error(`findUnique failed on ${tableName}:`, error);
          throw error;
        }
      },

      findMany: async ({ where = {}, orderBy = {}, take = null }: any = {}) => {
        try {
          const whereEntries = Object.entries(where);
          let query = `SELECT * FROM ${tableName}`;
          const params: any[] = [];
          let paramIndex = 1;

          if (whereEntries.length > 0) {
            const conditions = whereEntries.map(([key, value]) => {
              params.push(value);
              return `${key} = $${paramIndex++}`;
            });
            query += ` WHERE ${conditions.join(' AND ')}`;
          }

          if (Object.keys(orderBy).length > 0) {
            const order = Object.entries(orderBy).map(([key, val]: any) => 
              `${key} ${val === 'desc' ? 'DESC' : 'ASC'}`
            ).join(', ');
            query += ` ORDER BY ${order}`;
          }

          if (take) {
            query += ` LIMIT ${take}`;
          }

          const results = await this.rawQuery.query(query, params);
          return results || [];
        } catch (error) {
          console.error(`findMany failed on ${tableName}:`, error);
          throw error;
        }
      },

      count: async ({ where = {} }: any = {}) => {
        try {
          const whereEntries = Object.entries(where);
          let query = `SELECT COUNT(*) as count FROM ${tableName}`;
          const params: any[] = [];
          let paramIndex = 1;

          if (whereEntries.length > 0) {
            const conditions = whereEntries.map(([key, value]) => {
              params.push(value);
              return `${key} = $${paramIndex++}`;
            });
            query += ` WHERE ${conditions.join(' AND ')}`;
          }

          const result = await this.rawQuery.queryOne(query, params);
          return result?.count || 0;
        } catch (error) {
          console.error(`count failed on ${tableName}:`, error);
          return 0;
        }
      },

      create: async ({ data }: any) => {
        try {
          const keys = Object.keys(data).filter(k => data[k] !== undefined);
          if (keys.length === 0) throw new Error('No data to insert');
          
          const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
          const columns = keys.join(', ');
          const values = keys.map(k => data[k]);

          const query = `INSERT INTO ${tableName} (${columns}) VALUES (${placeholders}) RETURNING *`;
          const result = await this.rawQuery.queryOne(query, values);
          return result || data;
        } catch (error) {
          console.error(`create failed on ${tableName}:`, error);
          throw error;
        }
      },

      upsert: async ({ where, create, update }: any) => {
        try {
          const [key, value] = Object.entries(where)[0];
          const existing = await this.rawQuery.queryOne(
            `SELECT * FROM ${tableName} WHERE ${key} = $1 LIMIT 1`,
            [value]
          );

          if (existing) {
            const updateKeys = Object.keys(update).filter(k => update[k] !== undefined);
            if (updateKeys.length === 0) return existing;
            
            const setClause = updateKeys.map((k, i) => `${k} = $${i + 1}`).join(', ');
            const values = updateKeys.map(k => update[k]);
            values.push(value);
            const query = `UPDATE ${tableName} SET ${setClause} WHERE ${key} = $${updateKeys.length + 1} RETURNING *`;
            return await this.rawQuery.queryOne(query, values);
          } else {
            const createKeys = Object.keys(create).filter(k => create[k] !== undefined);
            const placeholders = createKeys.map((_, i) => `$${i + 1}`).join(', ');
            const columns = createKeys.join(', ');
            const values = createKeys.map(k => create[k]);
            const query = `INSERT INTO ${tableName} (${columns}) VALUES (${placeholders}) RETURNING *`;
            return await this.rawQuery.queryOne(query, values);
          }
        } catch (error) {
          console.error(`upsert failed on ${tableName}:`, error);
          throw error;
        }
      },

      update: async ({ where, data }: any) => {
        try {
          const [key, value] = Object.entries(where)[0];
          const updateKeys = Object.keys(data).filter(k => data[k] !== undefined);
          if (updateKeys.length === 0) return null;
          
          const setClause = updateKeys.map((k, i) => `${k} = $${i + 1}`).join(', ');
          const values = updateKeys.map(k => data[k]);
          values.push(value);
          const query = `UPDATE ${tableName} SET ${setClause} WHERE ${key} = $${updateKeys.length + 1} RETURNING *`;
          return await this.rawQuery.queryOne(query, values);
        } catch (error) {
          console.error(`update failed on ${tableName}:`, error);
          throw error;
        }
      },

      delete: async ({ where }: any) => {
        try {
          const [key, value] = Object.entries(where)[0];
          const query = `DELETE FROM ${tableName} WHERE ${key} = $1 RETURNING *`;
          return await this.rawQuery.queryOne(query, [value]);
        } catch (error) {
          console.error(`delete failed on ${tableName}:`, error);
          throw error;
        }
      },
    };
  }

  async $connect(): Promise<void> {
    // Stub - do nothing
  }

  // Return functional delegates for all Prisma models
  get user() { return this.createDelegate('users'); }
  get refreshToken() { return this.createDelegate('refresh_tokens'); }
  get parentChild() { return this.createDelegate('parent_children'); }
  get teacherStudent() { return this.createDelegate('teacher_students'); }
  get permission() { return this.createDelegate('permissions'); }
  get session() { return this.createDelegate('sessions'); }
  get eegLog() { return this.createDelegate('eeg_logs'); }
  get eegProcessed() { return this.createDelegate('eeg_processed'); }
  get deviceProvider() { return this.createDelegate('device_providers'); }
  get simulatorConfig() { return this.createDelegate('simulator_configs'); }
  get learningContent() { return this.createDelegate('learning_contents'); }
  get recommendation() { return this.createDelegate('recommendations'); }
  get journal() { return this.createDelegate('journals'); }
  get achievement() { return this.createDelegate('achievements'); }
  get userAchievement() { return this.createDelegate('user_achievements'); }
  get gamification() { return this.createDelegate('gamification'); }
  get reward() { return this.createDelegate('rewards'); }
  get mission() { return this.createDelegate('missions'); }
  get notification() { return this.createDelegate('notifications'); }
  get intervention() { return this.createDelegate('interventions'); }
  get analytics() { return this.createDelegate('analytics'); }
  get activityLog() { return this.createDelegate('activity_logs'); }
  get auditLog() { return this.createDelegate('audit_logs'); }
  get setting() { return this.createDelegate('settings'); }
}
