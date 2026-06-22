# Activity Schema

## Overview

`packages/db/src/activity-schema.ts` defines a **shared Zod discriminated union** (`activitySchema`) that serves as the single source of truth for activity content shape across the system:

| Consumer | How It Uses the Schema |
|----------|----------------------|
| **LLM pipeline** (`packages/pipeline/src/generate-activities/`) | Type-specific content schemas for step output, validation + retry |
| **DB ingest** (`packages/db/src/curriculum-pipeline.ts`) | Validates content at write time (full schema for JSON, skip for YAML) |
| **UI rendering** (`packages/ui/src/`) | Canonical shapes match component props directly |
| **Migration** (`packages/db/src/cli/migrate-yaml-to-json.ts`) | Validates migrated content post-write |
| **Roundtrip tests** (`packages/ui/src/render-roundtrip.ts`) | Builds correct responses from canonical shapes |

---

## Schema Architecture

```
activitySchema (discriminated union by `type`)
├── visual_counting     → visualCountingContentSchema
├── matching            → matchingContentSchema
├── drag_drop           → dragDropContentSchema
├── sequencing          → sequencingContentSchema
├── multiple_choice     → multipleChoiceContentSchema
├── story_question      → storyQuestionContentSchema
├── real_world          → realWorldContentSchema
├── fraction_visual     → fractionVisualContentSchema
├── place_value_chart   → placeValueChartContentSchema
├── grid_area           → gridAreaContentSchema
├── chart_reader        → chartReaderContentSchema
├── clock_time          → clockTimeContentSchema
├── measurement_scale   → measurementScaleContentSchema
└── fill_blank          → fillBlankContentSchema
```

Each content schema is independently exported (e.g., `visualCountingContentSchema`) for reuse in per-step LLM generation.

---

## Activity Types & Content Shapes

The fields below reflect the actual Zod schemas in `packages/db/src/activity-schema.ts`. "Required" means the field has no `.optional()` and no default. All other fields are optional.

### 1. `visual_counting`
Display a visual count of items and ask the learner to identify the quantity.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `description` | `string` | No | Instruction text |
| `items` | `string[]` | No | Emoji/character items to display |
| `count` | `number` (int, positive) | No | The correct count |
| `text` | `string` | No | Contextual explanation |
| `emoji` | `string` | No | Override emoji for counter |
| `size` | `"sm" \| "md" \| "lg"` | No | Display size |
| `hint` | `string` | No | Singular hint text |
| `hints` | `string[]` (max 5) | No | Progressive hints array |
| `left` | `string[] \| number` | No | Left-side items (addition) |
| `right` | `string[] \| number` | No | Right-side items (addition) |
| `sum` | `number` (int) | No | Total after addition |

### 2. `matching`
Match items from two columns (e.g., numbers to names, shapes to words).

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `description` | `string` | No | Instruction text |
| `pairs` | `MatchingPair[]` (min 1) | Yes | Array of `{id?, itemA, itemB}` |
| `hints` | `string[]` (max 5) | No | Progressive hints |

`MatchingPair`: `{ id?: string, itemA: string, itemB: string }`

### 3. `drag_drop`
Drag items onto labeled drop targets.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `description` | `string` | No | Instruction text |
| `items` | `DragItem[]` (min 1) | Yes | Items to drag, each `{id, label, emoji?}` |
| `targets` | `DragTarget[]` (min 1) | Yes | Drop targets, each `{id, label}` |
| `expectedPositions` | `Record<string, string>` | Yes | Maps item ID → target ID |
| `hints` | `string[]` (max 5) | No | Progressive hints |

### 4. `sequencing`
Arrange items in the correct order.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `description` | `string` | No | Instruction text |
| `items` | `SeqItem[]` (min 2) | Yes | Items to sequence, each `{id, label, emoji?}` |
| `correctOrder` | `string[]` (min 2) | Yes | Ordered array of item IDs |
| `hints` | `string[]` (max 5) | No | Progressive hints |

### 5. `multiple_choice`
Answer a multiple-choice question.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `questions` | `McQuestion[]` (min 1) | Yes | Array of `{question, options, correctIndex}` |

