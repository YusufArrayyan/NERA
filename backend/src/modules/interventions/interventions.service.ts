import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class InterventionsService {
  constructor(private prisma: PrismaService) {}

  async create(fromUserId: string, data: { toUserId: string; type: string; title: string; notes: string; priority?: any }) {
    const intervention = await this.prisma.intervention.create({
      data: { fromUserId, toUserId: data.toUserId, type: data.type, title: data.title, notes: data.notes, priority: data.priority || 'MEDIUM' },
    });
    // Create notification for the student
    await this.prisma.notification.create({
      data: { userId: data.toUserId, type: 'INTERVENTION', title: data.title, message: data.notes },
    });
    return intervention;
  }

  async getForUser(userId: string) {
    return this.prisma.intervention.findMany({
      where: { toUserId: userId },
      include: { fromUser: { select: { id: true, name: true, role: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getSentByUser(userId: string) {
    return this.prisma.intervention.findMany({
      where: { fromUserId: userId },
      include: { toUser: { select: { id: true, name: true, role: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateStatus(id: string, status: any) {
    return this.prisma.intervention.update({
      where: { id },
      data: { status, ...(status === 'RESOLVED' ? { resolvedAt: new Date() } : {}) },
    });
  }
}
