# Activity Interaction Audit Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor 4 activity components (Matching, DragDrop, PlaceValueChart, Sequencing) from click-based interactions to true drag-and-drop, improving usability for children with ASD per ALX guidelines.

**Architecture:** Introduce `@dnd-kit` as the drag-and-drop dependency in `packages/ui/`. Each activity component gets a focused refactor preserving its existing props/API so `ActivityRenderer` and `activity-utils` require zero changes. GridCounter's pointer-drag pattern serves as the reference implementation.

**Tech Stack:** React 18, TypeScript (strict), `@dnd-kit/core` + `@dnd-kit/sortable`, Tailwind CSS with ALX color palette, Pointer Events (mouse + touch).

---

### Task 1: Add @dnd-kit dependency

**Files:**
- Modify: `packages/ui/package.json`

- [ ] **Step 1: Install @dnd-kit packages**

```bash
pnpm --filter @learn-easy/ui add @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

- [ ] **Step 2: Verify install**

Run: `pnpm --filter @learn-easy/ui build` — Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
git add packages/ui/package.json pnpm-lock.yaml
git commit -m "chore: add @dnd-kit dependencies for drag-and-drop interactions"
```

---

### Task 2: Refactor DragDrop — true drag-and-drop

**Files:**
- Modify: `packages/ui/src/DragDrop.tsx` (full rewrite)
- Modify: `packages/ui/src/index.ts` (update export — only if types changed)

**Current behavior (delete):** Click-to-select then click-to-place. Items in pool, targets as drop zones. Uses `selectedItemId`, `onSelectItem`, `onPlaceItem` props.

**Target behavior:** True drag-and-drop. Items in the pool are draggable via `@dnd-kit/core` `useDraggable`. Targets are droppable via `useDroppable`. Drag overlay follows cursor/finger. Snap animation on drop.

- [ ] **Step 1: Rewrite DragDrop.tsx with @dnd-kit**

```typescript
import { useState, useCallback } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  useDraggable,
  useDroppable,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { cn } from "./utils";

export interface DragDropItem {
  id: string;
  label: string;
  emoji?: string;
}

export interface DragDropTarget {
  id: string;
  label: string;
}

export interface DragDropProps {
  items: DragDropItem[];
  targets: DragDropTarget[];
  placements: Record<string, string>;
  selectedItemId: string | null;
  onSelectItem: (id: string) => void;
  onPlaceItem: (targetId: string) => void;
  onRemoveItem: (itemId: string) => void;
  showResult?: boolean;
  correctPlacements?: Record<string, string>;
}

function DraggableItem({
  item,
  isSelected,
  showResult,
  result,
}: {
  item: DragDropItem;
  isSelected: boolean;
  showResult?: boolean;
  result?: "correct" | "incorrect";
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `item-${item.id}`,
    data: { item },
  });

  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`, zIndex: 50 }
    : undefined;

  return (
    <button
      ref={setNodeRef}
      type="button"
      {...listeners}
      {...attributes}
      style={style}
      className={cn(
        "min-h-[56px] rounded-lg border-2 px-4 py-2 text-base font-medium text-slate-text",
        "focus:outline-none focus:ring-2 focus:ring-soft-blue focus:ring-offset-2",
        "touch-none select-none",
        isDragging && "opacity-50",
        isSelected
          ? "border-soft-blue bg-soft-blue/10"
          : "border-slate-300 bg-white hover:border-slate-400",
        result === "correct" && "!border-muted-green",
        result === "incorrect" && "!border-soft-coral",
      )}
      aria-label={item.label}
    >
      {item.emoji && <span className="mr-2" aria-hidden="true">{item.emoji}</span>}
      {item.label}
    </button>
  );
}

