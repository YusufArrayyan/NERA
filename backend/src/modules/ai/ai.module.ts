import { Module } from '@nestjs/common';
import { RuleBasedAIProvider } from './providers/rule-based-ai.provider';
import { AI_PROVIDER } from './interfaces/ai-provider.interface';
import { AIService } from './ai.service';
import { AIController } from './ai.controller';

@Module({
  controllers: [AIController],
  providers: [
    AIService,
    RuleBasedAIProvider,
    {
      provide: AI_PROVIDER,
      useClass: RuleBasedAIProvider,
    },
  ],
  exports: [AIService],
})
export class AIModule {}
