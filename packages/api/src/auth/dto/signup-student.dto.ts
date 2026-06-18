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

export class SignupStudentDto {
  @IsEmail()
  email: string;

  @IsString()
  name: string;

  @IsString()
  password: string;

  @IsInt()
  @Min(3)
  @Max(99)
  age: number;

  @IsString()
  @IsIn(['A', 'B', 'C'])
  level: string;

  @IsInt()
  @Min(1)
  @Max(3)
  autismSupportLevel: number;

  @IsString()
  @IsIn(['low', 'medium', 'high'])
  readingLevel: string;

  @IsBoolean()
  visualSupport: boolean;

  @IsBoolean()
  audioSupport: boolean;

  @IsBoolean()
  sensorySensitivity: boolean;

  @IsString()
  @IsIn(['short', 'medium', 'long'])
  attentionSpan: string;

  @IsOptional()
  @IsString()
  parentId?: string;
}