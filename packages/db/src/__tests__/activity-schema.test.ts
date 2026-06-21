import { describe, it, expect } from 'vitest';
import {
  activitySchema,
  activityContentSchema,
  validateActivity,
  VALID_TYPES_PER_STEP,
} from '../activity-schema';

// ─── Fixture helpers ──────────────────────────────────────────────────

function fullActivity(overrides: Record<string, unknown> = {}) {
  return {
    step: 'observe',
    type: 'visual_counting',
    order: 1,
    content: { type: 'visual_counting', content: { count: 3, items: ['🍎'], text: 'Three apples.' } },
    ...overrides,
  };
}

// ─── Tests for content schema (discriminated union) ──────────────────

describe('activityContentSchema', () => {
  it('parses visual_counting', () => {
    const result = activityContentSchema.safeParse({
      type: 'visual_counting',
      content: { count: 5, items: ['⭐'], text: 'Five stars.' },
    });
    expect(result.success).toBe(true);
  });

  it('parses visual_counting addition variant', () => {
    const result = activityContentSchema.safeParse({
      type: 'visual_counting',
      content: { left: ['🍎', '🍎'], right: ['🍎'], sum: 3 },
    });
    expect(result.success).toBe(true);
  });

  it('parses matching', () => {
    const result = activityContentSchema.safeParse({
      type: 'matching',
      content: {
        pairs: [
          { itemA: '🌳', itemB: 'Plant' },
          { itemA: '🐱', itemB: 'Animal' },
        ],
      },
    });
    expect(result.success).toBe(true);
  });

  it('parses drag_drop', () => {
    const result = activityContentSchema.safeParse({
      type: 'drag_drop',
      content: {
        items: [{ id: 'i1', label: '🌳' }, { id: 'i2', label: '🐱' }],
        targets: [{ id: 't1', label: 'Plants' }, { id: 't2', label: 'Animals' }],
        expectedPositions: { i1: 't1', i2: 't2' },
      },
    });
    expect(result.success).toBe(true);
  });

  it('parses sequencing', () => {
    const result = activityContentSchema.safeParse({
      type: 'sequencing',
      content: {
        items: [{ id: 's1', label: 'Step 1' }, { id: 's2', label: 'Step 2' }],
        correctOrder: ['s1', 's2'],
      },
    });
    expect(result.success).toBe(true);
  });

  it('parses multiple_choice', () => {
    const result = activityContentSchema.safeParse({
      type: 'multiple_choice',
      content: {
        questions: [
          { question: 'What is 2+2?', options: ['3', '4', '5', '6'], correctIndex: 1 },
        ],
      },
    });
    expect(result.success).toBe(true);
  });

  it('parses story_question', () => {
    const result = activityContentSchema.safeParse({
      type: 'story_question',
      content: {
        scenario: 'Ravi planted a seed.',
        questions: [
          { question: 'What did Ravi plant?', options: ['A flower', 'A seed', 'A tree'], correctIndex: 1 },
        ],
      },
    });
    expect(result.success).toBe(true);
  });

  it('parses real_world', () => {
    const result = activityContentSchema.safeParse({
      type: 'real_world',
      content: { scenario: 'Look around your room.', taskDescription: 'Find numbers.' },
    });
    expect(result.success).toBe(true);
  });

  it('parses fraction_visual', () => {
    const result = activityContentSchema.safeParse({
      type: 'fraction_visual',
      content: { numerator: 1, denominator: 2, mode: 'circle', interactive: false },
    });
    expect(result.success).toBe(true);
  });

  it('parses place_value_chart', () => {
    const result = activityContentSchema.safeParse({
      type: 'place_value_chart',
      content: { maxPlaces: 'lakh', digits: [null, null, 5, 4, 3], interactive: false },
    });
    expect(result.success).toBe(true);
  });

  it('parses grid_area', () => {
    const result = activityContentSchema.safeParse({
      type: 'grid_area',
      content: { rows: 5, cols: 5, mode: 'area' },
    });
    expect(result.success).toBe(true);
  });

  it('parses chart_reader', () => {
    const result = activityContentSchema.safeParse({
      type: 'chart_reader',
      content: {
        type: 'bar',
        data: [{ label: 'Cricket', value: 12 }],
        interactive: false,
      },
    });
    expect(result.success).toBe(true);
  });

  it('parses clock_time', () => {
    const result = activityContentSchema.safeParse({
      type: 'clock_time',
      content: { hour: 3, minute: 0, mode: 'read', interactive: false },
    });
    expect(result.success).toBe(true);
  });

  it('parses measurement_scale', () => {
    const result = activityContentSchema.safeParse({
      type: 'measurement_scale',
      content: { type: 'ruler', min: 0, max: 30, step: 1, unit: 'cm', interactive: false },
    });
    expect(result.success).toBe(true);
  });

  it('parses fill_blank', () => {
    const result = activityContentSchema.safeParse({
      type: 'fill_blank',
      content: {
        template: '3 + ___ = 8',
        blanks: [{ id: 'b1', position: 0, correctAnswer: '5' }],
        mode: 'select',
      },
    });
    expect(result.success).toBe(true);
  });

  it('rejects mismatched type and content', () => {
    // type says multiple_choice but content has story_question fields
    const result = activityContentSchema.safeParse({
      type: 'multiple_choice',
      content: { scenario: 'A story.' },
    });
    expect(result.success).toBe(false);
  });

  it('rejects unknown type', () => {
    const result = activityContentSchema.safeParse({
      type: 'unknown_type',
      content: {},
    });
    expect(result.success).toBe(false);
  });
});

