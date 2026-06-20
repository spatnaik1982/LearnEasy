# Curriculum Content Creation Guide

## Overview

LearnEasy uses a **curriculum-as-code** approach: every concept a learner studies is defined as a YAML file checked into the repository. This gives us:

- **Version control** — track every change to curriculum content
- **Automated validation** — catch errors before they reach learners
- **Separation of concerns** — content authors write YAML, engineers build the platform

This guide covers everything you need to create, edit, and validate curriculum content.

---

## Quick Start

```bash
# 1. Navigate to the right directory for your content
cd curriculum/level-a/math/

# 2. Copy an existing concept file as a template
cp counting-1-10.yaml my-new-concept.yaml

# 3. Edit the YAML file with your content

# 4. Validate your work from the repo root
pnpm curriculum:validate
```

---

## Directory Structure

All curriculum files live under `curriculum/` at the repo root. The directory structure encodes hierarchy:

```
curriculum/
├── level-a/               # NIOS OBE Level A
│   ├── math/              # Mathematics
│   │   ├── counting-1-10.yaml
│   │   ├── ch1-numbers.yaml
│   │   ├── ch3-addition.yaml
│   │   └── ...
│   ├── language/          # Language & Literacy
│   │   ├── ch1-letter-recognition-a-e.yaml
│   │   └── ...
│   └── evs/               # Environmental Studies
│       ├── ch1-plants-and-animals.yaml
│       └── ...
├── level-b/               # NIOS OBE Level B
│   └── math/              # Mathematics (pipeline-generated)
└── level-c/               # Future: NIOS OBE Level C
```

### Path Rules

The pipeline extracts metadata from the file path. Every file must follow this structure:

```
level-<code>/<subject>/<filename>.yaml
```

| Path component | Examples | Notes |
|---|---|---|
| `level-<code>` | `level-a`, `level-b`, `level-c` | `code` must match `/^[a-zA-Z0-9]+$/` |
| `<subject>` | `math`, `language`, `evs` | Lowercase subject name |
| `<filename>` | `counting-1-10.yaml`, `ch3-addition.yaml` | Must end in `.yaml` or `.yml` |

The pipeline maps `level-a/math/filename.yaml` to:
- Level: `A` (Level A)
- Subject: `MATH` (Mathematics)

---

## YAML File Format

Every concept file has two top-level sections:

1. **Concept metadata** — what this concept is about
2. **Activities array** — the 5-step learning sequence

### Full Example

```yaml
# ─── Concept Metadata ─────────────────────────────────────────────

conceptId: counting_1_10          # Unique identifier (lowercase, underscores)

chapter:                          # Chapter grouping (optional, but recommended)
  code: CH1
  name: Numbers

learningObjective: "Count objects from 1 to 10 with one-to-one correspondence"
coreIdea: "Each number represents a specific quantity"

examples:                         # At least one concrete example
  - "Count 3 apples: 🍎🍎🍎"
  - "Count 5 stars: ⭐⭐⭐⭐⭐"

misconceptions:                   # Common misunderstandings (can be empty)
  - "Skipping objects while counting"
  - "Counting same object twice"

supports:                         # Learning support flags (optional)
  visual: true

masteryCriteria: 0.8              # 0.0 to 1.0 — 80% required for mastery

difficulty: beginner              # beginner | intermediate | advanced
estimatedDuration: 15             # Minutes (positive integer)
dependencies: []                  # Prerequisite conceptIds

# ─── Activities (5 required steps) ─────────────────────────────────

activities:
  - step: observe
    type: visual_counting
    order: 1
    content:
      description: "Observe apples"
      items: ["🍎"]
      count: 3
      text: "There are three apples."

  - step: guided_practice
    type: visual_counting
    order: 2
    content:
      description: "Count the stars"
      items: ["⭐"]
      count: 5
      hint: "Count each star one by one."

  - step: independent_practice
    type: visual_counting
    order: 3
    content:
      description: "Count the flowers"
      items: ["🌸"]
      count: 7

  - step: mastery_check
    type: multiple_choice
    order: 4
    content:
      questions:
        - question: "How many apples? 🍎🍎"
          options: ["1", "2", "3", "4"]
          correctIndex: 1

  - step: positive_completion
    type: visual_counting
    order: 5
    content:
      message: "Great work! You counted correctly."
      encouragement: true
```

