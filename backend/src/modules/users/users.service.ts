import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { UserRole } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll(role?: UserRole) {
    return this.prisma.user.findMany({
      where: { deletedAt: null, ...(role ? { role } : {}) },
      select: { id: true, name: true, email: true, role: true, avatar: true, isActive: true, isVerified: true, locale: true, lastLoginAt: true, createdAt: true },
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

  async getStudentsForTeacher(teacherId: string) {
    const relations = await this.prisma.teacherStudent.findMany({
      where: { teacherId },
      include: {
        student: {
          include: {
            gamification: true,
            sessions: { orderBy: { startTime: 'desc' }, take: 1 },
          },
        },
      },
    });
    return relations.map((r) => r.student);
  }

  async getChildrenForParent(parentId: string) {
    const relations = await this.prisma.parentChild.findMany({
      where: { parentId },
      include: {
        child: {
          include: { gamification: true, sessions: { orderBy: { startTime: 'desc' }, take: 5 } },
        },
      },
    });
    return relations.map((r) => r.child);
  }

  async assignTeacherToStudent(teacherId: string, studentId: string) {
    return this.prisma.teacherStudent.create({ data: { teacherId, studentId } });
  }

  async assignParentToChild(parentId: string, childId: string) {
    return this.prisma.parentChild.create({ data: { parentId, childId } });
  }

  async getDashboardStats() {
    const [totalUsers, students, teachers, counselors, parents, admins, activeSessions] = await Promise.all([
      this.prisma.user.count({ where: { deletedAt: null } }),
      this.prisma.user.count({ where: { role: 'STUDENT', deletedAt: null } }),
      this.prisma.user.count({ where: { role: 'TEACHER', deletedAt: null } }),
      this.prisma.user.count({ where: { role: 'COUNSELOR', deletedAt: null } }),
      this.prisma.user.count({ where: { role: 'PARENT', deletedAt: null } }),
      this.prisma.user.count({ where: { role: 'ADMIN', deletedAt: null } }),
      this.prisma.session.count({ where: { status: 'ACTIVE' } }),
    ]);
    return { totalUsers, students, teachers, counselors, parents, admins, activeSessions };
  }
}
