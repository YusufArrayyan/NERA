import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll(role?: string) {
    return this.prisma.user.findMany({
      where: { deleted_at: null, ...(role ? { role } : {}) },
      select: { id: true, email: true, username: true, first_name: true, last_name: true, role: true, status: true, created_at: true },
      orderBy: { created_at: 'desc' },
    });
  }

  async findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      include: { gamification: true },
    });
  }

  async update(id: string, data: any) {
    const { password_hash, ...safeData } = data;
    return this.prisma.user.update({ where: { id }, data: safeData });
  }

  async softDelete(id: string) {
    return this.prisma.user.update({ where: { id }, data: { deleted_at: new Date(), status: 'inactive' } });
  }

  async getDashboardStats() {
    const [totalUsers, students, teachers, activeSessions] = await Promise.all([
      this.prisma.user.count({ where: { deleted_at: null } }),
      this.prisma.user.count({ where: { role: 'student', deleted_at: null } }),
      this.prisma.user.count({ where: { role: 'teacher', deleted_at: null } }),
      this.prisma.eegSession.count({ where: { status: 'recording' } }),
    ]);
    return { totalUsers, students, teachers, activeSessions };
  }
}
