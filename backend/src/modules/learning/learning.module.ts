import { Module } from '@nestjs/common';
import { LearningService } from './learning.service';
import { AdaptiveRecommendationService } from './adaptive-recommendation.service';
import { LearningController } from './learning.controller';
@Module({ controllers: [LearningController], providers: [LearningService, AdaptiveRecommendationService], exports: [LearningService, AdaptiveRecommendationService] })
export class LearningModule {}
