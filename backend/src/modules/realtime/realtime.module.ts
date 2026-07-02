import { Module } from '@nestjs/common';
import { RealtimeGateway } from './realtime.gateway';
import { EEGModule } from '../eeg/eeg.module';

@Module({
  imports: [EEGModule],
  providers: [RealtimeGateway],
  exports: [RealtimeGateway],
})
export class RealtimeModule {}
