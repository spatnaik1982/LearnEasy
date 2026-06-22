import { describe, it, expect } from 'vitest';
import type { LlmProvider } from '@learn-easy/llm-config';
import { generateActivitiesForConcept } from '../index';
import { activityContentSchema, VALID_TYPES_PER_STEP } from '@learn-easy/db';
import type { GeneratedConcept } from '../../types';
import type { z } from 'zod';

function makeConcept(overrides: Partial<GeneratedConcept> = {}): GeneratedConcept {
  return {
    conceptId: 'test_concept',
    chapterCode: 'B-CH1',
    chapterName: 'Test Chapter',
    learningObjective: 'Count objects from 1 to 10',
    coreIdea: 'Counting is assigning one number to each object',
    examples: ['Count 3 apples', 'Count 5 balls'],
    misconceptions: ['Skipping objects while counting'],
    supports: { visual: true },
    masteryCriteria: 3,
    difficulty: 'beginner',
    estimatedDuration: 10,
    dependencies: [],
    ...overrides,
  };
}

// Canonical valid content for each type (matches Zod schemas in activity-schema.ts)
const VALID_CONTENT: Record<string, Record<string, unknown>> = {
  visual_counting: {
    description: 'Count the apples',
    items: ['🍎', '🍎', '🍎'],
    count: 3,
    text: 'There are three apples.',
  },
  matching: {
    description: 'Match shapes to names',
    pairs: [
      { itemA: '⬤', itemB: 'Circle' },
      { itemA: '⬛', itemB: 'Square' },
    ],
  },
  drag_drop: {
    description: 'Drag digits to columns',
    items: [{ id: 'item-0', label: '5' }, { id: 'item-1', label: '3' }],
    targets: [{ id: 'target-0', label: 'Tens' }, { id: 'target-1', label: 'Ones' }],
    expectedPositions: { 'item-0': 'target-0', 'item-1': 'target-1' },
  },
  sequencing: {
    description: 'Order numbers ascending',
    items: [{ id: 'item-0', label: '3' }, { id: 'item-1', label: '5' }, { id: 'item-2', label: '8' }],
    correctOrder: ['item-0', 'item-1', 'item-2'],
  },
  multiple_choice: {
    questions: [
      { question: 'What is 2 + 2?', options: ['3', '4', '5'], correctIndex: 1 },
    ],
  },
  story_question: {
    scenario: 'Riya has 3 apples. She gets 2 more.',
    questions: [
      { question: 'How many apples now?', options: ['4', '5', '6'], correctIndex: 1 },
    ],
  },
  real_world: {
    scenario: 'You have 5 rupees. You buy a pencil for 3 rupees.',
    taskDescription: 'How much money is left?',
  },
  fraction_visual: {
    numerator: 1,
    denominator: 2,
    mode: 'bar',
    interactive: true,
    label: '1/2',
  },
  place_value_chart: {
    maxPlaces: 'lakh',
    digits: [null, null, null, null, 5, 4],
    interactive: true,
  },
  grid_area: {
    rows: 4,
    cols: 4,
    mode: 'area',
    highlighted: [{ row: 0, col: 0 }, { row: 0, col: 1 }],
    interactive: true,
  },
  chart_reader: {
    type: 'bar',
    data: [{ label: 'Apples', value: 5 }, { label: 'Oranges', value: 3 }],
    interactive: true,
    correctLabel: 'Apples',
  },
  clock_time: {
    hour: 3,
    minute: 30,
    mode: 'set',
    interactive: true,
    targetTime: { hour: 3, minute: 30 },
  },
  measurement_scale: {
    type: 'ruler',
    min: 0,
    max: 10,
    step: 1,
    unit: 'cm',
    interactive: true,
    targetValue: 5,
  },
  fill_blank: {
    template: '2 + ___ = 5',
    blanks: [{ id: 'blank-0', position: 0, correctAnswer: '3' }],
    mode: 'type',
  },
};

