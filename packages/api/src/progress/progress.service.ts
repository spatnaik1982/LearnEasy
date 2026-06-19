import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProgressService {
  constructor(private prisma: PrismaService) {}

  async getStudentProgress(studentId: string) {
    return this.prisma.progress.findMany({
      where: { studentId },
      include: { concept: { select: { id: true, name: true, code: true } } },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async getConceptProgress(studentId: string, conceptId: string) {
    const progress = await this.prisma.progress.findUnique({
      where: {
        studentId_conceptId: { studentId, conceptId },
      },
      include: { concept: true },
    });

    if (!progress) {
      throw new NotFoundException(
        `No progress found for student ${studentId} on concept ${conceptId}`,
      );
    }

    return progress;
  }

  async getChapterProgress(studentId: string, chapterId: string) {
    const concepts = await this.prisma.concept.findMany({
      where: { chapterId },
      select: { id: true },
    });

    const conceptIds: string[] = concepts.map((c: { id: string }) => c.id);

    const progressRecords = await this.prisma.progress.findMany({
      where: {
        studentId,
        conceptId: { in: conceptIds },
      },
    });

    const totalConcepts = conceptIds.length;
    const conceptsCompleted = progressRecords.filter(
      (p: { completed: boolean }) => p.completed,
    ).length;
    const totalMastery = progressRecords.reduce(
      (sum: number, p: { mastery: number }) => sum + p.mastery,
      0,
    );
    const chapterMastery =
      totalConcepts > 0 ? totalMastery / totalConcepts : 0;

    return {
      chapterId,
      totalConcepts,
      conceptsCompleted,
      chapterMastery: Math.round(chapterMastery * 100) / 100,
    };
  }

  async getSubjectProgress(studentId: string, subjectId: string) {
    const concepts = await this.prisma.concept.findMany({
      where: { chapter: { subjectId } },
      select: { id: true },
    });

    const conceptIds: string[] = concepts.map((c: { id: string }) => c.id);

    const progressRecords = await this.prisma.progress.findMany({
      where: {
        studentId,
        conceptId: { in: conceptIds },
      },
    });

    const totalConcepts = conceptIds.length;
    const totalMastery = progressRecords.reduce(
      (sum: number, p: { mastery: number }) => sum + p.mastery,
      0,
    );
    const subjectMastery =
      totalConcepts > 0 ? totalMastery / totalConcepts : 0;

    return {
      subjectId,
      totalConcepts,
      conceptsStarted: progressRecords.length,
      subjectMastery: Math.round(subjectMastery * 100) / 100,
    };
  }

  async verifyParentAccess(parentId: string, studentId: string): Promise<boolean> {
    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
      select: { parentId: true },
    });

    if (!student) return false;
    return student.parentId === parentId;
  }
}
