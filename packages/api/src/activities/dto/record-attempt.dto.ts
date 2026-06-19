import { IsString, IsOptional, IsInt, Min, IsObject } from 'class-validator';

export class RecordAttemptDto {
  @IsString()
  studentId: string;

  @IsObject()
  response: Record<string, any>;

  @IsOptional()
  @IsInt()
  @Min(0)
  hintsUsed?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  timeSpent?: number;
}
