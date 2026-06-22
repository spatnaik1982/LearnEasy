import { z } from 'zod';

// ─── Shared helpers ────────────────────────────────────────────────

const hintsSchema = z.array(z.string()).max(5).optional();

// ─── Per-type content schemas (canonical shapes) ────────────────────

const visualCountingContent = z.object({
  description: z.string().optional(),
  items: z.array(z.string()).optional(),
  count: z.number().int().positive().optional(),
  text: z.string().optional(),
  hint: z.string().optional(),
  hints: hintsSchema,
  emoji: z.string().optional(),
  size: z.enum(['sm', 'md', 'lg']).optional(),
  left: z.union([z.array(z.string()), z.number()]).optional(),
  right: z.union([z.array(z.string()), z.number()]).optional(),
  sum: z.number().int().optional(),
});

const matchingPairSchema = z.object({
  id: z.string().optional(),
  itemA: z.string(),
  itemB: z.string(),
});

const matchingContent = z.object({
  description: z.string().optional(),
  pairs: z.array(matchingPairSchema).min(1),
  hints: hintsSchema,
});

const dragDropItemSchema = z.object({
  id: z.string(),
  label: z.string(),
  emoji: z.string().optional(),
});

const dragDropTargetSchema = z.object({
  id: z.string(),
  label: z.string(),
});

const dragDropContent = z.object({
  description: z.string().optional(),
  items: z.array(dragDropItemSchema).min(1),
  targets: z.array(dragDropTargetSchema).min(1),
  expectedPositions: z.record(z.string(), z.string()),
  hints: hintsSchema,
});

const sequencingItemSchema = z.object({
  id: z.string(),
  label: z.string(),
  emoji: z.string().optional(),
});

const sequencingContent = z.object({
  description: z.string().optional(),
  items: z.array(sequencingItemSchema).min(2),
  correctOrder: z.array(z.string()).min(2),
  hints: hintsSchema,
});

const mcQuestionSchema = z.object({
  question: z.string(),
  options: z.array(z.string()).min(2),
  correctIndex: z.number().int().min(0),
});

const multipleChoiceContent = z.object({
  questions: z.array(mcQuestionSchema).min(1),
});

const storyQuestionContent = z.object({
  scenario: z.string(),
  questions: z.array(mcQuestionSchema).min(1),
  visual: z.string().optional(),
});

const realWorldContent = z.object({
  scenario: z.string(),
  taskDescription: z.string().optional(),
  prompt: z.string().optional(),
  expectedAnswer: z.string().optional(),
  visualExample: z.string().optional(),
  hint: z.string().optional(),
});

const fractionVisualContent = z.object({
  numerator: z.number().int().min(0),
  denominator: z.number().int().min(1),
  mode: z.enum(['bar', 'circle']),
  label: z.string().optional(),
  showLabel: z.boolean().optional(),
  interactive: z.boolean(),
  compare: z.object({
    numerator: z.number().int().min(0),
    denominator: z.number().int().min(1),
  }).optional(),
});

const placeValueChartContent = z.object({
  maxPlaces: z.enum(['lakh', 'crore']),
  digits: z.array(z.union([z.number().int().min(0).max(9), z.null()])),
  targetNumber: z.number().int().optional(),
  interactive: z.boolean(),
  draggableDigits: z.array(z.number().int().min(0).max(9)).optional(),
  showLabels: z.boolean().optional(),
});

const gridAreaContent = z.object({
  rows: z.number().int().min(1).max(20),
  cols: z.number().int().min(1).max(20),
  mode: z.enum(['area', 'perimeter']),
  highlighted: z.array(z.object({
    row: z.number().int(),
    col: z.number().int(),
  })).optional(),
  interactive: z.boolean().optional(),
  maxHighlights: z.number().int().optional(),
  cellSize: z.number().int().optional(),
  showCount: z.boolean().optional(),
});

const chartDataPoint = z.object({
  label: z.string(),
  value: z.number(),
  emoji: z.string().optional(),
});

const chartReaderContent = z.object({
  type: z.enum(['bar', 'pictograph']),
  data: z.array(chartDataPoint).min(1),
  title: z.string().optional(),
  showValues: z.boolean().optional(),
  interactive: z.boolean(),
  correctLabel: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.interactive && !data.correctLabel) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'correctLabel is required when interactive: true (needed for scoring)',
      path: ['correctLabel'],
    });
  }
});

const clockTimeContent = z.object({
  hour: z.number().int().min(0).max(23),
  minute: z.number().int().min(0).max(59),
  mode: z.enum(['read', 'set']),
  showDigital: z.boolean().optional(),
  interactive: z.boolean(),
  targetTime: z.object({
    hour: z.number().int().min(0).max(23),
    minute: z.number().int().min(0).max(59),
  }).optional(),
  size: z.number().int().optional(),
}).superRefine((data, ctx) => {
  if (data.mode === 'set' && data.interactive && !data.targetTime) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'targetTime is required when mode: "set" and interactive: true (needed for scoring)',
      path: ['targetTime'],
    });
  }
});

const measurementScaleContent = z.object({
  type: z.enum(['ruler', 'thermometer', 'cylinder']),
  min: z.number(),
  max: z.number(),
  step: z.number().positive(),
  unit: z.string(),
  value: z.number().optional(),
  interactive: z.boolean(),
  targetValue: z.number().optional(),
  showReading: z.boolean().optional(),
  showLabels: z.boolean().optional(),
}).superRefine((data, ctx) => {
  if (data.interactive && data.targetValue === undefined) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'targetValue is required when interactive: true (needed for scoring)',
      path: ['targetValue'],
    });
  }
});

