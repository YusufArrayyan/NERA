import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { LearningService } from './learning.service';
import { UserRole } from '@prisma/client';

@ApiTags('learning')
@Controller('learning')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class LearningController {
  constructor(private learningService: LearningService) {}

  @Get('content')
  @ApiOperation({ summary: 'Get learning content' })
  async getAllContent(@Query('type') type?: string, @Query('difficulty') difficulty?: string) {
    return this.learningService.getAllContent(type, difficulty ? parseInt(difficulty) : undefined);
  }

  @Get('content/adaptive/:mode')
  @ApiOperation({ summary: 'Get adaptive content for learning mode' })
  async getAdaptiveContent(@Param('mode') mode: string, @Query('difficulty') difficulty?: string) {
    return this.learningService.getContentForMode(mode, difficulty ? parseInt(difficulty) : undefined);
  }

  @Get('content/:id')
  @ApiOperation({ summary: 'Get content by ID' })
  async getById(@Param('id') id: string) { return this.learningService.getById(id); }

  @Post('content')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Create learning content (admin/teacher)' })
  async create(@Body() data: any) { return this.learningService.create(data); }

  @Put('content/:id')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Update learning content' })
  async update(@Param('id') id: string, @Body() data: any) { return this.learningService.update(id, data); }

  @Delete('content/:id')
  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Delete learning content (admin)' })
  async delete(@Param('id') id: string) { return this.learningService.delete(id); }
}
