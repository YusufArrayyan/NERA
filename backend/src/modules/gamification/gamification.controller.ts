import { Controller, Get, Post, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GamificationService } from './gamification.service';

@ApiTags('gamification')
@Controller('gamification')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class GamificationController {
  constructor(private gamificationService: GamificationService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Get user gamification stats' })
  async getStats(@Request() req: any) {
    return this.gamificationService.getUserStats(req.user.sub);
  }

  @Get('leaderboard')
  @ApiOperation({ summary: 'Get leaderboard' })
  async getLeaderboard(@Query('period') period?: string, @Query('limit') limit?: string) {
    return this.gamificationService.getLeaderboard(period, limit ? parseInt(limit) : 10);
  }

  @Get('achievements')
  @ApiOperation({ summary: 'Get all available achievements' })
  async getAchievements() {
    return this.gamificationService.getAllAchievements();
  }

  @Post('check-achievements')
  @ApiOperation({ summary: 'Check and award new achievements' })
  async checkAchievements(@Request() req: any) {
    return this.gamificationService.checkAchievements(req.user.sub);
  }

  @Get('missions')
  @ApiOperation({ summary: 'Get available missions' })
  async getMissions() {
    return this.gamificationService.getMissions();
  }
}
