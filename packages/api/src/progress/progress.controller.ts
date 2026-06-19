import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ProgressService } from './progress.service';

@Controller('students')
@UseGuards(JwtAuthGuard)
export class ProgressController {
  constructor(private progressService: ProgressService) {}

  @Get(':id/progress')
  getStudentProgress(@Param('id') id: string) {
    return this.progressService.getStudentProgress(id);
  }

  @Get(':id/progress/:conceptId')
  getConceptProgress(
    @Param('id') id: string,
    @Param('conceptId') conceptId: string,
  ) {
    return this.progressService.getConceptProgress(id, conceptId);
  }

  @Get(':id/progress/by-chapter/:chapterId')
  getChapterProgress(
    @Param('id') id: string,
    @Param('chapterId') chapterId: string,
  ) {
    return this.progressService.getChapterProgress(id, chapterId);
  }

  @Get(':id/progress/by-subject/:subjectId')
  getSubjectProgress(
    @Param('id') id: string,
    @Param('subjectId') subjectId: string,
  ) {
    return this.progressService.getSubjectProgress(id, subjectId);
  }
}
