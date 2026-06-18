import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AiService } from './ai.service';
import { TutorRequestDto } from './dto/tutor-request.dto';
import { InsightRequestDto } from './dto/insight-request.dto';

@Controller('api/ai')
@UseGuards(JwtAuthGuard)
export class AiController {
  constructor(private aiService: AiService) {}

  @Post('tutor')
  async tutor(@Body() dto: TutorRequestDto) {
    const result = await this.aiService.tutor(dto);
    return { data: result };
  }

  @Post('insights')
  async insights(@Body() dto: InsightRequestDto) {
    const result = await this.aiService.generateInsight(dto.studentId);
    return { data: result };
  }
}