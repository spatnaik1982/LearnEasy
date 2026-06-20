import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateParentDto } from './dto/update-parent.dto';

@Injectable()
export class ParentService {
  constructor(private prisma: PrismaService) {}

  async getProfile(id: string) {
    const parent = await this.prisma.parent.findUnique({
      where: { id },
      include: {
        children: {
          select: { id: true, name: true, age: true, level: true },
        },
      },
    });
    if (!parent) throw new NotFoundException('Parent not found');
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...profile } = parent;
    return profile;
  }

  async updateProfile(id: string, dto: UpdateParentDto) {
    const parent = await this.prisma.parent.findUnique({
      where: { id },
    });
    if (!parent) throw new NotFoundException('Parent not found');

    const updated = await this.prisma.parent.update({
      where: { id },
      data: dto,
      include: {
        children: {
          select: { id: true, name: true, age: true, level: true },
        },
      },
    });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...profile } = updated;
    return profile;
  }
}