---

## Concept Metadata Reference

### Required Fields

| Field | Type | Rules | Example |
|---|---|---|---|
| `conceptId` | string | Regex `/^[a-z]+[a-z0-9_]*$/`. Must be unique across the entire curriculum. Use `_` as separator. | `counting_1_10`, `addition_1_10`, `plants_and_animals` |
| `learningObjective` | string | ≥ 10 characters. Keep ≤ 12 words for ALX compliance. | `"Count objects from 1 to 10 with one-to-one correspondence"` |
| `coreIdea` | string | The one-sentence takeaway. | `"Each number represents a specific quantity"` |
| `examples` | string[] | At least 1. Concrete, visual examples. | `["Count 3 apples: 🍎🍎🍎"]` |
| `masteryCriteria` | number | 0.0 – 1.0. Decimal representing required percentage for mastery. | `0.8` (80%) |

### Optional Fields

| Field | Type | Default | Description |
|---|---|---|---|
| `chapter` | object | — | Grouping info. `code` (string, e.g. `CH1`) and `name` (string, e.g. `Numbers`). |
| `misconceptions` | string[] | `[]` | Common errors or misunderstandings. Can be empty. |
| `supports` | object | — | Boolean flags: `visual`, `audio`, `prompting`. Set `visual: true` for concepts with visual content. |
| `difficulty` | enum | `beginner` | One of: `beginner`, `intermediate`, `advanced`. |
| `estimatedDuration` | number | — | Time in minutes to complete (positive integer). |
| `dependencies` | string[] | `[]` | Array of `conceptId` values this concept requires as prerequisites. |

### Writing Tips

- **`learningObjective`**: Write in plain language. Avoid jargon. Focus on what the child will *do*, not what they'll *understand*.
  - Good: "Count objects from 1 to 10 with one-to-one correspondence"
  - Avoid: "Develop numeracy skills through quantitative reasoning"

- **`coreIdea`**: The simplest possible summary. If an adult read it and said "well, obviously," you've done it right.

- **`examples`**: Use emoji and concrete objects (apples, stars, flowers, toys, animals). Abstract examples are confusing.

- **`misconceptions`**: Think about what a child with ASD might get wrong. Be specific — "Thinking a bigger denominator means a bigger fraction" is better than "Common mistakes."

---

## Activities: The 5-Step Learning Sequence

Every concept must have exactly 5 activities, one for each step of the lesson routine (ALX-7: Routine-Based Learning):

| Step | Order | Purpose | What the child does |
|---|---|---|---|
| `observe` | 1 | **I Do** — The tutor demonstrates the concept. | Watches and follows along. |
| `guided_practice` | 2 | **We Do** — The child practices with hints and support. | Tries with help available. |
| `independent_practice` | 3 | **You Do** — The child practices on their own. | Solves without hints. |
| `mastery_check` | 4 | **Check** — Assessment to verify understanding. | Answers questions to demonstrate mastery. |
| `positive_completion` | 5 | **Celebrate** — Positive reinforcement and closure. | Receives encouragement (no task). |

Each activity object has these required fields:

| Field | Type | Rules |
|---|---|---|
| `step` | string | Must be one of the 5 step names above |
| `type` | string | Must be one of the 7 valid activity types (see below) |
| `order` | number | Positive integer. Must match the canonical order above (1–5, observe first, positive_completion last). |
| `content` | object | Type-specific content payload (see below) |

### Valid Activity Types

