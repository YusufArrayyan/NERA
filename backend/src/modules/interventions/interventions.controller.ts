import { Controller, Get, Post, Put, Param, Body, UseGuards, Request, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { InterventionsService } from './interventions.service';
import { InterventionsTriggerService } from './interventions-trigger.service';
import { UserRole } from '@prisma/client';

@ApiTags('interventions')
@Controller('interventions')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class InterventionsController {
  constructor(
    private interventionsService: InterventionsService,
    private triggerService: InterventionsTriggerService,
  ) {}

  @Post()
  @Roles(UserRole.TEACHER, UserRole.COUNSELOR)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Create intervention (teacher/counselor)' })
  async create(@Request() req: any, @Body() data: any) {
    return this.interventionsService.create(req.user.sub, data);
  }

  @Get('received')
  @ApiOperation({ summary: 'Get interventions received by user' })
  async getReceived(@Request() req: any) { return this.interventionsService.getForUser(req.user.sub); }

  @Get('sent')
  @Roles(UserRole.TEACHER, UserRole.COUNSELOR)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Get interventions sent by user' })
  async getSent(@Request() req: any) { return this.interventionsService.getSentByUser(req.user.sub); }

  @Get('stats')
  @ApiOperation({ summary: 'Get personal intervention statistics' })
  async getStats(@Request() req: any) {
    return this.triggerService.getUserInterventionStats(req.user.sub);
  }

  @Get('stats/:userId')
  @Roles(UserRole.TEACHER, UserRole.COUNSELOR, UserRole.ADMIN)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Get intervention statistics for a user' })
  async getUserStats(@Param('userId') userId: string) {
    return this.triggerService.getUserInterventionStats(userId);
  }

  @Put(':id/status')
  @ApiOperation({ summary: 'Update intervention status' })
  async updateStatus(@Param('id') id: string, @Body() body: { status: string }) {
    return this.interventionsService.updateStatus(id, body.status);
  }

  @Post('config/thresholds')
  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Configure intervention thresholds (admin only)' })
  async setThresholds(@Body() config: any) {
    this.triggerService.setConfig(config);
    return { message: 'Intervention thresholds updated', config };
  }
}
