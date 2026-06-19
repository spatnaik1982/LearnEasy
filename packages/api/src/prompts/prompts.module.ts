import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { PromptsController } from './prompts.controller';
import { PromptsService } from './prompts.service';
import { PromptFadingService } from './prompt-fading.service';

@Module({
  imports: [PrismaModule],
  controllers: [PromptsController],
  providers: [PromptsService, PromptFadingService],
  exports: [PromptsService, PromptFadingService],
})
export class PromptsModule {}
