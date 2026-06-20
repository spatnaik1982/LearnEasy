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
        content: z.string(),
      }),
    )
    .length(5),
});

function loadPromptTemplate(): string {
  return GENERATE_ACTIVITIES_PROMPT;
}

const GENERATE_ACTIVITIES_PROMPT = `You are designing learning activities for a concept in the LearnEasy platform. Each concept requires exactly 5 activities in a fixed sequence.

## Concept to Design For

- **conceptId:** {CONCEPT_ID}
- **Learning Objective:** {LEARNING_OBJECTIVE}
- **Core Idea:** {CORE_IDEA}
- **Examples:** {EXAMPLES}
- **Misconceptions:** {MISCONCEPTIONS}

## The 5-Step Activity Sequence

| Step | Order | Purpose |
|---|---|---|
| observe | 1 | Tutor demonstrates the concept. Show, don't just tell. |
| guided_practice | 2 | Learner tries with hints and support. |
| independent_practice | 3 | Learner practices on their own (no hints). |
| mastery_check | 4 | 2-3 multiple-choice questions to verify understanding. |
| positive_completion | 5 | Encouragement message (no task). |

## Available Activity Types

| Type | Description | Best Used For |
|---|---|---|
| visual_counting | Count objects shown on screen | Numbers, simple quantities |
| matching | Match item A to item B | Classification, vocabulary |
| drag_drop | Drag items into correct positions | Sorting, labeling, place value |
| sequencing | Arrange items in correct order | Ordering numbers, steps |
| multiple_choice | Select correct answer from options | Mastery checks |
| story_question | Answer questions about a scenario | Word problems, real-world math |
| real_world | Apply concept to real-world scenario | Practical application |
| fraction_visual | Show fractions as bars or circles | Fractions, decimals |
| place_value_chart | Place digits in columns | Large numbers, decimals |
| grid_area | Count squares on a grid | Area, perimeter |
| chart_reader | Read values from bar charts | Data handling |
| clock_time | Read or set time on a clock | Time measurement |
| measurement_scale | Read a scale or ruler | Length, weight, temperature |
| fill_blank | Fill in missing number/word | Equations, sequences |

## Activity Type Rules Per Step

| Step | Allowed Types |
|---|---|
| observe | visual_counting, story_question, fraction_visual, place_value_chart, grid_area, clock_time, measurement_scale, chart_reader |
| guided_practice | visual_counting, matching, drag_drop, sequencing, story_question, fraction_visual, place_value_chart, fill_blank |
| independent_practice | visual_counting, matching, drag_drop, sequencing, fraction_visual, place_value_chart, fill_blank |
| mastery_check | multiple_choice |
| positive_completion | visual_counting |

## Hint Structure for guided_practice

Provide exactly 4 graduated hints, then an empty string:
1. Explicit answer ("The correct answer is X. Let me show you...")
2. Visual/attention cue ("Look at the [specific part] carefully.")
3. Encouraging nudge ("You're close! Check your [step].")
4. Process hint ("Try [specific strategy].")
5. "" (empty string - signals no more hints)

## ALX Content Guidelines

- Maximum 12 words per sentence
- Literal, concrete language (no metaphors like "piece of cake")
- Visual-first: pair text with emoji or visual descriptions
- No negative language: use "Try again" not "Wrong" or "Incorrect"
- Use encouraging phrases: "You're close!", "Great try!", "Let's try one more time!"

## Story Question Format

For \`story_question\` type, the content should include:
- A short scenario (2-3 sentences)
- 1-2 questions about the scenario
- Each question: text, options (4), correctIndex (0-based)

## Examples of Good Activities

For a fractions_intro concept:
- observe: Show a pizza divided into 4 parts with 1 part shaded. "One part out of four is called one-fourth. 🍕"
- guided_practice: "How many parts are shaded?" with fraction bar showing 3/5
- independent_practice: "What fraction of this circle is shaded?" with 2/3 circle
- mastery_check: Multiple choice: "Which shows 1/2?", "How many parts in total?"

## Content Shape Definitions

Each activity type has a specific content shape. Follow these exactly:

### visual_counting
\`\`\`json
{ "count": number, "emoji": string, "items": [string], "text": string }
\`\`\`
For observe steps, use \`{ "description": string }\` as a read-only display.

### matching
\`\`\`json
{ "pairs": [{ "itemA": string, "itemB": string }] }
\`\`\`

### drag_drop
\`\`\`json
{ "items": [{ "id": string, "label": string }], "groups": [{ "label": string, "target": [string] }] }
\`\`\`
Each group label is a target zone. Each item's label is the draggable text. Each group target lists the item labels that belong there.

### sequencing
\`\`\`json
{ "items": [{ "id": string, "label": string }], "correctOrder": [string] }
\`\`\`

### multiple_choice
\`\`\`json
{ "questions": [{ "question": string, "options": [string], "correctIndex": number }] }
\`\`\`

### story_question
\`\`\`json
{ "scenario": string, "questions": [{ "question": string, "options": [string], "correctIndex": number }] }
\`\`\`

### fraction_visual
\`\`\`json
{ "numerator": number, "denominator": number, "mode": "bar"|"circle", "label": string, "interactive": bool }
\`\`\`

### place_value_chart
\`\`\`json
{ "digits": [number|null], "maxPlaces": "lakh"|"crore", "targetNumber": number, "interactive": bool }
\`\`\`

### grid_area
\`\`\`json
{ "rows": number, "cols": number, "mode": "area"|"perimeter", "interactive": bool }
\`\`\`

### chart_reader
\`\`\`json
{ "type": "bar"|"pictograph", "data": [{ "label": string, "value": number }], "title": string }
\`\`\`

### clock_time
\`\`\`json
{ "hour": number, "minute": number, "mode": "read"|"set", "interactive": bool, "showDigital": bool }
\`\`\`

### measurement_scale
\`\`\`json
{ "type": "ruler"|"thermometer"|"cylinder", "min": number, "max": number, "step": number, "unit": string, "value": number, "interactive": bool }
\`\`\`

### fill_blank
\`\`\`json
{ "template": string, "blanks": [{ "id": string, "position": number, "correctAnswer": string|number, "options": [string|number] }], "mode": "select"|"type" }
\`\`\`
"template" is the text with ___ placeholders. Each blank has a position (0-based index matching the placeholder), correctAnswer, and optional options.

### real_world / real_world_task
\`\`\`json
{ "scenario": string, "taskDescription": string }
\`\`\`

## Output Format

Return exactly 5 activities in order (step 1-5). Each activity must have:
- step: string
- type: string (from allowed types for that step)
- order: number (1-5)
- content: string — a JSON-encoded string of the activity content object following the content shape definitions above.
  For guided_practice: include "hints" array (exactly 5 strings — 4 graduated hints + 1 empty string).
  For mastery_check: include "questions" array (exactly 2-3 items, each with "question" (NOT "text"), "options" (array of 4 strings), and "correctIndex" (number 0-3)).`;

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
      let questions = content.questions;
      if (!Array.isArray(questions) && typeof content.question === 'object' && content.question !== null) {
        const q = content.question as Record<string, unknown>;
        if (Array.isArray(content.options)) {
          questions = [{ text: q.text ?? '', options: content.options, correctIndex: q.correctIndex ?? content.correctIndex ?? 0 }];
        } else {
          questions = [{ text: q.text ?? '', options: (q.options as string[]) ?? [], correctIndex: (q.correctIndex as number) ?? 0 }];
        }
      }
      if (!Array.isArray(questions) && Array.isArray(content.question)) {
        questions = content.question;
      }
      if (Array.isArray(questions)) {
        if (questions.length > 0) {
          (act.content as Record<string, unknown>).questions = questions;
        }
      }
    }

    if (act.step === 'guided_practice') {
      const content = act.content as Record<string, unknown>;
      const hints = content.hints;
      if (!Array.isArray(hints) || hints.length === 0) {
        content.hints = [''];
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
      maxTokens: 16384,
    });

    const activities = result.activities.map((a) => {
      let content: Record<string, unknown>;
      if (typeof a.content === 'string') {
        try {
          content = JSON.parse(a.content);
        } catch {
          content = {};
        }
      } else if (typeof a.content === 'object' && a.content !== null) {
        content = a.content as Record<string, unknown>;
      } else {
        content = {};
      }
      return { ...a, content };
    }) as GeneratedActivity[];
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
