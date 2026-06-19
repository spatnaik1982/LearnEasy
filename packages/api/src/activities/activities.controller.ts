import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ActivitiesService } from './activities.service';
import { RecordAttemptDto } from './dto/record-attempt.dto';

@Controller('activities')
@UseGuards(JwtAuthGuard)
export class ActivitiesController {
  constructor(private activitiesService: ActivitiesService) {}

  @Post(':id/attempt')
  recordAttempt(@Param('id') id: string, @Body() dto: RecordAttemptDto) {
    return this.activitiesService.recordAttempt(id, dto);
  }

  @Get(':id/attempts')
  getAttempts(
    @Param('id') id: string,
    @Query('studentId') studentId: string,
  ) {
    return this.activitiesService.getAttempts(studentId, id);
  }

  @Get(':id/latest-attempt')
  getLatestAttempt(
    @Param('id') id: string,
    @Query('studentId') studentId: string,
  ) {
    return this.activitiesService.getLatestAttempt(studentId, id);
  }
}
