import { Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { StudentService } from './student.service';

@Controller('students')
@UseGuards(JwtAuthGuard)
export class StudentController {
  constructor(private studentService: StudentService) {}

  @Get(':id')
  async getProfile(@Param('id') id: string) {
    const student = await this.studentService.getProfile(id);
    return { data: student };
  }

  @Patch(':id/onboarding/complete')
  async completeOnboarding(@Param('id') id: string) {
    await this.studentService.completeOnboarding(id);
    return { data: { completed: true } };
  }
}