| Type | Level | Description | Best used for |
|------|-------|-------------|---------------|
| `visual_counting` | A + B | Count objects shown on screen | Numbers, addition, subtraction |
| `matching` | A + B | Match item A to item B | Classification, vocabulary, phonics |
| `drag_drop` | A + B | Drag items into correct positions | Sequencing, sorting, spatial concepts |
| `sequencing` | A + B | Arrange items in correct order | Story order, number sequence, life cycle |
| `multiple_choice` | A + B | Select the correct answer from options | Mastery checks, comprehension |
| `story_question` | A + B | Answer questions about a short story | Reading comprehension |
| `real_world` | A + B | Apply concept to real-world scenario | Practical application, generalization |
| `fraction_visual` | B | Visual fraction bars/circles (part-of-whole) | Fractions, equivalents, comparison |
| `place_value_chart` | B | Place value chart up to crore (Indian system) | Large numbers, digit placement |
| `grid_area` | B | Grid-based area/perimeter counting | Perimeter, area, unit squares |
| `chart_reader` | B | Bar charts and pictographs | Data handling, reading values |
| `clock_time` | B | Interactive analog clock | Telling time, reading clocks |
| `measurement_scale` | B | Ruler, thermometer, measuring cylinder | Measurement reading |
| `fill_blank` | B | Equation/sequence fill-in-the-blank | Missing digits, expanded form |

### Activity Content by Type

#### `visual_counting`

```yaml
content:
  description: "Observe apples"       # Short description of the activity
  items: ["🍎"]                       # Array of emoji/item strings
  count: 3                           # How many items to display (or: left + right for addition)
  text: "There are three apples."    # Optional explanatory text
  hint: "Count each apple."          # Optional single hint (guided_practice)
  hints:                            # Optional array of graduated hints
    - "Hint 1: Let me show you..."
    - "Hint 2: Look carefully..."
    - "Hint 3: You're close..."
    - "Hint 4: Try counting..."
    - ""                            # Empty string = no more hints
```

For addition concepts, use `left` + `right` instead of `items` + `count`:

```yaml
content:
  description: "Adding apples"
  left: ["🍎", "🍎"]                  # First group (or a number like 3)
  right: ["🍎"]                       # Second group (or a number like 2)
  sum: 3                             # Expected total
  text: "Two apples plus one apple equals three apples."
```

#### `matching`

```yaml
content:
  description: "Match each as plant or animal"
  pairs:
    - itemA: "🌳"
      itemB: "Plant"
    - itemA: "🐱"
      itemB: "Animal"
  hints:                            # Optional graduated hints
    - "The tree 🌳 is a Plant."
    - "Look at the first item."
    - "You're close! Check your match."
    - "Try thinking: what category?"
    - ""
```

#### `drag_drop`

```yaml
content:
  description: "Sort items into groups"
  groups:
    - label: "Plants"
      target: ["🌳", "🌻"]
    - label: "Animals"
      target: ["🐱", "🐦"]
  items: ["🌳", "🐱", "🌻", "🐦"]   # Items to be dragged
```

#### `sequencing`

```yaml
content:
  description: "Put the story in order"
  items:                            # Items in the correct order
    - "1. The seed is planted"
    - "2. Water makes it grow"
    - "3. A flower blooms"
  shuffled:                         # Optional: items in scrambled order for display
    - "3. A flower blooms"
    - "1. The seed is planted"
    - "2. Water makes it grow"
```

#### `multiple_choice`

```yaml
content:
  questions:
    - question: "How many apples? 🍎🍎"
      options: ["1", "2", "3", "4"]
      correctIndex: 1               # Zero-indexed: 1 = "2" (the second option)
    - question: "How many stars? ⭐⭐⭐⭐⭐"
      options: ["4", "5", "6", "7"]
      correctIndex: 1
```

#### `story_question`

```yaml
content:
  story: "Ravi planted a seed. He watered it every day. After one week, a small green plant grew."
  questions:
    - question: "What did Ravi plant?"
      options: ["A flower", "A seed", "A tree"]
      correctIndex: 1
    - question: "What happened after one week?"
      options: ["It rained", "A plant grew", "Ravi went to school"]
      correctIndex: 1
```

#### `real_world`

```yaml
content:
  description: "Find numbers at home"
  scenario: "Look around your room. Can you find a clock with numbers?"
  prompt: "What numbers do you see on the clock?"
  expectedAnswer: "1 to 12"         # Optional expected answer for AI evaluation
```

