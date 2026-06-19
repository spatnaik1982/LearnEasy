import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface PromptFadeResult {
  newLevel: number;
  independentlyMastered: boolean;
}

@Injectable()
export class PromptFadingService {
  constructor(private prisma: PrismaService) {}

  /**
   * Evaluate whether to fade (increase) or revert (decrease) the prompt level
   * based on the most recent attempt's correctness.
   */
  async evaluatePromptFade(
    attempt: {
      correct: boolean;
      studentId: string;
      conceptId: string;
      createdAt: Date;
    },
    currentLevel: number,
    consecutiveCorrect: number,
  ): Promise<PromptFadeResult> {
    let newLevel = currentLevel;
    let independentlyMastered = false;

    if (attempt.correct) {
      // Correct: possible fade-up
      if (consecutiveCorrect >= 2 && currentLevel < 5) {
        newLevel = currentLevel + 1;
      }
      if (consecutiveCorrect >= 3 && currentLevel === 5) {
        independentlyMastered = true;
      }
    } else {
      // Incorrect: revert down
      if (currentLevel === 1) {
        // Stay at level 1
        newLevel = 1;
      } else if (currentLevel === 5) {
        // Revert from 5 to 4
        newLevel = 4;
      } else {
        // Revert one level down
        newLevel = currentLevel - 1;
      }
    }

    return { newLevel, independentlyMastered };
  }

  /**
   * Get the count of most recent consecutive correct attempts
   * for a student's activities in a given concept.
   */
  async getConsecutiveCorrect(
    studentId: string,
    conceptId: string,
  ): Promise<number> {
    // Get all activities for this concept
    const activities = await this.prisma.activity.findMany({
      where: { conceptId },
      select: { id: true },
    });

    const activityIds = activities.map((a: { id: string }) => a.id);

    if (activityIds.length === 0) return 0;

    // Get the student's most recent attempts for this concept's activities
    const attempts = await this.prisma.activityAttempt.findMany({
      where: {
        studentId,
        activityId: { in: activityIds },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Count consecutive correct attempts from most recent
    let count = 0;
    for (const attempt of attempts) {
      if (attempt.correct) {
        count++;
      } else {
        break;
      }
    }

    return count;
  }

  /**
   * Check if the student has been inactive for 7+ days on this concept.
   * If so, reset prompt level to 1.
   */
  async checkInactivityReset(
    studentId: string,
    conceptId: string,
  ): Promise<{ reset: boolean; currentLevel: number }> {
    const activities = await this.prisma.activity.findMany({
      where: { conceptId },
      select: { id: true },
    });

    const activityIds = activities.map((a: { id: string }) => a.id);

    if (activityIds.length === 0) {
      return { reset: false, currentLevel: 1 };
    }

    const lastAttempt = await this.prisma.activityAttempt.findFirst({
      where: {
        studentId,
        activityId: { in: activityIds },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!lastAttempt) {
      return { reset: false, currentLevel: 1 };
    }

    const daysSinceLastAttempt =
      (Date.now() - lastAttempt.createdAt.getTime()) / (1000 * 60 * 60 * 24);

    if (daysSinceLastAttempt >= 7) {
      // Reset prompt level to 1
      await this.prisma.promptState.upsert({
        where: {
          studentId_conceptId: { studentId, conceptId },
        },
        update: { promptLevel: 1 },
        create: { studentId, conceptId, promptLevel: 1 },
      });

      return { reset: true, currentLevel: 1 };
    }

    // Get current prompt level
    const state = await this.prisma.promptState.findUnique({
      where: {
        studentId_conceptId: { studentId, conceptId },
      },
    });

    return { reset: false, currentLevel: state?.promptLevel ?? 1 };
  }
}
