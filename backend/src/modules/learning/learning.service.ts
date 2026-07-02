import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class LearningService {
  constructor(private prisma: PrismaService) {}

  async getAllContent(type?: string, difficulty?: number) {
    return this.prisma.learningContent.findMany({
      where: {
        deletedAt: null,
        isPublished: true,
        ...(type ? { type: type as any } : {}),
        ...(difficulty ? { difficulty } : {}),
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getById(id: string) {
    return this.prisma.learningContent.findUnique({ where: { id } });
  }

  async create(data: any) {
    return this.prisma.learningContent.create({ data });
  }

  async update(id: string, data: any) {
    return this.prisma.learningContent.update({ where: { id }, data });
  }

  async delete(id: string) {
    return this.prisma.learningContent.update({ where: { id }, data: { deletedAt: new Date() } });
  }

  async getContentForMode(mode: string, difficulty?: number) {
    return this.prisma.learningContent.findMany({
      where: {
        deletedAt: null,
        isPublished: true,
        type: mode as any,
        ...(difficulty ? { difficulty: { lte: difficulty } } : {}),
      },
      take: 5,
      orderBy: { createdAt: 'desc' },
    });
  }
}
