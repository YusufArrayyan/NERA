import { Module } from '@nestjs/common';
import { InterventionsService } from './interventions.service';
import { InterventionsTriggerService } from './interventions-trigger.service';
import { InterventionsController } from './interventions.controller';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [NotificationsModule],
  controllers: [InterventionsController],
  providers: [InterventionsService, InterventionsTriggerService],
  exports: [InterventionsService, InterventionsTriggerService],
})
export class InterventionsModule {}
