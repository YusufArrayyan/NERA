import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';

// Database
import { DatabaseModule } from './database/database.module';

// Feature modules
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { EEGModule } from './modules/eeg/eeg.module';
import { AIModule } from './modules/ai/ai.module';
import { GamificationModule } from './modules/gamification/gamification.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { LearningModule } from './modules/learning/learning.module';
import { JournalModule } from './modules/journal/journal.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { InterventionsModule } from './modules/interventions/interventions.module';
import { RealtimeModule } from './modules/realtime/realtime.module';

@Module({
  imports: [
    // Config
    ConfigModule.forRoot({ isGlobal: true }),

    // Rate limiting
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),

    // Scheduled tasks
    ScheduleModule.forRoot(),

    // Database
    DatabaseModule,

    // Feature modules
    AuthModule,
    UsersModule,
    EEGModule,
    AIModule,
    GamificationModule,
    AnalyticsModule,
    LearningModule,
    JournalModule,
    NotificationsModule,
    InterventionsModule,
    RealtimeModule,
  ],
})
export class AppModule {}
