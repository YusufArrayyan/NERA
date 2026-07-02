import { Controller, Get, Param, Put, Delete, Body, UseGuards, Request, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UsersService } from './users.service';
import { UserRole } from '@prisma/client';

@ApiTags('users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.COUNSELOR)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Get all users (admin/teacher/counselor)' })
  async findAll(@Query('role') role?: UserRole) { return this.usersService.findAll(role); }

  @Get('dashboard-stats')
  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Get dashboard statistics (admin)' })
  async getDashboardStats() { return this.usersService.getDashboardStats(); }

  @Get('my-students')
  @Roles(UserRole.TEACHER, UserRole.COUNSELOR)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Get students for current teacher' })
  async getMyStudents(@Request() req: any) { return this.usersService.getStudentsForTeacher(req.user.sub); }

  @Get('my-children')
  @Roles(UserRole.PARENT)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Get children for current parent' })
  async getMyChildren(@Request() req: any) { return this.usersService.getChildrenForParent(req.user.sub); }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  async findById(@Param('id') id: string) { return this.usersService.findById(id); }

  @Put(':id')
  @ApiOperation({ summary: 'Update user' })
  async update(@Param('id') id: string, @Body() data: any) { return this.usersService.update(id, data); }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Soft delete user (admin)' })
  async softDelete(@Param('id') id: string) { return this.usersService.softDelete(id); }
}