// ─── Tests for scoring-contract superRefines ─────────────────────────

describe('scoring contract superRefines', () => {
  it('rejects chart_reader interactive without correctLabel', () => {
    const result = activityContentSchema.safeParse({
      type: 'chart_reader',
      content: {
        type: 'bar',
        data: [{ label: 'A', value: 1 }],
        interactive: true,
      },
    });
    expect(result.success).toBe(false);
  });

  it('accepts chart_reader interactive WITH correctLabel', () => {
    const result = activityContentSchema.safeParse({
      type: 'chart_reader',
      content: {
        type: 'bar',
        data: [{ label: 'A', value: 1 }],
        interactive: true,
        correctLabel: 'A',
      },
    });
    expect(result.success).toBe(true);
  });

  it('accepts chart_reader interactive without correctLabel when not interactive', () => {
    const result = activityContentSchema.safeParse({
      type: 'chart_reader',
      content: {
        type: 'bar',
        data: [{ label: 'A', value: 1 }],
        interactive: false,
      },
    });
    expect(result.success).toBe(true);
  });

  it('rejects clock_time set+interactive without targetTime', () => {
    const result = activityContentSchema.safeParse({
      type: 'clock_time',
      content: { hour: 3, minute: 0, mode: 'set', interactive: true },
    });
    expect(result.success).toBe(false);
  });

  it('accepts clock_time set+interactive WITH targetTime', () => {
    const result = activityContentSchema.safeParse({
      type: 'clock_time',
      content: { hour: 3, minute: 0, mode: 'set', interactive: true, targetTime: { hour: 7, minute: 30 } },
    });
    expect(result.success).toBe(true);
  });

  it('accepts clock_time read+interactive without targetTime', () => {
    const result = activityContentSchema.safeParse({
      type: 'clock_time',
      content: { hour: 3, minute: 0, mode: 'read', interactive: true },
    });
    expect(result.success).toBe(true);
  });

  it('rejects measurement_scale interactive without targetValue', () => {
    const result = activityContentSchema.safeParse({
      type: 'measurement_scale',
      content: { type: 'ruler', min: 0, max: 30, step: 1, unit: 'cm', interactive: true },
    });
    expect(result.success).toBe(false);
  });

  it('accepts measurement_scale interactive WITH targetValue', () => {
    const result = activityContentSchema.safeParse({
      type: 'measurement_scale',
      content: { type: 'ruler', min: 0, max: 30, step: 1, unit: 'cm', interactive: true, targetValue: 12 },
    });
    expect(result.success).toBe(true);
  });

  it('accepts measurement_scale non-interactive without targetValue', () => {
    const result = activityContentSchema.safeParse({
      type: 'measurement_scale',
      content: { type: 'ruler', min: 0, max: 30, step: 1, unit: 'cm', interactive: false },
    });
    expect(result.success).toBe(true);
  });

  it('accepts place_value_chart interactive WITHOUT targetNumber (extraRefine not required by spec, but handled)', () => {
    // The spec for place_value_chart says targetNumber is optional but needed for scoring
    // Not a superRefine per story 1 spec, but accept without it
    const result = activityContentSchema.safeParse({
      type: 'place_value_chart',
      content: { maxPlaces: 'lakh', digits: [5, 4, 3], interactive: true },
    });
    expect(result.success).toBe(true);
  });
});

// ─── Tests for full activitySchema (including step↔type) ──────────