---

## Level B Chapter Reference

This table maps each Level B Math chapter to the activity types it uses. Use it as a starting point when authoring a new concept.

| Chapter | Topics | Observe | Guided | Independent | Mastery | Example |
|---|---|---|---|---|---|---|
| CH1 — Numbers (1000–9999) | place value, reading/writing, forming, expanded form | `place_value_chart` | `drag_drop` | `fill_blank` | `multiple_choice` | `place_value_understanding.yaml` |
| CH2 — Operations | addition, subtraction, multiplication, division | `visual_counting` | `story_question` / `drag_drop` | `fill_blank` | `multiple_choice` | `addition_basics.yaml` |
| CH3 — Fractions & Geometry | fractions, decimals, perimeter, area, volume, angles, symmetry, lines | `fraction_visual` / `grid_area` | `drag_drop` / `matching` | `fill_blank` / `fraction_visual` | `multiple_choice` | `fractions_intro.yaml` |
| CH4 — Order & Comparison | ascending, descending, comparing | `visual_counting` / `sequencing` | `drag_drop` | `multiple_choice` | `multiple_choice` | `ascending_order_numbers.yaml` |
| CH5 — Measurement | length, weight, capacity, conversion, time | `clock_time` / `measurement_scale` | `drag_drop` / `matching` | `fill_blank` / `measurement_scale` | `multiple_choice` / `clock_time` | `clock_reading.yaml` |
| CH7 — Data Handling | data collection, bar graphs, pictographs | `chart_reader` | `drag_drop` | `fill_blank` | `multiple_choice` | `bar_graphs.yaml` |

**Coverage gaps:** CH5 (Measurement) now has clock_time and measurement_scale concepts added. CH6 is planned for future content.

## Per-type Scoring Rules

Each activity type has a `correct: boolean` decision made by `evaluateActivity()` in `packages/ui/src/activity-utils.ts`. The table below documents, for each new type, what content field is required for scoring and what happens when the field is missing.

| Type | Required for scoring | Without it | Tolerance |
|---|---|---|---|
| `fraction_visual` | (none — click-driven) | `correct: true` if `interactive: false`, else `correct: false` | exact match |
| `place_value_chart` | `targetNumber` | `correct: true` if `interactive: false` (observe), else `correct: false` | exact digit match |
| `grid_area` | (none — click-driven) | `correct: false` (no clicks = no completion) | exact count (area) or perimeter |
| `chart_reader` | `correctLabel` (when `interactive: true`) | `correct: true` (stimulus observe) | exact label match |
| `clock_time` | `targetTime` (when `interactive: true`) | `correct: true` (observe) | hour exact, minutes ±5 |
| `measurement_scale` | `targetValue` (when `interactive: true`) | `correct: true` (observe) | ±1 step |
| `fill_blank` | `blanks[].correctAnswer` (always) | `correct: false` (no answers provided) | string match |

**Observe-step auto-complete:** When `stepLabel === "observe"` and the type is in `OBSERVE_STEP_AUTO_COMPLETABLE_TYPES` (all 7 new types), the renderer auto-calls `onComplete({ observed: true })` after 1500ms. `evaluateActivity` short-circuits on `response.observed === true` and returns `{ correct: true }` regardless of the type.

### Level B Activity Types (EPIC-14)

> **Note on the observe step:** For the observe step (where the tutor demonstrates), set `interactive: false` (or omit the `interactive` key). The renderer auto-completes these activities after 1500ms. The user is not expected to answer anything in observe. See the "Per-type scoring rules" section below for details.

The following 7 activity types were added in EPIC-14 for Level B Math concepts.

#### `fraction_visual`

```yaml
content:
  numerator: 3
  denominator: 4
  mode: "circle"                    # "bar" or "circle"
  label: "3/4"
  showLabel: true
  interactive: true
  compare:                          # Optional: equivalence comparison
    numerator: 6
    denominator: 8
```

**Comparison mode (equivalent fractions):**

```yaml
content:
  numerator: 1
  denominator: 2
  mode: circle
  label: "1/2"
  compare:
    numerator: 2
    denominator: 4
  showLabel: true
```

