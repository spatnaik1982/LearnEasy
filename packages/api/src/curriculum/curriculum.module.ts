import { Module } from '@nestjs/common';
import {
  CurriculumController,
  SubjectController,
  ChapterController,
  ConceptController,
} from './curriculum.controller';
import { CurriculumService } from './curriculum.service';

@Module({
  controllers: [
    CurriculumController,
    SubjectController,
    ChapterController,
    ConceptController,
  ],
  providers: [CurriculumService],
})
export class CurriculumModule {}