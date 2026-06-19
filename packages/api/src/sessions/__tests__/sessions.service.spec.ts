import { Test, TestingModule } from '@nestjs/testing';
import { SessionsService } from '../sessions.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('SessionsService', () => {
  let service: SessionsService;
  let prisma: any;

  const mockPrisma = {
    session: {
      updateMany: jest.fn(),
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SessionsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<SessionsService>(SessionsService);
    prisma = module.get(PrismaService);

    jest.clearAllMocks();
  });

  describe('startSession', () => {
    it('should end any active session and create a new one', async () => {
      mockPrisma.session.updateMany.mockResolvedValue({ count: 1 });
      mockPrisma.session.create.mockResolvedValue({
        id: 'session-new',
        studentId: 'student-1',
        startTime: new Date(),
      });

      const result = await service.startSession({ studentId: 'student-1' });

      expect(mockPrisma.session.updateMany).toHaveBeenCalledWith({
        where: { studentId: 'student-1', endTime: null },
        data: { endTime: expect.any(Date) },
      });
      expect(mockPrisma.session.create).toHaveBeenCalledWith({
        data: { studentId: 'student-1' },
      });
      expect(result.id).toBe('session-new');
    });
  });

  describe('endSession', () => {
    it('should update session with endTime and duration', async () => {
      const startTime = new Date('2025-01-01T10:00:00Z');
      mockPrisma.session.findUnique.mockResolvedValue({
        id: 'session-1',
        startTime,
        endTime: null,
      });
      mockPrisma.session.update.mockResolvedValue({
        id: 'session-1',
        startTime,
        endTime: new Date('2025-01-01T10:30:00Z'),
        duration: 1800,
      });

      const result = await service.endSession('session-1');

      expect(result.duration).toBeGreaterThanOrEqual(0);
      expect(mockPrisma.session.update).toHaveBeenCalled();
    });

    it('should throw NotFoundException when session does not exist', async () => {
      mockPrisma.session.findUnique.mockResolvedValue(null);

      await expect(service.endSession('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getSessions', () => {
    it('should return sessions from the last 30 days', async () => {
      const sessions = [
        { id: 's1', startTime: new Date('2025-01-20') },
        { id: 's2', startTime: new Date('2025-01-15') },
      ];
      mockPrisma.session.findMany.mockResolvedValue(sessions);

      const result = await service.getSessions('student-1');

      expect(result).toEqual(sessions);
      expect(mockPrisma.session.findMany).toHaveBeenCalledWith({
        where: {
          studentId: 'student-1',
          startTime: { gte: expect.any(Date) },
        },
        orderBy: { startTime: 'desc' },
      });
    });
  });

  describe('getLatestSession', () => {
    it('should return the most recent incomplete session', async () => {
      const session = {
        id: 's1',
        studentId: 'student-1',
        startTime: new Date(),
        endTime: null,
      };
      mockPrisma.session.findFirst.mockResolvedValue(session);

      const result = await service.getLatestSession('student-1');

      expect(result).toEqual(session);
      expect(mockPrisma.session.findFirst).toHaveBeenCalledWith({
        where: { studentId: 'student-1', endTime: null },
        orderBy: { startTime: 'desc' },
      });
    });
  });
});
