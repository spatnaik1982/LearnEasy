import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StudentService {
  constructor(private prisma: PrismaService) {}

  async completeOnboarding(id: string) {
    await this.prisma.student.update({
      where: { id },
      data: { onboardedAt: new Date() },
    });
  }
}
