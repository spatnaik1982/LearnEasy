import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ResumeService } from './resume.service';

@Controller('students')
@UseGuards(JwtAuthGuard)
export class ResumeController {
  constructor(private resumeService: ResumeService) {}

  @Get(':id/resume-state')
  getResumeState(@Param('id') id: string) {
    return this.resumeService.getResumeState(id);
  }
}
