import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StudentService {
  constructor(private prisma: PrismaService) {}

  async getProfile(id: string) {
    const student = await this.prisma.student.findUnique({
      where: { id },
      select: { id: true, name: true, email: true, level: true },
    });
    if (!student) throw new NotFoundException('Student not found');
    return student;
  }

  async completeOnboarding(id: string) {
    await this.prisma.student.update({
      where: { id },
      data: { onboardedAt: new Date() },
    });
  }
}
