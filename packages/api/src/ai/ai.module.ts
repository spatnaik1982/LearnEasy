import { Module } from '@nestjs/common';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { AiTutorService } from '@learn-easy/ai';

@Module({
  controllers: [AiController],
  providers: [AiService, AiTutorService],
  exports: [AiService],
})
export class AiModule {}