const fillBlankBlankSchema = z.object({
  id: z.string(),
  position: z.number().int().min(0),
  correctAnswer: z.union([z.string(), z.number()]),
  options: z.array(z.union([z.string(), z.number()])).optional(),
});

const fillBlankContent = z.object({
  template: z.string(),
  blanks: z.array(fillBlankBlankSchema).min(1),
  mode: z.enum(['select', 'type']),
});

// ─── Discriminated union ──────────────────────────────────────────

export const activityContentSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('visual_counting'), content: visualCountingContent }),
  z.object({ type: z.literal('matching'), content: matchingContent }),
  z.object({ type: z.literal('drag_drop'), content: dragDropContent }),
  z.object({ type: z.literal('sequencing'), content: sequencingContent }),
  z.object({ type: z.literal('multiple_choice'), content: multipleChoiceContent }),
  z.object({ type: z.literal('story_question'), content: storyQuestionContent }),
  z.object({ type: z.literal('real_world'), content: realWorldContent }),
  z.object({ type: z.literal('fraction_visual'), content: fractionVisualContent }),
  z.object({ type: z.literal('place_value_chart'), content: placeValueChartContent }),
  z.object({ type: z.literal('grid_area'), content: gridAreaContent }),
  z.object({ type: z.literal('chart_reader'), content: chartReaderContent }),
  z.object({ type: z.literal('clock_time'), content: clockTimeContent }),
  z.object({ type: z.literal('measurement_scale'), content: measurementScaleContent }),
  z.object({ type: z.literal('fill_blank'), content: fillBlankContent }),
]);

// ─── Step / type enums ─────────────────────────────────────────────

export const stepEnum = z.enum([
  'observe',
  'guided_practice',
  'independent_practice',
  'mastery_check',
  'positive_completion',
]);

export const activityTypeEnum = z.enum([
  'visual_counting',
  'matching',
  'drag_drop',
  'sequencing',
  'multiple_choice',
  'story_question',
  'real_world',
  'fraction_visual',
  'place_value_chart',
  'grid_area',
  'chart_reader',
  'clock_time',
  'measurement_scale',
  'fill_blank',
]);

// ─── Step ↔ type compatibility lookup ──────────────────────────────

export const VALID_TYPES_PER_STEP: Record<string, readonly string[]> = {
  observe: [
    'visual_counting', 'story_question', 'fraction_visual',
    'place_value_chart', 'grid_area', 'clock_time',
    'measurement_scale', 'chart_reader',
  ],
  guided_practice: [
    'visual_counting', 'matching', 'drag_drop', 'sequencing',
    'story_question', 'fraction_visual', 'place_value_chart',
    'chart_reader', 'clock_time', 'measurement_scale',
    'grid_area', 'fill_blank',
  ],
  independent_practice: [
    'visual_counting', 'matching', 'drag_drop', 'sequencing',
    'fraction_visual', 'place_value_chart', 'fill_blank',
    'chart_reader', 'clock_time', 'measurement_scale',
    'grid_area', 'real_world',
  ],
  mastery_check: ['multiple_choice', 'fill_blank', 'story_question', 'drag_drop'],
  positive_completion: ['visual_counting'],
};

// ─── Full activity schema ─────────────────────────────────────────

export const activitySchema = z.object({
  step: stepEnum,
  type: activityTypeEnum,
  order: z.number().int().min(1).max(5),
  content: activityContentSchema,
}).superRefine((data, ctx) => {
  const allowed = VALID_TYPES_PER_STEP[data.step];
  if (allowed && !allowed.includes(data.type)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `Step "${data.step}" does not allow type "${data.type}". Allowed: ${allowed.join(', ')}`,
      path: ['type'],
    });
  }
});

// ─── Per-type content schemas (exported for reuse in step-specific gen) ──

export const visualCountingContentSchema = visualCountingContent;
export const matchingContentSchema = matchingContent;
export const dragDropContentSchema = dragDropContent;
export const sequencingContentSchema = sequencingContent;
export const multipleChoiceContentSchema = multipleChoiceContent;
export const storyQuestionContentSchema = storyQuestionContent;
export const realWorldContentSchema = realWorldContent;
export const fractionVisualContentSchema = fractionVisualContent;
export const placeValueChartContentSchema = placeValueChartContent;
export const gridAreaContentSchema = gridAreaContent;
export const chartReaderContentSchema = chartReaderContent;
export const clockTimeContentSchema = clockTimeContent;
export const measurementScaleContentSchema = measurementScaleContent;
export const fillBlankContentSchema = fillBlankContent;

// ─── Inferred types ────────────────────────────────────────────────

export type ActivityContent = z.infer<typeof activityContentSchema>;
export type Activity = z.infer<typeof activitySchema>;
export type ActivityStep = z.infer<typeof stepEnum>;
export type ActivityType = z.infer<typeof activityTypeEnum>;

// ─── Validation function ───────────────────────────────────────────

export function validateActivity(
  data: unknown,
): { success: true; data: Activity } | { success: false; errors: string[] } {
  const result = activitySchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  const errors = result.error.issues.map(
    (issue) => `${issue.path.join('.')}: ${issue.message}`,
  );
  return { success: false, errors };
}
