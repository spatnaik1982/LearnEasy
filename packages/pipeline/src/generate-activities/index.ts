import { z } from 'zod';
import {
  activityContentSchema,
  VALID_TYPES_PER_STEP,
  visualCountingContentSchema,
  matchingContentSchema,
  dragDropContentSchema,
  sequencingContentSchema,
  multipleChoiceContentSchema,
  storyQuestionContentSchema,
  fractionVisualContentSchema,
  placeValueChartContentSchema,
  gridAreaContentSchema,
  chartReaderContentSchema,
  clockTimeContentSchema,
  measurementScaleContentSchema,
  fillBlankContentSchema,
} from '@learn-easy/db';
import type { LlmProvider } from '@learn-easy/llm-config';
import type { GeneratedConcept, GeneratedActivity } from '../types';
import { selectTypesForConcept } from './type-selector';
import { EXEMPLARS, type Exemplar } from './exemplars';

// ─── Prompt templates ────────────────────────────────────────────

import { OBSERVE_PROMPT } from './prompts/observe';
import { GUIDED_PRACTICE_PROMPT } from './prompts/guided-practice';
import { INDEPENDENT_PRACTICE_PROMPT } from './prompts/independent-practice';
import { MASTERY_CHECK_PROMPT } from './prompts/mastery-check';
import { POSITIVE_COMPLETION_PROMPT } from './prompts/positive-completion';

const STEP_PROMPTS: Record<string, string> = {
  observe: OBSERVE_PROMPT,
  guided_practice: GUIDED_PRACTICE_PROMPT,
  independent_practice: INDEPENDENT_PRACTICE_PROMPT,
  mastery_check: MASTERY_CHECK_PROMPT,
  positive_completion: POSITIVE_COMPLETION_PROMPT,
};

// ─── Type → content schema mapping ───────────────────────────────

function contentSchemaForType(type: string): z.ZodType {
  switch (type) {
    case 'visual_counting':     return visualCountingContentSchema;
    case 'matching':            return matchingContentSchema;
    case 'drag_drop':           return dragDropContentSchema;
    case 'sequencing':          return sequencingContentSchema;
    case 'multiple_choice':     return multipleChoiceContentSchema;
    case 'story_question':      return storyQuestionContentSchema;
    case 'fraction_visual':     return fractionVisualContentSchema;
    case 'place_value_chart':   return placeValueChartContentSchema;
    case 'grid_area':           return gridAreaContentSchema;
    case 'chart_reader':        return chartReaderContentSchema;
    case 'clock_time':          return clockTimeContentSchema;
    case 'measurement_scale':   return measurementScaleContentSchema;
    case 'fill_blank':          return fillBlankContentSchema;
    default: throw new Error(`Unknown activity type: ${type}`);
  }
}

// ─── Schema for per-step generation ────────────────────────────────
// Wraps a type-specific content schema so the LLM returns { type, content }

function stepOutputSchema(type: string): z.ZodType {
  const contentSchema = contentSchemaForType(type);
  return z.object({ type: z.literal(type), content: contentSchema });
}

// ─── Prompt builder ───────────────────────────────────────────────

function buildStepPrompt(
  step: string,
  type: string,
  concept: GeneratedConcept,
): string {
  const template = STEP_PROMPTS[step];
  if (!template) throw new Error(`Unknown step: ${step}`);

  const exemplars = EXEMPLARS.filter((e) => e.type === type && e.step === step);
  const exemplarSection = exemplars.length > 0
    ? `\n## Good Example for This Type+Step\n${exemplars.map((e) => JSON.stringify(e.content, null, 2)).join('\n\n')}`
    : '';

  const prompt = template
    .replace(/{CONCEPT_ID}/g, concept.conceptId)
    .replace(/{LEARNING_OBJECTIVE}/g, concept.learningObjective)
    .replace(/{CORE_IDEA}/g, concept.coreIdea)
    .replace(/{EXAMPLES}/g, concept.examples.map((e) => `  - ${e}`).join('\n'))
    .replace(/{MISCONCEPTIONS}/g, concept.misconceptions.map((m) => `  - ${m}`).join('\n'));

  return `${prompt}\n\nGenerate the ${step} activity now as a JSON object with "type" and "content" fields.${exemplarSection}`;
}

// ─── Retry prompt with error feedback ─────────────────────────────

function buildRetryPrompt(
  basePrompt: string,
  errors: string[],
  previousAttempt: unknown,
): string {
  return `${basePrompt}\n\nThe previous attempt failed validation with these errors:\n${errors.map((e) => `  - ${e}`).join('\n')}\n\nPrevious attempt:\n${JSON.stringify(previousAttempt, null, 2)}\n\nPlease fix the issues and try again.`;
}

// ─── ALX compliance check ─────────────────────────────────────────

interface AlxWarning {
  type: string;
  field: string;
  message: string;
}

