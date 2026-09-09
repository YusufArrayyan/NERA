import { Controller, Get, Post, Put, Param, Query, UseGuards, Request, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { NotificationsService } from './notifications.service';
import { EmailService } from './email.service';
import { UserRole } from '@prisma/client';

@ApiTags('notifications')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NotificationsController {
  constructor(
    private notificationsService: NotificationsService,
    private emailService: EmailService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get user notifications' })
  async getNotifications(@Request() req: any, @Query('unread') unread?: string) {
    return this.notificationsService.getUserNotifications(req.user.sub, unread === 'true');
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Get unread notification count' })
  async getUnreadCount(@Request() req: any) {
    const count = await this.notificationsService.getUnreadCount(req.user.sub);
    return { count };
  }

  @Put(':id/read')
  @ApiOperation({ summary: 'Mark notification as read' })
  async markAsRead(@Param('id') id: string) {
    return this.notificationsService.markAsRead(id);
  }

  @Post('read-all')
  @ApiOperation({ summary: 'Mark all notifications as read' })
  async markAllAsRead(@Request() req: any) {
    return this.notificationsService.markAllAsRead(req.user.sub);
  }

  @Post('test-email')
  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Send test email (admin only)' })
  async testEmail(@Request() req: any) {
    const sent = await this.emailService.sendTest(req.user.email || 'test@headband.app');
    return { sent, email: req.user.email };
  }

  @Post('email/focus-alert')
  @ApiOperation({ summary: 'Send focus alert email' })
  async sendFocusAlert(
    @Request() req: any,
    @Body() body: { focusIndex: number; stressIndex: number; focusCategory: string },
  ) {
    const sent = await this.emailService.sendFocusAlert(
      req.user.email,
      req.user.name || 'User',
      body,
    );
    return { sent, email: req.user.email, type: 'FOCUS_ALERT' };
  }

  @Post('email/daily-summary')
  @ApiOperation({ summary: 'Send daily summary email' })
  async sendDailySummary(
    @Request() req: any,
    @Body() body: {
      sessionCount: number;
      totalDuration: number;
      avgFocus: number;
      avgStress: number;
      topMode: string;
      streak: number;
    },
  ) {
    const sent = await this.emailService.sendDailySummary(
      req.user.email,
      req.user.name || 'User',
      body,
    );
    return { sent, email: req.user.email, type: 'DAILY_SUMMARY' };
  }

  @Post('email/intervention')
  @ApiOperation({ summary: 'Send intervention notification email' })
  async sendInterventionEmail(
    @Request() req: any,
    @Body() body: { title: string; description: string; type: string; priority: string },
  ) {
    const sent = await this.emailService.sendInterventionNotification(
      req.user.email,
      req.user.name || 'User',
      body,
    );
    return { sent, email: req.user.email, type: 'INTERVENTION' };
  }

  @Post('email/recommendation')
  @ApiOperation({ summary: 'Send recommendation email' })
  async sendRecommendation(
    @Request() req: any,
    @Body() body: { title: string; content: string; reason: string; actionUrl?: string },
  ) {
    const sent = await this.emailService.sendRecommendation(
      req.user.email,
      req.user.name || 'User',
      body,
    );
    return { sent, email: req.user.email, type: 'RECOMMENDATION' };
  }
}
