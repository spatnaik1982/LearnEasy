# EPIC-15: Level B Math Curriculum Content

## Objective

Create the complete Level B Mathematics curriculum as validated YAML concept files, either authored manually or generated via the PDF-to-curriculum pipeline (EPIC-13), covering all 8 chapters of the NIOS OBE Level B syllabus.

## Background

The NIOS OBE Level B Mathematics textbook covers 8 chapters: Numbers, Operations, Fractions, Decimals, Measurement, Perimeter/Area/Volume, Geometry, and Data Handling. Each chapter contains 3–6 distinct teachable concepts. The Level A curriculum (`curriculum/level-a/math/`) serves as the template for format, structure, and ALX compliance. Level B builds on Level A concepts as prerequisites.

## User Value

Learners can access the complete Level B Math curriculum with proper concept sequencing, dependencies, and ALX-compliant activities across all 8 chapters.

## Scope

- 8 chapters of Level B Math YAML files in `curriculum/level-b/math/`
- 28–35 concepts total, each with 5 activities
- Dependencies connecting concepts within Level B and to Level A
- Validation passing via `pnpm curriculum:validate`
- Optional: pipeline-generated (EPIC-13) or manually authored

## Stories

- **Story 15.1** — Chapter 1: Numbers (5-6 concepts)
- **Story 15.2** — Chapter 2: Operations (5-6 concepts)
- **Story 15.3** — Chapter 3: Fractions (4-5 concepts)
- **Story 15.4** — Chapter 4: Decimals (3-4 concepts)
- **Story 15.5** — Chapter 5: Measurement (4-5 concepts)
- **Story 15.6** — Chapter 6: Perimeter, Area, Volume (3-4 concepts)
- **Story 15.7** — Chapter 7: Geometry (4-5 concepts)
- **Story 15.8** — Chapter 8: Data Handling (2-3 concepts)
- **Story 15.9** — Level B Dependency Graph & Integration

## Dependencies

- EPIC-0 (concept schema, curriculum pipeline, validation CLI)
- EPIC-13 (if using pipeline to generate; optional if authoring manually)
- EPIC-14 (new activity components needed for fraction, place value, grid, chart, clock, scale, fill-blank types)

## Success Criteria

- `curriculum/level-b/math/` contains 28–35 YAML files, one per concept
- Each file follows the exact same format as Level A YAMLs
- All files pass `pnpm curriculum:validate` with zero errors
- Dependencies correctly reference Level A and intra-Level-B concepts
- No circular dependencies
- All activities follow ALX-7 5-step routine
- All content follows ALX guidelines (literal language, visual-first, ≤12 words per sentence)

## Out Of Scope

- Level B Language or EVS curriculum (future)
- Level C curriculum (future)
- UI for new activity types (EPIC-14)

---

## Story 15.1 — Chapter 1: Numbers

### Goal

Create YAML concept files for Chapter 1 (Numbers) covering numbers up to 1 crore, place value, expanded form, comparing numbers, ordering numbers, and forming smallest/greatest numbers.

### Concept ID | Concepts | Learning Objective | Dependencies
---|---|---|---
`numbers_up_to_crore` | Reading & writing numbers up to 1 crore | "Read and write numbers up to 1 crore in numerals and words" | `counting_1_10`, `number_recognition_1_10`
`place_value_crore` | Indian place value system (up to crore) | "Identify place values of digits in numbers up to 1 crore" | `numbers_up_to_crore`
`expanded_form` | Expanded form of numbers | "Write numbers as sum of place values" | `place_value_crore`
`comparing_large_numbers` | Comparing numbers (>, <, =) up to 1 crore | "Compare two numbers up to 1 crore using >, <, or =" | `place_value_crore`
`ordering_numbers` | Ascending and descending order | "Arrange numbers up to 1 crore in ascending or descending order" | `comparing_large_numbers`
`forming_numbers` | Forming smallest/greatest numbers from given digits | "Form the smallest and greatest number from given digits" | `place_value_crore`

### Content Requirements

