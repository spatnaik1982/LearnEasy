import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ResumeService {
  constructor(private prisma: PrismaService) {}

  async getResumeState(studentId: string) {
    // 1. Find the latest incomplete session (no endTime)
    const latestSession = await this.prisma.session.findFirst({
      where: {
        studentId,
        endTime: null,
      },
      orderBy: { startTime: 'desc' },
    });

    if (!latestSession) {
      return { hasResumableSession: false };
    }

    // 2. Find the most recent activity attempt for this student
    const latestAttempt = await this.prisma.activityAttempt.findFirst({
      where: { studentId },
      orderBy: { createdAt: 'desc' },
      include: {
        activity: {
          include: {
            concept: {
              include: {
                chapter: {
                  include: {
                    subject: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!latestAttempt) {
      return { hasResumableSession: false };
    }

    const activity = latestAttempt.activity;
    const concept = activity.concept;
    const chapter = concept.chapter;
    const subject = chapter.subject;

    // 3. Map activity step to step index (0-3, step 4 is completion)
    const stepMap: Record<string, number> = {
      observe: 0,
      guided_practice: 1,
      independent_practice: 2,
      mastery_check: 3,
      positive_completion: 4,
    };

    const step = stepMap[activity.step] ?? 0;

    return {
      hasResumableSession: true,
      conceptId: concept.id,
      chapterId: chapter.id,
      subjectId: subject.id,
      step,
      activityId: activity.id,
    };
  }
}
