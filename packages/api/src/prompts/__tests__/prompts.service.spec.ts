import { Test, TestingModule } from '@nestjs/testing';
import { PromptsService } from '../prompts.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('PromptsService', () => {
  let service: PromptsService;
  let prisma: any;

  const mockPrisma = {
    activity: {
      findUnique: jest.fn(),
    },
    promptState: {
      findUnique: jest.fn(),
      upsert: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PromptsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<PromptsService>(PromptsService);
    prisma = module.get(PrismaService);

    jest.clearAllMocks();
  });

  describe('getPromptLevel', () => {
    it('should return default level 1 when no prompt state exists', async () => {
      mockPrisma.promptState.findUnique.mockResolvedValue(null);

      const result = await service.getPromptLevel('student-1', 'concept-1');

      expect(result).toEqual({ promptLevel: 1 });
    });

    it('should return the current prompt level from PromptState', async () => {
      mockPrisma.promptState.findUnique.mockResolvedValue({ promptLevel: 3 });

      const result = await service.getPromptLevel('student-1', 'concept-1');

      expect(result).toEqual({ promptLevel: 3 });
    });
  });

  describe('setPromptLevel', () => {
    it('should upsert and return the clamped prompt level', async () => {
      mockPrisma.promptState.upsert.mockResolvedValue({});

      const result = await service.setPromptLevel('student-1', 'concept-1', 4);

      expect(result).toEqual({ promptLevel: 4 });
      expect(mockPrisma.promptState.upsert).toHaveBeenCalledWith({
        where: {
          studentId_conceptId: { studentId: 'student-1', conceptId: 'concept-1' },
        },
        update: { promptLevel: 4 },
        create: { studentId: 'student-1', conceptId: 'concept-1', promptLevel: 4 },
      });
    });

    it('should clamp level to valid range (1-5)', async () => {
      mockPrisma.promptState.upsert.mockResolvedValue({});

      const resultHigh = await service.setPromptLevel('student-1', 'concept-1', 10);
      expect(resultHigh).toEqual({ promptLevel: 5 });

      const resultLow = await service.setPromptLevel('student-1', 'concept-1', 0);
      expect(resultLow).toEqual({ promptLevel: 1 });
    });
  });

  describe('getPrompt', () => {
    it('should throw NotFoundException when activity does not exist', async () => {
      mockPrisma.activity.findUnique.mockResolvedValue(null);

      await expect(
        service.getPrompt('nonexistent', 1),
      ).rejects.toThrow(NotFoundException);
    });

    it('should return hint at requested level', async () => {
      mockPrisma.activity.findUnique.mockResolvedValue({
        id: 'activity-1',
        content: {
          hints: ['Level 1 hint', 'Level 2 hint', 'Level 3 hint'],
        },
      });

      const result = await service.getPrompt('activity-1', 2);

      expect(result).toEqual({ hint: 'Level 2 hint', level: 2 });
    });

    it('should fallback to closest available level when requested level is out of range', async () => {
      mockPrisma.activity.findUnique.mockResolvedValue({
        id: 'activity-1',
        content: {
          hints: ['Level 1 hint', 'Level 2 hint'],
        },
      });

      const result = await service.getPrompt('activity-1', 5);

      // Fallback to closest: last available hint at level 2
      expect(result).toEqual({ hint: 'Level 2 hint', level: 2 });
    });

    it('should return empty string hint and default level when hints array is empty', async () => {
      mockPrisma.activity.findUnique.mockResolvedValue({
        id: 'activity-1',
        content: { hints: [] },
      });

      const result = await service.getPrompt('activity-1', 1);

      expect(result).toEqual({ hint: '', level: 1 });
    });
  });
});
