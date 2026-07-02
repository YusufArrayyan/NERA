import { Controller, Get, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { AnalyticsService } from './analytics.service';
import { UserRole } from '@prisma/client';

@ApiTags('analytics')
@Controller('analytics')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AnalyticsController {
  constructor(private analyticsService: AnalyticsService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user analytics' })
  async getMyAnalytics(@Request() req: any, @Query('period') period?: string) {
    return this.analyticsService.getUserAnalytics(req.user.sub, period || 'WEEKLY');
  }

  @Get('student/:id')
  @Roles(UserRole.TEACHER, UserRole.COUNSELOR, UserRole.PARENT, UserRole.ADMIN)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Get student analytics (teacher/counselor/parent)' })
  async getStudentAnalytics(@Param('id') id: string) {
    return this.analyticsService.getStudentAnalyticsForTeacher(id);
  }

  @Get('class')
  @Roles(UserRole.TEACHER)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Get class-wide analytics (teacher)' })
  async getClassAnalytics(@Request() req: any) {
    return this.analyticsService.getClassAnalytics(req.user.sub);
  }
}
