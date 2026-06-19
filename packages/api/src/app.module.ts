import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { CurriculumModule } from './curriculum/curriculum.module';
import { AiModule } from './ai/ai.module';
import { ActivitiesModule } from './activities/activities.module';
import { ProgressModule } from './progress/progress.module';
import { SessionsModule } from './sessions/sessions.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    CurriculumModule,
    AiModule,
    ActivitiesModule,
    ProgressModule,
    SessionsModule,
  ],
})
export class AppModule {}
