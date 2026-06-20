import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../auth.service';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: any;
  let jwtService: any;

  const mockPrisma = {
    student: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    parent: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  };

  const mockJwtService = {
    sign: jest.fn().mockReturnValue('mock-token'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get(PrismaService);
    jwtService = module.get(JwtService);

    jest.clearAllMocks();
  });

  describe('signupStudent', () => {
    const validDto = {
      email: 'student@test.com',
      name: 'Test Student',
      password: 'test123',
      age: 8,
      level: 'A',
      autismSupportLevel: 2,
      readingLevel: 'medium',
      visualSupport: true,
      audioSupport: false,
      sensorySensitivity: true,
      attentionSpan: 'medium',
    };

    it('should create a student and return token + user', async () => {
      mockPrisma.student.findUnique.mockResolvedValue(null);
      mockPrisma.student.create.mockResolvedValue({
        id: 'student-1',
        email: 'student@test.com',
        name: 'Test Student',
        level: 'A',
        password: 'hashed-password',
      });

      const result = await service.signupStudent(validDto);

      expect(result.access_token).toBe('mock-token');
      expect(result.user).toEqual({
        id: 'student-1',
        email: 'student@test.com',
        name: 'Test Student',
        role: 'student',
        level: 'A',
      });
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        sub: 'student-1',
        email: 'student@test.com',
        role: 'student',
        level: 'A',
      });
    });

    it('should throw ConflictException when email already exists', async () => {
      mockPrisma.student.findUnique.mockResolvedValue({ id: 'existing', email: validDto.email });

      await expect(service.signupStudent(validDto)).rejects.toThrow(ConflictException);
    });

    it('should throw ConflictException with message Email already registered', async () => {
      mockPrisma.student.findUnique.mockResolvedValue({ id: 'existing', email: validDto.email });

      await expect(service.signupStudent(validDto)).rejects.toThrow('Email already registered');
    });
  });

  describe('signupParent', () => {
    const validDto = {
      email: 'parent@test.com',
      name: 'Test Parent',
      password: 'test123',
    };

    it('should create a parent and return token + user', async () => {
      mockPrisma.parent.findUnique.mockResolvedValue(null);
      mockPrisma.parent.create.mockResolvedValue({
        id: 'parent-1',
        email: 'parent@test.com',
        name: 'Test Parent',
        password: 'hashed-password',
      });

      const result = await service.signupParent(validDto);

      expect(result.access_token).toBe('mock-token');
      expect(result.user).toEqual({
        id: 'parent-1',
        email: 'parent@test.com',
        name: 'Test Parent',
        role: 'parent',
      });
    });

    it('should throw ConflictException when email already exists', async () => {
      mockPrisma.parent.findUnique.mockResolvedValue({ id: 'existing', email: validDto.email });

      await expect(service.signupParent(validDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    it('should login a student with valid credentials', async () => {
      const bcrypt = await import('bcryptjs');
      const hashed = await bcrypt.hash('test123', 10);

      mockPrisma.student.findUnique.mockResolvedValue({
        id: 'student-1',
        email: 'student@test.com',
        name: 'Test Student',
        password: hashed,
        level: 'A',
      });

      const result = await service.login({
        email: 'student@test.com',
        password: 'test123',
        role: 'student',
      });

      expect(result.access_token).toBe('mock-token');
      expect(result.user.role).toBe('student');
    });

    it('should return 401 for student with wrong password', async () => {
      const hashed = await (await import('bcryptjs')).hash('correctpw', 10);
      mockPrisma.student.findUnique.mockResolvedValue({
        id: 'student-1',
        email: 'student@test.com',
        password: hashed,
      });

      await expect(service.login({
        email: 'student@test.com',
        password: 'wrongpw',
        role: 'student',
      })).rejects.toThrow(UnauthorizedException);
    });

    it('should return 401 for non-existent student email', async () => {
      mockPrisma.student.findUnique.mockResolvedValue(null);

      await expect(service.login({
        email: 'nonexistent@test.com',
        password: 'test123',
        role: 'student',
      })).rejects.toThrow(UnauthorizedException);
    });

    it('should login a parent with valid credentials', async () => {
      const hashed = await (await import('bcryptjs')).hash('test123', 10);

      mockPrisma.parent.findUnique.mockResolvedValue({
        id: 'parent-1',
        email: 'parent@test.com',
        name: 'Test Parent',
        password: hashed,
      });

      const result = await service.login({
        email: 'parent@test.com',
        password: 'test123',
        role: 'parent',
      });

      expect(result.access_token).toBe('mock-token');
      expect(result.user.role).toBe('parent');
    });

    it('should return 401 for parent with wrong password', async () => {
      const hashed = await (await import('bcryptjs')).hash('correctpw', 10);
      mockPrisma.parent.findUnique.mockResolvedValue({
        id: 'parent-1',
        email: 'parent@test.com',
        password: hashed,
      });

      await expect(service.login({
        email: 'parent@test.com',
        password: 'wrongpw',
        role: 'parent',
      })).rejects.toThrow(UnauthorizedException);
    });
  });
});
