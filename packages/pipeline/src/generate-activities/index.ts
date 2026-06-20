import { readFileSync } from 'fs';
import { join } from 'path';
import { z } from 'zod';
import type { LlmProvider } from '@learn-easy/llm-config';
import type { GeneratedConcept, GeneratedActivity } from '../types';
import { VALID_TYPES_PER_STEP } from '../types';

const activitySchema = z.object({
  activities: z
    .array(
      z.object({
        step: z.enum([
          'observe',
          'guided_practice',
          'independent_practice',
          'mastery_check',
          'positive_completion',
        ]),
        type: z.string(),
        order: z.number().min(1).max(5),
        content: z.record(z.unknown()),
      }),
    )
    .length(5),
});

function loadPromptTemplate(): string {
  return readFileSync(
    join(__dirname, 'prompts', 'generate-activities.txt'),
    'utf-8',
  );
}

function buildPrompt(
  template: string,
  concept: GeneratedConcept,
): string {
  return template
    .replace(/{CONCEPT_ID}/g, concept.conceptId)
    .replace(/{LEARNING_OBJECTIVE}/g, concept.learningObjective)
    .replace(/{CORE_IDEA}/g, concept.coreIdea)
    .replace(/{EXAMPLES}/g, concept.examples.map((e) => `  - ${e}`).join('\n'))
    .replace(/{MISCONCEPTIONS}/g, concept.misconceptions.map((m) => `  - ${m}`).join('\n'));
}

function validateActivityTypes(
  activities: GeneratedActivity[],
): string[] {
  const errors: string[] = [];

  for (const act of activities) {
    const allowed = VALID_TYPES_PER_STEP[act.step];
    if (allowed && !allowed.includes(act.type)) {
      errors.push(
        `Step "${act.step}": type "${act.type}" is not allowed. Allowed: ${allowed.join(', ')}`,
      );
    }

    if (act.step === 'mastery_check') {
      const content = act.content as Record<string, unknown>;
      const questions = content.questions;
      if (!Array.isArray(questions) || questions.length < 2) {
        errors.push(
          `Step "mastery_check": must have at least 2 questions, got ${Array.isArray(questions) ? questions.length : 0}`,
        );
      }
    }

    if (act.step === 'guided_practice') {
      const content = act.content as Record<string, unknown>;
      const hints = content.hints;
      if (!Array.isArray(hints) || hints.length < 4) {
        errors.push(
          `Step "guided_practice": must have at least 4 hints, got ${Array.isArray(hints) ? hints.length : 0}`,
        );
      }
    }

    if (act.step === 'positive_completion') {
      if (act.type !== 'visual_counting') {
        errors.push(
          `Step "positive_completion": type must be "visual_counting", got "${act.type}"`,
        );
      }
    }
  }

  return errors;
}

function checkALXCompliance(activities: GeneratedActivity[]): string[] {
  const warnings: string[] = [];
  const WORD_LIMIT = 12;

  for (const act of activities) {
    const content = act.content as Record<string, unknown>;

    const checkString = (prefix: string, value: unknown) => {
      if (typeof value === 'string') {
        const words = value.split(/\s+/).length;
        if (words > WORD_LIMIT) {
          warnings.push(
            `${act.step}.${prefix}: ${words} words (limit ${WORD_LIMIT})`,
          );
        }
      }
    };

    checkString('text', content.text);
    checkString('description', content.description);
    checkString('message', content.message);

    if (act.step === 'mastery_check') {
      const questions = content.questions as Array<Record<string, unknown>> | undefined;
      if (questions) {
        for (let i = 0; i < questions.length; i++) {
          checkString(`questions[${i}].question`, questions[i].question);
        }
      }
    }
  }

  return warnings;
}

export async function generateActivitiesForConcept(
  llm: LlmProvider,
  concept: GeneratedConcept,
): Promise<{
  activities: GeneratedActivity[];
  warnings: string[];
  errors: string[];
}> {
  const template = loadPromptTemplate();
  const prompt = buildPrompt(template, concept);

  try {
    const result = await llm.generateStructured(prompt, activitySchema, {
      temperature: 0.4,
    });

    const activities = result.activities as GeneratedActivity[];
    const stepOrder = ['observe', 'guided_practice', 'independent_practice', 'mastery_check', 'positive_completion'];
    const ordered = stepOrder.map((step, idx) => {
      const found = activities.find((a) => a.step === step);
      if (found) {
        return { ...found, order: idx + 1 };
      }
      throw new Error(`Missing required step: ${step}`);
    });

    const typeErrors = validateActivityTypes(ordered);
    if (typeErrors.length > 0) {
      return { activities: [], warnings: [], errors: typeErrors };
    }

    const alxWarnings = checkALXCompliance(ordered);

    return { activities: ordered, warnings: alxWarnings, errors: [] };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      activities: [],
      warnings: [],
      errors: [`Failed to generate activities for ${concept.conceptId}: ${message}`],
    };
  }
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
