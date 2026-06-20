import {
  IsBoolean,
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
  Min,
  Max,
  IsIn,
} from 'class-validator';

export class UpdateStudentDto {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsInt()
  @Min(3)
  @Max(99)
  age?: number;

  @IsOptional()
  @IsString()
  @IsIn(['A', 'B', 'C'])
  level?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(3)
  autismSupportLevel?: number;

  @IsOptional()
  @IsString()
  @IsIn(['low', 'medium', 'high'])
  readingLevel?: string;

  @IsOptional()
  @IsBoolean()
  visualSupport?: boolean;

  @IsOptional()
  @IsBoolean()
  audioSupport?: boolean;

  @IsOptional()
  @IsBoolean()
  sensorySensitivity?: boolean;

  @IsOptional()
  @IsString()
  @IsIn(['short', 'medium', 'long'])
  attentionSpan?: string;
}
