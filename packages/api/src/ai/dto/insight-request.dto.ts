import { IsString } from 'class-validator';

export class InsightRequestDto {
  @IsString()
  studentId: string;
}