describe('activitySchema', () => {
  it('accepts valid observe / visual_counting', () => {
    const result = activitySchema.safeParse({
      step: 'observe',
      type: 'visual_counting',
      order: 1,
      content: { type: 'visual_counting', content: { count: 3 } },
    });
    expect(result.success).toBe(true);
  });

  it('accepts valid mastery_check / multiple_choice', () => {
    const result = activitySchema.safeParse({
      step: 'mastery_check',
      type: 'multiple_choice',
      order: 4,
      content: {
        type: 'multiple_choice',
        content: { questions: [{ question: 'Q?', options: ['a', 'b', 'c', 'd'], correctIndex: 0 }] },
      },
    });
    expect(result.success).toBe(true);
  });

  it('accepts valid mastery_check / fill_blank', () => {
    const result = activitySchema.safeParse({
      step: 'mastery_check',
      type: 'fill_blank',
      order: 4,
      content: {
        type: 'fill_blank',
        content: { template: '___ + 2 = 5', blanks: [{ id: 'b1', position: 0, correctAnswer: '3' }], mode: 'select' },
      },
    });
    expect(result.success).toBe(true);
  });

  it('accepts valid positive_completion / visual_counting', () => {
    const result = activitySchema.safeParse({
      step: 'positive_completion',
      type: 'visual_counting',
      order: 5,
      content: { type: 'visual_counting', content: { message: 'Great!', encouragement: true } },
    });
    expect(result.success).toBe(true);
  });

  it('rejects mastery_check with visual_counting (wrong type for step)', () => {
    const result = activitySchema.safeParse({
      step: 'mastery_check',
      type: 'visual_counting',
      order: 4,
      content: { type: 'visual_counting', content: { count: 3 } },
    });
    expect(result.success).toBe(false);
  });

  it('rejects observe with drag_drop (not allowed in observe)', () => {
    const result = activitySchema.safeParse({
      step: 'observe',
      type: 'drag_drop',
      order: 1,
      content: {
        type: 'drag_drop',
        content: {
          items: [{ id: 'i1', label: 'A' }],
          targets: [{ id: 't1', label: 'B' }],
          expectedPositions: { i1: 't1' },
        },
      },
    });
    expect(result.success).toBe(false);
  });

  it('rejects order < 1', () => {
    const result = activitySchema.safeParse({
      step: 'observe',
      type: 'visual_counting',
      order: 0,
      content: { type: 'visual_counting', content: { count: 3 } },
    });
    expect(result.success).toBe(false);
  });

  it('rejects order > 5', () => {
    const result = activitySchema.safeParse({
      step: 'observe',
      type: 'visual_counting',
      order: 6,
      content: { type: 'visual_counting', content: { count: 3 } },
    });
    expect(result.success).toBe(false);
  });
});

// ─── Tests for validateActivity wrapper ──────────────────────────────

describe('validateActivity', () => {
  it('returns success with typed data on valid input', () => {
    const result = validateActivity({
      step: 'observe',
      type: 'visual_counting',
      order: 1,
      content: { type: 'visual_counting', content: { count: 3 } },
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.step).toBe('observe');
      expect(result.data.type).toBe('visual_counting');
    }
  });

  it('returns descriptive errors on invalid input', () => {
    const result = validateActivity({
      step: 'mastery_check',
      type: 'visual_counting',
      order: 4,
      content: { type: 'visual_counting', content: { count: 3 } },
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors.length).toBeGreaterThan(0);
      result.errors.forEach((err) => {
        expect(typeof err).toBe('string');
        expect(err.length).toBeGreaterThan(0);
      });
    }
  });

  it('returns multiple errors for multiple validation failures', () => {
    const result = validateActivity({});
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors.length).toBeGreaterThanOrEqual(3);
    }
  });
});

// ─── Tests for VALID_TYPES_PER_STEP consistency ──────────────────────

describe('VALID_TYPES_PER_STEP', () => {
  it('each step has at least one valid type', () => {
    for (const [step, types] of Object.entries(VALID_TYPES_PER_STEP)) {
      expect(types.length).toBeGreaterThan(0);
    }
  });

  it('positive_completion only allows visual_counting', () => {
    expect(VALID_TYPES_PER_STEP['positive_completion']).toEqual(['visual_counting']);
  });

  it('mastery_check allows multiple_choice and fill_blank', () => {
    expect(VALID_TYPES_PER_STEP['mastery_check']).toContain('multiple_choice');
    expect(VALID_TYPES_PER_STEP['mastery_check']).toContain('fill_blank');
  });
});
