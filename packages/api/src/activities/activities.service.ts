import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RecordAttemptDto } from './dto/record-attempt.dto';
import { AttemptResponseDto } from './dto/attempt-response.dto';

@Injectable()
export class ActivitiesService {
  constructor(private prisma: PrismaService) {}

  async recordAttempt(activityId: string, dto: RecordAttemptDto): Promise<AttemptResponseDto> {
    const activity = await this.prisma.activity.findUnique({
      where: { id: activityId },
    });

    if (!activity) {
      throw new NotFoundException(`Activity ${activityId} not found`);
    }

    const correct = this.evaluateResponse(activity.type, activity.content as Record<string, any>, dto.response);
    const feedback = correct ? 'Great work!' : "Let's try again!";

    const attempt = await this.prisma.activityAttempt.create({
      data: {
        studentId: dto.studentId,
        activityId,
        correct,
        response: dto.response,
        hintsUsed: dto.hintsUsed ?? 0,
        timeSpent: dto.timeSpent ?? null,
        completed: true,
      },
    });

    // On first correct attempt, upsert progress
    if (correct) {
      await this.upsertProgress(dto.studentId, activity.conceptId);
    }

    return {
      attemptId: attempt.id,
      correct,
      feedback,
    };
  }

  async getAttempts(studentId: string, activityId: string) {
    return this.prisma.activityAttempt.findMany({
      where: { studentId, activityId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getLatestAttempt(studentId: string, activityId: string) {
    return this.prisma.activityAttempt.findFirst({
      where: { studentId, activityId },
      orderBy: { createdAt: 'desc' },
    });
  }

  private evaluateResponse(
    activityType: string,
    content: Record<string, any>,
    response: Record<string, any>,
  ): boolean {
    switch (activityType) {
      case 'visual_counting': {
        const expectedCount = content.count;
        return response.count === expectedCount;
      }

      case 'multiple_choice': {
        const question = content.questions?.[0];
        if (!question || question.correctIndex === undefined) return false;
        return response.selectedIndex === question.correctIndex;
      }

      case 'matching': {
        const pairs = content.pairs;
        if (!Array.isArray(pairs) || !Array.isArray(response.pairs)) return false;
        const correctPairs = pairs.filter(
          (p: any) =>
            response.pairs.some(
              (rp: any) => rp.left === p.left && rp.right === p.right,
            ),
        ).length;
        return correctPairs === pairs.length;
      }

      case 'sequencing': {
        const correctOrder = content.correctOrder;
        if (!Array.isArray(correctOrder) || !Array.isArray(response.order)) return false;
        if (correctOrder.length !== response.order.length) return false;
        return correctOrder.every((val: any, idx: number) => val === response.order[idx]);
      }

      default:
        // Unknown activity type — mark as correct to avoid blocking
        return true;
    }
  }

  private async upsertProgress(studentId: string, conceptId: string) {
    // Check if there's already a correct attempt for any activity in this concept
    const existingProgress = await this.prisma.progress.findUnique({
      where: {
        studentId_conceptId: { studentId, conceptId },
      },
    });

    if (!existingProgress) {
      // First correct activity in this concept — set mastery to 0.25
      await this.prisma.progress.create({
        data: {
          studentId,
          conceptId,
          mastery: 0.25,
        },
      });
    } else {
      // Increment mastery by 0.25, cap at 1.0
      const newMastery = Math.min(existingProgress.mastery + 0.25, 1.0);
      await this.prisma.progress.update({
        where: {
          studentId_conceptId: { studentId, conceptId },
        },
        data: {
          mastery: newMastery,
          completed: newMastery >= 1.0,
        },
      });
    }
  }
}
