import { evaluateActivity, ActivityContent } from './activity-utils';
import { normalizeContent } from './normalize-content';

export interface RoundtripResult {
  activityId: string;
  type: string;
  step: string;
  passed: boolean;
  reason?: string;
}

export function buildCorrectResponse(type: string, content: Record<string, unknown>): Record<string, unknown> {
  switch (type) {
    case 'visual_counting':
    case 'visual_counter': {
      const expected = (content.sum as number | undefined) ?? (content.count as number | undefined);
      return { count: expected ?? 0 };
    }
    case 'matching': {
      const pairs = (content.pairs as Array<{ id: string; itemA: string; itemB: string }>) ?? [];
      return { pairs: pairs.map((p) => ({ id: p.id, correct: true })) };
    }
    case 'sequencing': {
      return { order: (content.correctOrder as string[]) ?? [] };
    }
    case 'multiple_choice':
    case 'story_question': {
      const questions = (content.questions as Array<{ correctIndex: number }>) ?? [];
      if (questions.length === 0) {
        const ci = (content.correctIndex as number) ?? 0;
        return { selectedIndex: ci, questionIndex: 0, correct: true };
      }
      return { selectedIndex: questions[0].correctIndex, questionIndex: 0, correct: true };
    }
    case 'drag_drop':
    case 'dragdrop': {
      return { droppedPositions: (content.expectedPositions as Record<string, string>) ?? {} };
    }
    case 'real_world':
    case 'real_world_task': {
      return { completed: true };
    }
    case 'fraction_visual': {
      return { shaded: (content.numerator as number) ?? 0 };
    }
    case 'place_value_chart': {
      return { __skip: 'click-driven' };
    }
    case 'grid_area': {
      const highlighted = (content.highlighted as { row: number; col: number }[]) ?? [];
      return { highlighted, count: highlighted.length };
    }
    case 'chart_reader': {
      return { selectedLabel: (content.correctLabel as string) ?? '' };
    }
    case 'clock_time': {
      const tt = (content.targetTime as { hour: number; minute: number }) ?? { hour: 0, minute: 0 };
      return { hour: tt.hour, minute: tt.minute };
    }
    case 'measurement_scale': {
      return { value: (content.targetValue as number) ?? 0 };
    }
    case 'fill_blank': {
      const blanks = (content.blanks as Array<{ id: string; correctAnswer: string | number }>) ?? [];
      const answers: Record<string, string | number> = {};
      for (const b of blanks) answers[b.id] = b.correctAnswer;
      return { answers };
    }
    default:
      return { __skip: `unknown type: ${type}` };
  }
}

export function runRoundtrip(
  activity: { id: string; type: string; step: string; content: Record<string, unknown> },
): RoundtripResult {
  const type = activity.type.toLowerCase().replace(/-/g, '_');
  const normalized = normalizeContent(type, activity.content);
  const response = buildCorrectResponse(type, normalized);

  if (activity.step === 'observe') {
    const result = evaluateActivity(type, { observed: true }, normalized as ActivityContent);
    return {
      activityId: activity.id,
      type,
      step: activity.step,
      passed: result.correct === true,
      reason: result.correct ? undefined : 'observe step did not return correct on { observed: true }',
    };
  }

  if (response.__skip) {
    return {
      activityId: activity.id,
      type,
      step: activity.step,
      passed: true,
      reason: `skipped: ${response.__skip}`,
    };
  }

  if ((type === 'multiple_choice' || type === 'story_question') && activity.step !== 'observe') {
    const questions = (normalized.questions as Array<{ correctIndex: number }>) ?? [];
    if (questions.length > 1) {
      const allCorrect = questions.every((q, idx) => {
        const r = evaluateActivity(type, { selectedIndex: q.correctIndex, questionIndex: idx, correct: true }, normalized as ActivityContent);
        return r.correct === true;
      });
      return {
        activityId: activity.id,
        type,
        step: activity.step,
        passed: allCorrect,
        reason: allCorrect ? undefined : 'one or more questions failed with correct response',
      };
    }
  }

  const result = evaluateActivity(type, response, normalized as ActivityContent);
  return {
    activityId: activity.id,
    type,
    step: activity.step,
    passed: result.correct === true,
    reason: result.correct ? undefined : `evaluateActivity returned correct=${result.correct}`,
  };
}
