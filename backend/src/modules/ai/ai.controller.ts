import { Controller, Get, Post, Param, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AIService } from './ai.service';

@ApiTags('ai')
@Controller('ai')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AIController {
  constructor(private aiService: AIService) {}

  @Get('recommendations')
  @ApiOperation({ summary: 'Get AI-generated recommendations for current user' })
  async getRecommendations(@Request() req: any) {
    return this.aiService.getRecommendations(req.user.sub);
  }

  @Get('recommendations/history')
  @ApiOperation({ summary: 'Get recommendation history' })
  async getRecommendationHistory(@Request() req: any) {
    return this.aiService.getUserRecommendations(req.user.sub);
  }

  @Get('analyze/session/:id')
  @ApiOperation({ summary: 'Get AI analysis for a specific session' })
  async analyzeSession(@Param('id') id: string) {
    return this.aiService.analyzeSession(id);
  }

  @Post('journal/generate')
  @ApiOperation({ summary: 'Generate AI cognitive journal entry' })
  async generateJournal(@Request() req: any, @Body() body: { mood?: string }) {
    return this.aiService.generateJournal(req.user.sub, body.mood);
  }
}
