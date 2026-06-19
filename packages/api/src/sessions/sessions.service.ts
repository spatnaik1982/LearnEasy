import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StartSessionDto } from './dto/start-session.dto';

@Injectable()
export class SessionsService {
  constructor(private prisma: PrismaService) {}

  async startSession(dto: StartSessionDto) {
    // End any existing active session for the student
    await this.prisma.session.updateMany({
      where: {
        studentId: dto.studentId,
        endTime: null,
      },
      data: {
        endTime: new Date(),
      },
    });

    // Create new session
    return this.prisma.session.create({
      data: {
        studentId: dto.studentId,
      },
    });
  }

  async endSession(sessionId: string) {
    const session = await this.prisma.session.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      throw new NotFoundException(`Session ${sessionId} not found`);
    }

    const endTime = new Date();
    const duration = Math.floor(
      (endTime.getTime() - session.startTime.getTime()) / 1000,
    );

    return this.prisma.session.update({
      where: { id: sessionId },
      data: {
        endTime,
        duration,
      },
    });
  }

  async getSessions(studentId: string) {
    // Last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    return this.prisma.session.findMany({
      where: {
        studentId,
        startTime: { gte: thirtyDaysAgo },
      },
      orderBy: { startTime: 'desc' },
    });
  }

  async getLatestSession(studentId: string) {
    return this.prisma.session.findFirst({
      where: {
        studentId,
        endTime: null,
      },
      orderBy: { startTime: 'desc' },
    });
  }
}
