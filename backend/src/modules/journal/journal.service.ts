import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class JournalService {
  constructor(private prisma: PrismaService) {}

  async getUserJournals(userId: string, limit = 20) {
    return this.prisma.journal.findMany({
      where: { userId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async create(userId: string, data: { title?: string; content: string; mood?: any; tags?: string[] }) {
    return this.prisma.journal.create({ data: { userId, ...data } });
  }

  async update(id: string, data: any) {
    return this.prisma.journal.update({ where: { id }, data });
  }

  async delete(id: string) {
    return this.prisma.journal.update({ where: { id }, data: { deletedAt: new Date() } });
  }
}
