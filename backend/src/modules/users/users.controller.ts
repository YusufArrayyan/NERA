import { Controller, Get, Param, Put, Delete, Body, UseGuards, Request, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UsersService } from './users.service';

@ApiTags('users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'Get all users' })
  async findAll(@Query('role') role?: string) { return this.usersService.findAll(role); }

  @Get('dashboard-stats')
  @ApiOperation({ summary: 'Get dashboard statistics' })
  async getDashboardStats() { return this.usersService.getDashboardStats(); }

  @Get('my-students')
  @ApiOperation({ summary: 'Get students for current teacher' })
  async getMyStudents(@Request() req: any) { return { message: 'Not implemented in MVP' }; }

  @Get('my-children')
  @ApiOperation({ summary: 'Get children for current parent' })
  async getMyChildren(@Request() req: any) { return { message: 'Not implemented in MVP' }; }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  async findById(@Param('id') id: string) { return this.usersService.findById(id); }

  @Put(':id')
  @ApiOperation({ summary: 'Update user' })
  async update(@Param('id') id: string, @Body() data: any) { return this.usersService.update(id, data); }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete user' })
  async softDelete(@Param('id') id: string) { return this.usersService.softDelete(id); }
}