`McQuestion`: `{ question: string, options: string[] (min 2), correctIndex: number (int, min 0) }`

### 6. `story_question`
Read a scenario and answer comprehension-style questions.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `scenario` | `string` | Yes | Narrative context |
| `questions` | `McQuestion[]` (min 1) | Yes | Same shape as multiple_choice questions |
| `visual` | `string` | No | Optional visual emoji |

### 7. `real_world`
Apply a concept to a real-world scenario.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `scenario` | `string` | Yes | Narrative context |
| `taskDescription` | `string` | No | Task prompt |
| `prompt` | `string` | No | Alternative prompt text |
| `expectedAnswer` | `string` | No | Expected answer |
| `visualExample` | `string` | No | Emoji visual |
| `hint` | `string` | No | Hint text |

### 8. `fraction_visual`
Display a fraction visually as a shaded shape.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `numerator` | `number` (int, min 0) | Yes | Shaded parts |
| `denominator` | `number` (int, min 1) | Yes | Total parts |
| `mode` | `"bar" \| "circle"` | Yes | Visualization mode |
| `interactive` | `boolean` | Yes | Whether learner can interact |
| `label` | `string` | No | Label text (e.g., "1/2") |
| `showLabel` | `boolean` | No | Whether to show the label |
| `compare` | `CompareFraction` | No | `{numerator, denominator}` for comparison |

### 9. `place_value_chart`
Display a number in a place value grid.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `maxPlaces` | `"lakh" \| "crore"` | Yes | Grid size |
| `digits` | `(number \| null)[]` | Yes | Right-aligned digit array (0-9 or null) |
| `interactive` | `boolean` | Yes | Whether learner can interact |
| `targetNumber` | `number` (int) | No | Target number for practice |
| `draggableDigits` | `number[]` | No | Available digits to drag |
| `showLabels` | `boolean` | No | Show place value column labels |

### 10. `grid_area`
Highlight cells in a grid to calculate area/perimeter.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `rows` | `number` (int, 1-20) | Yes | Number of rows |
| `cols` | `number` (int, 1-20) | Yes | Number of columns |
| `mode` | `"area" \| "perimeter"` | Yes | Calculation mode |
| `highlighted` | `{row, col}[]` | No | Pre-highlighted cells |
| `interactive` | `boolean` | No | Whether learner can highlight |
| `maxHighlights` | `number` (int) | No | Max cells selectable |
| `cellSize` | `number` (int) | No | Cell size in px |
| `showCount` | `boolean` | No | Show running count |

### 11. `chart_reader`
Read and interpret a bar chart or pictograph.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `type` | `"bar" \| "pictograph"` | Yes | Chart type |
| `data` | `ChartDataPoint[]` (min 1) | Yes | Array of `{label, value, emoji?}` |
| `interactive` | `boolean` | Yes | Whether learner can interact |
| `title` | `string` | No | Chart title |
| `showValues` | `boolean` | No | Show values on bars |
| `correctLabel` | `string` | No | Required when `interactive: true` (for scoring) |

### 12. `clock_time`
Read and set the time on an analog clock.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `hour` | `number` (int, 0-23) | Yes | Current hour |
| `minute` | `number` (int, 0-59) | Yes | Current minute |
| `mode` | `"read" \| "set"` | Yes | Interaction mode |
| `interactive` | `boolean` | Yes | Whether learner can interact |
| `targetTime` | `{hour, minute}` | No | Required when `mode: "set"` and `interactive: true` |
| `showDigital` | `boolean` | No | Show digital time |
| `size` | `number` (int) | No | Clock size |

### 13. `measurement_scale`
Read a value from a scale (ruler, thermometer, weighing scale).

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `type` | `"ruler" \| "thermometer" \| "cylinder"` | Yes | Scale type |
| `min` | `number` | Yes | Scale minimum |
| `max` | `number` | Yes | Scale maximum |
| `step` | `number` (positive) | Yes | Step between markings |
| `unit` | `string` | Yes | Unit label (e.g., "kg", "cm", "°C") |
| `interactive` | `boolean` | Yes | Whether learner can interact |
| `value` | `number` | No | Current reading |
| `targetValue` | `number` | No | Required when `interactive: true` (for scoring) |
| `showReading` | `boolean` | No | Show current reading |
| `showLabels` | `boolean` | No | Show scale labels |

