import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { JournalService } from './journal.service';

@ApiTags('journal')
@Controller('journal')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class JournalController {
  constructor(private journalService: JournalService) {}

  @Get()
  @ApiOperation({ summary: 'Get user journals' })
  async getJournals(@Request() req: any, @Query('limit') limit?: string) {
    return this.journalService.getUserJournals(req.user.sub, limit ? parseInt(limit) : 20);
  }

  @Post()
  @ApiOperation({ summary: 'Create journal entry' })
  async create(@Request() req: any, @Body() data: any) {
    return this.journalService.create(req.user.sub, data);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update journal entry' })
  async update(@Param('id') id: string, @Body() data: any) { return this.journalService.update(id, data); }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete journal entry' })
  async delete(@Param('id') id: string) { return this.journalService.delete(id); }
}