function DroppableTarget({
  target,
  placedItems,
  selectedItemId,
  showResult,
  getResult,
  onRemoveItem,
  isDragOver,
}: {
  target: DragDropTarget;
  placedItems: DragDropItem[];
  selectedItemId: string | null;
  showResult?: boolean;
  getResult: (itemId: string) => "correct" | "incorrect" | undefined;
  onRemoveItem: (itemId: string) => void;
  isDragOver: boolean;
}) {
  const isEmpty = placedItems.length === 0;
  const { setNodeRef, isOver } = useDroppable({
    id: `target-${target.id}`,
    data: { target },
  });

  const highlightDrop = isDragOver || isOver;

  return (
    <div
      ref={setNodeRef}
      data-target={target.id}
      className={cn(
        "flex flex-col gap-3 rounded-lg border-2 px-4 py-3 transition-colors duration-150",
        "focus:outline-none focus:ring-2 focus:ring-soft-blue focus:ring-offset-2",
        isEmpty
          ? "border-dashed border-slate-300 bg-slate-50"
          : "border-solid border-slate-300 bg-white",
        highlightDrop && "!border-soft-blue !bg-soft-blue/5",
      )}
      role="region"
      aria-label={`Target: ${target.label}${isEmpty ? ", empty" : ""}`}
    >
      <span className="text-sm font-medium text-on-surface-variant">
        {target.label}
      </span>
      {isEmpty && (
        <span className="text-sm text-on-surface-variant">
          Drop items here
        </span>
      )}
      {placedItems.map((item) => {
        const result = getResult(item.id);
        return (
          <div
            key={item.id}
            data-result={result || undefined}
            className={cn(
              "flex items-center gap-2 rounded-lg border px-3 py-2",
              result === "correct" && "border-muted-green",
              result === "incorrect" && "border-soft-coral",
              !result && "border-slate-200",
            )}
          >
            <span className="flex-1 text-base font-medium text-slate-text">
              {item.emoji && <span className="mr-2" aria-hidden="true">{item.emoji}</span>}
              {item.label}
            </span>
            {!showResult && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveItem(item.id);
                }}
                className="flex h-8 w-8 items-center justify-center rounded text-slate-400 hover:bg-slate-100 hover:text-slate-600 focus:outline-none focus:ring-2 focus:ring-soft-blue"
                aria-label={`Remove ${item.label}`}
                type="button"
              >
                ✕
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}

export function DragDrop({
  items,
  targets,
  placements,
  selectedItemId: _selectedItemId,
  onSelectItem: _onSelectItem,
  onPlaceItem,
  onRemoveItem,
  showResult,
  correctPlacements,
}: DragDropProps) {
  const [activeItem, setActiveItem] = useState<DragDropItem | null>(null);

  const placedIds = new Set(Object.keys(placements));
  const unplacedItems = items.filter((item) => !placedIds.has(item.id));

  const getResult = (itemId: string): "correct" | "incorrect" | undefined => {
    if (!showResult || !correctPlacements) return undefined;
    return correctPlacements[itemId] === placements[itemId]
      ? "correct"
      : "incorrect";
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const item = event.active.data.current?.item as DragDropItem | undefined;
    if (item) setActiveItem(item);
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    setActiveItem(null);
    const { active, over } = event;
    if (!over) return;
    const targetId = over.data.current?.target?.id as string | undefined;
    if (!targetId) return;
    onPlaceItem(targetId);
  }, [onPlaceItem]);

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex flex-col gap-6" role="group" aria-label="Drag and drop activity">
        <div role="group" aria-label="Available items">
          <div className="flex flex-wrap gap-4" role="list" aria-label="Items to place">
            {unplacedItems.map((item) => (
              <DraggableItem
                key={item.id}
                item={item}
                isSelected={false}
                showResult={showResult}
                result={getResult(item.id)}
              />
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2" role="group" aria-label="Target zones">
          {targets.map((target) => {
            const targetItems = items.filter(
              (item) => placements[item.id] === target.id,
            );
            return (
              <DroppableTarget
                key={target.id}
                target={target}
                placedItems={targetItems}
                selectedItemId={null}
                showResult={showResult}
                getResult={getResult}
                onRemoveItem={onRemoveItem}
                isDragOver={activeItem?.id ? targetItems.length === 0 : false}
              />
            );
          })}
        </div>
      </div>

      <DragOverlay>
        {activeItem ? (
          <div className="min-h-[56px] rounded-lg border-2 border-soft-blue bg-soft-blue/10 px-4 py-2 text-base font-medium text-slate-text shadow-lg">
            {activeItem.emoji && <span className="mr-2" aria-hidden="true">{activeItem.emoji}</span>}
            {activeItem.label}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `pnpm --filter @learn-easy/ui build` — Expected: Build succeeds

- [ ] **Step 3: Verify existing tests pass**

Run: `pnpm --filter @learn-easy/ui test` — Expected: Tests pass

- [ ] **Step 4: Commit**

```bash
git add packages/ui/src/DragDrop.tsx
git commit -m "feat: refactor DragDrop to true drag-and-drop with @dnd-kit"
```

---

### Task 3: Refactor Matching — drag-to-connect

**Files:**
- Modify: `packages/ui/src/Matching.tsx` (full rewrite)

**Current behavior (delete):** Click left item, then click right item to match. No visual connection line between matched pairs. Items are sorted; right column is shuffled.

**Target behavior:** Drag from left item onto right item to create a match. When a match is formed, draw an SVG line (or colored connector) between the two items. Support undo by clicking a matched pair. Left column items stay in original order; right column items are shuffled.

- [ ] **Step 1: Rewrite Matching.tsx with @dnd-kit**

```typescript
import { useMemo, useState, useCallback } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  useDraggable,
  useDroppable,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { cn } from "./utils";

export interface MatchingPair {
  id: string;
  itemA: string;
  itemB: string;
}

export interface MatchingProps {
  pairs: MatchingPair[];
  connections: Record<string, string>;
  selectedLeftId: string | null;
  selectedRightId: string | null;
  onSelectLeft: (id: string) => void;
  onSelectRight: (id: string) => void;
  onUndo: () => void;
  showResult?: boolean;
  correctPairs?: Record<string, string>;
}

function seededShuffle<T>(arr: T[], seed: string): T[] {
  const result = [...arr];
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = ((hash << 5) - hash + seed.charCodeAt(i)) | 0;
  for (let i = result.length - 1; i > 0; i--) {
    hash = ((hash << 5) - hash + i) | 0;
    const j = Math.abs(hash) % (i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function DraggableLeftItem({
  pair,
  isMatched,
  isDragging,
  result,
}: {
  pair: MatchingPair;
  isMatched: boolean;
  isDragging: boolean;
  result?: "correct" | "incorrect";
}) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: `left-${pair.id}`,
    data: { pair, side: "left" },
    disabled: isMatched,
  });

  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`, zIndex: 50 }
    : undefined;

  return (
    <button
      ref={setNodeRef}
      type="button"
      {...listeners}
      {...attributes}
      style={style}
      className={cn(
        "min-h-[56px] rounded-lg px-4 py-3 text-left text-lg font-medium text-slate-text",
        "border-l-4 border-soft-blue focus:outline-none focus:ring-2 focus:ring-soft-blue focus:ring-offset-2",
        "touch-none select-none",
        isMatched && "border-muted-green opacity-70",
        isDragging && "opacity-50 shadow-lg",
        result === "incorrect" && "border-soft-coral",
      )}
      aria-label={`Match: ${pair.itemA}`}
      disabled={isMatched}
    >
      {pair.itemA}
    </button>
  );
}

function DroppableRightItem({
  pair,
  isMatched,
  isSelected,
  result,
  onActivate,
}: {
  pair: MatchingPair;
  isMatched: boolean;
  isSelected: boolean;
  result?: "correct" | "incorrect";
  onActivate: () => void;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: `right-${pair.id}`,
    data: { pair, side: "right" },
    disabled: isMatched,
  });

  return (
    <button
      ref={setNodeRef}
      type="button"
      onClick={isMatched ? undefined : onActivate}
      className={cn(
        "min-h-[56px] rounded-lg px-4 py-3 text-left text-lg font-medium text-slate-text",
        "border-l-4 border-muted-teal focus:outline-none focus:ring-2 focus:ring-muted-teal focus:ring-offset-2",
        "transition-colors duration-150",
        isMatched && "border-muted-green opacity-70",
        !isMatched && isSelected && "bg-muted-teal/10",
        !isMatched && !isSelected && "bg-white",
        !isMatched && isOver && "bg-muted-teal/20 border-muted-teal",
        result === "incorrect" && "border-soft-coral",
      )}
      aria-label={`Target: ${pair.itemB}`}
      disabled={isMatched}
    >
      {pair.itemB}
    </button>
  );
}

export function Matching({
  pairs,
  connections,
  selectedLeftId,
  selectedRightId,
  onSelectLeft,
  onSelectRight,
  onUndo,
  showResult,
  correctPairs,
}: MatchingProps) {
  const [draggingLeftId, setDraggingLeftId] = useState<string | null>(null);

  const isMatched = (id: string) => id in connections;

  const getResult = (id: string): "correct" | "incorrect" | undefined => {
    if (!showResult || !correctPairs) return undefined;
    return correctPairs[id] === connections[id] ? "correct" : "incorrect";
  };

  const shuffled = useMemo(() => {
    const seed = pairs.map((p) => p.id).join("-");
    return seededShuffle(pairs, seed);
  }, [pairs]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const pairId = String(event.active.id).replace("left-", "");
    setDraggingLeftId(pairId);
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    setDraggingLeftId(null);
    const { active, over } = event;
    if (!over) return;

    const leftId = String(active.id).replace("left-", "");
    const rightId = String(over.id).replace("right-", "");

    if (leftId && rightId) {
      onSelectLeft(leftId);
      onSelectRight(rightId);
    }
  }, [onSelectLeft, onSelectRight]);

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-6" role="group" aria-label="Matching activity">
        <div className="flex flex-col gap-4" role="list" aria-label="Left column items">
          {pairs.map((pair) => {
            const matched = isMatched(pair.id);
            const selected = selectedLeftId === pair.id;
            const result = getResult(pair.id);
            return (
              <DraggableLeftItem
                key={pair.id}
                pair={pair}
                isMatched={matched}
                isDragging={draggingLeftId === pair.id}
                result={result}
              />
            );
          })}
        </div>

        <div className="flex flex-col gap-4" role="list" aria-label="Right column items">
          {shuffled.map((pair) => {
            const matched = isMatched(pair.id);
            const selected = selectedRightId === pair.id;
            const result = getResult(pair.id);
            return (
              <DroppableRightItem
                key={pair.id}
                pair={pair}
                isMatched={matched}
                isSelected={selected}
                result={result}
                onActivate={() => !matched && onSelectRight(pair.id)}
              />
            );
          })}
        </div>

        {Object.keys(connections).length > 0 && (
          <button
            onClick={onUndo}
            className="self-start rounded-lg px-3 py-2 text-sm font-medium text-slate-text hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-soft-blue"
            aria-label="Undo last match"
          >
            Undo
          </button>
        )}
      </div>

      <DragOverlay>
        {draggingLeftId ? (
          <div className="min-h-[56px] rounded-lg border-l-4 border-soft-blue bg-white px-4 py-3 text-left text-lg font-medium text-slate-text shadow-lg">
            {pairs.find((p) => p.id === draggingLeftId)?.itemA}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `pnpm --filter @learn-easy/ui build` — Expected: Build succeeds

- [ ] **Step 3: Verify tests pass**

Run: `pnpm --filter @learn-easy/ui test` — Expected: Tests pass

- [ ] **Step 4: Commit**

```bash
git add packages/ui/src/Matching.tsx
git commit -m "feat: refactor Matching to drag-to-connect with @dnd-kit"
```

---

### Task 4: Refactor PlaceValueChart — drag digits to columns

**Files:**
- Modify: `packages/ui/src/PlaceValueChart.tsx` (full rewrite)
- Modify: `packages/ui/src/ActivityRenderer.tsx` (simplify click handler logic since drag replaces manual activate-column step)

**Current behavior (delete):** Click digit → click empty column → digit placed. Active column toggle required on empty column.

**Target behavior:** Digits in bank are draggable onto columns. Columns are droppable. Tap a placed digit to remove it. Remove the "activate column" middle step.

- [ ] **Step 1: Rewrite PlaceValueChart.tsx with @dnd-kit**

```typescript
import { useCallback } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  useDraggable,
  useDroppable,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { cn } from "./utils";

export interface PlaceValueChartProps {
  maxPlaces?: 'lakh' | 'crore';
  placedDigits: Record<number, number>;
  draggableDigits: number[];
  selectedDigit: number | null;
  activeColumn: number | null;
  onSelectDigit: (digit: number) => void;
  onPlaceDigit: (column: number) => void;
  onRemoveDigit: (column: number) => void;
  targetNumber?: number;
  showResult?: boolean;
  showLabels?: boolean;
}

const COLUMNS_CRORE = [
  { label: 'Cr', ariaLabel: 'Crores column' },
  { label: 'TL', ariaLabel: 'Ten lakhs column' },
  { label: 'L', ariaLabel: 'Lakhs column' },
  { label: 'TTh', ariaLabel: 'Ten thousands column' },
  { label: 'Th', ariaLabel: 'Thousands column' },
  { label: 'H', ariaLabel: 'Hundreds column' },
  { label: 'T', ariaLabel: 'Tens column' },
  { label: 'O', ariaLabel: 'Ones column' },
] as const;

const COLUMNS_LAKH = [
  { label: 'L', ariaLabel: 'Lakhs column' },
  { label: 'TTh', ariaLabel: 'Ten thousands column' },
  { label: 'Th', ariaLabel: 'Thousands column' },
  { label: 'H', ariaLabel: 'Hundreds column' },
  { label: 'T', ariaLabel: 'Tens column' },
  { label: 'O', ariaLabel: 'Ones column' },
] as const;

function DraggableDigit({
  digit,
  isSelected,
}: {
  digit: number;
  isSelected: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `digit-${digit}`,
    data: { digit },
  });

  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`, zIndex: 50 }
    : undefined;

  return (
    <button
      ref={setNodeRef}
      type="button"
      {...listeners}
      {...attributes}
      style={style}
      className={cn(
        "w-14 h-14 rounded-lg border-2 text-xl font-bold transition-colors duration-150",
        "touch-none select-none",
        isDragging && "opacity-50",
        isSelected
          ? "bg-soft-blue text-white border-soft-blue"
          : "bg-white border-soft-blue text-slate-text hover:bg-soft-blue/10",
      )}
      aria-label={`Digit ${digit}`}
    >
      {digit}
    </button>
  );
}

function DroppableColumn({
  column,
  idx,
  digit,
  isEmpty,
  isActiveCol,
  colResult,
  showLabels,
}: {
  column: typeof COLUMNS_CRORE[number];
  idx: number;
  digit: number | undefined;
  isEmpty: boolean;
  isActiveCol: boolean;
  colResult: "correct" | "incorrect" | null;
  showLabels: boolean;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: `col-${idx}`,
    data: { column: idx },
  });

  return (
    <div
      ref={setNodeRef}
      className="flex flex-col items-center"
    >
      {showLabels && (
        <div className="flex items-center justify-center h-14 bg-soft-blue text-white font-semibold text-sm rounded-t-md w-14" aria-hidden="true">
          {column.label}
        </div>
      )}
      <div
        role="gridcell"
        aria-label={column.ariaLabel}
        tabIndex={0}
        className={cn(
          "flex items-center justify-center w-14 h-14 text-2xl font-bold select-none transition-colors duration-150 rounded-md",
          isEmpty && "border-2 border-dashed border-soft-blue bg-warm-off-white",
          !isEmpty && "bg-warm-off-white",
          isActiveCol && "!bg-soft-blue/5",
          !isEmpty && "cursor-pointer",
          isOver && "!bg-soft-blue/10 !border-soft-blue !border-2",
          colResult === 'correct' && "!border-muted-green !border-2",
          colResult === 'incorrect' && "!border-soft-coral !border-2"
        )}
        data-column={idx}
      >
        {digit !== undefined ? digit : ''}
      </div>
    </div>
  );
}

export function PlaceValueChart({
  maxPlaces = 'crore',
  placedDigits,
  draggableDigits,
  selectedDigit: _selectedDigit,
  activeColumn: _activeColumn,
  onSelectDigit: _onSelectDigit,
  onPlaceDigit,
  onRemoveDigit,
  targetNumber,
  showResult = false,
  showLabels = true,
}: PlaceValueChartProps) {
  const columns = maxPlaces === 'crore' ? COLUMNS_CRORE : COLUMNS_LAKH;
  const numCols = columns.length;
  const [activeDraggedDigit, setActiveDraggedDigit] = useState<number | null>(null);

  const gridStyle = {
    gridTemplateColumns: `repeat(${numCols}, 56px)`,
  };

  const targetStr = targetNumber != null ? String(targetNumber).padStart(numCols, '0') : null;

  const getColumnResult = useCallback((idx: number): 'correct' | 'incorrect' | null => {
    if (!showResult || targetStr === null || !(idx in placedDigits)) return null;
    return String(placedDigits[idx]) === targetStr[idx] ? 'correct' : 'incorrect';
  }, [showResult, targetStr, placedDigits]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const digit = event.active.data.current?.digit as number;
    setActiveDraggedDigit(digit);
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    setActiveDraggedDigit(null);
    const { active, over } = event;
    if (!over) return;
    const columnIdx = over.data.current?.column as number;
    if (columnIdx === undefined) return;

    const digit = active.data.current?.digit as number;
    if (digit !== undefined) {
      onPlaceDigit(columnIdx);
    }
  }, [onPlaceDigit]);

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex flex-col items-center gap-6">
        <div
          role="grid"
          aria-label="Place value chart"
          style={gridStyle}
          className="grid gap-px"
        >
          {columns.map((col, idx) => {
            const digit = idx in placedDigits ? placedDigits[idx] : undefined;
            const isEmpty = digit === undefined;
            const colResult = getColumnResult(idx);

            return (
              <DroppableColumn
                key={col.label}
                column={col}
                idx={idx}
                digit={digit}
                isEmpty={isEmpty}
                isActiveCol={false}
                colResult={colResult}
                showLabels={showLabels}
              />
            );
          })}
        </div>

        <div role="radiogroup" aria-label="Digit bank" className="flex flex-wrap gap-2 justify-center">
          {draggableDigits.map((digit) => (
            <DraggableDigit
              key={`digit-${digit}`}
              digit={digit}
              isSelected={false}
            />
          ))}
        </div>
      </div>

      <DragOverlay>
        {activeDraggedDigit !== null ? (
          <div className="w-14 h-14 flex items-center justify-center rounded-lg border-2 border-soft-blue bg-soft-blue/10 text-xl font-bold text-slate-text shadow-lg">
            {activeDraggedDigit}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
```

- [ ] **Step 2: Update ActivityRenderer to simplify PVC click handler**

In `packages/ui/src/ActivityRenderer.tsx`, simplify the PlaceValueChart handler:
- Remove `pvcActiveColumn` state entirely
- Remove `setPvcActiveColumn` calls
- The `onPlaceDigit` handler should directly call `onPlaceDigit(column)` — the column index comes from the DnD drop target

Edit `ActivityRenderer.tsx` case `"place_value_chart"`:

```typescript
case "place_value_chart": {
  const pvcDraggableDigits = (normalizedContent.draggableDigits as number[]) ?? [];
  return (
    <PlaceValueChart
      maxPlaces={(normalizedContent.maxPlaces as "lakh" | "crore") ?? "crore"}
      placedDigits={pvcPlacedDigits}
      draggableDigits={pvcDraggableDigits}
      selectedDigit={pvcSelectedDigit}
      activeColumn={null}
      onSelectDigit={(digit) => setPvcSelectedDigit(digit === pvcSelectedDigit ? null : digit)}
      onPlaceDigit={(column) => {
        if (pvcSelectedDigit == null) return;
        setPvcPlacedDigits((prev) => ({ ...prev, [column]: pvcSelectedDigit }));
        setPvcSelectedDigit(null);
      }}
      onRemoveDigit={(column) => {
        setPvcPlacedDigits((prev) => {
          const updated = { ...prev };
          delete updated[column];
          return updated;
        });
      }}
      targetNumber={normalizedContent.targetNumber as number | undefined}
      showResult={lifecycle === "correct" || lifecycle === "incorrect"}
      showLabels={(normalizedContent.showLabels as boolean) ?? true}
    />
  );
}
```

Remove `pvcActiveColumn` state declaration and the `// PlaceValueChart-specific state` block that initializes it to `null`.

- [ ] **Step 3: Verify build**

Run: `pnpm --filter @learn-easy/ui build` — Expected: Build succeeds

- [ ] **Step 4: Verify tests pass**

Run: `pnpm --filter @learn-easy/ui test` — Expected: Tests pass

- [ ] **Step 5: Commit**

```bash
git add packages/ui/src/PlaceValueChart.tsx packages/ui/src/ActivityRenderer.tsx
git commit -m "feat: refactor PlaceValueChart to drag digits to columns"
```

---

### Task 5: Refactor Sequencing — drag-to-reorder

**Files:**
- Modify: `packages/ui/src/Sequencing.tsx` (full rewrite)

**Current behavior (delete):** Click items to add to sequence list. Reorder via ▲/▼ buttons. Remove by clicking item.

**Target behavior:** Click items to add to sequence (same as before). Reorder by **drag-and-drop within the sequence list** using `@dnd-kit/sortable`. Remove via a dedicated ✕ button. Keep ▲/▼ as keyboard-only fallback. Animate position changes.

- [ ] **Step 1: Rewrite Sequencing.tsx with @dnd-kit/sortable**

```typescript
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useState, useCallback } from "react";
import { cn } from "./utils";

export interface SequencingItem {
  id: string;
  label: string;
  emoji?: string;
}

export interface SequencingProps {
  items: SequencingItem[];
  userOrder: string[];
  onAddItem: (id: string) => void;
  onRemoveItem: (id: string) => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
  showResult?: boolean;
  correctOrder?: string[];
}

function SortableSequenceItem({
  item,
  index,
  result,
  onRemove,
}: {
  item: SequencingItem;
  index: number;
  result?: "correct" | "incorrect";
  onRemove: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      data-result={result || undefined}
      className={cn(
        "flex items-center gap-3 rounded-lg border-2 px-3 py-2",
        "touch-none",
        isDragging && "opacity-50 shadow-lg z-50",
        result === "correct" && "border-muted-green",
        result === "incorrect" && "border-soft-coral",
        !result && "border-slate-300 bg-white",
      )}
      role="listitem"
    >
      {/* Drag handle */}
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="flex h-10 w-10 cursor-grab items-center justify-center rounded text-slate-400 hover:bg-slate-100 hover:text-slate-600 focus:outline-none focus:ring-2 focus:ring-soft-blue active:cursor-grabbing"
        aria-label={`Drag to reorder ${item.label}`}
      >
        ⠿
      </button>

      {/* Position number */}
      <span
        className={cn(
          "flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-white",
          result === "correct" && "bg-muted-green",
          result === "incorrect" && "bg-soft-coral",
          !result && "bg-soft-blue",
        )}
      >
        {index + 1}
      </span>

      {/* Item label */}
      <span className="flex-1 text-base font-medium text-slate-text">
        {item.emoji && <span className="mr-2" aria-hidden="true">{item.emoji}</span>}
        {item.label}
      </span>

      {/* Remove button */}
      <button
        onClick={onRemove}
        className="flex h-10 w-10 items-center justify-center rounded text-slate-400 hover:bg-slate-100 hover:text-slate-600 focus:outline-none focus:ring-2 focus:ring-soft-blue"
        aria-label={`Remove ${item.label}`}
        type="button"
      >
        ✕
      </button>
    </div>
  );
}

export function Sequencing({
  items,
  userOrder,
  onAddItem,
  onRemoveItem,
  onReorder,
  showResult,
  correctOrder,
}: SequencingProps) {
  const [activeId, setActiveId] = useState<string | null>(null);

  const sequencedIds = new Set(userOrder);
  const availableItems = items.filter((item) => !sequencedIds.has(item.id));
  const sequencedItems = userOrder
    .map((id) => items.find((item) => item.id === id))
    .filter(Boolean) as SequencingItem[];

  const getResult = (itemId: string, index: number): "correct" | "incorrect" | undefined => {
    if (!showResult || !correctOrder) return undefined;
    return correctOrder[index] === itemId ? "correct" : "incorrect";
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(String(event.active.id));
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = userOrder.indexOf(String(active.id));
    const newIndex = userOrder.indexOf(String(over.id));
    if (oldIndex !== -1 && newIndex !== -1) {
      onReorder(oldIndex, newIndex);
    }
  }, [userOrder, onReorder]);

  const activeItem = activeId ? items.find((i) => i.id === activeId) : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex flex-col gap-6" role="group" aria-label="Sequencing activity">
        <div role="group" aria-label="Available items">
          <p className="mb-3 text-sm font-medium text-on-surface-variant">
            Click items to add to sequence, then drag to reorder
          </p>
          <div className="flex flex-wrap gap-4" role="list" aria-label="Items to choose from">
            {availableItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onAddItem(item.id)}
                className="min-h-[56px] rounded-lg border-2 border-slate-300 bg-white px-4 py-2 text-base font-medium text-slate-text hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-soft-blue focus:ring-offset-2"
                role="listitem"
                type="button"
              >
                {item.emoji && <span className="mr-2" aria-hidden="true">{item.emoji}</span>}
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div role="group" aria-label="Your sequence">
          <p className="mb-3 text-sm font-medium text-on-surface-variant">
            Drag handle ⠿ to reorder
          </p>
          {sequencedItems.length === 0 ? (
            <div className="flex min-h-[52px] items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-slate-50">
              <span className="text-sm text-on-surface-variant">
                Select items above to build your sequence
              </span>
            </div>
          ) : (
            <SortableContext
              items={userOrder}
              strategy={verticalListSortingStrategy}
            >
              <div className="flex flex-col gap-2" role="list" aria-label="Your ordered sequence">
                {sequencedItems.map((item, index) => {
                  const result = getResult(item.id, index);
                  return (
                    <SortableSequenceItem
                      key={item.id}
                      item={item}
                      index={index}
                      result={result}
                      onRemove={() => onRemoveItem(item.id)}
                    />
                  );
                })}
              </div>
            </SortableContext>
          )}
        </div>
      </div>

      <DragOverlay>
        {activeItem ? (
          <div className="flex items-center gap-3 rounded-lg border-2 border-soft-blue bg-white px-3 py-2 shadow-lg">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-soft-blue text-sm font-bold text-white">
              {(userOrder.indexOf(activeItem.id) + 1) || 1}
            </span>
            <span className="text-base font-medium text-slate-text">
              {activeItem.emoji && <span className="mr-2" aria-hidden="true">{activeItem.emoji}</span>}
              {activeItem.label}
            </span>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `pnpm --filter @learn-easy/ui build` — Expected: Build succeeds

- [ ] **Step 3: Verify tests pass**

Run: `pnpm --filter @learn-easy/ui test` — Expected: Tests pass

- [ ] **Step 4: Commit**

```bash
git add packages/ui/src/Sequencing.tsx
git commit -m "feat: refactor Sequencing to drag-to-reorder with @dnd-kit/sortable"
```

---

### Task 6: Add fade-in animation to drag placement actions

**Files:**
- Modify: `packages/ui/src/DragDrop.tsx` (add transition class)
- Modify: `packages/ui/src/Matching.tsx` (add transition class)
- Modify: `packages/ui/src/PlaceValueChart.tsx` (add transition class)
- Modify: `packages/ui/src/Sequencing.tsx` (add transition class)

**Current:** Items snap into place with no animation when dropped.

**Target:** All placed/dropped items animate with a subtle fade-in + scale transition.

- [ ] **Step 1: Add animation class to DragDrop placed items**

In `DroppableTarget`, add a CSS animation to the placed item `<div>`:

```typescript
<div
  key={item.id}
  style={{ animation: "dropAppear 200ms ease-out" }}
  ...
```

Add the keyframe to a `<style>` tag at the top of the component or a shared CSS file:

```css
@keyframes dropAppear {
  from { opacity: 0; transform: scale(0.9); }
  to { opacity: 1; transform: scale(1); }
}
```

- [ ] **Step 2: Add same animation to Matching matched items**

In `Matching.tsx`, add the `dropAppear` animation to each matched item when it gains the matched state.

- [ ] **Step 3: Add same animation to PlaceValueChart placed digits**

In `PlaceValueChart.tsx`, add the `dropAppear` animation to digits rendered in columns.

- [ ] **Step 4: Add same animation to Sequencing reordered items**

In `SortableSequenceItem`, add `transition` already handled by `@dnd-kit/utilities` `CSS.Transition.toString(transition)`. Also add the `dropAppear` animation for items that were just added from the pool.

- [ ] **Step 5: Commit**

```bash
git add packages/ui/src/DragDrop.tsx packages/ui/src/Matching.tsx packages/ui/src/PlaceValueChart.tsx packages/ui/src/Sequencing.tsx
git commit -m "feat: add drop animation to all drag-and-drop activities"
```

---

### Task 7: Touch target audit across all activity components

**Files:**
- Modify: `packages/ui/src/FillBlank.tsx` (option buttons)
- Modify: `packages/ui/src/VisualCounter.tsx` (number buttons)
- Modify: `packages/ui/src/MultipleChoice.tsx` (option cards)
- Modify: `packages/ui/src/ClockWidget.tsx` (hand drag targets)
- Modify: `packages/ui/src/ScaleReader.tsx` (slider)

**ALX requirement:** All touch targets minimum 56x56px, minimum 16px spacing between interactive elements.

- [ ] **Step 1: Audit and fix FillBlank option buttons**

Ensure option buttons in `BlankSlot` have `minHeight: 56px` and `minWidth: 56px` (already present — verify).

- [ ] **Step 2: Audit and fix ClockWidget hand hit areas**

Increase the invisible hit area around clock hands. Add an invisible wider stroke or transparent circle over each hand that extends the touch target to 56x56px.

- [ ] **Step 3: Verify all touch targets**

Run a manual check: every `<button>` and clickable element should have `min-h-[56px]` (Tailwind) equivalent.

- [ ] **Step 4: Commit**

```bash
git add packages/ui/src/FillBlank.tsx packages/ui/src/ClockWidget.tsx packages/ui/src/ScaleReader.tsx
git commit -m "fix: ensure all touch targets meet ALX 56x56 minimum"
```

---

### Task 8: Update tests for new interaction patterns

**Files:**
- Create: `packages/ui/src/__tests__/DragDrop.test.tsx`
- Create: `packages/ui/src/__tests__/Matching.test.tsx`
- Create: `packages/ui/src/__tests__/Sequencing.test.tsx`
- Create: `packages/ui/src/__tests__/PlaceValueChart.test.tsx`

- [ ] **Step 1: Write DragDrop test**

```typescript
import { render, screen } from '@testing-library/react';
import { DragDrop } from '../DragDrop';

const mockItems = [
  { id: '1', label: 'Apple', emoji: '🍎' },
  { id: '2', label: 'Banana', emoji: '🍌' },
];

const mockTargets = [
  { id: 'fruit', label: 'Fruits' },
];

describe('DragDrop', () => {
  it('renders unplaced items in the pool', () => {
    render(
      <DragDrop
        items={mockItems}
        targets={mockTargets}
        placements={{}}
        selectedItemId={null}
        onSelectItem={() => {}}
        onPlaceItem={() => {}}
        onRemoveItem={() => {}}
      />
    );
    expect(screen.getByText('Apple')).toBeInTheDocument();
    expect(screen.getByText('Banana')).toBeInTheDocument();
  });

  it('renders target zones', () => {
    render(
      <DragDrop
        items={mockItems}
        targets={mockTargets}
        placements={{}}
        selectedItemId={null}
        onSelectItem={() => {}}
        onPlaceItem={() => {}}
        onRemoveItem={() => {}}
      />
    );
    expect(screen.getByText('Fruits')).toBeInTheDocument();
  });

  it('does not render placed items in the pool', () => {
    render(
      <DragDrop
        items={mockItems}
        targets={mockTargets}
        placements={{ '1': 'fruit' }}
        selectedItemId={null}
        onSelectItem={() => {}}
        onPlaceItem={() => {}}
        onRemoveItem={() => {}}
      />
    );
    expect(screen.queryByText('Apple')).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run DragDrop test**

Run: `pnpm --filter @learn-easy/ui test` — Expected: Tests pass

- [ ] **Step 3: Write Matching test**

```typescript
import { render, screen } from '@testing-library/react';
import { Matching } from '../Matching';

const mockPairs = [
  { id: '1', itemA: '🍎 Apple', itemB: 'Red' },
  { id: '2', itemA: '🍌 Banana', itemB: 'Yellow' },
];

describe('Matching', () => {
  it('renders all left items', () => {
    render(
      <Matching
        pairs={mockPairs}
        connections={{}}
        selectedLeftId={null}
        selectedRightId={null}
        onSelectLeft={() => {}}
        onSelectRight={() => {}}
        onUndo={() => {}}
      />
    );
    expect(screen.getByText('🍎 Apple')).toBeInTheDocument();
    expect(screen.getByText('🍌 Banana')).toBeInTheDocument();
  });

  it('disables matched items', () => {
    render(
      <Matching
        pairs={mockPairs}
        connections={{ '1': '1' }}
        selectedLeftId={null}
        selectedRightId={null}
        onSelectLeft={() => {}}
        onSelectRight={() => {}}
        onUndo={() => {}}
      />
    );
    const items = screen.getAllByRole('button');
    const disabledItems = items.filter((btn) => btn.hasAttribute('disabled'));
    expect(disabledItems.length).toBeGreaterThan(0);
  });

  it('shows undo button when connections exist', () => {
    render(
      <Matching
        pairs={mockPairs}
        connections={{ '1': '1' }}
        selectedLeftId={null}
        selectedRightId={null}
        onSelectLeft={() => {}}
        onSelectRight={() => {}}
        onUndo={() => {}}
      />
    );
    expect(screen.getByLabelText('Undo last match')).toBeInTheDocument();
  });
});
```

- [ ] **Step 4: Run Matching test**

Run: `pnpm --filter @learn-easy/ui test` — Expected: Tests pass

- [ ] **Step 5: Write Sequencing test**

```typescript
import { render, screen } from '@testing-library/react';
import { Sequencing } from '../Sequencing';

const mockItems = [
  { id: '1', label: 'First', emoji: '1️⃣' },
  { id: '2', label: 'Second', emoji: '2️⃣' },
  { id: '3', label: 'Third', emoji: '3️⃣' },
];

describe('Sequencing', () => {
  it('renders available items', () => {
    render(
      <Sequencing
        items={mockItems}
        userOrder={[]}
        onAddItem={() => {}}
        onRemoveItem={() => {}}
        onReorder={() => {}}
      />
    );
    expect(screen.getByText('First')).toBeInTheDocument();
    expect(screen.getByText('Second')).toBeInTheDocument();
    expect(screen.getByText('Third')).toBeInTheDocument();
  });

  it('does not render sequenced items in available pool', () => {
    render(
      <Sequencing
        items={mockItems}
        userOrder={['1']}
        onAddItem={() => {}}
        onRemoveItem={() => {}}
        onReorder={() => {}}
      />
    );
    expect(screen.queryByText('First')).not.toBeInTheDocument();
    expect(screen.getByText('Second')).toBeInTheDocument();
  });

  it('renders sequenced items in order', () => {
    render(
      <Sequencing
        items={mockItems}
        userOrder={['2', '1']}
        onAddItem={() => {}}
        onRemoveItem={() => {}}
        onReorder={() => {}}
      />
    );
    const labels = screen.getAllByRole('listitem');
    expect(labels.length).toBe(2);
  });
});
```

- [ ] **Step 6: Run Sequencing test**

Run: `pnpm --filter @learn-easy/ui test` — Expected: Tests pass

- [ ] **Step 7: Write PlaceValueChart test**

```typescript
import { render, screen } from '@testing-library/react';
import { PlaceValueChart } from '../PlaceValueChart';

describe('PlaceValueChart', () => {
  it('renders all column headers in crore mode', () => {
    render(
      <PlaceValueChart
        maxPlaces="crore"
        placedDigits={{}}
        draggableDigits={[1, 2, 3]}
        selectedDigit={null}
        activeColumn={null}
        onSelectDigit={() => {}}
        onPlaceDigit={() => {}}
        onRemoveDigit={() => {}}
      />
    );
    expect(screen.getByText('Cr')).toBeInTheDocument();
    expect(screen.getByText('O')).toBeInTheDocument();
  });

  it('renders draggable digits', () => {
    render(
      <PlaceValueChart
        maxPlaces="lakh"
        placedDigits={{}}
        draggableDigits={[5, 3]}
        selectedDigit={null}
        activeColumn={null}
        onSelectDigit={() => {}}
        onPlaceDigit={() => {}}
        onRemoveDigit={() => {}}
      />
    );
    expect(screen.getByLabelText('Digit 5')).toBeInTheDocument();
    expect(screen.getByLabelText('Digit 3')).toBeInTheDocument();
  });

  it('displays placed digits', () => {
    render(
      <PlaceValueChart
        maxPlaces="lakh"
        placedDigits={{ 5: 7 }}
        draggableDigits={[7]}
        selectedDigit={null}
        activeColumn={null}
        onSelectDigit={() => {}}
        onPlaceDigit={() => {}}
        onRemoveDigit={() => {}}
      />
    );
    const cells = screen.getAllByRole('gridcell');
    expect(cells.some((c) => c.textContent === '7')).toBe(true);
  });
});
```

- [ ] **Step 8: Run PlaceValueChart test**

Run: `pnpm --filter @learn-easy/ui test` — Expected: Tests pass

- [ ] **Step 9: Commit**

```bash
git add packages/ui/src/__tests__/
git commit -m "test: add interaction tests for refactored activities"
```

---

### Task 9: Integration smoke test

- [ ] **Step 1: Build all packages**

Run: `pnpm build` — Expected: All packages build without errors

- [ ] **Step 2: Run full lint**

Run: `pnpm lint` — Expected: No lint errors

- [ ] **Step 3: Run full test suite**

Run: `pnpm test` — Expected: All tests pass

- [ ] **Step 4: Commit**

```bash
git add .
git commit -m "chore: post-refactor integration fixes"
```
