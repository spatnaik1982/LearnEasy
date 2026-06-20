export interface ActivityContent {
  count?: number;
  sum?: number;
  pairs?: Array<{ id: string; itemA: string; itemB: string }>;
  correctOrder?: string[];
  correctIndex?: number;
  options?: string[];
  selectedIndex?: number;
  hints?: string[];
  question?: string;
  scenario?: string;
  taskDescription?: string;
  expectedPositions?: Record<string, string>;
  [key: string]: unknown;
}

export interface EvaluationResult {
  correct: boolean;
  accuracy?: number;
}

function compareArrays(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  return a.every((val, idx) => val === b[idx]);
}

/**
 * Evaluate an activity response against the expected content.
 * Returns an object with `correct` boolean and optional `accuracy` percentage.
 */
export function evaluateActivity(
  type: string,
  response: Record<string, unknown>,
  content: ActivityContent,
): EvaluationResult {
  switch (type) {
    case "visual_counter":
    case "visual_counting": {
      const expectedCount = content.sum ?? content.count;
      const givenCount = response.count as number | undefined;
      return {
        correct: givenCount === expectedCount,
        accuracy: expectedCount != null && givenCount != null
          ? Math.max(0, 1 - Math.abs(givenCount - expectedCount) / expectedCount)
          : undefined,
      };
    }

    case "matching": {
      const totalPairs = content.pairs?.length ?? 0;
      const responsePairs = response.pairs as Array<{ id: string; correct: boolean }> | undefined;

      if (!responsePairs || totalPairs === 0) {
        return { correct: false, accuracy: 0 };
      }

      const correctCount = responsePairs.filter((p) => p.correct).length;
      return {
        correct: correctCount === totalPairs,
        accuracy: totalPairs > 0 ? correctCount / totalPairs : 0,
      };
    }

    case "sequencing": {
      const correctOrder = content.correctOrder ?? [];
      const userOrder = response.order as string[] | undefined;

      if (!userOrder) return { correct: false, accuracy: 0 };

      const correct = compareArrays(correctOrder, userOrder);
      const accuracy =
        correctOrder.length > 0
          ? userOrder.filter(
              (id, idx) => id === correctOrder[idx],
            ).length / correctOrder.length
          : 0;

      return { correct, accuracy };
    }

    case "multiple_choice": {
      // Direct correctness override from multi-question aggregate
      if (typeof response.correct === "boolean") {
        return { correct: response.correct };
      }
      const correctIndex = content.correctIndex;
      const selectedIndex = response.selectedIndex as number | undefined;

      return {
        correct: selectedIndex === correctIndex,
      };
    }

    case "story_question": {
      if (typeof response.correct === "boolean") {
        return { correct: response.correct };
      }
      const correctIndex = content.correctIndex;
      const selectedIndex = response.selectedIndex as number | undefined;

      return {
        correct: selectedIndex === correctIndex,
      };
    }

    case "drag_drop":
    case "dragdrop": {
      const droppedPositions = response.droppedPositions as
        | Record<string, string>
        | undefined;
      const expected = content.expectedPositions as
        | Record<string, string>
        | undefined;

      if (!droppedPositions || !expected) {
        return { correct: false, accuracy: 0 };
      }

      const keys = Object.keys(expected);
      const correctCount = keys.filter(
        (key) => droppedPositions[key] === expected[key],
      ).length;

      return {
        correct: correctCount === keys.length,
        accuracy: keys.length > 0 ? correctCount / keys.length : 0,
      };
    }

    case "real_world": {
      // Real-world tasks are always marked completed
      return { correct: true };
    }

    default:
      return { correct: false };
  }
}

/**
 * Get a hint from the activity's hints array at the given level.
 * Returns null if no hint is available.
 */
export function getHint(
  activity: { content?: { hints?: string[] } },
  level: number,
): string | null {
  const hints = activity.content?.hints;
  if (!hints || hints.length === 0) return null;
  const index = level - 1;
  if (index < 0 || index >= hints.length) return null;
  return hints[index];
}

/**
 * ABA Prompt Levels
 */
export const PROMPT_LEVELS = [
  'demonstration',
  'visual_hint',
  'partial_hint',
  'verbal_cue',
  'independent',
] as const;

/**
 * Get a leveled hint from the activity's hints array.
 * Returns the hint at the requested level (1-5), with fallback
 * to the next available level if the requested level doesn't exist.
 */
export function getLeveledHint(
  activity: { content?: { hints?: string[] } },
  level: number,
): string | null {
  const hints = activity.content?.hints;
  if (!hints || hints.length === 0) return null;

  const index = level - 1;
  if (index >= 0 && index < hints.length) {
    return hints[index];
  }

  // Fallback to closest available level
  if (hints.length > 0) {
    if (level > hints.length) {
      return hints[hints.length - 1];
    }
    return hints[0];
  }

  return null;
}

const correctMessages = [
  "That's right! Well done!",
  "Great job! You got it!",
  "Excellent work!",
  "Perfect! You're doing great!",
  "Awesome! Keep it up!",
];

const incorrectMessages = [
  "Let's try that again.",
  "Not quite — give it another go.",
  "Almost there, try once more!",
  "Keep trying — you can do it!",
];

/**
 * Returns ALX-compliant feedback based on whether the response was correct.
 */
export function getActivityFeedback(correct: boolean): string {
  const messages = correct ? correctMessages : incorrectMessages;
  return messages[Math.floor(Math.random() * messages.length)];
}
