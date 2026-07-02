import { Module } from '@nestjs/common';
import { EEGController } from './controllers/eeg.controller';
import { EEGService } from './services/eeg.service';
import { EEGProcessingService } from './services/eeg-processing.service';
import { SimulatorProvider } from './providers/simulator.provider';
import { EEG_PROVIDER } from './interfaces/eeg-provider.interface';

@Module({
  controllers: [EEGController],
  providers: [
    EEGService,
    EEGProcessingService,
    SimulatorProvider,
    {
      // Dependency Injection: swap SimulatorProvider with HeadbandProvider here
      provide: EEG_PROVIDER,
      useClass: SimulatorProvider,
    },
  ],
  exports: [EEGService, EEGProcessingService, EEG_PROVIDER],
})
export class EEGModule {}
