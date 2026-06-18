import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AiTutorService } from '@learn-easy/ai';

@Injectable()
export class AiService {
  constructor(
    private prisma: PrismaService,
    private aiTutor: AiTutorService,
  ) {}

  async tutor(dto: {
    conceptId: string;
    query?: string;
    type: 'explain' | 'hint' | 'encourage' | 'insight';
  }) {
    const concept = await this.prisma.concept.findUniqueOrThrow({
      where: { id: dto.conceptId },
    });

    switch (dto.type) {
      case 'explain':
        return this.aiTutor.explainSimpler(
          concept.name,
          concept.objective,
          dto.query || 'Explain this concept.',
        );
      case 'hint': {
        const result = await this.aiTutor.generateHint(
          concept.name,
          concept.objective,
          dto.query || 'Help me solve this.',
        );
        return { hint: result.hint };
      }
      case 'encourage': {
        const result = await this.aiTutor.generateEncouragement(concept.name);
        return { message: result.message };
      }
      case 'insight':
        return { insight: 'Analyzing progress...' };
    }
  }

  async generateInsight(studentId: string) {
    const student = await this.prisma.student.findUniqueOrThrow({
      where: { id: studentId },
      include: {
        progress: {
          include: { concept: true },
        },
      },
    });

    const completedConcepts = student.progress.filter(
      (p: { completed: boolean; mastery: number; concept: { name: string } }) => p.completed,
    );
    const inProgress = student.progress.filter(
      (p: { completed: boolean; mastery: number }) => !p.completed && p.mastery > 0,
    );

    const conceptData =
      completedConcepts.length > 0
        ? `completed ${completedConcepts.length} concepts (${completedConcepts.map((p: { concept: { name: string } }) => p.concept.name).join(', ')}), working on ${inProgress.length} more`
        : `working on ${Math.max(inProgress.length, 1)} concepts`;

    const result = await this.aiTutor.generateInsight(
      student.name,
      conceptData,
    );
    return result;
  }
}