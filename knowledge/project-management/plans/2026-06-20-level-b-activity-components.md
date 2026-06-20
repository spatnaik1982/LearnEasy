# Level B Activity Components Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build 7 new activity components for Level B Math and integrate them into ActivityRenderer, evaluateActivity, STEP_ACTIVITY_TYPES, and VALID_ACTIVITY_TYPES.

**Architecture:** Each component is a standalone file in `packages/ui/src/`, barrel-exported from `packages/ui/src/index.ts`. ActivityRenderer dispatches via `switch(type)`, evaluateActivity handles scoring. The student app's STEP_ACTIVITY_TYPES and the curriculum pipeline's VALID_ACTIVITY_TYPES are updated to include the new type strings.

**Tech Stack:** React 18, TypeScript (strict), Tailwind CSS with ALX color palette, Jest + ts-jest for testing, SVG for visual rendering (FractionVisualizer, ClockWidget, ScaleReader), HTML table/div grid for data display (PlaceValueChart, GridCounter, FillBlank, ChartReader).

---

### Task 1: Jest Configuration

**Files:**
- Create: `packages/ui/jest.config.ts`
- Create: `packages/ui/setup-tests.ts`

- [ ] **Step 1: Create jest.config.ts**

```typescript
import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterSetup: ['<rootDir>/setup-tests.ts'],
  moduleNameMapper: {
    '\\.(css|less|scss)$': '<rootDir>/__mocks__/styleMock.ts',
  },
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.ts?(x)'],
};

export default config;
```

- [ ] **Step 2: Create setup-tests.ts**

```typescript
import '@testing-library/jest-dom';
```

- [ ] **Step 3: Create __mocks__/styleMock.ts**

```typescript
export default {};
```

- [ ] **Step 4: Add test dependencies and run install**

Run: `pnpm --filter @learn-easy/ui add -D @testing-library/react @testing-library/jest-dom @testing-library/user-event jest-environment-jsdom`

### Task 2: Story 14.1 — FractionVisualizer Component

**Files:**
- Create: `packages/ui/src/FractionVisualizer.tsx`
- Create: `packages/ui/src/__tests__/FractionVisualizer.test.tsx`
- Modify: `packages/ui/src/index.ts` (add export)

- [ ] **Step 1: Write the failing test**

```typescript
import { render, screen } from '@testing-library/react';
import { FractionVisualizer } from '../FractionVisualizer';

describe('FractionVisualizer', () => {
  it('renders a fraction bar with correct number of parts', () => {
    const { container } = render(
      <FractionVisualizer numerator={3} denominator={4} mode="bar" />
    );
    const bars = container.querySelectorAll('rect');
    // Should have 3 filled rects and border rects
    expect(bars.length).toBeGreaterThan(0);
  });

  it('renders a fraction circle with correct number of sectors', () => {
    const { container } = render(
      <FractionVisualizer numerator={1} denominator={3} mode="circle" />
    );
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('shows correct aria-label', () => {
    render(<FractionVisualizer numerator={3} denominator={4} />);
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('aria-label', expect.stringContaining('3 out of 4'));
  });

  it('shows label when showLabel is true', () => {
    render(<FractionVisualizer numerator={1} denominator={2} showLabel />);
    expect(screen.getByText('1/2')).toBeInTheDocument();
  });

  it('renders compare mode showing two fractions', () => {
    const { container } = render(
      <FractionVisualizer numerator={1} denominator={2} compare={{ numerator: 2, denominator: 4 }} />
    );
    const svgs = container.querySelectorAll('svg');
    expect(svgs.length).toBe(2);
  });

  it('shows error when denominator exceeds max', () => {
    render(<FractionVisualizer numerator={1} denominator={20} maxDenominator={12} />);
    expect(screen.getByText('Too many parts to show clearly')).toBeInTheDocument();
  });

  it('handles improper fraction showing whole + remainder', () => {
    render(<FractionVisualizer numerator={5} denominator={3} />);
    const svgs = container.querySelectorAll('svg');
    expect(svgs.length).toBe(2); // whole + remainder
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @learn-easy/ui test` — Expected: FAIL (components not found)

- [ ] **Step 3: Write FractionVisualizer component**

```typescript
import { useMemo } from 'react';
import { cn } from './utils';

interface FractionVisualizerCompare {
  numerator: number;
  denominator: number;
}

export interface FractionVisualizerProps {
  numerator: number;
  denominator: number;
  mode?: 'bar' | 'circle';
  label?: string;
  showLabel?: boolean;
  interactive?: boolean;
  maxDenominator?: number;
  compare?: FractionVisualizerCompare;
  onShade?: (shaded: number) => void;
  className?: string;
}

function FractionBar({
  numerator,
  denominator,
  shaded,
  interactive,
  onShade,
}: {
  numerator: number;
  denominator: number;
  shaded: number;
  interactive?: boolean;
  onShade?: (shaded: number) => void;
}) {
  const parts = Array.from({ length: denominator }, (_, i) => i);
  const width = 300;
  const partWidth = width / denominator;

  return (
    <svg
      width={width}
      height={60}
      role="img"
      aria-label={`${shaded} out of ${denominator} parts shaded`}
      className="overflow-visible"
    >
      {parts.map((i) => (
        <rect
          key={i}
          x={i * partWidth}
          y={0}
          width={partWidth - 1}
          height={60}
          fill={i < shaded ? '#76A5AF' : '#F9F7F2'}
          stroke="#374151"
          strokeWidth={1}
          className={interactive ? 'cursor-pointer hover:opacity-80 transition-opacity duration-200' : ''}
          onClick={() => {
            if (interactive && onShade) {
              if (i < shaded) {
                onShade(shaded - 1);
              } else {
                onShade(shaded + 1);
              }
            }
          }}
          data-part={i}
        />
      ))}
    </svg>
  );
}

function FractionCircle({
  numerator,
  denominator,
  shaded,
  interactive,
  onShade,
  size = 200,
}: {
  numerator: number;
  denominator: number;
  shaded: number;
  interactive?: boolean;
  onShade?: (shaded: number) => void;
  size?: number;
}) {
  const center = size / 2;
  const radius = center - 10;
  const parts = Array.from({ length: denominator }, (_, i) => i);

  function sectorPath(index: number): string {
    const startAngle = (index / denominator) * 360 - 90;
    const endAngle = ((index + 1) / denominator) * 360 - 90;
    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;
    const x1 = center + radius * Math.cos(startRad);
    const y1 = center + radius * Math.sin(startRad);
    const x2 = center + radius * Math.cos(endRad);
    const y2 = center + radius * Math.sin(endRad);
    const largeArc = endAngle - startAngle > 180 ? 1 : 0;
    return `M ${center} ${center} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;
  }

  return (
    <svg
      width={size}
      height={size}
      role="img"
      aria-label={`${shaded} out of ${denominator} parts shaded`}
      className="overflow-visible"
    >
      {parts.map((i) => (
        <path
          key={i}
          d={sectorPath(i)}
          fill={i < shaded ? '#EBC06D' : '#F9F7F2'}
          stroke="#374151"
          strokeWidth={1}
          className={interactive ? 'cursor-pointer hover:opacity-80 transition-opacity duration-200' : ''}
          onClick={() => {
            if (interactive && onShade) {
              if (i < shaded) {
                onShade(shaded - 1);
              } else {
                onShade(shaded + 1);
              }
            }
          }}
          data-part={i}
        />
      ))}
      <circle cx={center} cy={center} r={radius} fill="none" stroke="#374151" strokeWidth={2} />
      <circle cx={center} cy={center} r={4} fill="#374151" />
    </svg>
  );
}

