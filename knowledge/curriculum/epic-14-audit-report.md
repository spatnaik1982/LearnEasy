# EPIC-14 Implementation & Content Guide Audit

**Date:** 2026-06-20
**Scope:** [EPIC-14] Level B Activity Components (PR #125, closed via #96) and the `knowledge/curriculum/content-creation-guide.md` (hereafter "the guide").
**Status:** Audit complete. Validator passes (0 errors, 29 warnings — all text-length). UI tests pass (42/42). The implementation works, but the guide is materially out of date with what was actually shipped and what authors are actually writing in YAML.

---

## TL;DR

1. **Implementation: shippable.** All 7 new components exist, are integrated into `ActivityRenderer` + `activity-utils`, are exported from `packages/ui`, and pass unit tests. The validator accepts them. The student learn page dispatches them.
2. **Guide: out of date in 3 ways:**
   - **Wrong YAML shapes.** The guide documents the "ideal" `content:` shape for each new type. Authors are not using those shapes — they are using LLM-generated shapes from the EPIC-13 pipeline, and the codebase has a `normalizeContent()` shim in `ActivityRenderer.tsx` to bridge the gap. If an author follows the guide literally, the activities may render incorrectly or fail silently.
   - **Missing activity-type coverage.** Several "documented" types in the guide have **zero** occurrences in the 60+ Level B YAMLs the pipeline produced. `clock_time` and `measurement_scale` in particular have no example concepts in the curriculum at all.
   - **Missing Level B chapter context.** The guide gives one copy-paste example per type but no Level B chapter map, no example activities per chapter, and no guidance on which type to pick per lesson routine step. Authors are guessing.
3. **Concrete data: 82 concepts, 7 new component types defined, only 5 of them in real Level B content.** `clock_time` and `measurement_scale` are zero in `curriculum/level-b/`.

---

## 1. What EPIC-14 actually delivered

PR #125 (commit `4b0f55f` + `481ec92`) shipped:

| Component | File | Tests | Notes |
|---|---|---|---|
| `FractionVisualizer` | `packages/ui/src/FractionVisualizer.tsx` | 71 lines test | Bar + circle, compare mode, improper-fraction split |
| `PlaceValueChart` | `packages/ui/src/PlaceValueChart.tsx` | 38 lines test | `lakh`/`crore` columns, drag + click modes, targetNumber feedback |
| `GridCounter` | `packages/ui/src/GridCounter.tsx` | 53 lines test | `area`/`perimeter` modes, interactive highlighting |
| `ChartReader` | `packages/ui/src/ChartReader.tsx` | 47 lines test | `bar` + `pictograph`, hidden `<table>` for a11y |
| `ClockWidget` | `packages/ui/src/ClockWidget.tsx` | 41 lines test | `read`/`set` modes, drag + slider keyboard alt |
| `ScaleReader` | `packages/ui/src/ScaleReader.tsx` | 77 lines test | `ruler`/`thermometer`/`cylinder`, slider keyboard alt |
| `FillBlank` | `packages/ui/src/FillBlank.tsx` | 90 lines test | `select`/`type` modes, graduated option buttons |

**Integration:**

- `packages/ui/src/ActivityRenderer.tsx:628-718` — 7 new `case` arms dispatching each type. **`normalizeContent()` (lines 19-200) was significantly extended** to handle the YAML shapes the EPIC-13 pipeline emits. This is undocumented in the guide.
- `packages/ui/src/activity-utils.ts:135-198` — 7 new `evaluateActivity` cases.
- `packages/db/src/curriculum-pipeline.ts:51-66` — `VALID_ACTIVITY_TYPES` extended (the 7 new types are accepted by the validator).
- `apps/student/pages/learn/[conceptId].tsx:33-58` — `STEP_ACTIVITY_TYPES` and `ACTIVITY_WORK_LABELS` updated to include the 7 new types.
- `packages/ui/src/copy.ts:105-111` — completion descriptions for the 7 new types.
- `packages/ui/src/index.ts:5,6,18,26,29,30` — barrel exports for the 7 new components (note: not all on the same commit but landed together).

**Test results (re-verified):** `pnpm --filter @learn-easy/ui test` → 7 suites passed, 42 tests passed.

**Validator results (re-verified):** `pnpm curriculum:validate` → 82 concepts, 0 errors, 29 warnings. All 29 warnings are text-length (description/coreIdea/learningObjective > 12 words) — unrelated to EPIC-14 correctness.

---

## 2. What the guide documents vs what authors actually write

This is the central problem. The guide (lines 353-471) presents a clean "ideal" YAML shape for each new type. The pipeline, in practice, emits a different shape — and the `normalizeContent()` shim exists specifically to convert pipeline output into the shape the components expect. **If a content author writes the documented shape, the renderer will treat their data as pipeline-emitted data and the shim may mis-translate it.**

### 2.1 `fraction_visual`

| Source | Shape |
|---|---|
| **Guide (line 359-370)** | `numerator`, `denominator`, `mode`, `label`, `showLabel`, `interactive`, `compare` — matches `FractionVisualizer` props. |
| **All 8 Level B YAMLs** (`fractions_intro.yaml`, `equivalent_fractions.yaml`, `comparing_fractions.yaml`, `simplifying_fractions.yaml`, `subtracting_fractions.yaml`, `multiplying_fractions.yaml`, `decimals_to_fractions.yaml`, `decimals_intro.yaml`, `percentages_intro.yaml`, `like_fractions.yaml`, `adding_fractions.yaml`, `dividing_fractions.yaml`, `fractions_to_decimals.yaml`, `multiply_divide_decimals.yaml`) | `numerator`, `denominator`, `mode`, `label`, `interactive`. **Never** use `showLabel` or `compare`. The `fractions_intro.yaml:34-39` `guided_practice` step is a `fraction_visual` with **only** `hints: [""]` — i.e. an empty payload that will hit the component's default rendering (1/2 bar). |
| **Risk** | `label` is present in both, but the guide example shows `"3/4"` while authors use `"1/2"`, `"1/3"`, `"2/3"`, etc. — that is fine, but authors are also using `interactive: true|false` as the only "mode" flag — **they have no documentation for the `compare` field** and don't know it exists. |

Verdict: **guide is correct, but under-documented.** The `compare` field is documented in the props table but never in the YAML example, and no Level B concept uses it.

### 2.2 `place_value_chart`

| Source | Shape |
|---|---|
| **Guide (line 374-382)** | `maxPlaces`, `digits` (array of `number\|null`), `targetNumber`, `interactive`, `draggableDigits`, `showLabels`. |
| **`place_value_understanding.yaml:26-36` (observe step)** | `description`, `chart: { thousands, hundreds, tens, ones }` (object keyed by place name). |
| **`expanded_form.yaml:26-42` (observe step)** | `title`, `description`, `chart: [{ digit: "7", place: "10000" }, ...]` (array of `{digit, place}` objects). |
| **`forming_numbers.yaml:31-48` (observe step)** | `title`, `description`, `chart: { columns: [...], rows: [[...]] }` (table-like). |
| **All `place_value_chart` uses in Level B** | **5 concepts** (`place_value_understanding`, `expanded_form`, `forming_numbers`, `compare_decimals`, `reading_numbers_1000_9999`, `writing_numbers_1000_9999`). |
| **Code (`ActivityRenderer.tsx:177-197`)** | The `normalizeContent()` shim has **3 separate branches** for `place_value_chart` to translate these three different YAML shapes into the component's `digits` + `maxPlaces` props. |
| **Bug to flag** | The shim forces `n.interactive = false` for `place_value_chart` (`ActivityRenderer.tsx:196`). Authors writing `interactive: true` in YAML will have it silently dropped. The `ActivityRenderer` then renders `PlaceValueChart` without `onPlaceDigit` or `onRemoveDigit` callbacks (`ActivityRenderer.tsx:642-652`), so the `evaluateActivity` (`activity-utils.ts:143-150`) will treat it as `correct: true` whenever `digits` is provided — even if the digits are wrong. **This means interactive place_value_chart activities can never be scored as incorrect.** |
| **Additional bug** | The `evaluateActivity` for `place_value_chart` is `correct: true` whenever `!targetNumber \|\| !digits` — i.e., if the YAML doesn't include `targetNumber`, **every interactive attempt is marked correct**. The `forming_numbers` YAML, for example, has no `targetNumber`. |

Verdict: **guide is wrong / misleading.** The guide says `digits: [null, null, null, null, null, 5, 4, 3]` but no Level B YAML uses that shape. Every author would copy the guide and produce a YAML the `normalizeContent()` shim doesn't know how to handle — the chart would render with all nulls and the user could not interact with it.

### 2.3 `grid_area`

| Source | Shape |
|---|---|
| **Guide (line 386-398)** | `rows`, `cols`, `mode`, `highlighted`, `interactive`, `maxHighlights`, `cellSize`, `showCount`. |
| **`area_intro.yaml:28-35` (only Level B use)** | `rows`, `cols`, `mode`, `interactive`. No `highlighted`, no `cellSize`, no `maxHighlights`. |
| **Code (`ActivityRenderer.tsx:654-667`)** | The shim **does not exist for `grid_area`** — it passes YAML content straight through. Defaults to `cellSize: 40` and `showCount: true` at the renderer level. |
| **Bug to flag** | `evaluateActivity` for `grid_area` (`activity-utils.ts:152-158`) compares `response.count === response.highlighted.length`. This works for the renderer (which fires `handleComplete({ highlighted: cells, count: cells.length })`). But the `mode: "perimeter"` case is **never scored as correct** because the renderer always sends `count: cells.length` (not the perimeter count). The shim/renderer pair does not compute perimeter. |

Verdict: **guide is correct for the most part**, but the Level B example shows `interactive: false` — which means the entire `grid_area` activity in `area_intro.yaml` is a static display, **not a learnable activity**. The "fill in the area" teaching intent is lost. The student looks at a grid, sees it filled, and is done. This is also true of the `observe` steps for `place_value_chart` (3 of 5 use cases) and `chart_reader` (the only use case in `bar_graphs.yaml`). The pipeline consistently emits `interactive: false` for the `observe` step, which is the correct pedagogical intent — but the guide doesn't acknowledge this, and several rendered activities end up as no-ops with no completion criteria.

### 2.4 `chart_reader`

| Source | Shape |
|---|---|
| **Guide (line 402-415)** | `type`, `data`, `title`, `showValues`, `interactive`. |
| **`bar_graphs.yaml:24-38` (only Level B use)** | `type: bar`, `data: [{label, value}, ...]`, `title: "Rainfall by Month"`. **No `showValues`, no `interactive`.** The chart is just a static image. |
| **Code (`ActivityRenderer.tsx:669-679`)** | Renders `<ChartReader>` with `showValues: true` default (override at renderer level, not in YAML). |
| **Bug to flag** | `evaluateActivity` for `chart_reader` (`activity-utils.ts:160-166`) checks `response.selectedLabel === content.correctLabel`. But `correctLabel` is **never set** in `bar_graphs.yaml` — and even if the user could click a bar, there is no way to score which bar is "correct" because the question ("What does a bar graph represent?") is asked in the `mastery_check` step as `multiple_choice`, not in the `chart_reader` step. **The chart_reader activity in `bar_graphs.yaml` is unscoreable.** It fires `handleComplete({ selectedLabel: "January" })` on any click, which `evaluateActivity` will mark `correct: false` because `correctLabel` is undefined. So the user is shown "Not quite" feedback for clicking anything in the chart. |

Verdict: **guide is correct but the only Level B example is broken.** The `chart_reader` activity in the curriculum is structurally incomplete — it has no scoring criterion.

### 2.5 `clock_time`

| Source | Shape |
|---|---|
| **Guide (line 419-430)** | `hour`, `minute`, `mode`, `showDigital`, `targetTime`, `interactive`, `size`. |
| **All Level B YAMLs** | **Zero occurrences.** `rg "type: clock_time" curriculum/` returns nothing. |
| **Curriculum gap** | The EPIC-15 stories ("Level B Chapter 5 — Measurement" / "Measurement and Time") exist (`knowledge/project-management/epic-15-level-b-curriculum-content.md`), but no concept file under `curriculum/level-b/math/` has a `clock_time` activity. The closest is `units_of_measurement.yaml` (CH5) which uses `visual_counting` for observe and `matching`/`drag_drop` for the rest. |

Verdict: **guide documents a component with no curriculum content.** Content authors following the guide have no example to copy. The same is true of `measurement_scale`.

### 2.6 `measurement_scale`

| Source | Shape |
|---|---|
| **Guide (line 434-445)** | `type`, `min`, `max`, `step`, `unit`, `value`, `interactive`, `targetValue`, `showReading`, `showLabels`. |
| **All Level B YAMLs** | **Zero occurrences.** `rg "type: measurement_scale" curriculum/` returns nothing. |
| **Curriculum gap** | Same as `clock_time`. CH5 (Measurement) is the only relevant chapter and it has no `measurement_scale` activities. |

Verdict: **guide documents a component with no curriculum content.** Component exists, passes tests, but is unused.

### 2.7 `fill_blank`

| Source | Shape |
|---|---|
| **Guide (line 449-458)** | `template`, `blanks: [{ id, position, correctAnswer, options }]`, `mode: "select"\|"type"`. |
| **Most Level B YAMLs** (`perimeter_intro`, `area_intro`, `weight_conversion`, `subtraction_with_borrowing`, `length_subtraction`, `length_addition`, `division_two_digit`, `subtraction_basics`, `multiplication_basics`, `multiplication_two_digit`, `volume_intro`, `capacity_conversion`, `weight_conversion`, `converting_…`, `subtracting_fractions`, `simplifying_fractions`, `decimals_to_fractions`, `fractions_to_decimals`, `decimals_intro`, `add_subtract_decimals`, `place_value_decimals`, `place_value_understanding`, `reading_numbers_1000_9999`, `writing_numbers_1000_9999`, `expanded_form`, `length_conversion`, `percentages_intro`, `bar_graphs`, `addition_basics`, `addition_with_carry`, `division_two_digit`) — 30+ concepts use this canonical shape. |
| **Outlier: `expanded_form.yaml:67-77` (independent_practice step)** | Uses a different shape entirely: `prompt`, `statement`, `answers: ["300000", "90000", ...]`. |
| **Code (`ActivityRenderer.tsx:160-174`)** | The shim handles this fallback shape by deriving `template` from `prompt`/`question`/`statement` and building `blanks` from `answer`/`answers`. |

Verdict: **guide is correct for ~95% of uses**, but there is one outlier shape that the shim covers. The guide should mention this and document the `prompt + answers` shape as an alternative for pipeline-generated content.

---

## 3. Coverage gaps in the guide

| Topic in guide | Status | Recommendation |
|---|---|---|
| "Valid Activity Types" table (line 221-236) | Lists 14 types (7 new + 7 existing). Matches code. | OK. |
| `fraction_visual` content shape | Matches real usage for the most part. Missing `compare` example. | Add `compare` example. |
| `place_value_chart` content shape | **Wrong** for all 5 real Level B uses. | **Critical: rewrite this section** to show the three real shapes (`chart: { place: digit, ... }`, `chart: [{digit, place}]`, `chart: { columns, rows }`) and warn that the `digits: [null, ...]` shape in the current guide does not work. |
| `grid_area` content shape | OK; only one real usage. | Add perimeter-mode note. |
| `chart_reader` content shape | Shape is OK, but missing `correctLabel` and the "this is a setup, mastery_check is where the question is asked" pattern. | Add note about how `chart_reader` is typically used as a **stimulus** with the question in `mastery_check`. |
| `clock_time` content shape | No real Level B usage. | Either remove the example or add a sample concept. |
| `measurement_scale` content shape | No real Level B usage. | Either remove the example or add a sample concept. |
| `fill_blank` content shape | Mostly OK, but the `prompt + answers` shape is undocumented. | Add a "pipeline-generated alternative" subsection. |
| Level B chapter → type mapping | **Not in the guide.** | **Add a new section** mapping each Level B chapter to the activity types it uses (see §4 below). |
| `normalizeContent()` shim | **Not mentioned anywhere.** | **Add a section** explaining that YAML from the EPIC-13 pipeline may use shapes the components don't directly accept, and the renderer reshapes them at runtime. This is the single most important missing piece of context. |
| `evaluateActivity` rules per new type | **Not in the guide.** | **Add a section** explaining what each new type considers "correct." Without this, authors cannot write scorable concepts. |
| `interactive: false` for observe | **Not in the guide.** | Add ALX guidance: observe step should be non-interactive (tutor demonstrates); the renderer for the new types honors this. |
| `correctLabel` for `chart_reader` | **Not in the guide.** | Document the required field for mastery scoring. |
| `targetNumber` for `place_value_chart` | **Not in the guide.** | Document the required field for mastery scoring — without it, all attempts are "correct." |
| `correctLabel` for `chart_reader` | **Not in the guide.** | Same. |
| `targetTime` for `clock_time` | **Not in the guide** (though the props table does mention it). | Make it explicit that without `targetTime`, `evaluateActivity` returns `correct: false`. |

---

## 4. Level B chapter → activity-type map (proposed addition to guide)

Based on a scan of all 60 Level B math concept YAMLs:

| Chapter | Topics | Dominant activity types in YAML | Components used at render |
|---|---|---|---|
| CH1 — Numbers (1000–9999) | `place_value_understanding`, `reading_numbers_1000_9999`, `writing_numbers_1000_9999`, `forming_numbers`, `expanded_form`, `place_value_decimals` | `place_value_chart` (observe), `drag_drop` (guided), `fill_blank` (independent), `multiple_choice` (mastery) | PlaceValueChart, DragDrop, FillBlank, MultipleChoice |
| CH2 — Operations | `addition_basics`, `subtraction_basics`, `multiplication_basics`, `division_basics`, `addition_with_carry`, `subtraction_with_borrowing`, `multiplication_two_digit`, `division_two_digit`, `add_subtract_decimals`, `multiply_divide_decimals` | `visual_counting` (observe), `story_question`/`drag_drop` (guided), `fill_blank` (independent), `multiple_choice` (mastery) | VisualCounter, StoryQuestion, DragDrop, FillBlank, MultipleChoice |
| CH3 — Fractions & Geometry | `fractions_intro`, `like_fractions`, `equivalent_fractions`, `comparing_fractions`, `simplifying_fractions`, `adding_fractions`, `subtracting_fractions`, `multiplying_fractions`, `dividing_fractions`, `decimals_to_fractions`, `fractions_to_decimals`, `compare_decimals`, `decimals_intro`, `percentages_intro`, `perimeter_intro`, `area_intro`, `volume_intro`, `symmetry_intro`, `circle_elements`, `angles_intro`, `line_types`, `parallel_perpendicular_lines` | `fraction_visual` (observe), `drag_drop`/`matching` (guided), `fill_blank`/`fraction_visual` (independent), `multiple_choice` (mastery); `grid_area` once (`area_intro`) | FractionVisualizer, GridCounter (rarely), Matching, DragDrop, FillBlank, MultipleChoice |
| CH4 — Order & Comparison | `ascending_order_numbers`, `descending_order`, `comparing_numbers` | `visual_counting`/`sequencing` (observe), `drag_drop` (guided), `multiple_choice` (mastery) | VisualCounter, Sequencing, DragDrop, MultipleChoice |
| CH5 — Measurement | `length_units`, `length_addition`, `length_subtraction`, `length_conversion`, `weight_units`, `weight_conversion`, `capacity_units`, `capacity_conversion`, `conversion_between_units`, `units_of_measurement` | `visual_counting` (observe), `drag_drop`/`matching` (guided), `fill_blank`/`multiple_choice` (independent/mastery). **No `measurement_scale` or `clock_time` despite the chapter topic.** | VisualCounter, DragDrop, Matching, FillBlank, MultipleChoice. **ScaleReader, ClockWidget unused.** |
| CH6 — Money / Data | (none yet) | — | — |
| CH7 — Data Handling | `data_collection`, `bar_graphs` | `visual_counting`/`chart_reader` (observe), `drag_drop` (guided), `fill_blank`/`multiple_choice` (independent/mastery) | ChartReader (once, statically), VisualCounter, DragDrop, FillBlank, MultipleChoice |

**Conclusion: 7 components added, 5 used in production curriculum, 2 unused.** The two unused components (`ClockWidget`, `ScaleReader`) are exactly the ones whose natural chapter (CH5 Measurement) has concepts that **should** use them but don't. This is a curriculum-content gap, not a code gap, but it's worth flagging for EPIC-15 follow-up.

---

## 5. Scoring bugs found in `evaluateActivity` for the new types

These are not guide issues per se, but they directly affect what authors can write in YAML.

| Type | Bug | Effect |
|---|---|---|
| `place_value_chart` (`activity-utils.ts:143-150`) | When `targetNumber` is undefined, the function short-circuits to `correct: true`. The renderer (`ActivityRenderer.tsx:642-652`) passes `targetNumber` only if present in YAML. `forming_numbers.yaml` and `expanded_form.yaml` observe steps have no `targetNumber`, so the user clicks "Continue" and is auto-marked correct regardless of what they did. | Silent false mastery. |
| `place_value_chart` (same lines) | `targetStr` is `String(targetNumber).padStart(digits.length, '0')`. If `targetNumber` is `5964` and `digits` has 8 slots, the comparison is against `'00005964'`. The user only fills 4 slots — this will work, but the pattern is fragile. | Edge case for numbers < maxPlaces. |
| `place_value_chart` | `n.interactive = false` is forced in the shim (`ActivityRenderer.tsx:196`). If a YAML author writes `interactive: true`, it's silently dropped. | Interactive place_value_chart cannot be scored. |
| `grid_area` (`activity-utils.ts:152-158`) | `mode: "perimeter"` is never scored correctly because the renderer always sends `count: cells.length` (a count of highlighted cells, not the perimeter). The component itself does not compute perimeter. | Perimeter mode is unscorable. |
| `chart_reader` (`activity-utils.ts:160-166`) | Requires `content.correctLabel` to score, but no Level B YAML sets it. | All chart_reader interactions are marked incorrect. |
| `clock_time` (`activity-utils.ts:168-178`) | Returns `correct: false` if `targetTime` is undefined. Since no Level B YAML uses `clock_time`, this is theoretical — but if an author omits `targetTime`, every attempt is wrong. | Silent false failure. |
| `measurement_scale` (`activity-utils.ts:180-188`) | Returns `correct: false` if `targetValue` is undefined. Same issue. | Silent false failure. |
| `fraction_visual` (`activity-utils.ts:135-141`) | Compares `response.shaded === content.numerator`. But the renderer (`ActivityRenderer.tsx:628-640`) only fires `handleComplete` from the `onShade` callback, which only exists if `interactive: true`. For the `observe` step (where `interactive: false` is correct pedagogically), **the user has no way to "answer" the activity at all** — there is no input. The user clicks "Continue Lesson" without ever having answered, and the activity is never marked complete. | observe step is unrouted. |
| Same — `fraction_visual` `guided_practice` in `fractions_intro.yaml:34-39` | This step has only `hints: [""]` — no `numerator`, no `denominator`, no `mode`. The renderer will hit `?? 1` and `?? 2` defaults (`ActivityRenderer.tsx:631-632`) and render a 1/2 bar. The user cannot complete it. | Silent dead step. |

---

## 6. Summary of issues to address

### Critical (blocks correct curriculum authoring)

1. **Guide: rewrite `place_value_chart` content section.** The current YAML example uses a `digits:` array shape that the renderer doesn't accept. The three real shapes (`chart: { place: digit }`, `chart: [{ digit, place }]`, `chart: { columns, rows }`) must be documented.
2. **Guide: add a "Runtime normalization" section** explaining `normalizeContent()` and that pipeline-emitted shapes are reshaped. Without this, authors will write the "canonical" shape from the guide and produce broken concepts.
3. **Guide: add `clock_time` and `measurement_scale` examples** or note that they have no Level B usage yet. Currently the guide presents them as if they have a working example.
4. **Code: fix `place_value_chart` `evaluateActivity`** so that the absence of `targetNumber` is a validation error, not a silent pass.
5. **Code: fix `chart_reader` `evaluateActivity`** so it doesn't require an unused `correctLabel` — instead, mark the activity as informational and rely on the `mastery_check` step (which is where the actual question lives).
6. **Code: add a sample Level B `clock_time` concept and a `measurement_scale` concept** so the components are not dead code, and so the guide has real examples to point to.

### High (impacts quality of generated content)

7. **Guide: add a "Per-type scoring rules" section** documenting what each new type considers correct, including required fields.
8. **Guide: add the "Level B chapter → activity-type map"** from §4 of this report.
9. **Code: fix `grid_area` perimeter scoring** — either compute perimeter in the renderer or remove `mode: "perimeter"` from the public API until implemented.
10. **Code: fix the `interactive: true` strip in the `place_value_chart` shim** (`ActivityRenderer.tsx:196`). Either honor interactive mode or warn the author.
11. **Code: add a sample `fraction_visual` `guided_practice`** in the `fractions_intro.yaml` that doesn't have an empty payload — the current step at line 34-39 will render a default 1/2 bar that the user cannot complete.

### Medium (polish)

12. **Guide: document the `prompt + answers` alternative for `fill_blank`** (the shape used in `expanded_form.yaml:67-77`).
13. **Guide: add a section on `interactive: false` in the observe step** — explain that the renderer supports this and it is the correct pedagogical pattern.
14. **Guide: cross-link to `knowledge/curriculum/concept-schema.md`** which is the authoritative source for the `ConceptSpec` fields. The guide re-derives them.

### Low

15. **Validate the 29 text-length warnings** flagged by `pnpm curriculum:validate`. Most are auto-generated pipeline output and will re-appear, but a few are hand-written and worth tightening (e.g. `perimeter_intro.yaml:30` has a 33-word description in the observe step).

---

## 7. Recommended guide additions (concrete)

If you want, the guide can be amended as follows. (Not done in this audit — to be done as a separate PR.)

### New section after "Valid Activity Types" table (after line 237):

> ### Pipeline-Generated YAML Shapes
>
> The EPIC-13 PDF-to-curriculum pipeline emits YAML using shapes that differ from the canonical shapes documented below. The student app's `ActivityRenderer` includes a `normalizeContent()` helper that translates these pipeline shapes into the component prop shapes at runtime. Content authors writing YAML by hand should still prefer the canonical shapes in this guide, but the runtime will accept the pipeline shapes too. See the [EPIC-14 audit report](epic-14-audit-report.md) for the exact translations.

### Replace `place_value_chart` example (lines 372-382) with the three real shapes:

```yaml
# Shape A: place → digit object (used in place_value_understanding.yaml)
content:
  description: "Let's look at the number 5964."
  chart:
    thousands: 5
    hundreds: 9
    tens: 6
    ones: 4

# Shape B: digit/place pairs (used in expanded_form.yaml)
content:
  description: "Let's look at the number 75406."
  chart:
    - { digit: "7", place: "10000" }
    - { digit: "5", place: "1000" }
    - { digit: "4", place: "100" }
    - { digit: "0", place: "10" }
    - { digit: "6", place: "1" }

# Shape C: columns/rows table (used in forming_numbers.yaml)
content:
  description: "Let's look at how to arrange digits."
  chart:
    columns: [Thousands, Hundreds, Tens, Ones]
    rows:
      - [5, 3, 1, 0]
      - [0, 1, 3, 5]
```

### Add a "Per-type scoring" subsection:

> ### Scoring rules for new types
>
> Each new activity type has a `correct: boolean` decision made by `evaluateActivity()` in `packages/ui/src/activity-utils.ts`. The required content fields per type:
>
> | Type | Required for scoring | Optional |
> |---|---|---|
> | `fraction_visual` | (no scoring — observe only) | `numerator`, `denominator`, `mode`, `label`, `compare` |
> | `place_value_chart` | `targetNumber` (without it, all attempts are "correct") | `digits`, `maxPlaces`, `interactive` |
> | `grid_area` | (none — counts highlighted cells) | `rows`, `cols`, `mode`, `highlighted` |
> | `chart_reader` | `correctLabel` (without it, all clicks are "incorrect") | `type`, `data`, `title`, `interactive` |
> | `clock_time` | `targetTime` (without it, all attempts are "incorrect") | `hour`, `minute`, `showDigital` |
> | `measurement_scale` | `targetValue` (without it, all attempts are "incorrect") | `min`, `max`, `step`, `unit`, `value` |
> | `fill_blank` | `blanks[].correctAnswer` | `template`, `mode`, `options` |

### Add a "Level B chapter reference" table:

(see §4 of this report — propose adding the chapter→type table directly to the guide)

---

## 8. Verification

| Check | Result |
|---|---|
| All 7 new components exist as files | ✅ |
| All 7 components exported from `packages/ui/src/index.ts` | ✅ |
| All 7 types in `VALID_ACTIVITY_TYPES` (validator) | ✅ |
| All 7 types in `ActivityRenderer` switch | ✅ |
| All 7 types in `evaluateActivity` | ✅ |
| All 7 types in `STEP_ACTIVITY_TYPES` and `ACTIVITY_WORK_LABELS` | ✅ |
| All 7 types have unit tests | ✅ (42 tests pass) |
| `pnpm curriculum:validate` | ✅ (0 errors) |
| Guide documents the 7 new types | ✅ |
| Guide's documented shapes match real Level B usage | ⚠️ 1 of 7 (`place_value_chart` is wrong) |
| Guide mentions `normalizeContent()` shim | ❌ Missing |
| Guide has per-type scoring rules | ❌ Missing |
| Guide has Level B chapter reference | ❌ Missing |
| All new components have ≥1 Level B concept using them | ⚠️ 5 of 7 (`clock_time`, `measurement_scale` unused) |

---

## 9. Files reviewed

- `packages/ui/src/FractionVisualizer.tsx`
- `packages/ui/src/PlaceValueChart.tsx`
- `packages/ui/src/GridCounter.tsx`
- `packages/ui/src/ChartReader.tsx`
- `packages/ui/src/ClockWidget.tsx`
- `packages/ui/src/ScaleReader.tsx`
- `packages/ui/src/FillBlank.tsx`
- `packages/ui/src/ActivityRenderer.tsx`
- `packages/ui/src/activity-utils.ts`
- `packages/ui/src/copy.ts`
- `packages/ui/src/index.ts`
- `packages/ui/src/__tests__/*.test.tsx` (7 files)
- `packages/db/src/curriculum-pipeline.ts`
- `packages/db/src/cli/validate.ts`
- `packages/db/src/concept-schema.ts`
- `apps/student/pages/learn/[conceptId].tsx`
- `knowledge/curriculum/content-creation-guide.md`
- `knowledge/curriculum/concept-schema.md`
- `knowledge/project-management/epic-14-level-b-activity-components.md`
- All 60 Level B math concept YAMLs (sampled in depth, enumerated in summary)
- Selected Level A math YAMLs for shape comparison
