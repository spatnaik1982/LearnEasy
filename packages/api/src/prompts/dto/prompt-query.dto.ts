import { IsOptional, IsInt, Min, Max } from 'class-validator';

export class PromptQueryDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  level?: number;
}
