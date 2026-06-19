import { Module } from '@nestjs/common';
import { ActivitiesController } from './activities.controller';
import { ActivitiesService } from './activities.service';
import { PromptsModule } from '../prompts/prompts.module';
import { MasteryModule } from '../mastery/mastery.module';

@Module({
  imports: [PromptsModule, MasteryModule],
  controllers: [ActivitiesController],
  providers: [ActivitiesService],
})
export class ActivitiesModule {}
