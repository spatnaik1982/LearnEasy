import { Test, TestingModule } from '@nestjs/testing';
import { ProgressService } from '../progress.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('ProgressService', () => {
  let service: ProgressService;
  let prisma: any;

  const mockPrisma = {
    progress: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
    concept: {
      findMany: jest.fn(),
    },
    student: {
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProgressService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<ProgressService>(ProgressService);
    prisma = module.get(PrismaService);

    jest.clearAllMocks();
  });

  describe('getStudentProgress', () => {
    it('should return all progress records for a student', async () => {
      const progressRecords = [
        {
          id: 'p1',
          studentId: 'student-1',
          conceptId: 'concept-1',
          mastery: 0.5,
          completed: false,
          concept: { id: 'concept-1', name: 'Counting', code: 'COUNT' },
        },
      ];
      mockPrisma.progress.findMany.mockResolvedValue(progressRecords);

      const result = await service.getStudentProgress('student-1');

      expect(result).toEqual(progressRecords);
      expect(mockPrisma.progress.findMany).toHaveBeenCalledWith({
        where: { studentId: 'student-1' },
        include: { concept: { select: { id: true, name: true, code: true } } },
        orderBy: { updatedAt: 'desc' },
      });
    });
  });

  describe('getConceptProgress', () => {
    it('should return progress for a specific concept', async () => {
      const progress = {
        id: 'p1',
        studentId: 'student-1',
        conceptId: 'concept-1',
        mastery: 0.75,
        completed: false,
        concept: { id: 'concept-1', name: 'Counting', code: 'COUNT' },
      };
      mockPrisma.progress.findUnique.mockResolvedValue(progress);

      const result = await service.getConceptProgress('student-1', 'concept-1');

      expect(result).toEqual(progress);
    });

    it('should throw NotFoundException when no progress exists', async () => {
      mockPrisma.progress.findUnique.mockResolvedValue(null);

      await expect(
        service.getConceptProgress('student-1', 'concept-1'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getChapterProgress', () => {
    it('should return aggregated chapter progress', async () => {
      mockPrisma.concept.findMany.mockResolvedValue([
        { id: 'c1' },
        { id: 'c2' },
        { id: 'c3' },
      ]);

      mockPrisma.progress.findMany.mockResolvedValue([
        { completed: true, mastery: 1.0 },
        { completed: true, mastery: 0.75 },
        { completed: false, mastery: 0.5 },
      ]);

      const result = await service.getChapterProgress('student-1', 'ch-1');

      expect(result).toEqual({
        chapterId: 'ch-1',
        totalConcepts: 3,
        conceptsCompleted: 2,
        chapterMastery: 0.75,
      });
    });

    it('should return zero values for chapter with no concepts', async () => {
      mockPrisma.concept.findMany.mockResolvedValue([]);
      mockPrisma.progress.findMany.mockResolvedValue([]);

      const result = await service.getChapterProgress('student-1', 'ch-2');

      expect(result).toEqual({
        chapterId: 'ch-2',
        totalConcepts: 0,
        conceptsCompleted: 0,
        chapterMastery: 0,
      });
    });
  });

  describe('getSubjectProgress', () => {
    it('should return aggregated subject progress', async () => {
      mockPrisma.concept.findMany.mockResolvedValue([
        { id: 'c1' },
        { id: 'c2' },
      ]);

      mockPrisma.progress.findMany.mockResolvedValue([
        { mastery: 1.0 },
        { mastery: 0.5 },
      ]);

      const result = await service.getSubjectProgress('student-1', 'sub-1');

      expect(result).toEqual({
        subjectId: 'sub-1',
        totalConcepts: 2,
        conceptsStarted: 2,
        subjectMastery: 0.75,
      });
    });
  });

  describe('verifyParentAccess', () => {
    it('should return true when parent is linked to student', async () => {
      mockPrisma.student.findUnique.mockResolvedValue({ parentId: 'parent-1' });

      const result = await service.verifyParentAccess('parent-1', 'student-1');

      expect(result).toBe(true);
    });

    it('should return false when parent is not linked', async () => {
      mockPrisma.student.findUnique.mockResolvedValue({ parentId: 'parent-2' });

      const result = await service.verifyParentAccess('parent-1', 'student-1');

      expect(result).toBe(false);
    });

    it('should return false when student does not exist', async () => {
      mockPrisma.student.findUnique.mockResolvedValue(null);

      const result = await service.verifyParentAccess('parent-1', 'student-1');

      expect(result).toBe(false);
    });
  });
});