### 14. `fill_blank`
Fill in missing words or numbers in a template.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `template` | `string` | Yes | Text with blanks (use `___` or `{blank}`) |
| `blanks` | `Blank[]` (min 1) | Yes | Array of `{id, position, correctAnswer, options?}` |
| `mode` | `"select" \| "type"` | Yes | Interaction mode |

`Blank`: `{ id: string, position: number (int, min 0), correctAnswer: string | number, options?: (string|number)[] }`

---

## Scoring Contracts

Some activity types include **`superRefine` checks** that catch silent mis-scoring at generation time:

| Type | Contract | Behavior |
|------|----------|----------|
| `chart_reader` | `interactive → correctLabel` required | Ensures scoring label exists for interactive charts |
| `clock_time` | `mode: "set" && interactive → targetTime` required | Ensures target time exists for set-mode scoring |
| `measurement_scale` | `interactive → targetValue` required | Ensures target reading exists for scoring |

Note: `multiple_choice` does **not** currently enforce `correctIndex < options.length`. The pipeline's per-step generation uses `mcQuestionSchema` which only validates `options.min(2)` and `correctIndex.min(0)`. A superRefine for `correctIndex < options.length` would catch LLM off-by-one errors — consider adding it as a follow-up.

---

## Step-Type Compatibility

The `VALID_TYPES_PER_STEP` constant (defined in `packages/db/src/activity-schema.ts`, the single source of truth) defines which activity types are valid for each step:

| Step | Valid Types |
|------|-------------|
| `observe` | `visual_counting`, `story_question`, `fraction_visual`, `place_value_chart`, `grid_area`, `clock_time`, `measurement_scale`, `chart_reader` |
| `guided_practice` | `visual_counting`, `matching`, `drag_drop`, `sequencing`, `story_question`, `fraction_visual`, `place_value_chart`, `fill_blank` |
| `independent_practice` | `visual_counting`, `matching`, `drag_drop`, `sequencing`, `fraction_visual`, `place_value_chart`, `fill_blank` |
| `mastery_check` | `multiple_choice`, `fill_blank` |
| `positive_completion` | `visual_counting` |

The `stepOutputSchema()` builder in `packages/pipeline/src/generate-activities/index.ts` wraps the type-specific content schema so the LLM returns `{ type, content }` matching the expected shape for that step. The pipeline's `type-selector.ts` uses `VALID_TYPES_PER_STEP` to deterministically pick a type per step based on concept keywords.

---

## Adding a New Activity Type

1. Define the content shape in `packages/db/src/activity-schema.ts`:
   - Create a new Zod object schema (e.g., `newTypeContentSchema`)
   - Add it to the `activityContentSchema` discriminated union
   - Add any `superRefine` scoring contracts
   - Add to `VALID_TYPES_PER_STEP`
2. Export it from `packages/db/src/index.ts`
3. Add the content schema to `contentSchemaForType()` in `packages/pipeline/src/generate-activities/index.ts`
4. Add an exemplar in `packages/pipeline/src/generate-activities/exemplars.ts`
5. Create a per-step prompt template or add the type to existing step prompts
6. Update the `ActivityRenderer` switch statement in `packages/ui/src/ActivityRenderer.tsx`
7. Add roundtrip test support in `packages/ui/src/render-roundtrip.ts`
8. Add the type to this document's shapes table above

---

## Usage Guide

### Validating Content

```typescript
import { activitySchema, validateActivity } from '@learn-easy/db';

// Full activity validation
const result = activitySchema.safeParse({ step, type, order, content });

// Wrapped with path-level error messages
const errors = validateActivity({ step, type, order, content });
```

### Using Per-Type Schemas in the Pipeline

```typescript
import { visualCountingContentSchema } from '@learn-easy/db';

const outputSchema = z.object({
  type: z.literal('visual_counting'),
  content: visualCountingContentSchema,
});
```
