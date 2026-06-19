import { Test, TestingModule } from '@nestjs/testing';
import { PromptFadingService } from '../prompt-fading.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('PromptFadingService', () => {
  let service: PromptFadingService;
  let prisma: any;

  const mockPrisma = {
    activity: {
      findMany: jest.fn(),
    },
    activityAttempt: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
    },
    promptState: {
      findUnique: jest.fn(),
      upsert: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PromptFadingService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<PromptFadingService>(PromptFadingService);
    prisma = module.get(PrismaService);

    jest.clearAllMocks();
  });

  describe('evaluatePromptFade', () => {
    const baseAttempt = {
      correct: true,
      studentId: 'student-1',
      conceptId: 'concept-1',
      createdAt: new Date(),
    };

    it('should fade (increase level) after 2 consecutive correct attempts when level < 5', async () => {
      const result = await service.evaluatePromptFade(baseAttempt, 2, 2);

      expect(result.newLevel).toBe(3);
      expect(result.independentlyMastered).toBe(false);
    });

    it('should revert (decrease level) after an incorrect attempt', async () => {
      const result = await service.evaluatePromptFade(
        { ...baseAttempt, correct: false },
        3,
        0,
      );

      expect(result.newLevel).toBe(2);
      expect(result.independentlyMastered).toBe(false);
    });

    it('should stay at level 1 when incorrect and current level is 1', async () => {
      const result = await service.evaluatePromptFade(
        { ...baseAttempt, correct: false },
        1,
        0,
      );

      expect(result.newLevel).toBe(1);
      expect(result.independentlyMastered).toBe(false);
    });

    it('should revert from level 5 to level 4 when incorrect', async () => {
      const result = await service.evaluatePromptFade(
        { ...baseAttempt, correct: false },
        5,
        0,
      );

      expect(result.newLevel).toBe(4);
      expect(result.independentlyMastered).toBe(false);
    });

    it('should mark independentlyMastered when 3 consecutive correct at level 5', async () => {
      const result = await service.evaluatePromptFade(baseAttempt, 5, 3);

      expect(result.newLevel).toBe(5);
      expect(result.independentlyMastered).toBe(true);
    });

    it('should not fade with only 1 consecutive correct even at level < 5', async () => {
      const result = await service.evaluatePromptFade(baseAttempt, 3, 1);

      // No fade since consecutiveCorrect < 2
      expect(result.newLevel).toBe(3);
      expect(result.independentlyMastered).toBe(false);
    });

    it('should not independently master at level 5 with only 2 consecutive correct', async () => {
      const result = await service.evaluatePromptFade(baseAttempt, 5, 2);

      expect(result.newLevel).toBe(5);
      expect(result.independentlyMastered).toBe(false);
    });
  });

  describe('getConsecutiveCorrect', () => {
    it('should count consecutive correct attempts from most recent', async () => {
      mockPrisma.activity.findMany.mockResolvedValue([
        { id: 'act-1' },
        { id: 'act-2' },
      ]);
      mockPrisma.activityAttempt.findMany.mockResolvedValue([
        { correct: true, createdAt: new Date('2025-01-05') },
        { correct: true, createdAt: new Date('2025-01-04') },
        { correct: false, createdAt: new Date('2025-01-03') },
      ]);

      const result = await service.getConsecutiveCorrect('student-1', 'concept-1');

      expect(result).toBe(2);
    });

    it('should return 0 when no activities exist for concept', async () => {
      mockPrisma.activity.findMany.mockResolvedValue([]);

      const result = await service.getConsecutiveCorrect('student-1', 'concept-1');

      expect(result).toBe(0);
    });
  });

  describe('checkInactivityReset', () => {
    it('should reset prompt level to 1 after 7+ days of inactivity', async () => {
      const sevenDaysAgo = new Date(Date.now() - 8 * 24 * 60 * 60 * 1000);

      mockPrisma.activity.findMany.mockResolvedValue([{ id: 'act-1' }]);
      mockPrisma.activityAttempt.findFirst.mockResolvedValue({
        createdAt: sevenDaysAgo,
      });
      mockPrisma.promptState.upsert.mockResolvedValue({});

      const result = await service.checkInactivityReset('student-1', 'concept-1');

      expect(result.reset).toBe(true);
      expect(result.currentLevel).toBe(1);
      expect(mockPrisma.promptState.upsert).toHaveBeenCalledWith({
        where: {
          studentId_conceptId: { studentId: 'student-1', conceptId: 'concept-1' },
        },
        update: { promptLevel: 1 },
        create: { studentId: 'student-1', conceptId: 'concept-1', promptLevel: 1 },
      });
    });

    it('should not reset when last attempt was less than 7 days ago', async () => {
      const yesterday = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000);

      mockPrisma.activity.findMany.mockResolvedValue([{ id: 'act-1' }]);
      mockPrisma.activityAttempt.findFirst.mockResolvedValue({
        createdAt: yesterday,
      });
      mockPrisma.promptState.findUnique.mockResolvedValue({ promptLevel: 3 });

      const result = await service.checkInactivityReset('student-1', 'concept-1');

      expect(result.reset).toBe(false);
      expect(result.currentLevel).toBe(3);
    });
  });
});