#### `place_value_chart`

```yaml
# Canonical shape (recommended for new content)
content:
  maxPlaces: crore        # "lakh" or "crore"
  digits: [null, null, null, null, null, 5, 4, 3]  # null = empty slot
  targetNumber: 543
  interactive: true
  draggableDigits: [5, 4, 3]
  showLabels: true

# Pipeline shape A — place → digit object (used in place_value_understanding.yaml)
content:
  description: "Let's look at the number 5964."
  chart:
    thousands: 5
    hundreds: 9
    tens: 6
    ones: 4

# Pipeline shape B — digit/place pairs (used in expanded_form.yaml)
content:
  description: "Let's look at the number 75406."
  chart:
    - { digit: "7", place: "10000" }
    - { digit: "5", place: "1000" }
    - { digit: "4", place: "100" }
    - { digit: "0", place: "10" }
    - { digit: "6", place: "1" }

# Pipeline shape C — columns/rows table (used in forming_numbers.yaml)
content:
  description: "Let's look at how to arrange digits."
  chart:
    columns: [Thousands, Hundreds, Tens, Ones]
    rows:
      - [5, 3, 1, 0]
      - [0, 1, 3, 5]
```

**Scoring:** Requires `targetNumber`. Without it, the activity is unscored (used in observe steps where the learner is just viewing).

#### `grid_area`

```yaml
content:
  rows: 6
  cols: 8
  mode: "area"                      # "area" or "perimeter"
  highlighted:                      # Pre-highlighted cells
    - { row: 1, col: 1 }
    - { row: 1, col: 2 }
  interactive: true
  maxHighlights: 48
  cellSize: 40
  showCount: true
```

#### `chart_reader`

```yaml
# Stimulus mode (observe step, default): the chart is displayed but bars are not clickable.
content:
  type: bar
  data:
    - label: Cricket
      value: 12
      emoji: "🏏"
    - label: Football
      value: 8
      emoji: "⚽"
  title: Favorite Sports
  showValues: true
  interactive: false

# Scored mode (guided/independent/mastery): bars are clickable.
content:
  type: bar
  data:
    - { label: Cricket, value: 12 }
    - { label: Football, value: 8 }
    - { label: Hockey, value: 5 }
  title: Which sport is most popular?
  showValues: true
  interactive: true
  correctLabel: Cricket     # required for scoring
```

**Scoring:** Requires `correctLabel` when `interactive: true`. Without it, the activity is stimulus-only and auto-completes.

#### `clock_time`

```yaml
content:
  hour: 3
  minute: 45
  mode: "read"                      # "read" or "set"
  showDigital: true
  targetTime:                       # For "set" mode
    hour: 7
    minute: 30
  interactive: false                # true for "set" mode
  size: 250
```

**Scoring:** Requires `targetTime` for guided/independent/mastery steps. Without it (or with `interactive: false`), the activity is observe-only and auto-completes. The 5-minute tolerance on minutes is built in. Recommended Level B chapter: CH5 (Time / Measurement).

#### `measurement_scale`

```yaml
content:
  type: "ruler"                     # "ruler", "thermometer", or "cylinder"
  min: 0
  max: 30
  step: 1
  unit: "cm"
  value: 12
  interactive: true
  showReading: true
  showLabels: true
```

**Scoring:** Requires `targetValue` for guided/independent/mastery steps. Without it (or with `interactive: false`), the activity is observe-only. The 1-step tolerance is built in.

#### `fill_blank`

```yaml
content:
  template: "3 + ___ = 8"
  blanks:
    - id: "blank_1"
      position: 0
      correctAnswer: "5"
      options: ["3", "4", "5", "6"] # For select mode
  mode: "select"                    # "select" or "type"
```

**Pipeline variant — `prompt + answers` (used in `expanded_form.yaml`):**

```yaml
content:
  prompt: "Fill in the blanks for the expanded form of 395432:"
  statement: "395432 = ___ + ___ + ___ + ___ + ___ + ___."
  answers:
    - "300000"
    - "90000"
    - "5000"
    - "400"
    - "30"
    - "2"
```

