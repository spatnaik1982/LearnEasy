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
  // Auto-completed observe step (see ActivityRenderer observe-step auto-complete pattern)
  if (response.observed === true) {
    return { correct: true };
  }

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

    case "fraction_visual": {
      const shaded = response.shaded as number | undefined;
      const expectedNumerator = content.numerator as number | undefined;
      const interactive = content.interactive as boolean | undefined;

      // Observe step: non-interactive, no expected answer -> auto-complete
      if (interactive === false) return { correct: true };

      // Interactive: a missing shade response means the user hasn't answered correctly
      if (shaded === undefined) return { correct: false };

      return { correct: shaded === expectedNumerator };
    }

    case "place_value_chart": {
      const targetNumber = content.targetNumber as number | undefined;
      const maxPlaces = (content.maxPlaces as 'lakh' | 'crore') ?? 'crore';
      const interactive = content.interactive as boolean | undefined;
      const placedDigits = response.placedDigits as Record<number, number> | undefined;

      // Observe step: non-interactive -> auto-complete
      if (interactive === false) return { correct: true };

      // Interactive: need both targetNumber and user's placed digits
      if (targetNumber == null || !placedDigits) return { correct: false };

      const columns = maxPlaces === 'lakh' ? 6 : 8;
      const targetStr = String(targetNumber).padStart(columns, '0');
      const placedStr = Array.from({ length: columns }, (_, i) => String(placedDigits[i] ?? 0)).join('');
      return { correct: placedStr === targetStr };
    }

    case "grid_area": {
      const highlighted = response.highlighted as { row: number; col: number }[] | undefined;
      const expectedHighlighted = content.highlighted as { row: number; col: number }[] | undefined;
      const interactive = content.interactive as boolean | undefined;

      // Non-interactive or no authored target -> can't score, auto-complete
      if (interactive === false || !expectedHighlighted) return { correct: true };

      if (!highlighted) return { correct: false };

      const userSet = new Set(highlighted.map(c => `${c.row},${c.col}`));
      const allMatch = expectedHighlighted.length === highlighted.length &&
        expectedHighlighted.every(c => userSet.has(`${c.row},${c.col}`));

      return { correct: allMatch };
    }

    case "chart_reader": {
      const selectedLabel = response.selectedLabel as string | undefined;
      const expectedLabel = content.correctLabel as string | undefined;
      const interactive = content.interactive as boolean | undefined;

      // No correctLabel set, OR non-interactive: this is a stimulus, not a scored activity; auto-complete
      if (!expectedLabel || interactive === false) return { correct: true };

      return {
        correct: selectedLabel !== undefined && selectedLabel === expectedLabel,
      };
    }

    case "clock_time": {
      const setHour = response.hour as number | undefined;
      const setMinute = response.minute as number | undefined;
      const targetTime = content.targetTime as { hour: number; minute: number } | undefined;
      const interactive = content.interactive as boolean | undefined;

      // Observe step: non-interactive, no target -> auto-complete
      if (interactive === false || !targetTime) {
        return { correct: true };
      }

      if (setHour === undefined || setMinute === undefined) return { correct: false };
      const hourMatch = setHour === targetTime.hour;
      const minuteDiff = Math.abs(setMinute - targetTime.minute);
      return {
        correct: hourMatch && minuteDiff <= 5,
      };
    }

    case "measurement_scale": {
      const setValue = response.value as number | undefined;
      const targetValue = content.targetValue as number | undefined;
      const interactive = content.interactive as boolean | undefined;

      // Observe step: non-interactive, no target -> auto-complete
      if (interactive === false || targetValue === undefined) {
        return { correct: true };
      }

      if (setValue === undefined) return { correct: false };
      const step = (content.step as number) ?? 1;
      return {
        correct: Math.abs(setValue - targetValue) <= step,
      };
    }

    case "fill_blank": {
      const answers = response.answers as Record<string, string | number> | undefined;
      const blanks = content.blanks as { id: string; correctAnswer: string | number }[] | undefined;
      if (!answers || !blanks) return { correct: false };
      const allCorrect = blanks.every(
        (b) => String(answers[b.id]) === String(b.correctAnswer),
      );
      return { correct: allCorrect };
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
  "That is right.",
  "You got the correct answer.",
  "Good work.",
  "You answered correctly.",
];

