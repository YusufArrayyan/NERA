import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { UserRole } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll(role?: string) {
    // Map lowercase role string to UserRole enum if provided
    let whereClause: any = { deletedAt: null };
    if (role) {
      const roleMap: Record<string, UserRole> = {
        student: UserRole.STUDENT,
        teacher: UserRole.TEACHER,
        counselor: UserRole.COUNSELOR,
        parent: UserRole.PARENT,
        admin: UserRole.ADMIN,
      };
      const mappedRole = roleMap[role.toLowerCase()];
      if (mappedRole) {
        whereClause.role = mappedRole;
      }
    }

    return this.prisma.user.findMany({
      where: whereClause,
      select: { id: true, email: true, name: true, role: true, isActive: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      include: { gamification: true },
    });
  }

  async update(id: string, data: any) {
    const { passwordHash, ...safeData } = data;
    return this.prisma.user.update({ where: { id }, data: safeData });
  }

  async softDelete(id: string) {
    return this.prisma.user.update({ where: { id }, data: { deletedAt: new Date(), isActive: false } });
  }

  async getDashboardStats() {
    const [totalUsers, students, teachers, activeSessions] = await Promise.all([
      this.prisma.user.count({ where: { deletedAt: null } }),
      this.prisma.user.count({ where: { role: 'STUDENT', deletedAt: null } }),
      this.prisma.user.count({ where: { role: 'TEACHER', deletedAt: null } }),
      this.prisma.session.count({ where: { status: 'ACTIVE' } }),
    ]);
    return { totalUsers, students, teachers, activeSessions };
  }
}
