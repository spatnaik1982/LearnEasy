import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { StudentService } from './student.service';
import { UpdateStudentDto } from './dto/update-student.dto';

@Controller('students')
@UseGuards(JwtAuthGuard)
export class StudentController {
  constructor(private studentService: StudentService) {}

  @Get(':id')
  async getProfile(@Param('id') id: string) {
    const student = await this.studentService.getProfile(id);
    return { data: student };
  }

  @Patch(':id')
  async updateProfile(@Param('id') id: string, @Body() dto: UpdateStudentDto) {
    const student = await this.studentService.updateProfile(id, dto);
    return { data: student };
  }

  @Patch(':id/onboarding/complete')
  async completeOnboarding(@Param('id') id: string) {
    await this.studentService.completeOnboarding(id);
    return { data: { completed: true } };
  }
}
