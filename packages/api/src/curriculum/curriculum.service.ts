import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CurriculumService {
  constructor(private prisma: PrismaService) {}

  async getLevels() {
    return this.prisma.level.findMany({
      include: { _count: { select: { subjects: true } } },
    });
  }

  async getSubjectsByLevel(code: string) {
    return this.prisma.subject.findMany({
      where: { level: { code } },
      include: { _count: { select: { chapters: true } } },
    });
  }

  async getChaptersBySubject(id: string) {
    return this.prisma.chapter.findMany({
      where: { subjectId: id },
      include: { _count: { select: { concepts: true } } },
      orderBy: { order: 'asc' },
    });
  }

  async getConceptsByChapter(id: string) {
    return this.prisma.concept.findMany({
      where: { chapterId: id },
      include: { _count: { select: { activities: true } } },
      orderBy: { order: 'asc' },
    });
  }

  async getActivitiesByConcept(id: string) {
    return this.prisma.activity.findMany({
      where: { conceptId: id },
      orderBy: { order: 'asc' },
    });
  }
}