import { IsIn, IsOptional, IsString } from 'class-validator';

export class TutorRequestDto {
  @IsString()
  conceptId: string;

  @IsOptional()
  @IsString()
  query?: string;

  @IsString()
  @IsIn(['explain', 'hint', 'encourage', 'insight'])
  type: 'explain' | 'hint' | 'encourage' | 'insight';
}