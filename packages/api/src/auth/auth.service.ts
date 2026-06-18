import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { SignupStudentDto } from './dto/signup-student.dto';
import { SignupParentDto } from './dto/signup-parent.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  private generateToken(id: string, email: string, role: string) {
    return this.jwtService.sign({ sub: id, email, role });
  }

  async signupStudent(dto: SignupStudentDto) {
    const existing = await this.prisma.student.findUnique({
      where: { email: dto.email },
    });
    if (existing) throw new ConflictException('Email already registered');

    const hashed = await bcrypt.hash(dto.password, 10);

    const student = await this.prisma.student.create({
      data: {
        email: dto.email,
        name: dto.name,
        password: hashed,
        age: dto.age,
        level: dto.level,
        autismSupportLevel: dto.autismSupportLevel,
        readingLevel: dto.readingLevel,
        visualSupport: dto.visualSupport,
        audioSupport: dto.audioSupport,
        sensorySensitivity: dto.sensorySensitivity,
        attentionSpan: dto.attentionSpan,
        parentId: dto.parentId,
      },
    });

    return {
      access_token: this.generateToken(student.id, student.email, 'student'),
      user: { id: student.id, email: student.email, name: student.name, role: 'student' },
    };
  }

  async signupParent(dto: SignupParentDto) {
    const existing = await this.prisma.parent.findUnique({
      where: { email: dto.email },
    });
    if (existing) throw new ConflictException('Email already registered');

    const hashed = await bcrypt.hash(dto.password, 10);

    const parent = await this.prisma.parent.create({
      data: {
        email: dto.email,
        name: dto.name,
        password: hashed,
      },
    });

    return {
      access_token: this.generateToken(parent.id, parent.email, 'parent'),
      user: { id: parent.id, email: parent.email, name: parent.name, role: 'parent' },
    };
  }

  async login(dto: LoginDto) {
    if (dto.role === 'student') {
      const student = await this.prisma.student.findUnique({
        where: { email: dto.email },
      });
      if (!student) throw new UnauthorizedException('Invalid credentials');

      const valid = await bcrypt.compare(dto.password, student.password);
      if (!valid) throw new UnauthorizedException('Invalid credentials');

      return {
        access_token: this.generateToken(student.id, student.email, 'student'),
        user: { id: student.id, email: student.email, name: student.name, role: 'student' },
      };
    }

    const parent = await this.prisma.parent.findUnique({
      where: { email: dto.email },
    });
    if (!parent) throw new UnauthorizedException('Invalid credentials');

    const valid = await bcrypt.compare(dto.password, parent.password);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    return {
      access_token: this.generateToken(parent.id, parent.email, 'parent'),
      user: { id: parent.id, email: parent.email, name: parent.name, role: 'parent' },
    };
  }
}