function checkALXCompliance(
  step: string,
  type: string,
  content: Record<string, unknown>,
): AlxWarning[] {
  const warnings: AlxWarning[] = [];
  const WORD_LIMIT = 12;

  const checkString = (field: string, value: unknown) => {
    if (typeof value === 'string') {
      const words = value.split(/\s+/).length;
      if (words > WORD_LIMIT) {
        warnings.push({ type, field, message: `${step}.${field}: ${words} words (limit ${WORD_LIMIT})` });
      }
    }
  };

  checkString('description', content.description);
  checkString('message', content.message);
  checkString('scenario', content.scenario);

  if (type === 'multiple_choice' || type === 'story_question') {
    const questions = content.questions as Array<Record<string, unknown>> | undefined;
    if (questions) {
      questions.forEach((q, i) => checkString(`questions[${i}].question`, q.question));
    }
  }

  return warnings;
}

// ─── Per-step generation ──────────────────────────────────────────

async function generateStep(
  llm: LlmProvider,
  step: string,
  type: string,
  concept: GeneratedConcept,
  order: number,
  maxRetries: number,
): Promise<{
  activity: GeneratedActivity | null;
  warnings: AlxWarning[];
  errors: string[];
}> {
  const basePrompt = buildStepPrompt(step, type, concept);
  const outputSchema = stepOutputSchema(type);

  let lastErrors: string[] = [];
  let lastAttempt: unknown = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const prompt = attempt === 0 ? basePrompt : buildRetryPrompt(basePrompt, lastErrors, lastAttempt);
      const result = await llm.generateStructured(prompt, outputSchema, {
        temperature: attempt === 0 ? 0.4 : 0.5,
        maxTokens: 4096,
      });

      const activity: GeneratedActivity = {
        step: step as GeneratedActivity['step'],
        type: result.type,
        order,
        content: result.content as GeneratedActivity['content'],
      };

      // Validate content shape against the discriminated union (same shape DB ingest uses)
      const contentResult = activityContentSchema.safeParse({
        type: activity.type,
        content: activity.content,
      });

      if (!contentResult.success) {
        lastErrors = contentResult.error.issues.map(
          (i) => `${i.path.join('.')}: ${i.message}`,
        );
        lastAttempt = { type: result.type, content: result.content };
        continue;
      }

      // Validate step↔type compatibility
      const allowed = VALID_TYPES_PER_STEP[step];
      if (allowed && !allowed.includes(type)) {
        lastErrors = [`Step "${step}" does not allow type "${type}". Allowed: ${allowed.join(', ')}`];
        lastAttempt = { type: result.type, content: result.content };
        continue;
      }

      const alxWarnings = checkALXCompliance(step, type, activity.content as unknown as Record<string, unknown>);
      return { activity, warnings: alxWarnings, errors: [] };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      lastErrors = [message];
      lastAttempt = null;
    }
  }

  return {
    activity: null,
    warnings: [],
    errors: [`${step} (${type}): failed after ${maxRetries + 1} attempts`],
  };
}

// ─── Main entry point ─────────────────────────────────────────────

const STEP_ORDER = ['observe', 'guided_practice', 'independent_practice', 'mastery_check', 'positive_completion'] as const;
const MAX_RETRIES = 3;

export async function generateActivitiesForConcept(
  llm: LlmProvider,
  concept: GeneratedConcept,
): Promise<{
  activities: GeneratedActivity[];
  warnings: string[];
  errors: string[];
}> {
  const types = selectTypesForConcept(concept);
  const activities: GeneratedActivity[] = [];
  const allWarnings: string[] = [];
  const allErrors: string[] = [];

  for (let i = 0; i < STEP_ORDER.length; i++) {
    const step = STEP_ORDER[i];
    const type = types[step];

    const result = await generateStep(llm, step, type, concept, i + 1, MAX_RETRIES);

    if (result.activity) {
      activities.push(result.activity);
      allWarnings.push(...result.warnings.map((w) => w.message));
    } else {
      allErrors.push(...result.errors);
    }
  }

  return { activities, warnings: allWarnings, errors: allErrors };
}

export async function generateAllActivities(
  llm: LlmProvider,
  concepts: GeneratedConcept[],
): Promise<{
  activitiesMap: Map<string, GeneratedActivity[]>;
  warnings: string[];
  errors: string[];
}> {
  const activitiesMap = new Map<string, GeneratedActivity[]>();
  const warnings: string[] = [];
  const errors: string[] = [];

  for (const concept of concepts) {
    const result = await generateActivitiesForConcept(llm, concept);

    if (result.errors.length > 0) {
      errors.push(...result.errors);
      continue;
    }

    activitiesMap.set(concept.conceptId, result.activities);
    warnings.push(...result.warnings);
  }

  return { activitiesMap, warnings, errors };
}
