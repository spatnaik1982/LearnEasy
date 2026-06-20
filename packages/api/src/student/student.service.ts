import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateStudentDto } from './dto/update-student.dto';

@Injectable()
export class StudentService {
  constructor(private prisma: PrismaService) {}

  async getProfile(id: string) {
    const student = await this.prisma.student.findUnique({
      where: { id },
    });
    if (!student) throw new NotFoundException('Student not found');
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...profile } = student;
    return profile;
  }

  async updateProfile(id: string, dto: UpdateStudentDto) {
    const student = await this.prisma.student.findUnique({
      where: { id },
    });
    if (!student) throw new NotFoundException('Student not found');

    const updated = await this.prisma.student.update({
      where: { id },
      data: dto,
    });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...profile } = updated;
    return profile;
  }

  async completeOnboarding(id: string) {
    await this.prisma.student.update({
      where: { id },
      data: { onboardedAt: new Date() },
    });
  }
}
