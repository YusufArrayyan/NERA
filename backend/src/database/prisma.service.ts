import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient {
  constructor() {
    super({
      log:
        process.env.NODE_ENV === 'development'
          ? ['warn', 'error']
          : ['error'],
    });
  }

  async $connect(): Promise<void> {
    try {
      await super.$connect();
      console.log('✅ Prisma connected to database');
    } catch (error) {
      console.error('❌ Prisma connection failed:', error);
      throw error;
    }
  }
}
