import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'learn-easy-secret',
    });
  }

  async validate(payload: { sub: string; email: string; role: string }) {
    if (payload.role === 'student') {
      const student = await this.prisma.student.findUnique({
        where: { id: payload.sub },
      });
      if (!student) throw new UnauthorizedException();
      return { id: student.id, email: student.email, role: 'student' };
    }

    const parent = await this.prisma.parent.findUnique({
      where: { id: payload.sub },
    });
    if (!parent) throw new UnauthorizedException();
    return { id: parent.id, email: parent.email, role: 'parent' };
  }
}