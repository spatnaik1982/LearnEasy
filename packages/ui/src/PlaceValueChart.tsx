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

function ColumnCell({
  column,
  idx,
  digit,
  isEmpty,
  colResult,
  showLabels,
  isOver,
  onClick,
}: {
  column: typeof COLUMNS_CRORE[number];
  idx: number;
  digit: number | undefined;
  isEmpty: boolean;
  colResult: "correct" | "incorrect" | null;
  showLabels: boolean;
  isOver: boolean;
  onClick: () => void;
}) {
  const { setNodeRef } = useDroppable({
    id: `col-${idx}`,
    data: { column: idx },
  });

  return (
    <div ref={setNodeRef} className="flex flex-col items-center">
      {showLabels && (
        <div className="flex items-center justify-center h-14 bg-soft-blue text-white font-semibold text-sm rounded-t-md w-14" aria-hidden="true">
          {column.label}
        </div>
      )}
      <div
        role="gridcell"
        aria-label={column.ariaLabel}
        tabIndex={0}
        style={{ animation: isEmpty ? undefined : "dropAppear 200ms ease-out" }}
        className={cn(
          "flex items-center justify-center w-14 h-14 text-2xl font-bold select-none transition-colors duration-150 rounded-md",
          isEmpty && "border-2 border-dashed border-soft-blue bg-warm-off-white",
          !isEmpty && "bg-warm-off-white cursor-pointer",
          isOver && "!bg-soft-blue/10 !border-soft-blue !border-2",
          colResult === 'correct' && "!border-muted-green !border-2",
          colResult === 'incorrect' && "!border-soft-coral !border-2"
        )}
        onClick={onClick}
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
    const { over } = event;
    if (!over) return;
    const columnIdx = over.data.current?.column as number;
    if (columnIdx === undefined) return;
    onPlaceDigit(columnIdx);
  }, [onPlaceDigit]);

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <style>{`
  @keyframes dropAppear {
    from { opacity: 0; transform: scale(0.9); }
    to { opacity: 1; transform: scale(1); }
  }
`}</style>
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
              <ColumnCell
                key={col.label}
                column={col}
                idx={idx}
                digit={digit}
                isEmpty={isEmpty}
                colResult={colResult}
                showLabels={showLabels}
                isOver={false}
                onClick={() => {
                  if (!isEmpty) onRemoveDigit(idx);
                }}
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
