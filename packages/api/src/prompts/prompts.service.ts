import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PromptsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Retrieves prompt content from activity.content.hints array at the given level (1-5).
   * Fallbacks to the closest available level if the requested level is out of range.
   */
  async getPrompt(activityId: string, level: number): Promise<{ hint: string; level: number }> {
    const activity = await this.prisma.activity.findUnique({
      where: { id: activityId },
    });

    if (!activity) {
      throw new NotFoundException(`Activity ${activityId} not found`);
    }

    const content = activity.content as Record<string, any>;
    const hints: string[] = content?.hints ?? [];

    return this.resolveHint(hints, level);
  }

  /**
   * Returns the current prompt level for a student+concept, defaulting to 1.
   */
  async getPromptLevel(studentId: string, conceptId: string): Promise<{ promptLevel: number }> {
    const state = await this.prisma.promptState.findUnique({
      where: {
        studentId_conceptId: { studentId, conceptId },
      },
    });

    return { promptLevel: state?.promptLevel ?? 1 };
  }

  /**
   * Sets (upserts) the prompt level for a student+concept.
   */
  async setPromptLevel(
    studentId: string,
    conceptId: string,
    level: number,
  ): Promise<{ promptLevel: number }> {
    const clampedLevel = Math.max(1, Math.min(5, level));

    await this.prisma.promptState.upsert({
      where: {
        studentId_conceptId: { studentId, conceptId },
      },
      update: { promptLevel: clampedLevel },
      create: { studentId, conceptId, promptLevel: clampedLevel },
    });

    return { promptLevel: clampedLevel };
  }

  /**
   * Resolves a hint from a hints array at the requested level,
   * falling back to the closest available level.
   */
  private resolveHint(
    hints: string[],
    requestedLevel: number,
  ): { hint: string; level: number } {
    if (!hints || hints.length === 0) {
      return { hint: '', level: requestedLevel };
    }

    const index = requestedLevel - 1;
    if (index >= 0 && index < hints.length) {
      return { hint: hints[index], level: requestedLevel };
    }

    // Fallback: closest available level
    if (requestedLevel > hints.length) {
      const closestIndex = hints.length - 1;
      return { hint: hints[closestIndex], level: closestIndex + 1 };
    }

    // requestedLevel < 1 — return first hint
    return { hint: hints[0], level: 1 };
  }
}
