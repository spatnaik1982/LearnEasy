# EPIC-14: Level B Activity Components

## Objective

Extend the rendering engine with new activity types and UI components required for Level B Math content. The existing 7 activity types cover ~60% of Level B content; this epic adds 7 new types that handle fractions, place value, geometry, measurement, time, data handling, and fill-in-the-blank.

## Background

Level B Math introduces concepts that the existing activity types can't render effectively:
- **Fractions** — need part-of-whole visual (bars/circles), not discrete object counting
- **Large numbers (up to 1 crore)** — need place value charts, not emoji grids
- **Perimeter/Area** — need grid-based counting, not abstract formulas
- **Data handling** — need bar charts and pictographs, not text
- **Time** — need interactive clocks
- **Measurement** — need scale/thermometer reading
- **Fill-in-the-blank** — needed for equations, missing digits, and number patterns

Each new type follows the same integration pattern: new component → export → ActivityRenderer case → evaluateActivity case.

## User Value

Learners can visualize fractions, manipulate place values, read charts and clocks, and interact with geometry — making abstract Level B concepts concrete and accessible per ALX-2 (Visual First).

## Scope

- 7 new activity components in `packages/ui/src/`
- ActivityRenderer and evaluateActivity integration
- STEP_ACTIVITY_TYPES update in student app
- Storybook/examples for each new component

## Stories

- **Story 14.1** — FractionVisualizer Component
- **Story 14.2** — PlaceValueChart Component
- **Story 14.3** — GridCounter Component
- **Story 14.4** — ChartReader Component
- **Story 14.5** — ClockWidget Component
- **Story 14.6** — ScaleReader Component
- **Story 14.7** — FillBlank Component
- **Story 14.8** — ActivityRenderer & Evaluator Integration

## Dependencies

- EPIC-0 (existing ActivityRenderer, evaluateActivity, index.ts barrel export patterns)
- `packages/ui/src/ActivityRenderer.tsx` — must be modified to dispatch new types
- `packages/ui/src/activity-utils.ts` — must be modified to evaluate new types
- `apps/student/pages/learn/[conceptId].tsx` — STEP_ACTIVITY_TYPES may need extension

## Success Criteria

- All 7 new components render correctly in the student app
- Each component is accessible (aria-live, keyboard navigable, focus management)
- Each component passes ALX design review (ALX-1 through ALX-8)
- evaluateActivity() correctly scores each new type
- ActivityRenderer dispatches all new types
- All existing curriculum YAMLs still render correctly (no regressions)

## Out Of Scope

- Audio feedback
- Animation beyond fade transitions
- Touch gesture support beyond tap
- Multi-touch interactions

---

## Story 14.1 — FractionVisualizer Component

### Goal

Build a component that visually represents fractions as shaded parts of a whole, supporting fraction bars (horizontal rectangle divided into equal parts), fraction circles (pizza-style), and equivalence comparisons.

### Background

Level B Math (Chapter 3) teaches fraction basics, equivalent fractions, proper/improper/mixed fractions, and fraction comparison. The existing `VisualCounter` shows discrete objects (🍎🍎🍎) which doesn't work for continuous part-of-whole fractions. A dedicated fraction visualizer shows a shape divided into `N` equal parts with `M` parts shaded.

### User Story

As a learner, I want to see a fraction like 3/4 as a pizza with 3 out of 4 slices shaded so that I can understand fractions as parts of a whole.

### Functional Requirements

- Two display modes:
  - **Fraction bar**: horizontal rectangle divided into equal parts, parts shaded
  - **Fraction circle**: circle divided into equal sectors (like pizza slices), sectors shaded
- Props:
  ```typescript
  interface FractionVisualizerProps {
    numerator: number;
    denominator: number;
    mode?: 'bar' | 'circle';        // visual representation
    label?: string;                  // optional text below the visual
    showLabel?: boolean;             // show "3/4" or "three-fourths"
    interactive?: boolean;           // allow clicking to shade/unshade
    maxDenominator?: number;         // max parts (default: 12)
    compare?: {                      // for equivalent fraction comparison
      numerator: number;
      denominator: number;
    };
    onShade?: (shaded: number) => void;  // callback for interactive mode
    className?: string;
  }
  ```