- Use existing activity types (visual_counting doesn't scale to crore — use `place_value_chart`, `fill_blank`, `matching`, `drag_drop`, `multiple_choice`)
- Example adaptations for ASD learners:
  - `place_value_crore`: Show an abacus-style place value chart. "The digit 7 in the lakhs place means 7 lakhs."
  - `expanded_form`: "5,43,210 = 5,00,000 + 40,000 + 3,000 + 200 + 10 + 0"
  - `comparing_large_numbers`: Compare numbers as quantities: "Which is more? 12,34,567 or 12,43,567?"
- Emoji: use 📦 for bundles (1 📦 = 1000), 🧱 for blocks, or number cards
- Hints should guide attention to the leftmost differing digit when comparing

### Deliverables

- `curriculum/level-b/math/ch1-numbers/numbers_up_to_crore.yaml`
- `curriculum/level-b/math/ch1-numbers/place_value_crore.yaml`
- `curriculum/level-b/math/ch1-numbers/expanded_form.yaml`
- `curriculum/level-b/math/ch1-numbers/comparing_large_numbers.yaml`
- `curriculum/level-b/math/ch1-numbers/ordering_numbers.yaml`
- `curriculum/level-b/math/ch1-numbers/forming_numbers.yaml`

### Acceptance Criteria

- [ ] 6 YAML files created in `curriculum/level-b/math/`
- [ ] Each file has correct `chapter: { code: CH1, name: Numbers }`
- [ ] Each file has the 5-step activity sequence (observe, guided_practice, independent_practice, mastery_check, positive_completion)
- [ ] Dependencies reference correct Level A concept IDs
- [ ] All files pass `pnpm curriculum:validate`

### Files Expected To Change

- `curriculum/level-b/math/` (new directory with 6 YAML files)

### Testing Requirements

- Run `pnpm curriculum:validate` — must pass with 0 errors
- Manually verify each concept's activity types are appropriate

### Definition Of Done

- [ ] All 6 concept YAMLs written and validated

---

## Story 15.2 — Chapter 2: Operations

### Goal

Create YAML concept files for Chapter 2 (Addition, Subtraction, Multiplication, Division) covering operations with large numbers, properties, and estimation.

### Concepts

| ID | Learning Objective | Dependencies |
|---|---|---|
| `addition_large_numbers` | "Add numbers up to 1 crore using column addition" | `addition_1_10`, `place_value_crore` |
| `subtraction_large_numbers` | "Subtract numbers up to 1 crore using column subtraction" | `addition_large_numbers` |
| `multiplication_intro` | "Multiply 2-digit and 3-digit numbers by 1-digit numbers" | `addition_large_numbers` |
| `multiplication_larger` | "Multiply 2-digit numbers by 2-digit numbers" | `multiplication_intro` |
| `division_intro` | "Divide 2-digit and 3-digit numbers by 1-digit numbers" | `multiplication_intro` |
| `estimation` | "Estimate sums and differences to nearest 10, 100, 1000" | `addition_large_numbers`, `subtraction_large_numbers` |

### Content Requirements

- Use `fill_blank` for column addition/subtraction exercises (show the column layout with blanks)
- Use `grid_area` for area-model multiplication (e.g., 14 × 3 = 10×3 + 4×3)
- Use `multiple_choice` for estimation: "Round 5,432 to the nearest thousand"
- Avoid visual_counting with emoji (numbers too large) — prefer `fill_blank` and `place_value_chart`
- Example: "Add 23,456 + 12,345. Line up the digits by place value and add each column."

### Deliverables

- 6 YAML files for Chapter 2 operations

### Acceptance Criteria

- [ ] 6 YAML files created
- [ ] `chapter: { code: CH2, name: Operations }`
- [ ] Dependencies chain correctly (addition → subtraction, multiplication → division)
- [ ] All pass `pnpm curriculum:validate`

---

## Story 15.3 — Chapter 3: Fractions

### Goal

Create YAML concept files for Chapter 3 (Fractions) covering fraction basics, equivalent fractions, proper/improper/mixed fractions, comparison, and operations.

### Concepts

| ID | Learning Objective | Dependencies |
|---|---|---|
| `fractions_intro` | "Identify fractions as parts of a whole" | `addition_1_10`, `basic_shapes` |
| `equivalent_fractions` | "Find equivalent fractions by multiplying or dividing" | `fractions_intro` |
| `proper_improper_mixed` | "Identify proper, improper, and mixed fractions" | `fractions_intro` |
| `comparing_fractions` | "Compare fractions with like and unlike denominators" | `equivalent_fractions` |
| `fraction_addition` | "Add and subtract fractions with like denominators" | `proper_improper_mixed` |
| `fraction_of_number` | "Find a fraction of a whole number" | `fraction_addition`, `multiplication_intro` |

### Content Requirements

- Uses new `fraction_visual` activity type extensively — fraction bars and circles
- `fractions_intro` observe: "A pizza cut into 4 equal parts. 1 part is 1/4 🍕"
- `equivalent_fractions` observe: "1/2 = 2/4 = 3/6 — same amount, different numbers"
- `comparing_fractions`: visual side-by-side fraction bars. "3/4 is more than 1/4"
- `fraction_addition`: visual: "1/5 + 2/5 = 3/5" (shade 1 + 2 out of 5)
- Hints: "Count the shaded parts for the numerator. Count total parts for the denominator."

### Deliverables

- 6 YAML files for Chapter 3 fractions

### Acceptance Criteria

- [ ] 6 YAML files created
- [ ] `fraction_visual` activity type used for observe and guided_practice steps
- [ ] `chapter: { code: CH3, name: Fractions }`
- [ ] Dependencies chain: intro → equivalent → proper/improper → comparison → operations
- [ ] All pass `pnpm curriculum:validate`

---

## Story 15.4 — Chapter 4: Decimals

### Goal

Create YAML concept files for Chapter 4 (Decimals) covering decimal fractions, decimal↔fraction conversion, comparison, operations, and unit conversions.

### Concepts

| ID | Learning Objective | Dependencies |
|---|---|---|
| `decimals_intro` | "Identify decimals as fractions with denominator 10 or 100" | `fractions_intro` |
| `decimal_fraction_conversion` | "Convert between decimals and fractions" | `decimals_intro` |
| `comparing_decimals` | "Compare decimal numbers up to two decimal places" | `decimals_intro` |
| `decimal_operations` | "Add and subtract decimal numbers" | `decimals_intro`, `addition_large_numbers` |
| `unit_conversion` | "Convert between units (₹/paise, kg/g, L/mL, km/m, m/cm, cm/mm)" | `decimal_operations` |
| `percentage_intro` | "Express fractions and decimals as percentages" | `decimal_fraction_conversion` |

### Content Requirements

- Use `place_value_chart` for decimal place values (units . tenths hundredths)
- Use `fraction_visual` showing 10×10 grid with X out of 100 shaded for hundredths
- Use `matching` for decimal↔fraction conversion (0.5 ↔ 5/10, 0.75 ↔ 75/100)
- Use `fill_blank` for unit conversion: "3.5 m = ___cm" or "250 mL = ___L"
- Examples:
  - "₹5.50 = 5 rupees and 50 paise"
  - "1.5 m = 150 cm (multiply by 100)"
- Hints: "Count decimal places. Tenths = 1 place, hundredths = 2 places."

### Deliverables

- 6 YAML files for Chapter 4 decimals

### Acceptance Criteria

- [ ] 6 YAML files created
- [ ] `chapter: { code: CH4, name: Decimals }`
- [ ] Proper use of `place_value_chart` for decimal place values
- [ ] All pass `pnpm curriculum:validate`

---

## Story 15.5 — Chapter 5: Measurement

### Goal

Create YAML concept files for Chapter 5 (Measurement) covering length, weight, volume, temperature, time, and Indian currency.

### Concepts

| ID | Learning Objective | Dependencies |
|---|---|---|
| `length_measurement` | "Measure length using cm, m, km and convert between units" | `unit_conversion` |
| `weight_measurement` | "Measure weight using g, kg and convert between units" | `unit_conversion` |
| `volume_measurement` | "Measure volume using mL, L and convert between units" | `unit_conversion` |
| `temperature_reading` | "Read temperature on a Celsius thermometer" | `number_recognition_1_10` |
| `telling_time` | "Tell time to the nearest minute on analog and digital clocks" | `number_recognition_1_10`, `counting_1_10` |
| `indian_currency` | "Add and subtract amounts in rupees and paise" | `decimal_operations` |

### Content Requirements

- Uses `measurement_scale` for length (ruler), weight (scale), volume (cylinder), temperature (thermometer)
- Uses `clock_time` for time exercises
- Uses `real_world` for currency: "You have ₹50. You buy a notebook for ₹25. How much money is left?"
- Uses `fill_blank` for unit conversion: "A bag of rice weighs 5 ___ (g/kg)"
- Examples:
  - "A pencil is about 15 cm long"
  - "The temperature today is 30°C — it is warm"
  - "Half past 7 = 7:30"

### Deliverables

- 6 YAML files for Chapter 5 measurement

### Acceptance Criteria

- [ ] 6 YAML files created
- [ ] `clock_time` and `measurement_scale` types used
- [ ] `chapter: { code: CH5, name: Measurement }`
- [ ] All pass `pnpm curriculum:validate`

---

## Story 15.6 — Chapter 6: Perimeter, Area, Volume

### Goal

Create YAML concept files for Chapter 6 covering perimeter, area, and volume of rectangles, squares, and cuboids.

### Concepts

| ID | Learning Objective | Dependencies |
|---|---|---|
| `perimeter_intro` | "Find perimeter of rectangles and squares by adding sides" | `addition_large_numbers`, `basic_shapes` |
| `area_intro` | "Find area of rectangles and squares by counting unit squares" | `perimeter_intro` |
| `area_formula` | "Find area of rectangles using formula: length × width" | `area_intro`, `multiplication_intro` |
| `volume_intro` | "Find volume of cuboids by counting unit cubes" | `area_formula` |
| `capacity` | "Compare capacity of different containers" | `volume_measurement` |

### Content Requirements

- Uses `grid_area` for perimeter and area counting (grid mode)
- Uses `fill_blank` for formula-based calculations: "Area = length × width = 5 × 3 = ___ sq cm"
- Uses `real_world` for application: "You want to put a fence around your garden. The garden is 4m long and 3m wide. How much fencing do you need?"
- Uses `matching` for matching shapes to their perimeter/area
- Examples:
  - "A rectangle that is 4 squares long and 3 squares wide has area = 12 squares"
  - "Perimeter = add all sides: 4 + 3 + 4 + 3 = 14 units"

### Deliverables

- 5 YAML files for Chapter 6 perimeter/area/volume

### Acceptance Criteria

- [ ] 5 YAML files created
- [ ] `grid_area` type used for area/perimeter
- [ ] `chapter: { code: CH6, name: Perimeter Area Volume }`
- [ ] All pass `pnpm curriculum:validate`

---

## Story 15.7 — Chapter 7: Geometry

### Goal

Create YAML concept files for Chapter 7 (Geometry) covering symmetry, lines/rays/segments, angles, circles, and parallel/perpendicular lines.

### Concepts

| ID | Learning Objective | Dependencies |
|---|---|---|
| `symmetry` | "Identify lines of symmetry in 2D shapes" | `basic_shapes` |
| `lines_rays_segments` | "Identify lines, line segments, and rays" | `basic_shapes` |
| `angles_intro` | "Identify acute, right, and obtuse angles" | `lines_rays_segments` |
| `circle_parts` | "Identify center, radius, diameter, chord, and circumference of a circle" | `basic_shapes` |
| `parallel_perpendicular` | "Identify parallel and perpendicular lines" | `lines_rays_segments` |

### Content Requirements

- Uses `fraction_visual`? No — geometry is better with SVG-based shapes
- Uses `matching` for shape↔definition matching (e.g., "Radius" ↔ "Line from center to edge")
- Uses `drag_drop` for labeling circle parts
- Uses `fill_blank` for naming geometry terms
- Uses `multiple_choice` for angle identification: "Which angle is a right angle?"
- Examples:
  - "A square has 4 lines of symmetry ✂️"
  - "A right angle is like the corner of this book 📐"
  - "The radius is half the diameter of a circle ⭕"
- Emoji: 📐 for angle, ✂️ for symmetry fold, ⭕ for circle, 📏 for ruler/line

### Deliverables

- 5 YAML files for Chapter 7 geometry

### Acceptance Criteria

- [ ] 5 YAML files created
- [ ] `chapter: { code: CH7, name: Geometry }`
- [ ] All pass `pnpm curriculum:validate`

---

## Story 15.8 — Chapter 8: Data Handling

### Goal

Create YAML concept files for Chapter 8 (Data Handling) covering bar charts, pictographs, and data interpretation.

### Concepts

| ID | Learning Objective | Dependencies |
|---|---|---|
| `data_collection` | "Collect and record data using tally marks" | `counting_1_10` |
| `pictographs` | "Read and create pictographs to represent data" | `data_collection` |
| `bar_charts` | "Read and interpret bar charts" | `data_collection` |

### Content Requirements

- Uses `chart_reader` for bar chart and pictograph reading
- Uses `real_world` for data collection: "Ask 5 friends about their favorite fruit and make a tally chart"
- Uses `multiple_choice` for data interpretation: "How many children liked mango? 3, 5, or 8?"
- Uses `matching` for matching data to charts
- Examples:
  - "5 children like apple 🍎, 3 like banana 🍌, 7 like mango 🥭"
  - "In the pictograph, each ⭐ = 2 children. How many children liked cricket?"
- Hints: "Look at the key first — it tells you what each symbol means."

### Deliverables

- 3 YAML files for Chapter 8 data handling

### Acceptance Criteria

- [ ] 3 YAML files created
- [ ] `chart_reader` type used
- [ ] `chapter: { code: CH8, name: Data Handling }`
- [ ] All pass `pnpm curriculum:validate`

---

## Story 15.9 — Level B Dependency Graph & Integration

### Goal

Define the complete dependency graph for Level B Math concepts and integrate them with existing Level A concepts, ensuring no circular dependencies and a valid learning path.

### Background

Level B concepts build on Level A foundations. For example, `fractions_intro` depends on `addition_1_10` and `basic_shapes`. Within Level B, concepts chain together: `fractions_intro` → `equivalent_fractions` → `proper_improper_mixed` → `comparing_fractions` → `fraction_addition`. The dependency graph must be validated to ensure every concept is reachable and no cycles exist.

### User Story

As the curriculum system, I want a validated dependency graph for all Level B Math concepts so that the platform can enforce mastery-based progression.

### Dependencies Map

```
Level A (Entry Points):
  counting_1_10, number_recognition_1_10, addition_1_10, subtraction_1_10, basic_shapes

Level B Chapter 1 (Numbers):
  numbers_up_to_crore → place_value_crore → expanded_form
  place_value_crore → comparing_large_numbers → ordering_numbers
  place_value_crore → forming_numbers

Level B Chapter 2 (Operations):
  addition_1_10, place_value_crore → addition_large_numbers → subtraction_large_numbers
  addition_large_numbers → multiplication_intro → multiplication_larger
  multiplication_intro → division_intro
  addition_large_numbers, subtraction_large_numbers → estimation

Level B Chapter 3 (Fractions):
  addition_1_10, basic_shapes → fractions_intro → equivalent_fractions
  fractions_intro → proper_improper_mixed
  equivalent_fractions → comparing_fractions
  proper_improper_mixed → fraction_addition
  fraction_addition, multiplication_intro → fraction_of_number

Level B Chapter 4 (Decimals):
  fractions_intro → decimals_intro → decimal_fraction_conversion
  decimals_intro → comparing_decimals
  decimals_intro, addition_large_numbers → decimal_operations
  decimal_operations → unit_conversion
  decimal_fraction_conversion → percentage_intro

Level B Chapter 5 (Measurement):
  unit_conversion → length_measurement
  unit_conversion → weight_measurement
  unit_conversion → volume_measurement
  number_recognition_1_10 → temperature_reading
  number_recognition_1_10, counting_1_10 → telling_time
  decimal_operations → indian_currency

Level B Chapter 6 (Perimeter/Area/Volume):
  addition_large_numbers, basic_shapes → perimeter_intro → area_intro
  area_intro, multiplication_intro → area_formula
  area_formula → volume_intro
  volume_measurement → capacity

Level B Chapter 7 (Geometry):
  basic_shapes → symmetry
  basic_shapes → lines_rays_segments → angles_intro
  lines_rays_segments → circle_parts
  lines_rays_segments → parallel_perpendicular

Level B Chapter 8 (Data Handling):
  counting_1_10 → data_collection → pictographs
  data_collection → bar_charts
```

### Requirements

- Update each YAML file's `dependencies` field to match the dependency map above
- Run `detectCircularDependencies()` from `packages/db/src/dependency-graph.ts` to verify no cycles
- Run `runCurriculumPipeline()` to validate all cross-references
- Generate a Mermaid diagram documenting the complete Level B dependency graph
- Verify every concept is reachable from at least one Level A entry point

### Deliverables

- Updated `dependencies` fields in all Level B YAML files
- `knowledge/curriculum/level-b-dependency-graph.md` with Mermaid diagram
- Validation report showing all concepts, dependencies, and entry points

### Acceptance Criteria

- [ ] All Level B YAML files have correct `dependencies` fields
- [ ] Every dependency references a valid existing conceptId (Level A or Level B)
- [ ] No circular dependencies detected
- [ ] All concepts reachable from Level A entry points
- [ ] `pnpm curriculum:validate` passes with 0 errors
- [ ] Mermaid diagram documents the complete graph

### Files Expected To Change

- All Level B YAML files (dependency fields)
- `knowledge/curriculum/level-b-dependency-graph.md` (new)

### Testing Requirements

- Run `pnpm curriculum:validate` — must pass
- Run dependency graph validation — must pass with no cycles

### Definition Of Done

- [ ] Full dependency graph validated and documented
- [ ] All curriculum validation checks pass