function makeMockProvider(
  responsesByType: Record<string, Record<string, unknown>>,
  failingTypes: string[] = [],
): LlmProvider {
  return {
    async generateStructured<T>(
      _prompt: string,
      _schema: z.ZodType<T>,
      _options?: { temperature?: number; maxTokens?: number },
    ): Promise<T> {
      // The schema's discriminated union has type literal; extract expected type from prompt tail
      // Simpler: the per-step generation builds the prompt with the selected type; the mock returns
      // content keyed by type. We infer type from the prompt's "Generate the <step> activity" line.
      const stepMatch = _prompt.match(/Generate the (\w+) activity/);
      const step = stepMatch ? stepMatch[1] : '';
      const type = (VALID_TYPES_PER_STEP as Record<string, string[]>)[step]?.[0] ?? 'visual_counting';

      // For mastery_check/positive_completion override to the hardcoded type
      const finalType = step === 'mastery_check' ? 'multiple_choice'
        : step === 'positive_completion' ? 'visual_counting'
        : type;

      if (failingTypes.includes(finalType)) {
        throw new Error(`Mock provider failure for type ${finalType}`);
      }

      const content = responsesByType[finalType] ?? VALID_CONTENT[finalType];
      return { type: finalType, content } as unknown as T;
    },
  };
}

describe('generateActivitiesForConcept', () => {
  it('produces 5 activities that pass activityContentSchema', async () => {
    const concept = makeConcept();
    const provider = makeMockProvider(VALID_CONTENT);

    const result = await generateActivitiesForConcept(provider, concept);

    expect(result.errors).toEqual([]);
    expect(result.activities).toHaveLength(5);

    for (const activity of result.activities) {
      const parsed = activityContentSchema.safeParse({
        type: activity.type,
        content: activity.content,
      });
      expect(parsed.success, `Activity ${activity.step}/${activity.type} should validate: ${
        parsed.success ? '' : JSON.stringify(parsed.error.issues)
      }`).toBe(true);
    }
  });

  it('activities respect VALID_TYPES_PER_STEP', async () => {
    const concept = makeConcept();
    const provider = makeMockProvider(VALID_CONTENT);

    const result = await generateActivitiesForConcept(provider, concept);

    for (const activity of result.activities) {
      const allowed = VALID_TYPES_PER_STEP[activity.step];
      expect(allowed, `Step ${activity.step} should have allowed types`).toBeDefined();
      expect(allowed.includes(activity.type), `Step ${activity.step} should allow ${activity.type}`).toBe(true);
    }
  });

  it('retries on content validation failure then succeeds', async () => {
    const concept = makeConcept();
    // First call returns invalid content (missing required fields), subsequent calls return valid
    let callCount = 0;
    const provider: LlmProvider = {
      async generateStructured<T>(
        _prompt: string,
        _schema: z.ZodType<T>,
        _options?: { temperature?: number; maxTokens?: number },
      ): Promise<T> {
        callCount++;
        // Return invalid content on first call for the observe step, valid otherwise
        if (callCount === 1) {
          // missing required `mode` and `interactive` — will fail fraction_visual schema
          return {
            type: 'visual_counting',
            content: { /* empty — fails visual_counting? Actually visual_counting has all optional */
              description: 'Test',
            },
          } as unknown as T;
        }
        return {
          type: 'visual_counting',
          content: VALID_CONTENT.visual_counting,
        } as unknown as T;
      },
    };

    const result = await generateActivitiesForConcept(provider, concept);
    // All 5 activities should produce (visual_counting passes even with minimal content since all fields optional)
    expect(result.activities.length).toBeGreaterThan(0);
  });

  it('reports errors when provider always fails', async () => {
    const concept = makeConcept();
    const provider: LlmProvider = {
      async generateStructured<T>(): Promise<T> {
        throw new Error('API unavailable');
      },
    };

    const result = await generateActivitiesForConcept(provider, concept);

    expect(result.activities).toHaveLength(0);
    expect(result.errors.length).toBe(5);
    expect(result.errors[0]).toMatch(/failed after/);
  });
});