- Visual requirements:
  - Fraction bar: equal-width divisions, clear borders between parts, filled with Muted Teal (#76A5AF)
  - Fraction circle: equal-angle sectors, clear lines, filled with Soft Amber (#EBC06D)
  - Hover/active state on interactive parts: subtle scale change (1.05) at 200ms
  - Label centered below: "3/4" or "three-fourths" in Slate Text (#374151), 20px font
  - Minimum size: 200×200px for circle, 300×60px for bar
  - Touch targets for interactive parts: ≥56×56px
- Accessibility:
  - `role="img"` with `aria-label` describing the fraction (e.g., "3 out of 4 parts shaded")
  - Keyboard: Tab to focus, Enter/Space to toggle shade on interactive parts
  - `aria-live="polite"` region announces fraction value changes
- Error states:
  - `denominator > maxDenominator` → show message "Too many parts to show clearly"
  - `numerator > denominator` → render as improper fraction visual (whole + remainder)

### Technical Requirements

- New file: `packages/ui/src/FractionVisualizer.tsx`
- Use SVG for rendering (scales cleanly, accessible, no external dependencies)
- Fraction bar: `<rect>` elements with `<line>` dividers
- Fraction circle: `<path>` elements using arc commands for sectors
- Animation: fade in only (200ms) on mount (ALX-6 compliant)
- No autoplay, no flashing, no bounce
- Tailwind classes for colors from ALX palette
- Export from `packages/ui/src/index.ts`
- Unit test: renders correct number of parts, correct shading, accessibility labels

### Deliverables

- `packages/ui/src/FractionVisualizer.tsx`
- `packages/ui/src/__tests__/FractionVisualizer.test.tsx`
- `packages/ui/src/index.ts` update

### Acceptance Criteria

- [ ] Fraction bar renders with correct number of equal parts
- [ ] Fraction circle renders with correct number of equal sectors
- [ ] Shading accurately reflects numerator/denominator
- [ ] Compare mode shows two fractions side by side
- [ ] Interactive mode allows clicking parts to toggle shade
- [ ] `aria-label` correctly describes the fraction
- [ ] Keyboard navigation works to focus and toggle parts
- [ ] Improper fraction displays whole + remainder correctly
- [ ] Denominator exceeds max shows fallback message
- [ ] All tests pass

### Files Expected To Change

- `packages/ui/src/FractionVisualizer.tsx` (new)
- `packages/ui/src/__tests__/FractionVisualizer.test.tsx` (new)
- `packages/ui/src/index.ts` (add export)

### Testing Requirements

- Render test: bar mode, circle mode, correct part count
- Shading test: numerator matches shaded count
- Interactive test: click/drag changes shade
- Accessibility test: aria-label, keyboard focus, tab order
- Edge case: 0/denominator, denominator=1, improper fraction

### Definition Of Done

- [ ] Component renders in all modes
- [ ] All tests pass
- [ ] Accessibility validated

### Out Of Scope

- Drag-to-shade (click-toggle only)
- Animation beyond fade
- Audio fraction pronunciation

---

## Story 14.2 — PlaceValueChart Component

### Goal

Build a component that displays a place value chart (up to crore/crore) where learners can drag digits into the correct columns, reinforcing place value understanding for numbers up to 1 crore.

### Background

Level B Math (Chapter 1) covers numbers up to 1 crore with place value (Indian system: ones, tens, hundreds, thousands, ten thousands, lakhs, ten lakhs, crores). Learners need to place digits in the correct columns and read multi-digit numbers.

### User Story

As a learner, I want to drag digits into a place value chart so that I understand how the position of a digit determines its value.

### Functional Requirements

- Display a table with columns for each place value in the Indian system:
  | Crore (Cr) | Ten Lakh (TL) | Lakh (L) | Ten Thousand (TTh) | Thousand (Th) | Hundred (H) | Ten (T) | One (O) |
  |------------|---------------|-----------|--------------------|---------------|-------------|---------|---------|
- Props:
  ```typescript
  interface PlaceValueChartProps {
    maxPlaces?: 'lakh' | 'crore';     // how many columns to show (default: 'crore')
    digits?: (number | null)[];        // pre-filled digits (null = empty)
    interactive?: boolean;             // allow drag/drop or click-to-fill
    draggableDigits?: number[];        // available digits to place (for drag mode)
    targetNumber?: number;             // the number to represent (read-only display)
    onPlaceDigit?: (column: number, digit: number) => void;
    onRemoveDigit?: (column: number) => void;
    showLabels?: boolean;              // show place value labels
    className?: string;
  }
  ```
- Two interaction modes:
  - **Drag mode**: digits available in a "digit bank" below the chart, drag each into the correct column slot
  - **Click mode**: click an empty slot, a digit selector (0-9) appears, click to select
- Visual requirements:
  - Chart: rounded table with column headers in Soft Blue (#5D87B1) background
  - Each cell: minimum 64×56px touch target
  - Empty slot: dashed border, subtle pulse to indicate interactive
  - Filled slot: filled background (Warm Off-White #F9F7F2), bold digit (24px, Slate Text)
  - Correct placement: brief green flash (Muted Green #8FB996)
  - Incorrect placement: brief amber flash (Soft Amber #EBC06D)
  - Read-only mode (display only): no dashed borders, no interaction
- Accessibility:
  - Table with `role="grid"`, each cell is `role="gridcell"`
  - `aria-label` on each column: "Crores column", "Ten lakhs column", etc.
  - Drag and drop: also support keyboard alternative (Tab to cell, type digit)
  - `aria-live="polite"` announces placed digit and resulting number
- Error states:
  - Invalid drag target (dropped outside chart) → return digit to bank
  - Duplicate digit placement → swap digits

### Technical Requirements

- New file: `packages/ui/src/PlaceValueChart.tsx`
- HTML `<table>` for the chart structure (accessible by default)
- Drag and drop: use HTML5 Drag and Drop API (no external library needed)
  - `draggable` attribute on digit bank items
  - `onDragStart`, `onDragOver`, `onDrop`, `onDragEnd` handlers
  - Visual feedback on drag over: highlight target cell
- Click mode: inline digit picker (0-9 buttons) that appears below the clicked cell
- Animation: fade transitions for digit placement, 200ms
- Tailwind classes from ALX palette

### Deliverables

- `packages/ui/src/PlaceValueChart.tsx`
- `packages/ui/src/__tests__/PlaceValueChart.test.tsx`
- `packages/ui/src/index.ts` update

### Acceptance Criteria

- [ ] Place value chart renders 8 columns (Cr to O) in Indian system
- [ ] Drag mode: digits can be dragged from bank to cells
- [ ] Click mode: clicking empty cell shows digit selector
- [ ] Read-only mode: displays number without interaction
- [ ] Correct placement shows green flash feedback
- [ ] `aria-label` describes each column
- [ ] Keyboard: Tab navigates cells, digit keys fill them
- [ ] Number can be read from the filled chart
- [ ] All tests pass

### Files Expected To Change

- `packages/ui/src/PlaceValueChart.tsx` (new)
- `packages/ui/src/__tests__/PlaceValueChart.test.tsx` (new)
- `packages/ui/src/index.ts` (add export)

### Testing Requirements

- Render test: all 8 columns render
- Drag test: drag digit to cell updates value
- Click test: click cell opens picker, selection fills cell
- Read-only test: displays without interaction
- Accessibility test: grid roles, aria-labels, keyboard nav
- Edge case: drag to occupied cell swaps, drag outside returns

### Definition Of Done

- [ ] Component renders and interactive modes work
- [ ] All tests pass
- [ ] Accessibility validated

### Out Of Scope

- Touch drag-and-drop (native HTML5 DnD doesn't work on mobile — use click mode as fallback)
- Commas in displayed number
- Decimal place values

---

## Story 14.3 — GridCounter Component

### Goal

Build a component that renders a rectangular grid of squares (like graph paper) for counting area and measuring perimeter, with optional interactive highlighting.

### Background

Level B Math (Chapter 6) covers perimeter and area of rectangles and squares. Learners count unit squares to find area and count unit lengths for perimeter. A grid-based visual makes this concrete.

### User Story

As a learner, I want to see a grid of squares and count them to find area so that I understand what area means before learning formulas.

### Functional Requirements

- Display a grid of unit squares (default: 10×10, configurable)
- Props:
  ```typescript
  interface GridCounterProps {
    rows: number;
    cols: number;
    highlighted?: { row: number; col: number }[];  // cells to highlight
    showGridLines?: boolean;          // show/hide grid lines
    mode?: 'area' | 'perimeter';      // what to count
    interactive?: boolean;            // allow clicking cells to highlight
    maxHighlights?: number;           // max selectable cells
    onHighlight?: (cells: { row: number; col: number }[]) => void;
    showCount?: boolean;              // display "Area: 12 squares"
    cellSize?: number;                // px per cell (default: 40)
    className?: string;
  }
  ```
- Interaction modes:
  - **Area mode**: click cells to fill them (highlight). Count shows number of filled cells.
  - **Perimeter mode**: click cells to trace the outline. Count shows perimeter length.
- Visual requirements:
  - Grid: light gray lines (#E5E7EB), 1px
  - Empty cells: white background
  - Highlighted cells: filled with Muted Teal (#76A5AF)
  - Perimeter trace: thick border (3px) in Soft Blue (#5D87B1) along the outline
  - Count display: bottom-right corner, "Area: 12 squares" or "Perimeter: 14 units"
  - Cell size: minimum 40×40px for touch targets (56×56 preferred for interactive)
- Read-only mode: display a pre-highlighted grid without interaction
- Accessibility:
  - `role="grid"` with `aria-label` describing the grid
  - Each cell: `role="gridcell"`, `aria-label="Row X, Column Y, <highlighted/empty>"`
  - Keyboard: arrow keys navigate cells, Enter/Space to toggle highlight
  - `aria-live="polite"` announces count changes

### Technical Requirements

- New file: `packages/ui/src/GridCounter.tsx`
- HTML `<table>` with CSS Grid or `<div>` grid for layout
- Each cell is a `<button>` (for interactive) or `<div>` (for display)
- CSS Grid layout: `display: grid; grid-template-columns: repeat(N, cellSize)`
- No canvas/SVG needed — pure DOM elements for accessibility
- Animation: fade only on highlight toggle, 150ms

### Deliverables

- `packages/ui/src/GridCounter.tsx`
- `packages/ui/src/__tests__/GridCounter.test.tsx`
- `packages/ui/src/index.ts` update

### Acceptance Criteria

- [ ] Grid renders with correct rows and columns
- [ ] Clicking a cell highlights it (area mode)
- [ ] Count display shows correct number of highlighted cells
- [ ] Perimeter mode shows outline tracing
- [ ] Read-only mode displays highlights without interaction
- [ ] `aria-label` on each cell describes state
- [ ] Keyboard navigation works (arrow keys, Enter to toggle)
- [ ] `maxHighlights` prevents selecting too many cells
- [ ] All tests pass

### Files Expected To Change

- `packages/ui/src/GridCounter.tsx` (new)
- `packages/ui/src/__tests__/GridCounter.test.tsx` (new)
- `packages/ui/src/index.ts` (add export)

### Testing Requirements

- Render test: correct grid dimensions
- Highlight test: clicking toggles fill, count updates
- Perimeter test: border highlights on outline cells
- Read-only test: no interaction
- Accessibility test: grid roles, keyboard nav

### Definition Of Done

- [ ] Component renders in all modes
- [ ] All tests pass
- [ ] Accessibility validated

### Out Of Scope

- Irregular shapes (only rectangles supported)
- Unit labels (cm², m²)
- Formula display

---

## Story 14.4 — ChartReader Component

### Goal

Build a component that renders simple bar charts and pictographs for data handling exercises, allowing learners to read values and answer questions about the data.

### Background

Level B Math (Chapter 8) covers data handling including bar charts and pictographs. Learners need to read values from charts, compare categories, and answer questions like "How many students liked cricket?"

### User Story

As a learner, I want to see a bar chart showing how many children like different sports so that I can read and compare data visually.

### Functional Requirements

- Two chart types:
  - **Bar chart**: vertical bars with labels, values, and gridlines
  - **Pictograph**: emoji icons representing counts (e.g., 5 ⭐ = 10 units)
- Props:
  ```typescript
  interface ChartReaderProps {
    type: 'bar' | 'pictograph';
    data: {
      label: string;
      value: number;
      emoji?: string;           // for pictograph
    }[];
    title?: string;
    showValues?: boolean;       // display numeric values on bars
    interactive?: boolean;      // allow clicking bars to select
    maxValue?: number;          // y-axis max (auto-calculated if omitted)
    onSelect?: (label: string) => void;
    selectedLabel?: string;
    className?: string;
  }
  ```
- Visual requirements:
  - Bar chart:
    - Bars: Soft Blue (#5D87B1) with 2px rounded top corners
    - Hover: subtle brightness shift
    - Y-axis: grid lines at regular intervals (light gray)
    - X-axis: category labels (20px, Slate Text)
    - Value labels above bars (optional, 16px)
  - Pictograph:
    - Emoji repeated for each unit or group (e.g., 5 stars for 10 units → 5 emoji with "= 2" label)
    - Key/Legend showing emoji-to-value mapping
  - Minimum width: 300px, aspect ratio maintained
  - Selected bar: outlined with 2px Muted Teal border
- Accessibility:
  - Bar chart: `role="img"`, `aria-label` with data table fallback
  - Each bar: `role="button"`, `aria-label="Category: value units"`
  - Pictograph: `role="img"`, `aria-label` listing each category and count
  - Keyboard: Tab between bars, Enter to select
  - Data table: include a hidden `<table>` with the same data for screen readers
- Error states:
  - Empty data array → "No data to display"
  - Single data point → renders but notes "Only one category"
  - Very large values → auto-scale display

### Technical Requirements

- New file: `packages/ui/src/ChartReader.tsx`
- Pure CSS/HTML for bar rendering (use `<div>` with dynamic height via `style={{ height: percentage }}`)
- Pictograph: flexbox layout for emoji grid
- No charting library (keep bundle small — data is simple enough for CSS)
- Tailwind classes for colors
- Responsive: bar chart stacks vertically on screens <400px wide

### Deliverables

- `packages/ui/src/ChartReader.tsx`
- `packages/ui/src/__tests__/ChartReader.test.tsx`
- `packages/ui/src/index.ts` update

### Acceptance Criteria

- [ ] Bar chart renders with correct bar heights proportional to values
- [ ] Category labels display below bars
- [ ] Value labels display on/above bars (when showValues=true)
- [ ] Pictograph renders emoji repeating for each unit
- [ ] Pictograph legend shows mapping
- [ ] Interactive mode: clicking a bar calls onSelect
- [ ] Selected bar has visual indicator
- [ ] Hidden data table for screen readers
- [ ] Empty data shows fallback message
- [ ] All tests pass

### Files Expected To Change

- `packages/ui/src/ChartReader.tsx` (new)
- `packages/ui/src/__tests__/ChartReader.test.tsx` (new)
- `packages/ui/src/index.ts` (add export)

### Testing Requirements

- Render test: correct bar heights
- Pictograph test: correct emoji count
- Interactive test: onSelect fires
- Accessibility test: hidden table, aria-labels
- Edge case: empty data, single item, large values

### Definition Of Done

- [ ] Component renders in both modes
- [ ] All tests pass
- [ ] Accessibility validated

### Out Of Scope

- Pie charts
- Line charts
- Stacked bars
- Animated bar transitions

---

## Story 14.5 — ClockWidget Component

### Goal

Build an interactive analog clock component for telling time exercises, with movable hour and minute hands and digital time display.

### Background

Level B Math (Chapter 5 — Measurement) includes telling time using analog clocks. Learners need to read and set times like "3:45" or "half past seven" by moving clock hands.

### User Story

As a learner, I want to move the hands on a clock to show a specific time so that I can practice telling time.

### Functional Requirements

- Display a circular analog clock face with:
  - Hour markings (1–12) and minute tick marks (60)
  - Hour hand (short, thick) and minute hand (long, thin)
  - Optional second hand
- Props:
  ```typescript
  interface ClockWidgetProps {
    hour?: number;              // 1-12
    minute?: number;            // 0-59
    interactive?: boolean;      // allow dragging hands
    mode?: 'read' | 'set';      // read: display only, set: learner positions hands
    showDigital?: boolean;      // display digital time below
    targetTime?: { hour: number; minute: number }; // for "set the clock to" mode
    onTimeChange?: (hour: number, minute: number) => void;
    size?: number;              // px diameter (default: 250)
    className?: string;
  }
  ```
- Interaction:
  - **Read mode**: clock displays a fixed time, learner answers "What time is it?"
  - **Set mode**: learner drags hands to match a target time (shown as digital or text)
- Visual requirements:
  - Clock face: white circle with 1px border (Slate Text)
  - Hour numbers: 1–12 in Inter, 18px, positioned around the face
  - Minute ticks: 60 small marks, every 5th mark slightly larger
  - Hour hand: 40% of radius, 4px wide, rounded tip
  - Minute hand: 60% of radius, 2px wide, rounded tip
  - Center dot: 8px diameter circle
  - Hands color: Slate Text (#374151)
  - Number color: Slate Text (#374151)
  - Digital display below: "3:45" or "3 hours 45 minutes" in 24px font
- Accessibility:
  - `role="img"` with `aria-label` describing displayed time
  - Slider controls as keyboard alternative: two sliders (hour 1-12, minute 0-59)
  - `aria-live="polite"` announces time changes
- Error states:
  - Invalid hour/minute → clamp to valid range
  - `interactive=false` and no `hour/minute` → display 12:00 as default

### Technical Requirements

- New file: `packages/ui/src/ClockWidget.tsx`
- SVG for clock rendering (circle, lines for hands, text for numbers)
- Hand rotation via CSS `transform: rotate(Xdeg)` on `<g>` elements
- Drag interaction: `onMouseDown`/`onMouseMove`/`onMouseUp` on hands
  - Calculate angle from center to cursor position
  - Snap hour hand to nearest 5 minutes (when moving hour hand)
  - Snap minute hand to nearest minute
- Touch events: `onTouchStart`/`onTouchMove`/`onTouchEnd` for mobile
- Keyboard alternative: two `<input type="range">` sliders shown below clock when `interactive=true`
  - Hour: min=1, max=12, step=1
  - Minute: min=0, max=59, step=5 (or step=1)
- No animation (static display) unless hands are being dragged

### Deliverables

- `packages/ui/src/ClockWidget.tsx`
- `packages/ui/src/__tests__/ClockWidget.test.tsx`
- `packages/ui/src/index.ts` update

### Acceptance Criteria

- [ ] Clock face renders with numbers and tick marks
- [ ] Read mode: displays correct time from props
- [ ] Set mode: learner can drag hour hand to change hour
- [ ] Set mode: learner can drag minute hand to change minute
- [ ] Digital time display updates as hands move
- [ ] Keyboard slider controls are accessible
- [ ] `aria-label` describes current time
- [ ] Touch events work on mobile
- [ ] All tests pass

### Files Expected To Change

- `packages/ui/src/ClockWidget.tsx` (new)
- `packages/ui/src/__tests__/ClockWidget.test.tsx` (new)
- `packages/ui/src/index.ts` (add export)

### Testing Requirements

- Render test: correct clock face, numbers at positions
- Read test: hands at correct angles for given time
- Drag test: mouse drag rotates hand
- Keyboard test: slider updates time
- Accessibility test: aria-label, role
- Edge case: 12:00, 6:30, 11:59

### Definition Of Done

- [ ] Component renders in both modes
- [ ] All tests pass
- [ ] Accessibility validated

### Out Of Scope

- Second hand
- Roman numerals
- Animated smooth hand movement
- Timezone support

---

## Story 14.6 — ScaleReader Component

### Goal

Build a component that displays a marked scale (ruler, thermometer, measuring cylinder) for measurement reading exercises.

### Background

Level B Math (Chapter 5 — Measurement) covers reading measurements from scales: length (ruler/cm scale), temperature (thermometer), and volume (measuring cylinder). Learners need to read values between marked increments.

### User Story

As a learner, I want to read the temperature on a thermometer or the length on a ruler so that I can practice measurement reading skills.

### Functional Requirements

- Three scale types:
  - **Ruler**: horizontal linear scale (cm/mm or inches)
  - **Thermometer**: vertical scale with colored liquid column
  - **Cylinder**: vertical scale with colored liquid level
- Props:
  ```typescript
  interface ScaleReaderProps {
    type: 'ruler' | 'thermometer' | 'cylinder';
    min: number;
    max: number;
    step: number;               // increment between major marks
    unit: string;               // "cm", "°C", "mL", etc.
    value?: number;             // current reading
    interactive?: boolean;      // allow adjusting the reading
    targetValue?: number;       // for "set the scale to" mode
    onValueChange?: (value: number) => void;
    showReading?: boolean;      // show numeric reading
    showLabels?: boolean;       // show major mark labels
    height?: number;            // px height (for vertical scales)
    width?: number;             // px width (for horizontal scales)
    className?: string;
  }
  ```
- Visual requirements:
  - Ruler: 300×60px, major marks every cm (tall line + number), minor marks every mm (short line)
  - Thermometer: 40×250px bulb at bottom, red column, scale marks on side
  - Cylinder: 80×250px, liquid level, scale marks on side
  - Interactive: draggable indicator along the scale
  - ALX colors: Slate Text for marks, Soft Coral (#E5989B) for thermometer liquid, Muted Blue for cylinder liquid
- Accessibility:
  - `role="img"` with `aria-label` describing the scale and reading
  - Slider input (`<input type="range">`) as keyboard alternative
  - `aria-live="polite"` announces value changes
- Error states:
  - `min >= max` → return "Invalid scale range"
  - `value` outside min-max → clamp to nearest bound

### Technical Requirements

- New file: `packages/ui/src/ScaleReader.tsx`
- SVG for rendering (precise positioning of marks, lines, liquid columns)
- Ruler: `<line>` elements for marks, `<text>` for numbers
- Thermometer: `<rect>` for column (height proportional to value), `<path>` for bulb
- Cylinder: `<rect>` for liquid, `<line>` for marks
- Drag handling: `onMouseDown`/`onMouseMove`/`onMouseUp` on SVG
  - Calculate value from cursor Y position (thermometer/cylinder) or X position (ruler)
  - Snap to nearest `step` if step > 1
- Keyboard: `<input type="range">` with min/max/step matching scale

### Deliverables

- `packages/ui/src/ScaleReader.tsx`
- `packages/ui/src/__tests__/ScaleReader.test.tsx`
- `packages/ui/src/index.ts` update

### Acceptance Criteria

- [ ] Ruler renders with correct major and minor marks
- [ ] Thermometer renders with red liquid at correct height
- [ ] Cylinder renders with liquid at correct level
- [ ] Interactive mode: drag indicator changes reading
- [ ] Keyboard slider changes reading
- [ ] `aria-label` describes scale type and reading
- [ ] Invalid range shows error message
- [ ] All tests pass

### Files Expected To Change

- `packages/ui/src/ScaleReader.tsx` (new)
- `packages/ui/src/__tests__/ScaleReader.test.tsx` (new)
- `packages/ui/src/index.ts` (add export)

### Testing Requirements

- Render test: correct marks for each type
- Value test: indicator positioned correctly
- Drag test: mouse drag updates value
- Keyboard test: range input updates value
- Accessibility test: role, aria-label
- Edge case: min=max, value out of range

### Definition Of Done

- [ ] Component renders in all 3 modes
- [ ] All tests pass
- [ ] Accessibility validated

### Out Of Scope

- Dual scales (e.g., °C and °F)
- Meniscus curve on cylinder
- Spring scale / balance scale

---

## Story 14.7 — FillBlank Component

### Goal

Build a component that presents an equation, number sequence, or place value expression with one or more blank (missing) values that the learner fills in by selecting from options or typing.

### Background

Level B Math has many fill-in-the-blank style exercises: "7,45,_21 — what digit is missing?", "3 + _ = 8", "Write the expanded form: 5,432 = 5000 + _ + 30 + 2". A dedicated component handles these cleanly.

### User Story

As a learner, I want to fill in missing numbers in equations and sequences so that I can practice completing mathematical expressions.

### Functional Requirements

- Display a text/expression with `___` placeholders for missing values
- Props:
  ```typescript
  interface FillBlankProps {
    template: string;                    // "3 + ___ = 8" or "7,45,_21"
    blanks: {                            // positions and correct answers
      id: string;
      position: number;                  // index in template
      correctAnswer: string | number;
      options?: (string | number)[];    // for multiple-choice mode
    }[];
    mode?: 'select' | 'type';           // pick from options or type answer
    onComplete?: (answers: Record<string, string | number>) => void;
    showResult?: boolean;                // show correct/incorrect after submit
    className?: string;
  }
  ```
- Two modes:
  - **Select mode**: each blank has a dropdown/button group of options to choose from
  - **Type mode**: each blank is an `<input>` field where learner types the answer
- Visual requirements:
  - Template rendered inline as text (20px, Slate Text)
  - Blanks: dashed underline `___` in Soft Blue (#5D87B1), 60px wide minimum
  - Select mode: options appear as a row of buttons below the blank (56×56px touch targets)
  - Type mode: `<input>` with 60px width, centered text, bottom border only
  - Active blank: solid border (Soft Blue)
  - Filled blank: filled value in bold
  - Correct: brief green flash
  - Incorrect: brief amber flash (ALX-5 safe mistakes — no red "wrong" styling)
- Accessibility:
  - Each blank: `aria-label="Blank 1, fill in the missing value"`
  - Select mode: buttons with `role="option"`, grouped in `role="radiogroup"`
  - Type mode: `<input>` with `aria-label` describing what to fill
  - `aria-live="polite"` announces when all blanks are filled
- Error states:
  - `template` doesn't contain enough `___` for `blanks.length` → error log, pad with defaults
  - Empty input in type mode → "Please fill in all blanks"

### Technical Requirements

- New file: `packages/ui/src/FillBlank.tsx`
- Parse `template` string to split around `___` placeholders
  - Use `template.split('___')` to get segments, then interleave with blank components
- Select mode: flexbox row of buttons (pill style), optional `role="radiogroup"`
- Type mode: `<input type="text" inputMode="numeric" pattern="[0-9]*">` for math content
- Tailwind classes from ALX palette
- Animation: fade flash on submit (200ms)

### Deliverables

- `packages/ui/src/FillBlank.tsx`
- `packages/ui/src/__tests__/FillBlank.test.tsx`
- `packages/ui/src/index.ts` update

### Acceptance Criteria

- [ ] Template renders with `___` placeholders visible
- [ ] Select mode: options appear as buttons when blank is focused
- [ ] Selecting an option fills the blank
- [ ] Type mode: input field accepts numbers
- [ ] `onComplete` fires with all answers when all blanks filled
- [ ] Correct/incorrect flash feedback on submit
- [ ] `aria-label` on each blank
- [ ] All blanks required before completion
- [ ] All tests pass

### Files Expected To Change

- `packages/ui/src/FillBlank.tsx` (new)
- `packages/ui/src/__tests__/FillBlank.test.tsx` (new)
- `packages/ui/src/index.ts` (add export)

### Testing Requirements

- Render test: correct template with blanks
- Select test: clicking option fills blank
- Type test: typing fills blank
- Completion test: `onComplete` fires with correct answers
- Accessibility test: aria-labels on blanks
- Edge case: multiple blanks, blank at start/end

### Definition Of Done

- [ ] Component renders in both modes
- [ ] All tests pass
- [ ] Accessibility validated

### Out Of Scope

- Rich text formatting in template
- Auto-tab between blanks
- Math expression parsing beyond text

---

## Story 14.8 — ActivityRenderer & Evaluator Integration

### Goal

Integrate all new Level B activity components into the existing `ActivityRenderer` and `activity-utils` (evaluateActivity), so the student app can render and evaluate the new activity types.

### Background

The `ActivityRenderer.tsx` dispatches activity `type` strings to the correct component via a switch statement. The `activity-utils.ts` `evaluateActivity()` function scores learner responses. Each new activity type needs a case in both files.

### User Story

As a student, I want my new Level B activities (fractions, place value, etc.) to render and be scored correctly so that I can learn and get feedback.

### Functional Requirements

- Add cases to `ActivityRenderer.tsx` for:
  - `'fraction_visual'` → `<FractionVisualizer ...>`
  - `'place_value_chart'` → `<PlaceValueChart ...>`
  - `'grid_area'` → `<GridCounter ...>`
  - `'chart_reader'` → `<ChartReader ...>`
  - `'clock_time'` → `<ClockWidget ...>`
  - `'measurement_scale'` → `<ScaleReader ...>`
  - `'fill_blank'` → `<FillBlank ...>`
- Extend `normalizeContent()` to handle each new type's YAML content shape:
  ```typescript
  // fraction_visual YAML → component props
  normalizeContent('fraction_visual', content) → {
    numerator, denominator, mode, label, showLabel, interactive, compare
  }
  
  // place_value_chart YAML → component props
  normalizeContent('place_value_chart', content) → {
    maxPlaces, digits, interactive, draggableDigits, targetNumber
  }
  
  // grid_area YAML → component props
  normalizeContent('grid_area', content) → {
    rows, cols, highlighted, mode, interactive, maxHighlights, cellSize
  }
  
  // chart_reader YAML → component props
  normalizeContent('chart_reader', content) → {
    type, data, title, showValues, interactive
  }
  
  // clock_time YAML → component props
  normalizeContent('clock_time', content) → {
    hour, minute, interactive, mode, showDigital, targetTime
  }
  
  // measurement_scale YAML → component props
  normalizeContent('measurement_scale', content) → {
    type, min, max, step, unit, value, interactive, targetValue
  }
  
  // fill_blank YAML → component props
  normalizeContent('fill_blank', content) → {
    template, blanks, mode
  }
  ```
- Extend `evaluateActivity()` in `activity-utils.ts` for each new type:
  - `fraction_visual`: compare `shaded` count to expected `numerator`
  - `place_value_chart`: compare placed digits to expected number
  - `grid_area`: compare highlighted cells count to expected area/perimeter
  - `chart_reader`: compare selected label to expected label (for "which category has most" type questions)
  - `clock_time`: compare set time to target time (within 5-minute tolerance)
  - `measurement_scale`: compare value to target value (within 1 step tolerance)
  - `fill_blank`: compare all filled answers to correct answers
- Update `STEP_ACTIVITY_TYPES` in `apps/student/pages/learn/[conceptId].tsx`:
  ```typescript
  const STEP_ACTIVITY_TYPES = {
    0: ["visual_counter", "visual_counting", "story_question", "fraction_visual",
        "place_value_chart", "grid_area", "chart_reader", "clock_time", "measurement_scale"], // Observe
    1: ["matching", "story_question", "fraction_visual", "place_value_chart",
        "grid_area", "clock_time", "measurement_scale", "fill_blank"],   // Guided Practice
    2: ["sequencing", "drag_drop", "matching", "fraction_visual",
        "place_value_chart", "grid_area", "chart_reader", "fill_blank"], // Independent Practice
    3: ["multiple_choice", "fill_blank"],                                // Mastery Check
  };
  ```
- Export all new components from `packages/ui/src/index.ts`
- Add new activity type string constants to `packages/ui/src/copy.ts` (user-facing descriptions)
- Verify no regressions: run all existing tests

### Technical Requirements

- Each new component already built and tested (Stories 14.1–14.7)
- Changes to:
  - `packages/ui/src/ActivityRenderer.tsx` — switch statement + normalizeContent
  - `packages/ui/src/activity-utils.ts` — evaluateActivity switch
  - `packages/ui/src/index.ts` — ensure all new types re-exported
  - `apps/student/pages/learn/[conceptId].tsx` — STEP_ACTIVITY_TYPES
  - `apps/student/lib/mockData.ts` — add mock activity data for new types (for development)
- Test the full pipeline: YAML → API → ActivityRenderer → component render → evaluate → score

### Deliverables

- Updated `packages/ui/src/ActivityRenderer.tsx`
- Updated `packages/ui/src/activity-utils.ts`
- Updated `packages/ui/src/index.ts`
- Updated `apps/student/pages/learn/[conceptId].tsx`
- Updated `apps/student/lib/mockData.ts`
- Integration tests

### Acceptance Criteria

- [ ] `ActivityRenderer` renders all 7 new types correctly
- [ ] `normalizeContent()` handles all new YAML content shapes
- [ ] `evaluateActivity()` scores all 7 new types correctly
- [ ] `STEP_ACTIVITY_TYPES` includes all new types in appropriate steps
- [ ] Existing activity types still work (no regressions)
- [ ] All existing tests pass
- [ ] New integration tests for each new type
- [ ] Mock data includes examples for all new types

### Files Expected To Change

- `packages/ui/src/ActivityRenderer.tsx` (switch + normalizeContent)
- `packages/ui/src/activity-utils.ts` (evaluateActivity)
- `packages/ui/src/index.ts` (exports — likely already done per component story)
- `packages/ui/src/copy.ts` (new type descriptions)
- `apps/student/pages/learn/[conceptId].tsx` (STEP_ACTIVITY_TYPES)
- `apps/student/lib/mockData.ts` (mock examples)

### Testing Requirements

- Unit test: ActivityRenderer dispatch for each new type
- Unit test: evaluateActivity correctness for each new type
- Integration test: full render cycle for each new type
- Regression test: existing types still render and evaluate

### Definition Of Done

- [ ] All new types integrated
- [ ] All tests pass (existing + new)
- [ ] Manual verification in student app

### Out Of Scope

- New activity types beyond the 7 listed here (future)
- Visual polish beyond ALX specs (focus on functionality)