The renderer builds the `blanks` array from the `answers` field and uses the `prompt` (or `statement`) as the `template`.

### Runtime Normalization

The student app's `ActivityRenderer` includes a `normalizeContent()` helper that translates YAML shapes the EPIC-13 pipeline emits into the canonical component prop shape. Content authors writing YAML by hand should prefer the canonical shapes documented above, but the runtime will accept pipeline variants too.

For each new type, the runtime supports:
- `place_value_chart`: 4 shapes (canonical + 3 pipeline variants shown above)
- `chart_reader`: 2 shapes (canonical + `categories` variant)
- `fill_blank`: 2 shapes (canonical + `prompt + answers` variant shown above)
- `grid_area`, `clock_time`, `measurement_scale`, `fraction_visual`: the canonical shapes shown above

See `packages/ui/src/ActivityRenderer.tsx` for the exact normalization rules.

### Positive Completion (Step 5)

The final step is always the same structure — just a celebratory message:

```yaml
- step: positive_completion
  type: visual_counting              # Type is always visual_counting for this step
  order: 5
  content:
    message: "Great work! You counted correctly."
    encouragement: true
```

---

## Dependencies

Concepts can declare prerequisites using the `dependencies` field:

```yaml
dependencies:
  - counting_1_10
  - number_recognition_1_10
```

### Rules

- Each value must be a valid `conceptId` that exists in another curriculum file
- A concept with an empty dependencies array (`[]`) is an **entry point** — no prerequisites
- Circular dependencies are caught by the validator and produce an error
- Missing dependency references (typos, renamed concepts) are caught by the validator

### Best Practices

- Keep the dependency graph shallow — Level A concepts should have at most 2–3 prerequisites
- Group related concepts into chapters (use the `chapter` field) so dependencies are clear
- Use the validator to check your dependency structure before committing

---

## Validation

### Running the Validator

```bash
# Basic validation (from repo root)
pnpm curriculum:validate

# Verbose mode — see per-file results
pnpm curriculum:validate -- --verbose

# Against a custom directory (for testing)
pnpm curriculum:validate -- --dir /path/to/test/curriculum
```

### What Gets Checked

**Layer 1 — Structural (errors):**
- YAML syntax validity
- All required ConceptSpec fields present and correctly typed
- Activity structure: valid `step`, `type`, `order`, and `content` object
- All dependency references resolve to existing conceptIds
- No circular dependency chains
- No duplicate conceptIds

**Layer 2 — ALX Compliance (errors + warnings):**
- **Error**: Missing required activity steps (all 5 must be present)
- **Error**: Unknown activity type
- **Warning**: Text fields exceeding 12 words
- **Warning**: No visual-based activity (at least one activity should use `visual_counting`, `matching`, or `drag_drop`)

### Exit Codes

| Code | Meaning |
|---|---|
| `0` | All checks passed (warnings are OK) |
| `1` | One or more errors found — fix before committing |

---

## Workflow: Creating a New Concept

### Step-by-Step

1. **Identify the concept** — What skill should the child learn? Check the NIOS OBE syllabus for your level.

2. **Check prerequisites** — What concepts must the child master first? Look at existing concept files in the same subject area.

3. **Choose the file location** — Place it under the correct level and subject directory:
   ```
   curriculum/level-a/math/my-new-concept.yaml
   ```

4. **Write the YAML** — Fill in all required fields. Use an existing file in the same subject as a template.

5. **Design the activities** — Write all 5 activity steps following the Observe → Guided Practice → Independent Practice → Mastery Check → Positive Completion sequence.

6. **Validate** — Run `pnpm curriculum:validate`. Fix all errors. Review warnings and address any that matter.

7. **Test manually** — (Future) Run the student app locally and verify the concept renders correctly.

8. **Commit** — Use a conventional commit message:
   ```
   feat(curriculum): add counting 1-10 concept (Level A Math)
   ```

### Template

Copy this into a new `.yaml` file and fill in the blanks:

