import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { RawQueryService } from './raw-query.service';

@Global()
@Module({
  providers: [PrismaService, RawQueryService],
  exports: [PrismaService, RawQueryService],
})
export class DatabaseModule {}
