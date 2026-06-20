import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { CurriculumModule } from './curriculum/curriculum.module';
import { AiModule } from './ai/ai.module';
import { ActivitiesModule } from './activities/activities.module';
import { ProgressModule } from './progress/progress.module';
import { SessionsModule } from './sessions/sessions.module';
import { ResumeModule } from './resume/resume.module';
import { PromptsModule } from './prompts/prompts.module';
import { MasteryModule } from './mastery/mastery.module';
import { StudentModule } from './student/student.module';
import { ParentModule } from './parent/parent.module';

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
    ResumeModule,
    PromptsModule,
    MasteryModule,
    StudentModule,
    ParentModule,
  ],
})
export class AppModule {}
