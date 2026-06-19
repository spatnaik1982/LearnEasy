import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurriculumService } from './curriculum.service';

@Controller('levels')
@UseGuards(JwtAuthGuard)
export class CurriculumController {
  constructor(private curriculumService: CurriculumService) {}

  @Get()
  getLevels() {
    return this.curriculumService.getLevels();
  }

  @Get(':code/subjects')
  getSubjectsByLevel(@Param('code') code: string) {
    return this.curriculumService.getSubjectsByLevel(code);
  }
}

@Controller('subjects')
@UseGuards(JwtAuthGuard)
export class SubjectController {
  constructor(private curriculumService: CurriculumService) {}

  @Get(':id')
  getSubject(@Param('id') id: string) {
    return this.curriculumService.getSubject(id);
  }

  @Get(':id/chapters')
  getChaptersBySubject(@Param('id') id: string) {
    return this.curriculumService.getChaptersBySubject(id);
  }
}

@Controller('chapters')
@UseGuards(JwtAuthGuard)
export class ChapterController {
  constructor(private curriculumService: CurriculumService) {}

  @Get(':id')
  getChapter(@Param('id') id: string) {
    return this.curriculumService.getChapter(id);
  }

  @Get(':id/concepts')
  getConceptsByChapter(@Param('id') id: string) {
    return this.curriculumService.getConceptsByChapter(id);
  }
}

@Controller('concepts')
@UseGuards(JwtAuthGuard)
export class ConceptController {
  constructor(private curriculumService: CurriculumService) {}

  @Get(':id')
  getConcept(@Param('id') id: string) {
    return this.curriculumService.getConcept(id);
  }

  @Get(':id/activities')
  getActivitiesByConcept(@Param('id') id: string) {
    return this.curriculumService.getActivitiesByConcept(id);
  }
}