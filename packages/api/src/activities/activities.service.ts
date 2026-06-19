import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RecordAttemptDto } from './dto/record-attempt.dto';
import { AttemptResponseDto } from './dto/attempt-response.dto';
import { PromptFadingService } from '../prompts/prompt-fading.service';
import { PromptsService } from '../prompts/prompts.service';
import { MasteryService } from '../mastery/mastery.service';

@Injectable()
export class ActivitiesService {
  constructor(
    private prisma: PrismaService,
    private promptFadingService: PromptFadingService,
    private promptsService: PromptsService,
    private masteryService: MasteryService,
  ) {}

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

    // --- Prompt Fading Integration ---
    // Check inactivity reset first
    await this.promptFadingService.checkInactivityReset(
      dto.studentId,
      activity.conceptId,
    );

    // Get current prompt level
    const { promptLevel: currentLevel } =
      await this.promptsService.getPromptLevel(
        dto.studentId,
        activity.conceptId,
      );

    // Get consecutive correct count
    const consecutiveCorrect =
      await this.promptFadingService.getConsecutiveCorrect(
        dto.studentId,
        activity.conceptId,
      );

    // Evaluate whether to fade or revert
    const fadeResult = await this.promptFadingService.evaluatePromptFade(
      {
        correct,
        studentId: dto.studentId,
        conceptId: activity.conceptId,
        createdAt: attempt.createdAt,
      },
      currentLevel,
      consecutiveCorrect,
    );

    // Update prompt level if changed
    if (fadeResult.newLevel !== currentLevel) {
      await this.promptsService.setPromptLevel(
        dto.studentId,
        activity.conceptId,
        fadeResult.newLevel,
      );
    }

    // --- Mastery Calculation Integration ---
    const masteryResult = await this.masteryService.calculateMastery(
      dto.studentId,
      activity.conceptId,
    );

    // Update the Progress record with full mastery calculation (best-mastery: never decrease)
    const existingProgress = await this.prisma.progress.findUnique({
      where: {
        studentId_conceptId: { studentId: dto.studentId, conceptId: activity.conceptId },
      },
    });

    if (!existingProgress) {
      // Create new progress record
      await this.prisma.progress.create({
        data: {
          studentId: dto.studentId,
          conceptId: activity.conceptId,
          mastery: masteryResult.mastery,
          completed: masteryResult.completed,
        },
      });
    } else if (masteryResult.mastery > existingProgress.mastery) {
      // Only update if mastery has increased (best-mastery approach)
      await this.prisma.progress.update({
        where: {
          studentId_conceptId: { studentId: dto.studentId, conceptId: activity.conceptId },
        },
        data: {
          mastery: masteryResult.mastery,
          completed: masteryResult.completed,
        },
      });
    }

    return {
      attemptId: attempt.id,
      correct,
      feedback,
      promptLevel: fadeResult.newLevel,
      independentlyMastered: fadeResult.independentlyMastered,
      mastery: masteryResult.mastery,
      completed: masteryResult.completed,
      mastered: masteryResult.mastered,
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
}
