import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SessionsService } from './sessions.service';
import { StartSessionDto } from './dto/start-session.dto';

@Controller()
@UseGuards(JwtAuthGuard)
export class SessionsController {
  constructor(private sessionsService: SessionsService) {}

  @Post('sessions')
  startSession(@Body() dto: StartSessionDto) {
    return this.sessionsService.startSession(dto);
  }

  @Patch('sessions/:id/end')
  endSession(@Param('id') id: string) {
    return this.sessionsService.endSession(id);
  }

  @Get('students/:id/sessions')
  getSessions(@Param('id') id: string) {
    return this.sessionsService.getSessions(id);
  }

  @Get('students/:id/sessions/latest')
  getLatestSession(@Param('id') id: string) {
    return this.sessionsService.getLatestSession(id);
  }
}
