import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface MasteryResult {
  mastery: number;
  completed: boolean;
  mastered: boolean;
}

@Injectable()
export class MasteryService {
  constructor(private prisma: PrismaService) {}

  /**
   * Calculate mastery for a student on a concept using the formula:
   *   mastery = accuracy × 0.4 + consistency × 0.3 + independence × 0.3
   *
   * Returns the calculated mastery value, never decreasing below the existing value.
   */
  async calculateMastery(
    studentId: string,
    conceptId: string,
  ): Promise<MasteryResult> {
    // Get the last 5 activity attempts for this student+concept
    const attempts = await this.getRecentAttempts(studentId, conceptId);

    if (attempts.length === 0) {
      return { mastery: 0, completed: false, mastered: false };
    }

    // --- Accuracy (0.0 - 1.0) ---
    const accuracy =
      attempts.filter((a: { correct: boolean }) => a.correct).length / attempts.length;

    // --- Consistency ---
    const consistency = await this.calculateConsistency(studentId, conceptId);

    // --- Independence ---
    const independence = await this.calculateIndependence(
      studentId,
      conceptId,
      attempts,
    );

    // --- Formula ---
    const rawMastery =
      accuracy * 0.4 + consistency * 0.3 + independence * 0.3;

    // Clamp to 0.0 - 1.0
    const clampedMastery = Math.max(0, Math.min(1, rawMastery));

    // Best mastery: never decrease below existing
    const existingProgress = await this.prisma.progress.findUnique({
      where: {
        studentId_conceptId: { studentId, conceptId },
      },
    });

    const existingMastery = existingProgress?.mastery ?? 0;
    const finalMastery = Math.max(clampedMastery, existingMastery);

    return {
      mastery: finalMastery,
      completed: finalMastery >= 0.8,
      mastered: finalMastery >= 0.9,
    };
  }

  /**
   * Get recent attempts for a student+concept (up to 5 most recent).
   */
  private async getRecentAttempts(
    studentId: string,
    conceptId: string,
  ) {
    const activities = await this.prisma.activity.findMany({
      where: { conceptId },
      select: { id: true },
    });

    const activityIds = activities.map((a: { id: string }) => a.id);

    if (activityIds.length === 0) return [];

    return this.prisma.activityAttempt.findMany({
      where: {
        studentId,
        activityId: { in: activityIds },
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });
  }

  /**
   * Calculate consistency: percentage of sessions where accuracy was >70%.
   */
  private async calculateConsistency(
    studentId: string,
    conceptId: string,
  ): Promise<number> {
    const activities = await this.prisma.activity.findMany({
      where: { conceptId },
      select: { id: true },
    });

    const activityIds = activities.map((a: { id: string }) => a.id);

    if (activityIds.length === 0) return 0;

    // Get all sessions for this student
    const sessions = await this.prisma.session.findMany({
      where: { studentId },
      orderBy: { startTime: 'asc' },
    });

    if (sessions.length === 0) return 0;

    // For each session, get attempts within the session time range
    let goodSessions = 0;
    let totalSessionsWithAttempts = 0;

    for (const session of sessions) {
      const sessionAttempts = await this.prisma.activityAttempt.findMany({
        where: {
          studentId,
          activityId: { in: activityIds },
          createdAt: {
            gte: session.startTime,
            lte: session.endTime ?? undefined,
          },
        },
      });

      if (sessionAttempts.length > 0) {
        totalSessionsWithAttempts++;
        const sessionAccuracy =
          sessionAttempts.filter((a: { correct: boolean }) => a.correct).length /
          sessionAttempts.length;

        if (sessionAccuracy > 0.7) {
          goodSessions++;
        }
      }
    }

    if (totalSessionsWithAttempts === 0) return 0;

    return goodSessions / totalSessionsWithAttempts;
  }

  /**
   * Calculate independence: (5 - avgPromptLevel) / 4
   * Uses the average prompt level from the last 5 attempts.
   */
  private async calculateIndependence(
    studentId: string,
    conceptId: string,
    attempts: any[],
  ): Promise<number> {
    // Get prompt states for this student+concept
    const promptState = await this.prisma.promptState.findUnique({
      where: {
        studentId_conceptId: { studentId, conceptId },
      },
    });

    // If we have a prompt state, use its level as the current independence gauge
    const currentLevel = promptState?.promptLevel ?? 1;

    // Formula: (5 - currentLevel) / 4
    // Level 5 (independent) → (5-5)/4 = 0.0 ... wait, that's wrong
    // Higher level should mean MORE independent
    // Level 5 → max independence → score = 1.0
    // Level 1 → min independence → score = 0.0
    return (currentLevel - 1) / 4;
  }
}
