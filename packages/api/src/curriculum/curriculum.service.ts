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

  async getSubject(id: string) {
    return this.prisma.subject.findUnique({
      where: { id },
      include: { _count: { select: { chapters: true } } },
    });
  }

  async getChapter(id: string) {
    return this.prisma.chapter.findUnique({
      where: { id },
      include: { _count: { select: { concepts: true } } },
    });
  }

  async getConcept(id: string) {
    return this.prisma.concept.findUnique({
      where: { id },
      include: {
        _count: { select: { activities: true } },
        chapter: { select: { id: true, subjectId: true, name: true } },
      },
    });
  }
}