export function FractionVisualizer({
  numerator,
  denominator,
  mode = 'bar',
  label,
  showLabel = false,
  interactive = false,
  maxDenominator = 12,
  compare,
  onShade,
  className,
}: FractionVisualizerProps) {
  const labelText = label ?? `${numerator}/${denominator}`;

  if (denominator > maxDenominator) {
    return (
      <div
        className={cn('flex items-center justify-center rounded-lg bg-warm-off-white p-4', className)}
        role="alert"
      >
        <p className="text-base text-slate-text">Too many parts to show clearly</p>
      </div>
    );
  }

  const improperNumerator = numerator;
  const wholes = Math.floor(improperNumerator / denominator);
  const remainder = improperNumerator % denominator;

  function renderSingleFraction(num: number, den: number, shaded: number) {
    return mode === 'circle' ? (
      <FractionCircle
        numerator={num}
        denominator={den}
        shaded={shaded}
        interactive={interactive}
        onShade={onShade}
      />
    ) : (
      <FractionBar
        numerator={num}
        denominator={den}
        shaded={shaded}
        interactive={interactive}
        onShade={onShade}
      />
    );
  }

  return (
    <div
      className={cn('flex animate-fade-in flex-col items-center gap-2', className)}
      style={{ animationDuration: '200ms' }}
    >
      {remainder > 0 && wholes > 0 ? (
        <div className="flex items-center gap-2">
          {renderSingleFraction(wholes, 1, wholes)}
          <span className="text-xl text-slate-text">+</span>
          {renderSingleFraction(remainder, denominator, remainder)}
        </div>
      ) : (
        renderSingleFraction(numerator, denominator, numerator)
      )}

      {showLabel && (
        <p className="text-[20px] text-slate-text" aria-live="polite">
          {labelText}
        </p>
      )}

      {compare && (
        <div className="mt-4 flex items-center gap-4">
          <div className="flex flex-col items-center gap-1">
            {mode === 'bar' ? (
              <FractionBar numerator={numerator} denominator={denominator} shaded={numerator} />
            ) : (
              <FractionCircle numerator={numerator} denominator={denominator} shaded={numerator} size={150} />
            )}
            <span className="text-sm text-slate-text">{numerator}/{denominator}</span>
          </div>
          <span className="text-2xl text-slate-text">=</span>
          <div className="flex flex-col items-center gap-1">
            {mode === 'bar' ? (
              <FractionBar numerator={compare.numerator} denominator={compare.denominator} shaded={compare.numerator} />
            ) : (
              <FractionCircle numerator={compare.numerator} denominator={compare.denominator} shaded={compare.numerator} size={150} />
            )}
            <span className="text-sm text-slate-text">{compare.numerator}/{compare.denominator}</span>
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @learn-easy/ui test` — Expected: Tests pass

- [ ] **Step 5: Export from index.ts**

Add to `packages/ui/src/index.ts`:
```typescript
export { FractionVisualizer, type FractionVisualizerProps } from "./FractionVisualizer";
```

- [ ] **Step 6: Commit**

```bash
git add packages/ui/src/FractionVisualizer.tsx packages/ui/src/__tests__/FractionVisualizer.test.tsx packages/ui/src/index.ts packages/ui/jest.config.ts packages/ui/setup-tests.ts packages/ui/__mocks__/styleMock.ts
git commit -m "feat: add FractionVisualizer component for Level B fractions"
```

### Task 3: Story 14.2 — PlaceValueChart Component

**Files:**
- Create: `packages/ui/src/PlaceValueChart.tsx`
- Create: `packages/ui/src/__tests__/PlaceValueChart.test.tsx`
- Modify: `packages/ui/src/index.ts` (add export)

- [ ] **Step 1: Write the failing test**

```typescript
import { render, screen } from '@testing-library/react';
import { PlaceValueChart } from '../PlaceValueChart';

describe('PlaceValueChart', () => {
  it('renders all 8 columns in crore mode', () => {
    render(<PlaceValueChart maxPlaces="crore" />);
    expect(screen.getByText('Cr')).toBeInTheDocument();
    expect(screen.getByText('TL')).toBeInTheDocument();
    expect(screen.getByText('L')).toBeInTheDocument();
    expect(screen.getByText('TTh')).toBeInTheDocument();
    expect(screen.getByText('Th')).toBeInTheDocument();
    expect(screen.getByText('H')).toBeInTheDocument();
    expect(screen.getByText('T')).toBeInTheDocument();
    expect(screen.getByText('O')).toBeInTheDocument();
  });

  it('renders with role grid', () => {
    render(<PlaceValueChart />);
    expect(screen.getByRole('grid')).toBeInTheDocument();
  });

  it('displays digits when provided', () => {
    render(<PlaceValueChart digits={[1, 2, 3, 4, 5, 6, 7, 8]} />);
    expect(screen.getByText('8')).toBeInTheDocument();
  });

  it('has accessible column labels', () => {
    render(<PlaceValueChart />);
    expect(screen.getByLabelText('Crores column')).toBeInTheDocument();
  });

  it('renders in read-only mode without interactivity', () => {
    render(<PlaceValueChart digits={[1, 2, 3, 4, 5, 6, 7, 8]} />);
    const cells = screen.getAllByRole('gridcell');
    expect(cells.length).toBe(8);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @learn-easy/ui test` — Expected: FAIL

- [ ] **Step 3: Write PlaceValueChart component**

```typescript
import { useState, useCallback } from 'react';
import { cn } from './utils';

const COLUMNS = [
  { key: 'cr', label: 'Cr', fullLabel: 'Crores' },
  { key: 'tl', label: 'TL', fullLabel: 'Ten lakhs' },
  { key: 'l', label: 'L', fullLabel: 'Lakhs' },
  { key: 'tth', label: 'TTh', fullLabel: 'Ten thousands' },
  { key: 'th', label: 'Th', fullLabel: 'Thousands' },
  { key: 'h', label: 'H', fullLabel: 'Hundreds' },
  { key: 't', label: 'T', fullLabel: 'Tens' },
  { key: 'o', label: 'O', fullLabel: 'Ones' },
] as const;

const LAKH_COLUMNS = [
  { key: 'l', label: 'L', fullLabel: 'Lakhs' },
  { key: 'tth', label: 'TTh', fullLabel: 'Ten thousands' },
  { key: 'th', label: 'Th', fullLabel: 'Thousands' },
  { key: 'h', label: 'H', fullLabel: 'Hundreds' },
  { key: 't', label: 'T', fullLabel: 'Tens' },
  { key: 'o', label: 'O', fullLabel: 'Ones' },
] as const;

export interface PlaceValueChartProps {
  maxPlaces?: 'lakh' | 'crore';
  digits?: (number | null)[];
  interactive?: boolean;
  draggableDigits?: number[];
  targetNumber?: number;
  showLabels?: boolean;
  onPlaceDigit?: (column: number, digit: number) => void;
  onRemoveDigit?: (column: number) => void;
  className?: string;
}

export function PlaceValueChart({
  maxPlaces = 'crore',
  digits: initialDigits,
  interactive = false,
  draggableDigits,
  targetNumber,
  showLabels = true,
  onPlaceDigit,
  onRemoveDigit,
  className,
}: PlaceValueChartProps) {
  const columns = maxPlaces === 'lakh' ? LAKH_COLUMNS : COLUMNS;
  const [localDigits, setLocalDigits] = useState<(number | null)[]>(
    initialDigits ?? Array(columns.length).fill(null),
  );
  const [activePicker, setActivePicker] = useState<number | null>(null);
  const [dragOverCol, setDragOverCol] = useState<number | null>(null);
  const [flashCol, setFlashCol] = useState<'correct' | 'incorrect' | null>(null);

  const digits = initialDigits ?? localDigits;

  const handleCellClick = useCallback(
    (colIdx: number) => {
      if (!interactive) return;
      if (digits[colIdx] !== null) {
        const newDigits = [...digits];
        newDigits[colIdx] = null;
        setLocalDigits(newDigits);
        onRemoveDigit?.(colIdx);
        setActivePicker(null);
      } else {
        setActivePicker(activePicker === colIdx ? null : colIdx);
      }
    },
    [interactive, digits, onRemoveDigit, activePicker],
  );

  const handleDigitSelect = useCallback(
    (digit: number) => {
      if (activePicker === null) return;
      const newDigits = [...digits];
      // Check if this digit is already placed somewhere
      const existingIdx = newDigits.indexOf(digit);
      if (existingIdx !== -1) {
        newDigits[existingIdx] = null;
      }
      newDigits[activePicker] = digit;
      setLocalDigits(newDigits);
      onPlaceDigit?.(activePicker, digit);
      setActivePicker(null);

      // Flash feedback
      if (targetNumber !== undefined) {
        const targetStr = String(targetNumber).padStart(columns.length, '0');
        const placedStr = newDigits.map((d) => d ?? 0).join('');
        if (placedStr === targetStr) {
          setFlashCol('correct');
        } else {
          setFlashCol('incorrect');
        }
        setTimeout(() => setFlashCol(null), 500);
      }
    },
    [activePicker, digits, onPlaceDigit, columns.length, targetNumber],
  );

  const handleDragStart = useCallback(
    (e: React.DragEvent, digit: number) => {
      e.dataTransfer.setData('text/plain', String(digit));
    },
    [],
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent, colIdx: number) => {
      e.preventDefault();
      if (interactive) setDragOverCol(colIdx);
    },
    [interactive],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent, colIdx: number) => {
      e.preventDefault();
      setDragOverCol(null);
      if (!interactive) return;
      const digit = parseInt(e.dataTransfer.getData('text/plain'), 10);
      handleDigitSelect(digit);
    },
    [interactive, handleDigitSelect],
  );

  const handleDragEnd = useCallback(() => {
    setDragOverCol(null);
  }, []);

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      <div
        role="grid"
        aria-label="Place value chart"
        className="inline-block"
      >
        <div className="flex rounded-lg overflow-hidden border border-outline-variant">
          {columns.map((col, idx) => (
            <div
              key={col.key}
              role="gridcell"
              aria-label={`${col.fullLabel} column`}
              className={cn(
                'flex flex-col items-center border-r last:border-r-0 border-outline-variant min-w-[56px]',
                dragOverCol === idx && interactive && 'bg-soft-blue/10',
                flashCol === 'correct' && 'bg-muted-green/20',
                flashCol === 'incorrect' && 'bg-soft-amber/20',
              )}
              onDragOver={(e) => handleDragOver(e, idx)}
              onDrop={(e) => handleDrop(e, idx)}
              onDragLeave={() => setDragOverCol(null)}
            >
              {showLabels && (
                <div className="w-full bg-soft-blue px-2 py-1 text-center">
                  <span className="text-xs font-semibold text-white">{col.label}</span>
                </div>
              )}
              <button
                onClick={() => handleCellClick(idx)}
                className={cn(
                  'flex h-14 w-14 items-center justify-center text-2xl font-bold transition-colors duration-200',
                  digits[idx] !== null
                    ? 'bg-warm-off-white text-slate-text'
                    : interactive
                      ? 'border-2 border-dashed border-soft-blue bg-white text-slate-text hover:bg-soft-blue/5'
                      : 'bg-warm-off-white text-slate-text',
                )}
                aria-label={`${col.fullLabel} column${digits[idx] !== null ? `, digit ${digits[idx]}` : ', empty'}`}
                disabled={!interactive}
              >
                {digits[idx] !== null ? digits[idx] : ''}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Digit picker for click mode */}
      {activePicker !== null && interactive && (
        <div
          className="flex flex-wrap justify-center gap-2"
          role="radiogroup"
          aria-label="Select a digit"
        >
          {Array.from({ length: 10 }, (_, i) => i).map((d) => (
            <button
              key={d}
              onClick={() => handleDigitSelect(d)}
              className="flex h-14 w-14 items-center justify-center rounded-xl border-2 border-soft-blue bg-white text-xl font-bold text-slate-text hover:bg-soft-blue/10 focus:outline-none focus:ring-2 focus:ring-soft-blue"
              role="option"
              aria-label={`Digit ${d}`}
            >
              {d}
            </button>
          ))}
        </div>
      )}

      {/* Draggable digit bank */}
      {draggableDigits && draggableDigits.length > 0 && interactive && activePicker === null && (
        <div className="flex flex-wrap justify-center gap-2" aria-label="Available digits">
          {draggableDigits.map((d, i) => (
            <div
              key={`bank-${i}`}
              draggable
              onDragStart={(e) => handleDragStart(e, d)}
              onDragEnd={handleDragEnd}
              className="flex h-14 w-14 cursor-grab items-center justify-center rounded-xl border-2 border-muted-teal bg-white text-xl font-bold text-slate-text hover:bg-muted-teal/10 active:cursor-grabbing"
              role="button"
              aria-label={`Digit ${d}, drag to place in chart`}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleDigitSelect(d);
                }
              }}
            >
              {d}
            </div>
          ))}
        </div>
      )}

      {targetNumber !== undefined && !interactive && (
        <p className="text-center text-lg font-semibold text-slate-text">
          {targetNumber.toLocaleString('en-IN')}
        </p>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @learn-easy/ui test` — Expected: Tests pass

- [ ] **Step 5: Add export to index.ts**

```typescript
export { PlaceValueChart, type PlaceValueChartProps } from "./PlaceValueChart";
```

- [ ] **Step 6: Commit**

```bash
git add packages/ui/src/PlaceValueChart.tsx packages/ui/src/__tests__/PlaceValueChart.test.tsx packages/ui/src/index.ts
git commit -m "feat: add PlaceValueChart component for Level B place value"
```

### Task 4: Story 14.3 — GridCounter Component

**Files:**
- Create: `packages/ui/src/GridCounter.tsx`
- Create: `packages/ui/src/__tests__/GridCounter.test.tsx`
- Modify: `packages/ui/src/index.ts` (add export)

- [ ] **Step 1: Write the failing test**

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { GridCounter } from '../GridCounter';

describe('GridCounter', () => {
  it('renders grid with correct dimensions', () => {
    const { container } = render(<GridCounter rows={3} cols={4} />);
    const cells = container.querySelectorAll('[role="gridcell"]');
    expect(cells.length).toBe(12);
  });

  it('highlights specified cells', () => {
    const { container } = render(
      <GridCounter rows={2} cols={2} highlighted={[{ row: 0, col: 0 }, { row: 1, col: 1 }]} />
    );
    const cells = container.querySelectorAll('[data-highlighted="true"]');
    expect(cells.length).toBe(2);
  });

  it('shows count in area mode', () => {
    render(
      <GridCounter rows={2} cols={2} highlighted={[{ row: 0, col: 0 }]} showCount mode="area" />
    );
    expect(screen.getByText(/Area: 1 square/)).toBeInTheDocument();
  });

  it('has accessible grid role', () => {
    render(<GridCounter rows={3} cols={3} />);
    expect(screen.getByRole('grid')).toBeInTheDocument();
  });

  it('handles interactive cell click', () => {
    const onHighlight = jest.fn();
    render(<GridCounter rows={2} cols={2} interactive onHighlight={onHighlight} />);
    const cells = screen.getAllByRole('button');
    fireEvent.click(cells[0]);
    expect(onHighlight).toHaveBeenCalledWith([{ row: 0, col: 0 }]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @learn-easy/ui test` — Expected: FAIL

- [ ] **Step 3: Write GridCounter component**

```typescript
import { useState, useCallback, useMemo } from 'react';
import { cn } from './utils';

export interface GridCounterProps {
  rows: number;
  cols: number;
  highlighted?: { row: number; col: number }[];
  showGridLines?: boolean;
  mode?: 'area' | 'perimeter';
  interactive?: boolean;
  maxHighlights?: number;
  onHighlight?: (cells: { row: number; col: number }[]) => void;
  showCount?: boolean;
  cellSize?: number;
  className?: string;
}

export function GridCounter({
  rows,
  cols,
  highlighted: externalHighlights,
  showGridLines = true,
  mode = 'area',
  interactive = false,
  maxHighlights,
  onHighlight,
  showCount = false,
  cellSize = 40,
  className,
}: GridCounterProps) {
  const [localHighlights, setLocalHighlights] = useState<{ row: number; col: number }[]>([]);
  const highlights = externalHighlights ?? localHighlights;
  const highlightSet = useMemo(
    () => new Set(highlights.map((h) => `${h.row},${h.col}`)),
    [highlights],
  );

  const toggleCell = useCallback(
    (row: number, col: number) => {
      if (!interactive) return;
      const key = `${row},${col}`;
      if (highlightSet.has(key)) {
        const newHighlights = highlights.filter((h) => h.row !== row || h.col !== col);
        if (!externalHighlights) setLocalHighlights(newHighlights);
        onHighlight?.(newHighlights);
      } else {
        if (maxHighlights !== undefined && highlights.length >= maxHighlights) return;
        const newHighlights = [...highlights, { row, col }];
        if (!externalHighlights) setLocalHighlights(newHighlights);
        onHighlight?.(newHighlights);
      }
    },
    [interactive, highlightSet, highlights, maxHighlights, externalHighlights, onHighlight],
  );

  const count = highlights.length;

  return (
    <div className={cn('flex flex-col items-center gap-3', className)}>
      <div
        role="grid"
        aria-label={`${mode === 'area' ? 'Area' : 'Perimeter'} grid, ${rows} rows by ${cols} columns`}
        className="inline-block"
      >
        <div
          className="grid gap-0"
          style={{
            gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`,
            gridTemplateRows: `repeat(${rows}, ${cellSize}px)`,
          }}
        >
          {Array.from({ length: rows }, (_, row) =>
            Array.from({ length: cols }, (_, col) => {
              const key = `${row},${col}`;
              const isHighlighted = highlightSet.has(key);
              const CellTag = interactive ? 'button' : 'div';

              return (
                <CellTag
                  key={key}
                  role="gridcell"
                  aria-label={`Row ${row + 1}, Column ${col + 1}, ${isHighlighted ? 'highlighted' : 'empty'}`}
                  data-highlighted={isHighlighted}
                  onClick={() => toggleCell(row, col)}
                  style={{
                    width: cellSize,
                    height: cellSize,
                    borderRight: showGridLines ? '1px solid #E5E7EB' : 'none',
                    borderBottom: showGridLines ? '1px solid #E5E7EB' : 'none',
                    backgroundColor: isHighlighted ? '#76A5AF' : 'white',
                    transition: 'background-color 150ms',
                  }}
                  className={cn(
                    interactive && 'cursor-pointer focus:outline-none focus:ring-2 focus:ring-soft-blue focus:ring-inset',
                    isHighlighted && 'hover:opacity-80',
                    !isHighlighted && interactive && 'hover:bg-muted-teal/10',
                  )}
                />
              );
            }),
          )}
        </div>
      </div>

      {showCount && (
        <p className="text-base font-semibold text-slate-text" aria-live="polite">
          {mode === 'area'
            ? `Area: ${count} square${count !== 1 ? 's' : ''}`
            : `Perimeter: ${count} unit${count !== 1 ? 's' : ''}`}
        </p>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

- [ ] **Step 5: Add export to index.ts**

```typescript
export { GridCounter, type GridCounterProps } from "./GridCounter";
```

- [ ] **Step 6: Commit**

```bash
git add packages/ui/src/GridCounter.tsx packages/ui/src/__tests__/GridCounter.test.tsx packages/ui/src/index.ts
git commit -m "feat: add GridCounter component for Level B area/perimeter"
```

### Task 5: Story 14.4 — ChartReader Component

**Files:**
- Create: `packages/ui/src/ChartReader.tsx`
- Create: `packages/ui/src/__tests__/ChartReader.test.tsx`
- Modify: `packages/ui/src/index.ts` (add export)

- [ ] **Step 1: Write the failing test**

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { ChartReader } from '../ChartReader';

describe('ChartReader', () => {
  const data = [
    { label: 'Cricket', value: 8 },
    { label: 'Football', value: 5 },
    { label: 'Tennis', value: 3 },
  ];

  it('renders bar chart with correct number of bars', () => {
    const { container } = render(<ChartReader type="bar" data={data} />);
    const bars = container.querySelectorAll('[data-bar]');
    expect(bars.length).toBe(3);
  });

  it('shows value labels when showValues is true', () => {
    render(<ChartReader type="bar" data={data} showValues />);
    expect(screen.getByText('8')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('renders pictograph with emojis', () => {
    const { container } = render(
      <ChartReader type="pictograph" data={[{ label: 'Apples', value: 4, emoji: '🍎' }]} />
    );
    expect(screen.getByText('🍎')).toBeInTheDocument();
  });

  it('handles interactive selection', () => {
    const onSelect = jest.fn();
    render(<ChartReader type="bar" data={data} interactive onSelect={onSelect} />);
    const bars = screen.getAllByRole('button');
    fireEvent.click(bars[0]);
    expect(onSelect).toHaveBeenCalledWith('Cricket');
  });

  it('shows fallback for empty data', () => {
    render(<ChartReader type="bar" data={[]} />);
    expect(screen.getByText('No data to display')).toBeInTheDocument();
  });

  it('has accessible hidden data table', () => {
    const { container } = render(<ChartReader type="bar" data={data} />);
    const table = container.querySelector('table');
    expect(table).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

- [ ] **Step 3: Write ChartReader component**

```typescript
import { useState, useCallback, useMemo } from 'react';
import { cn } from './utils';

interface ChartDataItem {
  label: string;
  value: number;
  emoji?: string;
}

export interface ChartReaderProps {
  type: 'bar' | 'pictograph';
  data: ChartDataItem[];
  title?: string;
  showValues?: boolean;
  interactive?: boolean;
  maxValue?: number;
  onSelect?: (label: string) => void;
  selectedLabel?: string;
  className?: string;
}

export function ChartReader({
  type,
  data,
  title,
  showValues = true,
  interactive = false,
  maxValue,
  onSelect,
  selectedLabel,
  className,
}: ChartReaderProps) {
  const [localSelected, setLocalSelected] = useState<string | null>(null);
  const activeSelected = selectedLabel ?? localSelected;

  const chartMax = useMemo(
    () => maxValue ?? Math.max(...data.map((d) => d.value), 1),
    [maxValue, data],
  );

  const handleSelect = useCallback(
    (label: string) => {
      if (!interactive) return;
      setLocalSelected(label);
      onSelect?.(label);
    },
    [interactive, onSelect],
  );

  if (data.length === 0) {
    return (
      <div className={cn('flex items-center justify-center rounded-lg bg-warm-off-white p-6', className)}>
        <p className="text-base text-slate-text">No data to display</p>
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      {title && (
        <h3 className="text-xl font-semibold text-slate-text text-center">{title}</h3>
      )}

      {type === 'bar' ? (
        <div
          className="flex items-end justify-center gap-3 min-h-[200px]"
          role="img"
          aria-label={`Bar chart${title ? `: ${title}` : ''}. ${data.map((d) => `${d.label}: ${d.value}`).join(', ')}`}
        >
          {data.map((d) => {
            const heightPercent = (d.value / chartMax) * 100;
            const isSelected = activeSelected === d.label;
            return (
              <div key={d.label} className="flex flex-col items-center gap-1">
                <div className="flex flex-col items-center justify-end" style={{ height: 200 }}>
                  {showValues && (
                    <span className="text-sm font-medium text-slate-text">{d.value}</span>
                  )}
                  <button
                    data-bar
                    onClick={() => handleSelect(d.label)}
                    className={cn(
                      'w-12 rounded-t-sm transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-soft-blue',
                      isSelected ? 'ring-2 ring-muted-teal' : 'hover:brightness-110',
                    )}
                    style={{
                      height: `${heightPercent}%`,
                      minHeight: 4,
                      backgroundColor: '#5D87B1',
                    }}
                    aria-label={`${d.label}: ${d.value} units${isSelected ? ', selected' : ''}`}
                    disabled={!interactive}
                    role={interactive ? 'button' : 'img'}
                  />
                </div>
                <span className="text-base font-medium text-slate-text">{d.label}</span>
              </div>
            );
          })}
        </div>
      ) : (
        <div
          className="flex flex-col gap-4"
          role="img"
          aria-label={`Pictograph${title ? `: ${title}` : ''}. ${data.map((d) => `${d.label}: ${d.value}`).join(', ')}`}
        >
          {data.map((d) => {
            const isSelected = activeSelected === d.label;
            const emojiCount = Math.min(d.value, 20);
            return (
              <button
                key={d.label}
                onClick={() => handleSelect(d.label)}
                className={cn(
                  'flex items-center gap-3 rounded-lg p-2 transition-all duration-150',
                  isSelected && 'ring-2 ring-muted-teal bg-muted-teal/5',
                  interactive ? 'cursor-pointer hover:bg-muted-teal/5' : 'cursor-default',
                )}
                disabled={!interactive}
                role={interactive ? 'button' : 'img'}
                aria-label={`${d.label}: ${d.value}`}
              >
                <span className="w-20 text-right text-base font-medium text-slate-text">{d.label}</span>
                <div className="flex flex-wrap gap-0.5">
                  {Array.from({ length: emojiCount }, (_, i) => (
                    <span key={i} className="text-xl">{d.emoji ?? '■'}</span>
                  ))}
                </div>
                {showValues && (
                  <span className="text-sm text-muted-teal">({d.value})</span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Hidden data table for screen readers */}
      <table className="sr-only" aria-hidden="true">
        <caption>{title ?? 'Chart data'}</caption>
        <thead>
          <tr>
            <th>Category</th>
            <th>Value</th>
          </tr>
        </thead>
        <tbody>
          {data.map((d) => (
            <tr key={d.label}>
              <td>{d.label}</td>
              <td>{d.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

- [ ] **Step 5: Add export to index.ts**

```typescript
export { ChartReader, type ChartReaderProps } from "./ChartReader";
```

- [ ] **Step 6: Commit**

### Task 6: Story 14.5 — ClockWidget Component

**Files:**
- Create: `packages/ui/src/ClockWidget.tsx`
- Create: `packages/ui/src/__tests__/ClockWidget.test.tsx`
- Modify: `packages/ui/src/index.ts` (add export)

- [ ] **Step 1: Write the failing test**

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { ClockWidget } from '../ClockWidget';

describe('ClockWidget', () => {
  it('renders clock face with numbers', () => {
    render(<ClockWidget hour={3} minute={45} />);
    expect(screen.getByText('12')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('6')).toBeInTheDocument();
    expect(screen.getByText('9')).toBeInTheDocument();
  });

  it('shows digital time when showDigital is true', () => {
    render(<ClockWidget hour={3} minute={45} showDigital />);
    expect(screen.getByText('3:45')).toBeInTheDocument();
  });

  it('has accessible role img with time description', () => {
    render(<ClockWidget hour={10} minute={30} />);
    expect(screen.getByRole('img')).toHaveAttribute('aria-label', expect.stringContaining('10'));
  });

  it('renders slider controls for keyboard accessibility', () => {
    render(<ClockWidget hour={3} minute={45} interactive />);
    const sliders = screen.getAllByRole('slider');
    expect(sliders.length).toBe(2);
  });

  it('fires onTimeChange when slider changes', () => {
    const onChange = jest.fn();
    render(<ClockWidget hour={3} minute={45} interactive onTimeChange={onChange} />);
    const sliders = screen.getAllByRole('slider');
    fireEvent.change(sliders[0], { target: { value: '5' } });
    expect(onChange).toHaveBeenCalled();
  });

  it('pads single-digit minutes with zero in digital display', () => {
    render(<ClockWidget hour={2} minute={5} showDigital />);
    expect(screen.getByText('2:05')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

- [ ] **Step 3: Write ClockWidget component**

```typescript
import { useState, useCallback, useRef, useEffect } from 'react';
import { cn } from './utils';

export interface ClockWidgetProps {
  hour?: number;
  minute?: number;
  interactive?: boolean;
  mode?: 'read' | 'set';
  showDigital?: boolean;
  targetTime?: { hour: number; minute: number };
  onTimeChange?: (hour: number, minute: number) => void;
  size?: number;
  className?: string;
}

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

export function ClockWidget({
  hour: externalHour = 12,
  minute: externalMinute = 0,
  interactive = false,
  mode = 'read',
  showDigital = false,
  targetTime,
  onTimeChange,
  size = 250,
  className,
}: ClockWidgetProps) {
  const [hour, setHour] = useState(clamp(externalHour, 1, 12));
  const [minute, setMinute] = useState(clamp(externalMinute, 0, 59));
  const [dragging, setDragging] = useState<'hour' | 'minute' | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const center = size / 2;
  const radius = center - 20;
  const hourLength = radius * 0.4;
  const minuteLength = radius * 0.6;

  const hourAngle = ((hour % 12) / 12) * 360 + (minute / 60) * 30;
  const minuteAngle = (minute / 60) * 360;

  const currentDisplay = mode === 'set' && targetTime
    ? `${String(targetTime.hour).padStart(2, '0')}:${String(targetTime.minute).padStart(2, '0')}`
    : `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;

  const handlePointerMove = useCallback(
    (e: MouseEvent | TouchEvent) => {
      if (!dragging || !svgRef.current) return;
      e.preventDefault();
      const rect = svgRef.current.getBoundingClientRect();
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      const x = clientX - rect.left - center;
      const y = clientY - rect.top - center;
      let angle = (Math.atan2(y, x) * 180) / Math.PI + 90;
      if (angle < 0) angle += 360;

      if (dragging === 'hour') {
        const newHour = clamp(Math.round(angle / 30) || 12, 1, 12);
        setHour(newHour);
        onTimeChange?.(newHour, minute);
      } else {
        const newMinute = clamp(Math.round(angle / 6) * 5, 0, 59);
        setMinute(newMinute);
        onTimeChange?.(hour, newMinute);
      }
    },
    [dragging, center, hour, minute, onTimeChange],
  );

  const handlePointerUp = useCallback(() => {
    setDragging(null);
  }, []);

  useEffect(() => {
    if (dragging) {
      window.addEventListener('mousemove', handlePointerMove);
      window.addEventListener('mouseup', handlePointerUp);
      window.addEventListener('touchmove', handlePointerMove, { passive: false });
      window.addEventListener('touchend', handlePointerUp);
      return () => {
        window.removeEventListener('mousemove', handlePointerMove);
        window.removeEventListener('mouseup', handlePointerUp);
        window.removeEventListener('touchmove', handlePointerMove);
        window.removeEventListener('touchend', handlePointerUp);
      };
    }
  }, [dragging, handlePointerMove, handlePointerUp]);

  const numbers = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  const ticks = Array.from({ length: 60 }, (_, i) => i);

  function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
    const rad = ((angleDeg - 90) * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  }

  return (
    <div
      className={cn('flex flex-col items-center gap-3', className)}
      role="img"
      aria-label={`Clock showing ${currentDisplay}`}
    >
      <svg
        ref={svgRef}
        width={size}
        height={size}
        className="overflow-visible"
      >
        {/* Clock face */}
        <circle cx={center} cy={center} r={radius + 2} fill="white" stroke="#374151" strokeWidth={1} />

        {/* Minute ticks */}
        {ticks.map((t) => {
          const isMajor = t % 5 === 0;
          const tickLen = isMajor ? 8 : 4;
          const innerR = isMajor ? radius - 16 : radius - 10;
          const outer = polarToCartesian(center, center, radius - 2, (t / 60) * 360);
          const inner = polarToCartesian(center, center, innerR, (t / 60) * 360);
          return (
            <line
              key={t}
              x1={inner.x}
              y1={inner.y}
              x2={outer.x}
              y2={outer.y}
              stroke="#374151"
              strokeWidth={isMajor ? 1.5 : 0.5}
            />
          );
        })}

        {/* Hour numbers */}
        {numbers.map((n, i) => {
          const pos = polarToCartesian(center, center, radius - 24, (i / 12) * 360);
          return (
            <text
              key={n}
              x={pos.x}
              y={pos.y}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={18}
              fill="#374151"
              fontFamily="Inter, sans-serif"
            >
              {n}
            </text>
          );
        })}

        {/* Hour hand */}
        <g
          style={{ transform: `rotate(${hourAngle}deg)`, transformOrigin: `${center}px ${center}px` }}
          cursor={interactive && mode === 'set' ? 'grab' : 'default'}
          onMouseDown={() => interactive && mode === 'set' && setDragging('hour')}
          onTouchStart={() => interactive && mode === 'set' && setDragging('hour')}
        >
          <line
            x1={center}
            y1={center}
            x2={center}
            y2={center - hourLength}
            stroke="#374151"
            strokeWidth={4}
            strokeLinecap="round"
          />
        </g>

        {/* Minute hand */}
        <g
          style={{ transform: `rotate(${minuteAngle}deg)`, transformOrigin: `${center}px ${center}px` }}
          cursor={interactive && mode === 'set' ? 'grab' : 'default'}
          onMouseDown={() => interactive && mode === 'set' && setDragging('minute')}
          onTouchStart={() => interactive && mode === 'set' && setDragging('minute')}
        >
          <line
            x1={center}
            y1={center}
            x2={center}
            y2={center - minuteLength}
            stroke="#374151"
            strokeWidth={2}
            strokeLinecap="round"
          />
        </g>

        {/* Center dot */}
        <circle cx={center} cy={center} r={4} fill="#374151" />
      </svg>

      {/* Digital display */}
      {showDigital && (
        <p className="text-2xl font-semibold text-slate-text" aria-live="polite">
          {currentDisplay}
        </p>
      )}

      {/* Keyboard slider controls */}
      {interactive && mode === 'set' && (
        <div className="flex w-full max-w-xs flex-col gap-2">
          <label className="text-sm text-slate-text">
            Hour: {hour}
            <input
              type="range"
              min={1}
              max={12}
              step={1}
              value={hour}
              onChange={(e) => {
                const v = parseInt(e.target.value, 10);
                setHour(v);
                onTimeChange?.(v, minute);
              }}
              className="w-full"
              aria-label="Set hour"
              role="slider"
            />
          </label>
          <label className="text-sm text-slate-text">
            Minute: {minute}
            <input
              type="range"
              min={0}
              max={59}
              step={5}
              value={minute}
              onChange={(e) => {
                const v = parseInt(e.target.value, 10);
                setMinute(v);
                onTimeChange?.(hour, v);
              }}
              className="w-full"
              aria-label="Set minute"
              role="slider"
            />
          </label>
        </div>
      )}

      {mode === 'set' && targetTime && (
        <p className="text-sm text-muted-teal">
          Set the clock to {targetTime.hour}:{String(targetTime.minute).padStart(2, '0')}
        </p>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

- [ ] **Step 5: Add export to index.ts**

```typescript
export { ClockWidget, type ClockWidgetProps } from "./ClockWidget";
```

- [ ] **Step 6: Commit**

### Task 7: Story 14.6 — ScaleReader Component

**Files:**
- Create: `packages/ui/src/ScaleReader.tsx`
- Create: `packages/ui/src/__tests__/ScaleReader.test.tsx`
- Modify: `packages/ui/src/index.ts` (add export)

- [ ] **Step 1: Write the failing test**

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { ScaleReader } from '../ScaleReader';

describe('ScaleReader', () => {
  it('renders ruler with marks', () => {
    const { container } = render(<ScaleReader type="ruler" min={0} max={10} step={1} unit="cm" />);
    expect(screen.getByRole('img')).toBeInTheDocument();
  });

  it('renders thermometer with liquid', () => {
    const { container } = render(<ScaleReader type="thermometer" min={0} max={100} step={10} unit="°C" value={50} />);
    expect(screen.getByRole('img')).toBeInTheDocument();
  });

  it('renders cylinder with liquid', () => {
    const { container } = render(<ScaleReader type="cylinder" min={0} max={50} step={5} unit="mL" value={25} />);
    expect(screen.getByRole('img')).toBeInTheDocument();
  });

  it('shows reading when showReading is true', () => {
    render(<ScaleReader type="ruler" min={0} max={10} step={1} unit="cm" value={5} showReading />);
    expect(screen.getByText(/5\s*cm/)).toBeInTheDocument();
  });

  it('shows error for invalid range', () => {
    render(<ScaleReader type="ruler" min={10} max={0} step={1} unit="cm" />);
    expect(screen.getByText('Invalid scale range')).toBeInTheDocument();
  });

  it('fires onValueChange when interactive slider changes', () => {
    const onChange = jest.fn();
    render(<ScaleReader type="ruler" min={0} max={10} step={1} unit="cm" interactive onValueChange={onChange} />);
    const slider = screen.getByRole('slider');
    fireEvent.change(slider, { target: { value: '5' } });
    expect(onChange).toHaveBeenCalledWith(5);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

- [ ] **Step 3: Write ScaleReader component**

```typescript
import { useState, useCallback, useRef, useEffect } from 'react';
import { cn } from './utils';

export interface ScaleReaderProps {
  type: 'ruler' | 'thermometer' | 'cylinder';
  min: number;
  max: number;
  step: number;
  unit: string;
  value?: number;
  interactive?: boolean;
  targetValue?: number;
  onValueChange?: (value: number) => void;
  showReading?: boolean;
  showLabels?: boolean;
  height?: number;
  width?: number;
  className?: string;
}

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

export function ScaleReader({
  type,
  min,
  max,
  step,
  unit,
  value: externalValue,
  interactive = false,
  targetValue,
  onValueChange,
  showReading = false,
  showLabels = true,
  height = 250,
  width = 300,
  className,
}: ScaleReaderProps) {
  const [localValue, setLocalValue] = useState(externalValue ?? min);
  const value = externalValue !== undefined ? clamp(externalValue, min, max) : clamp(localValue, min, max);
  const [dragging, setDragging] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);

  if (min >= max) {
    return (
      <div className={cn('flex items-center justify-center rounded-lg bg-warm-off-white p-4', className)}>
        <p className="text-base text-slate-text" role="alert">Invalid scale range</p>
      </div>
    );
  }

  const range = max - min;
  const ratio = range > 0 ? (value - min) / range : 0;

  const setValue = useCallback(
    (v: number) => {
      const clamped = clamp(Math.round(v / step) * step, min, max);
      if (externalValue === undefined) setLocalValue(clamped);
      onValueChange?.(clamped);
    },
    [step, min, max, externalValue, onValueChange],
  );

  if (type === 'ruler') {
    const rulerHeight = 60;
    const padding = 20;
    const scaleWidth = width - padding * 2;
    const svgHeight = rulerHeight;
    const marksCount = Math.floor(range / step);

    return (
      <div className={cn('flex flex-col items-center gap-2', className)}>
        <svg
          ref={svgRef}
          width={width}
          height={svgHeight}
          role="img"
          aria-label={`Ruler from ${min} to ${max} ${unit}, reading ${value} ${unit}`}
        >
          {/* Ruler body */}
          <rect x={0} y={5} width={width} height={rulerHeight - 10} fill="#F9F7F2" stroke="#374151" strokeWidth={1} rx={4} />

          {/* Major marks */}
          {Array.from({ length: marksCount + 1 }, (_, i) => {
            const x = padding + (i / marksCount) * scaleWidth;
            return (
              <g key={`major-${i}`}>
                <line x1={x} y1={5} x2={x} y2={rulerHeight - 5} stroke="#374151" strokeWidth={1.5} />
                {showLabels && (
                  <text x={x} y={rulerHeight - 12} textAnchor="middle" fontSize={10} fill="#374151" fontFamily="Inter, sans-serif">
                    {min + i * step}
                  </text>
                )}
              </g>
            );
          })}

          {/* Minor marks (5 per major step) */}
          {Array.from({ length: marksCount }, (_, majorIdx) =>
            Array.from({ length: 4 }, (_, minorIdx) => {
              const x = padding + (majorIdx / marksCount) * scaleWidth + ((minorIdx + 1) / (marksCount * 5)) * scaleWidth * 5;
              return (
                <line
                  key={`minor-${majorIdx}-${minorIdx}`}
                  x1={x}
                  y1={5}
                  x2={x}
                  y2={rulerHeight - 20}
                  stroke="#374151"
                  strokeWidth={0.5}
                />
              );
            }),
          )}

          {/* Indicator arrow */}
          {interactive && (
            <g>
              <line
                x1={padding + ratio * scaleWidth}
                y1={5}
                x2={padding + ratio * scaleWidth}
                y2={rulerHeight - 5}
                stroke="#5D87B1"
                strokeWidth={3}
                strokeLinecap="round"
              />
              <polygon
                points={`${padding + ratio * scaleWidth - 5},10 ${padding + ratio * scaleWidth + 5},10 ${padding + ratio * scaleWidth},18`}
                fill="#5D87B1"
              />
            </g>
          )}
        </svg>

        {showReading && (
          <p className="text-lg font-semibold text-slate-text" aria-live="polite">
            {value} {unit}
          </p>
        )}

        {interactive && (
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => setValue(Number(e.target.value))}
            className="w-full max-w-xs"
            aria-label={`${type} value`}
            role="slider"
          />
        )}
      </div>
    );
  }

  // Vertical scales: thermometer or cylinder
  const verticalScaleHeight = height - 40;
  const scalePadding = 40;
  const scaleLeft = 50;
  const marksCountVert = Math.floor(range / step);

  function renderVerticalScale() {
    const liquidHeight = ratio * verticalScaleHeight;
    const liquidColor = type === 'thermometer' ? '#E5989B' : '#5D87B1';
    const bulbRadius = type === 'thermometer' ? 15 : 10;
    const columnWidth = type === 'cylinder' ? 30 : 16;
    const columnX = scaleLeft + (type === 'cylinder' ? -15 : -8);

    return (
      <svg
        ref={svgRef}
        width={width}
        height={height}
        role="img"
        aria-label={`${type === 'thermometer' ? 'Thermometer' : 'Measuring cylinder'} from ${min} to ${max} ${unit}, reading ${value} ${unit}`}
      >
        {/* Scale marks on the left */}
        {Array.from({ length: marksCountVert + 1 }, (_, i) => {
          const y = height - 20 - (i / marksCountVert) * verticalScaleHeight;
          return (
            <g key={`vmajor-${i}`}>
              <line x1={scaleLeft - 15} y1={y} x2={scaleLeft} y2={y} stroke="#374151" strokeWidth={1.5} />
              {showLabels && (
                <text x={scaleLeft - 20} y={y + 4} textAnchor="end" fontSize={10} fill="#374151" fontFamily="Inter, sans-serif">
                  {min + i * step}
                </text>
              )}
            </g>
          );
        })}

        {/* Minor marks */}
        {Array.from({ length: marksCountVert }, (_, majorIdx) =>
          Array.from({ length: 4 }, (_, minorIdx) => {
            const y = height - 20 - ((majorIdx * 5 + minorIdx + 1) / (marksCountVert * 5)) * verticalScaleHeight * 5;
            return (
              <line key={`vminor-${majorIdx}-${minorIdx}`} x1={scaleLeft - 8} y1={y} x2={scaleLeft} y2={y} stroke="#374151" strokeWidth={0.5} />
            );
          }),
        )}

        <!-- Liquid column -->
        {liquidHeight > 0 && (
          <rect
            x={columnX}
            y={height - 20 - liquidHeight}
            width={columnWidth}
            height={liquidHeight}
            fill={liquidColor}
            rx={type === 'cylinder' ? 0 : 2}
            opacity={0.8}
          />
        )}

        <!-- Bulb for thermometer -->
        {type === 'thermometer' && (
          <circle cx={scaleLeft} cy={height - 15} r={bulbRadius} fill="#E5989B" />
        )}

        <!-- Container outline -->
        {type === 'cylinder' && (
          <rect x={columnX - 2} y={height - 20 - verticalScaleHeight} width={columnWidth + 4} height={verticalScaleHeight} fill="none" stroke="#374151" strokeWidth={1} rx={2} />
        )}

        <!-- Interactive indicator arrow -->
        {interactive && (
          <g>
            <line
              x1={scaleLeft + 10}
              y1={height - 20 - liquidHeight}
              x2={scaleLeft + 25}
              y2={height - 20 - liquidHeight}
              stroke="#5D87B1"
              strokeWidth={3}
              strokeLinecap="round"
            />
            <polygon
              points={`${scaleLeft + 30},${height - 20 - liquidHeight} ${scaleLeft + 25},${height - 20 - liquidHeight - 5} ${scaleLeft + 25},${height - 20 - liquidHeight + 5}`}
              fill="#5D87B1"
            />
          </g>
        )}

        <!-- Unit label -->
        <text x={scaleLeft} y={height - 5} textAnchor="middle" fontSize={12} fill="#374151" fontFamily="Inter, sans-serif">
          {unit}
        </text>
      </svg>
    );
  }

  return (
    <div className={cn('flex flex-col items-center gap-2', className)}>
      {renderVerticalScale()}

      {showReading && (
        <p className="text-lg font-semibold text-slate-text" aria-live="polite">
          {value} {unit}
        </p>
      )}

      {interactive && (
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => setValue(Number(e.target.value))}
          className="w-full max-w-xs"
          aria-label={`${type === 'thermometer' ? 'Temperature' : 'Volume'} value`}
          role="slider"
        />
      )}
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

- [ ] **Step 5: Add export to index.ts**

```typescript
export { ScaleReader, type ScaleReaderProps } from "./ScaleReader";
```

- [ ] **Step 6: Commit**

### Task 8: Story 14.7 — FillBlank Component

**Files:**
- Create: `packages/ui/src/FillBlank.tsx`
- Create: `packages/ui/src/__tests__/FillBlank.test.tsx`
- Modify: `packages/ui/src/index.ts` (add export)

- [ ] **Step 1: Write the failing test**

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { FillBlank } from '../FillBlank';

describe('FillBlank', () => {
  it('renders template with blank placeholders', () => {
    render(
      <FillBlank
        template="3 + ___ = 8"
        blanks={[{ id: 'b1', position: 0, correctAnswer: '5', options: ['4', '5', '6'] }]}
        mode="select"
      />
    );
    expect(screen.getByText('3 +')).toBeInTheDocument();
    expect(screen.getByText('= 8')).toBeInTheDocument();
  });

  it('renders option buttons in select mode', () => {
    render(
      <FillBlank
        template="___ + 2 = 7"
        blanks={[{ id: 'b1', position: 0, correctAnswer: '5', options: ['3', '5', '7'] }]}
        mode="select"
      />
    );
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('renders input fields in type mode', () => {
    render(
      <FillBlank
        template="5 + ___ = 9"
        blanks={[{ id: 'b1', position: 0, correctAnswer: '4' }]}
        mode="type"
      />
    );
    const inputs = screen.getAllByRole('textbox');
    expect(inputs.length).toBe(1);
  });

  it('fires onComplete when all blanks filled', () => {
    const onComplete = jest.fn();
    render(
      <FillBlank
        template="___ + ___ = 10"
        blanks={[
          { id: 'b1', position: 0, correctAnswer: '3', options: ['2', '3', '4'] },
          { id: 'b2', position: 1, correctAnswer: '7', options: ['6', '7', '8'] },
        ]}
        mode="select"
        onComplete={onComplete}
      />
    );
    const buttons = screen.getAllByRole('button');
    // Click first option for each blank
    fireEvent.click(buttons[0]);
    fireEvent.click(buttons[3]);
    expect(onComplete).toHaveBeenCalled();
  });

  it('has accessible labels on blanks', () => {
    render(
      <FillBlank
        template="___ + 3 = 7"
        blanks={[{ id: 'b1', position: 0, correctAnswer: '4', options: ['2', '4', '6'] }]}
        mode="select"
      />
    );
    expect(screen.getByLabelText(/Blank 1/)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

- [ ] **Step 3: Write FillBlank component**

```typescript
import { useState, useCallback } from 'react';
import { cn } from './utils';

interface BlankDef {
  id: string;
  position: number;
  correctAnswer: string | number;
  options?: (string | number)[];
}

export interface FillBlankProps {
  template: string;
  blanks: BlankDef[];
  mode?: 'select' | 'type';
  onComplete?: (answers: Record<string, string | number>) => void;
  showResult?: boolean;
  className?: string;
}

export function FillBlank({
  template,
  blanks,
  mode = 'select',
  onComplete,
  showResult = false,
  className,
}: FillBlankProps) {
  const segments = template.split('___');
  const [filledAnswers, setFilledAnswers] = useState<Record<string, string | number>>({});
  const [activeBlank, setActiveBlank] = useState<string | null>(null);
  const [flashState, setFlashState] = useState<'correct' | 'incorrect' | null>(null);

  const handleFillBlank = useCallback(
    (blankId: string, answer: string | number) => {
      const newAnswers = { ...filledAnswers, [blankId]: answer };
      setFilledAnswers(newAnswers);
      setActiveBlank(null);

      const allFilled = blanks.every((b) => newAnswers[b.id] !== undefined);
      if (allFilled && onComplete) {
        onComplete(newAnswers);

        if (showResult) {
          const allCorrect = blanks.every(
            (b) => String(newAnswers[b.id]) === String(b.correctAnswer),
          );
          setFlashState(allCorrect ? 'correct' : 'incorrect');
          setTimeout(() => setFlashState(null), 1200);
        }
      }
    },
    [filledAnswers, blanks, onComplete, showResult],
  );

  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-2 text-xl text-slate-text',
        flashState === 'correct' && 'bg-muted-green/10 rounded-lg p-3',
        flashState === 'incorrect' && 'bg-soft-amber/10 rounded-lg p-3',
        className,
      )}
      aria-live="polite"
    >
      {segments.map((seg, idx) => (
        <span key={idx} className="flex items-center gap-1">
          {seg && <span>{seg}</span>}
          {idx < blanks.length && (
            <span className="relative inline-flex items-center">
              {mode === 'select' ? (
                <span className="relative">
                  <button
                    onClick={() =>
                      filledAnswers[blanks[idx].id]
                        ? handleFillBlank(blanks[idx].id, '')
                        : setActiveBlank(activeBlank === blanks[idx].id ? null : blanks[idx].id)
                    }
                    className={cn(
                      'inline-flex min-w-[60px] items-center justify-center border-b-2 px-2 py-1 text-lg font-bold transition-colors duration-200',
                      filledAnswers[blanks[idx].id]
                        ? 'border-solid border-soft-blue text-slate-text'
                        : 'border-dashed border-soft-blue text-slate-text/50',
                    )}
                    aria-label={`Blank ${idx + 1}${filledAnswers[blanks[idx].id] ? `: ${filledAnswers[blanks[idx].id]}` : ', fill in the missing value'}`}
                  >
                    {filledAnswers[blanks[idx].id] ?? '___'}
                  </button>
                  {activeBlank === blanks[idx].id && blanks[idx].options && (
                    <span
                      className="absolute left-1/2 top-full z-10 mt-1 flex -translate-x-1/2 gap-1 rounded-lg bg-white p-1 shadow-lg"
                      role="radiogroup"
                      aria-label={`Options for blank ${idx + 1}`}
                    >
                      {blanks[idx].options!.map((opt) => (
                        <button
                          key={String(opt)}
                          onClick={() => handleFillBlank(blanks[idx].id, opt)}
                          className="flex h-14 min-w-[56px] items-center justify-center rounded-lg border-2 border-soft-blue bg-white px-3 text-lg font-bold text-slate-text hover:bg-soft-blue/10 focus:outline-none focus:ring-2 focus:ring-soft-blue"
                          role="option"
                          aria-label={`${opt}`}
                        >
                          {opt}
                        </button>
                      ))}
                    </span>
                  )}
                </span>
              ) : (
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={filledAnswers[blanks[idx].id] ?? ''}
                  onChange={(e) => handleFillBlank(blanks[idx].id, e.target.value)}
                  className="w-16 border-b-2 border-dashed border-soft-blue bg-transparent text-center text-lg font-bold text-slate-text focus:border-solid focus:outline-none"
                  aria-label={`Blank ${idx + 1}, fill in the missing value`}
                  role="textbox"
                />
              )}
            </span>
          )}
        </span>
      ))}
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

- [ ] **Step 5: Add export to index.ts**

```typescript
export { FillBlank, type FillBlankProps } from "./FillBlank";
```

- [ ] **Step 6: Commit**

### Task 9: Story 14.8 — ActivityRenderer & Evaluator Integration

**Files:**
- Modify: `packages/ui/src/ActivityRenderer.tsx` (add 7 new cases + normalizeContent)
- Modify: `packages/ui/src/activity-utils.ts` (add 7 new evaluateActivity cases)
- Modify: `packages/ui/src/index.ts` (ensure all exports)
- Modify: `packages/ui/src/copy.ts` (add new type descriptions)
- Modify: `packages/db/src/curriculum-pipeline.ts` (extend VALID_ACTIVITY_TYPES)
- Modify: `apps/student/pages/learn/[conceptId].tsx` (extend STEP_ACTIVITY_TYPES and ACTIVITY_WORK_LABELS)
- Modify: `apps/student/lib/mockData.ts` (add mock data for new types, extend Activity type union)

- [ ] **Step 1: Update `packages/ui/src/copy.ts`**

Add to the COPY object:
```typescript
  completionFractionVisual: "Shade the correct number of parts",
  completionPlaceValue: "Place digits in the correct columns",
  completionGridArea: "Count the squares",
  completionChartReader: "Read the chart data",
  completionClockTime: "Show the correct time",
  completionMeasurementScale: "Read the measurement",
  completionFillBlank: "Fill in all the blanks",
```

- [ ] **Step 2: Update `packages/ui/src/ActivityRenderer.tsx`**

Add imports:
```typescript
import { FractionVisualizer } from "./FractionVisualizer";
import { PlaceValueChart } from "./PlaceValueChart";
import { GridCounter } from "./GridCounter";
import { ChartReader } from "./ChartReader";
import { ClockWidget } from "./ClockWidget";
import { ScaleReader } from "./ScaleReader";
import { FillBlank } from "./FillBlank";
```

Add cases to the switch statement (before `default:`):

```typescript
      case "fraction_visual":
        return (
          <FractionVisualizer
            numerator={(normalizedContent.numerator as number) ?? 1}
            denominator={(normalizedContent.denominator as number) ?? 2}
            mode={(normalizedContent.mode as 'bar' | 'circle') ?? 'bar'}
            label={normalizedContent.label as string}
            showLabel={(normalizedContent.showLabel as boolean) ?? false}
            interactive={(normalizedContent.interactive as boolean) ?? false}
            compare={normalizedContent.compare as { numerator: number; denominator: number } | undefined}
            onShade={(shaded) => handleComplete({ shaded })}
          />
        );

      case "place_value_chart":
        return (
          <PlaceValueChart
            maxPlaces={(normalizedContent.maxPlaces as 'lakh' | 'crore') ?? 'crore'}
            digits={normalizedContent.digits as (number | null)[]}
            interactive={(normalizedContent.interactive as boolean) ?? false}
            draggableDigits={normalizedContent.draggableDigits as number[]}
            targetNumber={normalizedContent.targetNumber as number}
            onPlaceDigit={(col, digit) => {
              // accumulate placed digits
            }}
          />
        );

      case "grid_area":
        return (
          <GridCounter
            rows={(normalizedContent.rows as number) ?? 5}
            cols={(normalizedContent.cols as number) ?? 5}
            highlighted={normalizedContent.highlighted as { row: number; col: number }[]}
            mode={(normalizedContent.mode as 'area' | 'perimeter') ?? 'area'}
            interactive={(normalizedContent.interactive as boolean) ?? false}
            maxHighlights={normalizedContent.maxHighlights as number}
            cellSize={(normalizedContent.cellSize as number) ?? 40}
            showCount
            onHighlight={(cells) => handleComplete({ highlighted: cells, count: cells.length })}
          />
        );

      case "chart_reader":
        return (
          <ChartReader
            type={(normalizedContent.type as 'bar' | 'pictograph') ?? 'bar'}
            data={(normalizedContent.data as { label: string; value: number; emoji?: string }[]) ?? []}
            title={normalizedContent.title as string}
            showValues={(normalizedContent.showValues as boolean) ?? true}
            interactive={(normalizedContent.interactive as boolean) ?? false}
            onSelect={(label) => handleComplete({ selectedLabel: label })}
          />
        );

      case "clock_time":
        return (
          <ClockWidget
            hour={(normalizedContent.hour as number) ?? 12}
            minute={(normalizedContent.minute as number) ?? 0}
            interactive={(normalizedContent.interactive as boolean) ?? false}
            mode={(normalizedContent.mode as 'read' | 'set') ?? 'read'}
            showDigital={(normalizedContent.showDigital as boolean) ?? true}
            targetTime={normalizedContent.targetTime as { hour: number; minute: number } | undefined}
            onTimeChange={(h, m) => handleComplete({ hour: h, minute: m })}
          />
        );

      case "measurement_scale":
        return (
          <ScaleReader
            type={(normalizedContent.type as 'ruler' | 'thermometer' | 'cylinder') ?? 'ruler'}
            min={(normalizedContent.min as number) ?? 0}
            max={(normalizedContent.max as number) ?? 10}
            step={(normalizedContent.step as number) ?? 1}
            unit={(normalizedContent.unit as string) ?? 'cm'}
            value={normalizedContent.value as number | undefined}
            interactive={(normalizedContent.interactive as boolean) ?? false}
            targetValue={normalizedContent.targetValue as number | undefined}
            showReading
            onValueChange={(v) => handleComplete({ value: v })}
          />
        );

      case "fill_blank":
        return (
          <FillBlank
            template={(normalizedContent.template as string) ?? ''}
            blanks={(normalizedContent.blanks as { id: string; position: number; correctAnswer: string | number; options?: (string | number)[] }[]) ?? []}
            mode={(normalizedContent.mode as 'select' | 'type') ?? 'select'}
            onComplete={(answers) => handleComplete({ answers })}
          />
        );
```

Add normalizeContent cases (inside the existing normalizeContent function):
```typescript
  if (t === "fraction_visual") {
    if (n.denominator && n.maxDenominator && (n.denominator as number) > (n.maxDenominator as number)) {
      // handled by component
    }
  }
```

- [ ] **Step 3: Update `packages/ui/src/activity-utils.ts`**

Add cases to the switch statement in `evaluateActivity`:

```typescript
    case "fraction_visual": {
      const shaded = response.shaded as number | undefined;
      const expectedNumerator = content.numerator as number | undefined;
      return {
        correct: shaded === expectedNumerator,
      };
    }

    case "place_value_chart": {
      // For place_value_chart, we check if digits match target
      const placedDigits = response.digits as (number | null)[] | undefined;
      const targetNumber = content.targetNumber as number | undefined;
      if (!targetNumber || !placedDigits) return { correct: false };
      const targetStr = String(targetNumber).padStart(placedDigits.length, '0');
      const placedStr = placedDigits.map((d) => d ?? 0).join('');
      return { correct: placedStr === targetStr };
    }

    case "grid_area": {
      const count = response.count as number | undefined;
      const highlighted = response.highlighted as { row: number; col: number }[] | undefined;
      return {
        correct: count !== undefined && highlighted !== undefined && count === highlighted.length,
      };
    }

    case "chart_reader": {
      const selectedLabel = response.selectedLabel as string | undefined;
      const expectedLabel = content.correctLabel as string | undefined;
      return {
        correct: selectedLabel !== undefined && selectedLabel === expectedLabel,
      };
    }

    case "clock_time": {
      const setHour = response.hour as number | undefined;
      const setMinute = response.minute as number | undefined;
      const targetTime = content.targetTime as { hour: number; minute: number } | undefined;
      if (!setHour || !setMinute || !targetTime) return { correct: false };
      const hourMatch = setHour === targetTime.hour;
      const minuteDiff = Math.abs(setMinute - targetTime.minute);
      return {
        correct: hourMatch && minuteDiff <= 5, // 5-minute tolerance
      };
    }

    case "measurement_scale": {
      const setValue = response.value as number | undefined;
      const targetValue = content.targetValue as number | undefined;
      if (setValue === undefined || targetValue === undefined) return { correct: false };
      const diff = Math.abs(setValue - targetValue);
      const step = content.step as number ?? 1;
      return {
        correct: diff <= step, // 1 step tolerance
      };
    }

    case "fill_blank": {
      const answers = response.answers as Record<string, string | number> | undefined;
      const blanks = content.blanks as { id: string; correctAnswer: string | number }[] | undefined;
      if (!answers || !blanks) return { correct: false };
      const allCorrect = blanks.every(
        (b) => String(answers[b.id]) === String(b.correctAnswer),
      );
      return { correct: allCorrect };
    }
```

- [ ] **Step 4: Update `packages/db/src/curriculum-pipeline.ts`**

Extend `VALID_ACTIVITY_TYPES`:
```typescript
const VALID_ACTIVITY_TYPES = [
  'visual_counting',
  'matching',
  'drag_drop',
  'sequencing',
  'multiple_choice',
  'story_question',
  'real_world',
  'fraction_visual',
  'place_value_chart',
  'grid_area',
  'chart_reader',
  'clock_time',
  'measurement_scale',
  'fill_blank',
] as const;
```

- [ ] **Step 5: Update `apps/student/pages/learn/[conceptId].tsx`**

Extend `STEP_ACTIVITY_TYPES`:
```typescript
const STEP_ACTIVITY_TYPES: Record<number, string[]> = {
  0: ["visual_counter", "visual_counting", "story_question", "fraction_visual", "place_value_chart", "grid_area", "chart_reader", "clock_time", "measurement_scale"],
  1: ["matching", "story_question", "fraction_visual", "place_value_chart", "grid_area", "clock_time", "measurement_scale", "fill_blank"],
  2: ["sequencing", "drag_drop", "matching", "fraction_visual", "place_value_chart", "grid_area", "chart_reader", "fill_blank"],
  3: ["multiple_choice", "fill_blank"],
};
```

Extend `ACTIVITY_WORK_LABELS`:
```typescript
  fraction_visual: COPY.completionFractionVisual,
  place_value_chart: COPY.completionPlaceValue,
  grid_area: COPY.completionGridArea,
  chart_reader: COPY.completionChartReader,
  clock_time: COPY.completionClockTime,
  measurement_scale: COPY.completionMeasurementScale,
  fill_blank: COPY.completionFillBlank,
```

- [ ] **Step 6: Update `apps/student/lib/mockData.ts`**

Extend the `Activity` type union:
```typescript
export interface Activity {
  id: string;
  type: "visual-counter" | "matching" | "multiple-choice" | "sequencing" | "drag-drop" | "story-question" | "real-world-task" | "fraction-visual" | "place-value-chart" | "grid-area" | "chart-reader" | "clock-time" | "measurement-scale" | "fill-blank";
  title: string;
  config: Record<string, unknown>;
  step?: string;
  order?: number;
}
```

Add mock examples for new types in a Level B Math subject:
```typescript
{
  id: "level-b-math",
  title: "Level B Math",
  description: "Advanced math concepts",
  emoji: "📐",
  chapters: [
    {
      id: "fractions",
      title: "Fractions",
      description: "Understanding fractions",
      concepts: [
        {
          id: "fractions-intro",
          title: "Introduction to Fractions",
          description: "Learn about fractions as parts of a whole",
          activities: [
            {
              id: "fraction-demo",
              type: "fraction-visual",
              title: "Understanding 3/4",
              step: "observe",
              order: 1,
              config: { numerator: 3, denominator: 4, mode: "bar", showLabel: true },
            },
            {
              id: "fraction-gp",
              type: "fraction-visual",
              title: "Shade 1/2",
              step: "guided_practice",
              order: 2,
              config: { numerator: 1, denominator: 2, mode: "circle", interactive: true },
            },
            {
              id: "fraction-mc",
              type: "multiple-choice",
              title: "Fraction Quiz",
              step: "mastery_check",
              order: 3,
              config: {
                question: "Which fraction is shaded? (3 out of 4 parts)",
                options: [
                  { id: "a", label: "1/4" },
                  { id: "b", label: "3/4" },
                  { id: "c", label: "4/3" },
                ],
                correctIndex: 1,
              },
            },
          ],
        },
      ],
    },
    {
      id: "measurement",
      title: "Measurement",
      description: "Learn to measure length, weight, volume, and time",
      concepts: [
        {
          id: "telling-time",
          title: "Telling Time",
          description: "Learn to read analog clocks",
          activities: [
            {
              id: "clock-demo",
              type: "clock-time",
              title: "Reading a Clock",
              step: "observe",
              order: 1,
              config: { hour: 3, minute: 45, showDigital: true },
            },
            {
              id: "clock-gp",
              type: "clock-time",
              title: "Set the Clock",
              step: "guided_practice",
              order: 2,
              config: { hour: 7, minute: 30, mode: "set", interactive: true, targetTime: { hour: 7, minute: 30 } },
            },
            {
              id: "clock-mc",
              type: "multiple-choice",
              title: "Time Quiz",
              step: "mastery_check",
              order: 3,
              config: {
                question: "What time is shown? (Clock shows 8:15)",
                options: [
                  { id: "a", label: "8:00" },
                  { id: "b", label: "8:15" },
                  { id: "c", label: "8:30" },
                ],
                correctIndex: 1,
              },
            },
          ],
        },
        {
          id: "temperature-reading",
          title: "Reading Temperature",
          description: "Learn to read a thermometer",
          activities: [
            {
              id: "thermometer-demo",
              type: "measurement-scale",
              title: "Reading a Thermometer",
              step: "observe",
              order: 1,
              config: { type: "thermometer", min: 0, max: 100, step: 10, unit: "°C", value: 37, showReading: true },
            },
            {
              id: "ruler-demo",
              type: "measurement-scale",
              title: "Measuring with a Ruler",
              step: "independent_practice",
              order: 2,
              config: { type: "ruler", min: 0, max: 10, step: 1, unit: "cm", value: 5, interactive: true },
            },
          ],
        },
      ],
    },
    {
      id: "place-value",
      title: "Place Value",
      description: "Understanding place values up to crore",
      concepts: [
        {
          id: "place-value-intro",
          title: "Place Value Chart",
          description: "Learn about place values",
          activities: [
            {
              id: "pv-demo",
              type: "place-value-chart",
              title: "Place Value: Crores",
              step: "observe",
              order: 1,
              config: { maxPlaces: "crore", digits: [1, 2, 3, 4, 5, 6, 7, 8], targetNumber: 12345678 },
            },
            {
              id: "pv-gp",
              type: "place-value-chart",
              title: "Fill the Chart",
              step: "guided_practice",
              order: 2,
              config: { maxPlaces: "lakh", interactive: true, draggableDigits: [1, 5, 3, 2, 7, 0] },
            },
          ],
        },
      ],
    },
    {
      id: "data-handling",
      title: "Data Handling",
      description: "Reading charts and graphs",
      concepts: [
        {
          id: "bar-chart-reading",
          title: "Reading Bar Charts",
          description: "Learn to read bar charts",
          activities: [
            {
              id: "chart-demo",
              type: "chart-reader",
              title: "Favorite Sports",
              step: "observe",
              order: 1,
              config: {
                type: "bar",
                data: [
                  { label: "Cricket", value: 8 },
                  { label: "Football", value: 5 },
                  { label: "Tennis", value: 3 },
                ],
                title: "Favorite Sports",
                showValues: true,
              },
            },
          ],
        },
      ],
    },
    {
      id: "geometry",
      title: "Perimeter & Area",
      description: "Counting area on a grid",
      concepts: [
        {
          id: "area-grid",
          title: "Area by Counting Squares",
          description: "Count squares to find area",
          activities: [
            {
              id: "grid-demo",
              type: "grid-area",
              title: "Area: 6 squares",
              step: "observe",
              order: 1,
              config: { rows: 3, cols: 4, highlighted: [{ row: 0, col: 0 }, { row: 0, col: 1 }, { row: 1, col: 0 }, { row: 1, col: 1 }, { row: 2, col: 0 }, { row: 2, col: 1 }], mode: "area", showCount: true },
            },
            {
              id: "grid-gp",
              type: "grid-area",
              title: "Find the Area",
              step: "guided_practice",
              order: 2,
              config: { rows: 4, cols: 5, mode: "area", interactive: true, maxHighlights: 8, showCount: true },
            },
          ],
        },
      ],
    },
    {
      id: "equations",
      title: "Equations & Sequences",
      description: "Fill in missing numbers",
      concepts: [
        {
          id: "fill-blank-intro",
          title: "Fill in the Blanks",
          description: "Complete equations and sequences",
          activities: [
            {
              id: "fb-demo",
              type: "fill-blank",
              title: "Complete the Equation",
              step: "guided_practice",
              order: 1,
              config: {
                template: "3 + ___ = 8",
                blanks: [{ id: "b1", position: 0, correctAnswer: "5", options: ["4", "5", "6"] }],
                mode: "select",
              },
            },
            {
              id: "fb-ip",
              type: "fill-blank",
              title: "Number Pattern",
              step: "independent_practice",
              order: 2,
              config: {
                template: "2, 4, ___, 8",
                blanks: [{ id: "b1", position: 0, correctAnswer: "6", options: ["5", "6", "7"] }],
                mode: "select",
              },
            },
          ],
        },
      ],
    },
  ],
},
```

- [ ] **Step 7: Verify build passes**

Run: `pnpm build` — Expected: All packages build successfully

- [ ] **Step 8: Run tests**

Run: `pnpm --filter @learn-easy/ui test` — Expected: All tests pass (existing + new)

- [ ] **Step 9: Commit all integration changes**

```bash
git add packages/ui/src/ActivityRenderer.tsx packages/ui/src/activity-utils.ts packages/ui/src/copy.ts packages/db/src/curriculum-pipeline.ts apps/student/pages/learn/conceptId.tsx apps/student/lib/mockData.ts
git commit -m "feat: integrate new Level B activity types into ActivityRenderer, evaluator, and student app"
```
