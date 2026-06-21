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
├── fraction_visual     → fractionVisualContentSchema
├── place_value_chart   → placeValueChartContentSchema
├── grid_area           → gridAreaContentSchema
├── chart_reader        → chartReaderContentSchema
├── clock_time          → clockTimeContentSchema
├── measurement_scale   → measurementScaleContentSchema
├── fill_blank          → fillBlankContentSchema
└── type_router         → typeRouterContentSchema
```

Each content schema is independently exported (e.g., `visualCountingContentSchema`) for reuse in per-step LLM generation.

---

## Activity Types & Content Shapes

### 1. `visual_counting`
Display a visual count of items and ask the learner to identify the quantity.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `description` | `string` | Yes | Instruction text |
| `items` | `string[]` | Yes | Emoji/character items to display |
| `count` | `number` | Yes | The correct count |
| `text` | `string` | No | Contextual explanation |
| `emoji` | `string` | No | Override emoji for counter |
| `size` | `"sm" \| "md" \| "lg"` | No | Display size |
| `hint` | `string` | No | Singular hint text |
| `hints` | `string[]` | No | Progressive hints array |

### 2. `matching`
Match items from two columns (e.g., numbers to names, shapes to words).

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `description` | `string` | Yes | Instruction text |
| `pairs` | `MatchingPair[]` | Yes | Array of `{id, itemA, itemB}` |
| `hints` | `string[]` | No | Progressive hints |

`MatchingPair`: `{ id: string, itemA: string, itemB: string }`

### 3. `drag_drop`
Drag items onto labeled drop targets.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `description` | `string` | Yes | Instruction text |
| `items` | `DragItem[]` | Yes | Items to drag, each `{id, label, emoji?}` |
| `targets` | `DragTarget[]` | Yes | Drop targets, each `{id, label}` |
| `expectedPositions` | `Record<string, string>` | Yes | Maps item ID → target ID |
| `hints` | `string[]` | No | Progressive hints |

### 4. `sequencing`
Arrange items in the correct order.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `description` | `string` | Yes | Instruction text |
| `items` | `SeqItem[]` | Yes | Items to sequence, each `{id, label, emoji?}` |
| `correctOrder` | `string[]` | Yes | Ordered array of item IDs |

### 5. `multiple_choice`
Answer a multiple-choice question.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `questions` | `McQuestion[]` | Yes | Array of `{question, options, correctIndex, emoji?}` |
| `description` | `string` | No | Optional instruction text |

`McQuestion`: `{ question: string, options: string[], correctIndex: number, emoji?: string }`

### 6. `story_question`
Read a scenario and answer comprehension-style questions.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `description` | `string` | Yes | Instruction text |
| `scenario` | `string` | Yes | Narrative context |
| `questions` | `McQuestion[]` | Yes | Same shape as multiple_choice questions |
| `hints` | `string[]` | No | Progressive hints |

### 7. `fraction_visual`
Display a fraction visually as a shaded shape.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `label` | `string` | Yes | Label text (e.g., "1/2") |
| `numerator` | `number` | Yes | Shaded parts |
| `denominator` | `number` | Yes | Total parts |
| `emoji` | `string` | No | Emoji to repeat |
| `showLabel` | `boolean` | No | Whether to show the label |
| `compare` | `CompareFraction` | No | `{numerator, denominator}` for comparison |

### 8. `place_value_chart`
Display a number in a place value grid.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `digits` | `(number \| null)[]` | Yes | Right-aligned digit array |
| `maxPlaces` | `"lakh" \| "crore"` | Yes | Grid size |

### 9. `grid_area`
Highlight cells in a grid to calculate area/perimeter.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `description` | `string` | Yes | Instruction text |
| `rows` | `number` | Yes | Number of rows |
| `cols` | `number` | Yes | Number of columns |
| `highlighted` | `{row, col}[]` | Yes | Cell coordinates |
| `label` | `string` | No | Optional label |
| `hint` | `string` | No | Hint text |

### 10. `chart_reader`
Read and interpret a bar chart or pictograph.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `description` | `string` | Yes | Instruction text |
| `title` | `string` | Yes | Chart title |
| `data` | `ChartDataPoint[]` | Yes | Array of `{label, value, emoji?}` |
| `questions` | `McQuestion[]` | Yes | Chart reading questions |

### 11. `clock_time`
Read and set the time on an analog clock.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `label` | `string` | No | Clock label |
| `hour` | `number` | Yes | Hour (1-12) |
| `minute` | `number` | Yes | Minute (0-59) |
| `targetTime` | `{hour, minute}` | No | Target time for practice mode |

### 12. `measurement_scale`
Read a value from a scale (ruler, thermometer, weighing scale).

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `description` | `string` | Yes | Instruction text |
| `min` | `number` | Yes | Scale minimum |
| `max` | `number` | Yes | Scale maximum |
| `value` | `number` | Yes | Correct reading |
| `unit` | `string` | Yes | Unit label (e.g., "kg", "cm", "°C") |
| `label` | `string` | No | Optional prompt text |
| `targetValue` | `number` | No | Target for practice mode |

### 13. `fill_blank`
Fill in missing words or numbers in a template.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `description` | `string` | Yes | Instruction text |
| `template` | `string` | Yes | Text with blanks (use `___` or `{blank}`) |
| `blanks` | `Blank[]` | Yes | Array of `{id, position, correctAnswer}` |
| `hint` | `string` | No | Hint text |

`Blank`: `{ id: string, position: number, correctAnswer: string | number }`

### 14. `type_router`
Delegates to another component based on a specified mode.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `mode` | `"story_mode" \| "quiz_mode" \| ...` | Yes | Delegation target |
| `content` | depends on mode | Yes | Sub-content for the routed component |

---

## Scoring Contracts

Some activity types include **`superRefine` checks** that catch silent mis-scoring at generation time:

| Type | Contract | Behavior |
|------|----------|----------|
| `chart_reader` | `questions[].correctIndex < options.length` | Ensures answer index is valid |
| `clock_time` | `minute >= 0 && minute <= 59` | Validates minute range |
| `measurement_scale` | `value >= min && value <= max` | Ensures reading is on-scale |
| `multiple_choice` | `correctIndex < options.length` | Same as chart_reader |

If any contract fails, the schema validation returns a clear error message identifying the exact field.

---

## Step-Type Compatibility

The `VALID_TYPES_PER_STEP` constant defines which activity types are valid for each step:

| Step | Valid Types |
|------|-------------|
| `observe` | `visual_counting`, `fraction_visual`, `place_value_chart`, `grid_area`, `chart_reader`, `clock_time`, `measurement_scale` |
| `guided_practice` | `matching`, `drag_drop`, `sequencing`, `multiple_choice`, `story_question` |
| `independent_practice` | All 14 types |
| `mastery_check` | `multiple_choice`, `chart_reader`, `clock_time`, `measurement_scale`, `fill_blank` |
| `positive_completion` | `visual_counting` |

The `stepOutputSchema()` builder in `packages/pipeline/src/generate-activities/index.ts` wraps the type-specific content schema so the LLM returns `{ type, content }` matching the expected shape for that step.

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
