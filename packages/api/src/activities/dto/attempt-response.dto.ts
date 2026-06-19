export class AttemptResponseDto {
  attemptId: string;
  correct: boolean;
  feedback: string;
  promptLevel?: number;
  independentlyMastered?: boolean;
  mastery?: number;
  completed?: boolean;
  mastered?: boolean;
}