```yaml
conceptId: your_concept_id
chapter:
  code: CH1
  name: Chapter Name
learningObjective: "What the child will be able to do"
coreIdea: "The key takeaway in one sentence"
examples:
  - "A concrete example with emoji if possible"
misconceptions:
  - "A common mistake to watch for"
supports:
  visual: true
masteryCriteria: 0.8
difficulty: beginner
estimatedDuration: 15
dependencies: []

activities:
  - step: observe
    type: visual_counting
    order: 1
    content:
      description: ""
      items: [""]
      count: 0
      text: ""

  - step: guided_practice
    type: visual_counting
    order: 2
    content:
      description: ""
      items: [""]
      count: 0
      hint: ""

  - step: independent_practice
    type: visual_counting
    order: 3
    content:
      description: ""
      items: [""]
      count: 0

  - step: mastery_check
    type: multiple_choice
    order: 4
    content:
      questions:
        - question: ""
          options: ["", "", "", ""]
          correctIndex: 0

  - step: positive_completion
    type: visual_counting
    order: 5
    content:
      message: ""
      encouragement: true
```

---

## Troubleshooting

### "YAML content is not an object"
Your file doesn't start with key-value pairs at the top level. Make sure the first line is a field like `conceptId:`, not a comment or empty line (comments are fine anywhere else).

### "Could not extract level/subject from path"
Your file isn't in the right directory structure. It must be at `curriculum/level-<code>/<subject>/filename.yaml`.

### "Missing required activity step"
You're missing one of the 5 required steps. Every concept must have `observe`, `guided_practice`, `independent_practice`, `mastery_check`, and `positive_completion`.

### "Activity at index N: type must be one of..."
You used an activity type that isn't in the allowed list. Check the spelling — valid types are: `visual_counting`, `matching`, `drag_drop`, `sequencing`, `multiple_choice`, `story_question`, `real_world`, `fraction_visual`, `place_value_chart`, `grid_area`, `chart_reader`, `clock_time`, `measurement_scale`, `fill_blank`.

### "Missing dependency: concept 'X' is referenced but not found"
A concept in your `dependencies` array doesn't exist. Either:
- You have a typo in the conceptId
- The dependency hasn't been created yet (create it first, or remove the reference)

### "Duplicate conceptId"
Two files declare the same `conceptId`. Use `grep -r "conceptId: your_id" curriculum/` to find the other file.

### "Circular dependency detected"
Concept A depends on B, and B depends on A (directly or indirectly). Rethink your prerequisite chain — every concept needs a valid learning order.

---

## Design Constraints (ALX Compliance)

All curriculum content must follow the Autism Learning Experience (ALX) guidelines. Key constraints for content authors:

- **ALX-2: Visual First** — Every concept should include emoji, images, or visual elements. At minimum, use emoji in examples.
- **ALX-3: One Concept at a Time** — Each file teaches exactly one concept.
- **ALX-5: Safe Mistakes** — Hints should be encouraging, never critical. Use phrases like "You're close!" and "Try again!" — never "Wrong" or "Incorrect."
- **ALX-8: Mastery-Based** — The `masteryCriteria` field lets you set what "good enough" looks like. For beginners, 0.7–0.8 is typical.

For full design guidelines, see `knowledge/design/design-guidelines.md`.

---

## Automated Pipeline Generation

Level B (and future Level C) curriculum content can be automatically generated from NIOS OBE PDF textbooks via the LangGraph-based pipeline:

```bash
pnpm curriculum:generate --pdf <path> --level B --subject math
```

See `knowledge/project-management/epic-13-pdf-curriculum-pipeline.md` for full documentation.

---

## Related Documentation

- [Concept Specification Schema](concept-schema.md) — TypeScript/Zod schema reference
- [Validation CLI](validate-cli.md) — Validator usage and options
- [Dependency Graph](dependency-graph.md) — How prerequisites are resolved
- [Design Guidelines](../design/design-guidelines.md) — Full ALX framework
- [Architecture Overview](../architecture.md) — System architecture
- [Pipeline Architecture](../architecture.md#curriculum-generation-pipeline-epic-13) — Pipeline system design