const incorrectMessages = [
  "Let us try that again.",
  "Not quite. Try again.",
  "Almost. Try once more.",
  "Keep trying. You can do it.",
];

/**
 * Returns ALX-compliant feedback based on whether the response was correct.
 */
export function getActivityFeedback(correct: boolean): string {
  const messages = correct ? correctMessages : incorrectMessages;
  return messages[Math.floor(Math.random() * messages.length)];
}

/**
 * Returns an ALX-compliant guidance message based on the activity type.
 * Guidance messages are concrete, action-oriented, and avoid abstract reasoning.
 */
export function getGuidanceMessage(type: string): string {
  const messages: Record<string, string> = {
    visual_counter: "Count each item. Touch each item as you count.",
    visual_counting: "Count each item. Touch each item as you count.",
    multiple_choice: "Read each choice. Pick the one that answers the question.",
    matching: "Tap an item on the left, then tap its match on the right.",
    sequencing: "Tap items to add them. Drag to reorder from first to last.",
    drag_drop: "Drag each item to its correct place. Or tap an item, then tap a target.",
    dragdrop: "Drag each item to its correct place. Or tap an item, then tap a target.",
    fill_blank: "Type the missing word. Or pick from the options.",
    fraction_visual: "Count the shaded parts. Then count the total parts.",
    place_value_chart: "Place each digit in the correct column.",
    grid_area: "Count the highlighted squares.",
    chart_reader: "Look at the chart. Each bar shows a value.",
    clock_time: "Look at the hour hand. Then look at the minute hand.",
    measurement_scale: "Read the number on the scale.",
    story_question: "Read the story. Then pick the correct answer.",
    real_world: "Think about what you would do.",
    real_world_task: "Think about what you would do.",
  };
  return messages[type] ?? "Read the question. Pick the correct answer.";
}

/**
 * Returns a hint text string for a given activity content.
 * Falls back from content.hints[] array, then to a type-specific generic hint.
 */
export function getHintText(
  type: string,
  content: Record<string, unknown>,
  hintIndex: number,
): string | null {
  const hints = content.hints as string[] | undefined;
  if (hints && hintIndex >= 0 && hintIndex < hints.length) {
    return hints[hintIndex];
  }
  // Type-specific fallback hints
  const fallbackHints: Record<string, string[]> = {
    visual_counter: ["Count each item aloud.", "Point to each item as you count."],
    visual_counting: ["Count each item aloud.", "Point to each item as you count."],
    matching: ["Tap an item on the left, then tap its match on the right.", "Try matching items you know first."],
    sequencing: ["Tap items to add them to your sequence.", "Think about what comes first, next, and last."],
    multiple_choice: ["Read each choice. Pick the one that answers the question.", "Eliminate choices you know are wrong first."],
    fill_blank: ["Read the sentence again. What word fits?", "Look for clues near the blank."],
    drag_drop: ["Look at each label. Where does it belong?", "Try placing items you know first."],
    dragdrop: ["Look at each label. Where does it belong?", "Try placing items you know first."],
    fraction_visual: ["Count the shaded parts.", "The bottom number shows the total parts."],
    place_value_chart: ["Look at each column label. Place one digit in each column.", "Start from the rightmost column."],
    grid_area: ["Count the highlighted squares one by one.", "Each square is one unit."],
    chart_reader: ["Look at each bar. The tallest bar shows the largest value.", "Read the label under each bar."],
    clock_time: ["Look at the short hand. That shows the hour.", "Look at the long hand. That shows the minutes."],
    measurement_scale: ["Read the number that lines up with the marker.", "Count the marks between numbers."],
    story_question: ["Read the story again.", "Find the sentence that answers the question."],
  };
  const fallback = fallbackHints[type];
  if (fallback && hintIndex >= 0 && hintIndex < fallback.length) {
    return fallback[hintIndex];
  }
  return null;
}
