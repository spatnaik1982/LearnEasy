import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PromptsService } from './prompts.service';
import { PromptQueryDto } from './dto/prompt-query.dto';

@Controller()
@UseGuards(JwtAuthGuard)
export class PromptsController {
  constructor(private promptsService: PromptsService) {}

  @Get('activities/:id/prompts')
  getPrompt(@Param('id') id: string, @Query() query: PromptQueryDto) {
    const level = query.level ?? 1;
    return this.promptsService.getPrompt(id, level);
  }

  @Get('students/:id/prompt-level/:conceptId')
  getPromptLevel(
    @Param('id') studentId: string,
    @Param('conceptId') conceptId: string,
  ) {
    return this.promptsService.getPromptLevel(studentId, conceptId);
  }
}
