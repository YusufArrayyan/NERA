import {
  Controller, Get, Post, Param, Query, UseGuards, Request, Body,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { EEGService } from '../services/eeg.service';
import { UserRole } from '@prisma/client';

@ApiTags('eeg')
@Controller('eeg')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class EEGController {
  constructor(private eegService: EEGService) {}

  @Get('status')
  @ApiOperation({ summary: 'Get EEG device/simulator status' })
  getStatus() {
    return this.eegService.getStatus();
  }

  @Post('connect')
  @ApiOperation({ summary: 'Connect to EEG device/simulator' })
  async connect() {
    return this.eegService.connect();
  }

  @Post('disconnect')
  @ApiOperation({ summary: 'Disconnect from EEG device/simulator' })
  async disconnect() {
    return this.eegService.disconnect();
  }

  @Get('data')
  @ApiOperation({ summary: 'Get single EEG data point (REST polling)' })
  @ApiQuery({ name: 'pattern', required: false })
  getData(@Query('pattern') pattern?: string) {
    return this.eegService.getDataPoint(pattern);
  }

  @Get('patterns')
  @ApiOperation({ summary: 'Get available simulator patterns' })
  getPatterns() {
    return this.eegService.getPatterns();
  }

  @Post('sessions/start')
  @Roles(UserRole.STUDENT)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Start a new EEG recording session' })
  async startSession(
    @Request() req: any,
    @Body() body: { pattern?: string },
  ) {
    return this.eegService.startSession(req.user.sub, body.pattern);
  }

  @Post('sessions/:id/stop')
  @ApiOperation({ summary: 'Stop an active EEG session' })
  async stopSession(@Param('id') id: string) {
    return this.eegService.stopSession(id);
  }

  @Get('sessions/:id')
  @ApiOperation({ summary: 'Get session data with EEG logs' })
  async getSessionData(@Param('id') id: string) {
    return this.eegService.getSessionData(id);
  }

  @Get('sessions')
  @ApiOperation({ summary: 'Get user session history' })
  async getUserSessions(@Request() req: any, @Query('limit') limit?: string) {
    return this.eegService.getUserSessions(req.user.sub, limit ? parseInt(limit) : 20);
  }
}
