import { Test, TestingModule } from '@nestjs/testing';
import { ActivitiesService } from '../activities.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

// Mock the three services injected into ActivitiesService constructor
const mockPromptFadingService = {
  evaluatePromptFade: jest.fn().mockReturnValue({ newLevel: 1, independentlyMastered: false }),
  getConsecutiveCorrect: jest.fn().mockResolvedValue(0),
  checkInactivityReset: jest.fn().mockResolvedValue(false),
};

const mockPromptsService = {
  getPromptLevel: jest.fn().mockResolvedValue(1),
  setPromptLevel: jest.fn().mockResolvedValue(undefined),
};

const mockMasteryService = {
  calculateMastery: jest.fn().mockResolvedValue({ mastery: 0.25, completed: false, mastered: false }),
};

describe('ActivitiesService', () => {
  let service: ActivitiesService;
  let prisma: any;

  const mockPrisma = {
    activity: {
      findUnique: jest.fn(),
    },
    activityAttempt: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
    },
    progress: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    promptState: {
      findUnique: jest.fn(),
      upsert: jest.fn(),
    },
  };

  beforeEach(async () => {
    const { PromptFadingService } = require('../../prompts/prompt-fading.service');
    const { PromptsService } = require('../../prompts/prompts.service');
    const { MasteryService } = require('../../mastery/mastery.service');

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ActivitiesService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: PromptFadingService, useValue: mockPromptFadingService },
        { provide: PromptsService, useValue: mockPromptsService },
        { provide: MasteryService, useValue: mockMasteryService },
      ],
    }).compile();

    service = module.get<ActivitiesService>(ActivitiesService);
    prisma = module.get(PrismaService);

    jest.clearAllMocks();
  });

  describe('recordAttempt', () => {
    it('should throw NotFoundException when activity does not exist', async () => {
      mockPrisma.activity.findUnique.mockResolvedValue(null);

      await expect(
        service.recordAttempt('nonexistent', {
          studentId: 'student-1',
          response: { count: 5 },
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should evaluate visual_counting correctly', async () => {
      mockPrisma.activity.findUnique.mockResolvedValue({
        id: 'activity-1',
        type: 'visual_counting',
        conceptId: 'concept-1',
        content: { count: 5 },
      });
      mockPrisma.activityAttempt.create.mockResolvedValue({
        id: 'attempt-1',
        correct: true,
      });
      mockPrisma.progress.findUnique.mockResolvedValue(null);
      mockPrisma.progress.create.mockResolvedValue({});

      const result = await service.recordAttempt('activity-1', {
        studentId: 'student-1',
        response: { count: 5 },
      });

      expect(result.correct).toBe(true);
      expect(result.feedback).toBe('Great work!');
      expect(result.attemptId).toBe('attempt-1');
    });

    it('should return incorrect feedback for wrong answer', async () => {
      mockPrisma.activity.findUnique.mockResolvedValue({
        id: 'activity-1',
        type: 'visual_counting',
        conceptId: 'concept-1',
        content: { count: 5 },
      });
      mockPrisma.activityAttempt.create.mockResolvedValue({
        id: 'attempt-2',
        correct: false,
      });

      const result = await service.recordAttempt('activity-1', {
        studentId: 'student-1',
        response: { count: 3 },
      });

      expect(result.correct).toBe(false);
      expect(result.feedback).toBe("Let's try again!");
    });

    it('should evaluate multiple_choice correctly', async () => {
      mockPrisma.activity.findUnique.mockResolvedValue({
        id: 'activity-2',
        type: 'multiple_choice',
        conceptId: 'concept-1',
        content: { questions: [{ correctIndex: 2 }] },
      });
      mockPrisma.activityAttempt.create.mockResolvedValue({
        id: 'attempt-3',
        correct: true,
      });
      mockPrisma.progress.findUnique.mockResolvedValue({ mastery: 0.5 });
      mockPrisma.progress.update.mockResolvedValue({});

      const result = await service.recordAttempt('activity-2', {
        studentId: 'student-1',
        response: { selectedIndex: 2 },
      });

      expect(result.correct).toBe(true);
    });

    it('should evaluate matching correctly', async () => {
      mockPrisma.activity.findUnique.mockResolvedValue({
        id: 'activity-3',
        type: 'matching',
        conceptId: 'concept-1',
        content: {
          pairs: [
            { left: 'A', right: '1' },
            { left: 'B', right: '2' },
          ],
        },
      });
      mockPrisma.activityAttempt.create.mockResolvedValue({
        id: 'attempt-4',
        correct: true,
      });
      mockPrisma.progress.findUnique.mockResolvedValue({ mastery: 0.75 });
      mockPrisma.progress.update.mockResolvedValue({});

      const result = await service.recordAttempt('activity-3', {
        studentId: 'student-1',
        response: {
          pairs: [
            { left: 'A', right: '1' },
            { left: 'B', right: '2' },
          ],
        },
      });

      expect(result.correct).toBe(true);
    });

    it('should evaluate sequencing correctly', async () => {
      mockPrisma.activity.findUnique.mockResolvedValue({
        id: 'activity-4',
        type: 'sequencing',
        conceptId: 'concept-1',
        content: { correctOrder: [1, 2, 3, 4] },
      });
      mockPrisma.activityAttempt.create.mockResolvedValue({
        id: 'attempt-5',
        correct: true,
      });
      mockPrisma.progress.findUnique.mockResolvedValue(null);
      mockPrisma.progress.create.mockResolvedValue({});

      const result = await service.recordAttempt('activity-4', {
        studentId: 'student-1',
        response: { order: [1, 2, 3, 4] },
      });

      expect(result.correct).toBe(true);
    });
  });

  describe('getAttempts', () => {
    it('should return attempts ordered by createdAt desc', async () => {
      const attempts = [
        { id: '2', createdAt: new Date('2025-01-02') },
        { id: '1', createdAt: new Date('2025-01-01') },
      ];
      mockPrisma.activityAttempt.findMany.mockResolvedValue(attempts);

      const result = await service.getAttempts('student-1', 'activity-1');

      expect(result).toEqual(attempts);
      expect(mockPrisma.activityAttempt.findMany).toHaveBeenCalledWith({
        where: { studentId: 'student-1', activityId: 'activity-1' },
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('getLatestAttempt', () => {
    it('should return the most recent attempt', async () => {
      const attempt = { id: 'latest', createdAt: new Date('2025-01-03') };
      mockPrisma.activityAttempt.findFirst.mockResolvedValue(attempt);

      const result = await service.getLatestAttempt('student-1', 'activity-1');

      expect(result).toEqual(attempt);
    });
  });
});
