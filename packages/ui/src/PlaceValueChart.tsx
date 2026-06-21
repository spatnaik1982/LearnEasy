import { useCallback } from "react";
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

export function PlaceValueChart({
  maxPlaces = 'crore',
  placedDigits,
  draggableDigits,
  selectedDigit,
  activeColumn,
  onSelectDigit,
  onPlaceDigit,
  onRemoveDigit,
  targetNumber,
  showResult = false,
  showLabels = true,
}: PlaceValueChartProps) {
  const columns = maxPlaces === 'crore' ? COLUMNS_CRORE : COLUMNS_LAKH;
  const numCols = columns.length;

  const gridStyle = {
    gridTemplateColumns: `repeat(${numCols}, 56px)`,
  };

  const targetStr = targetNumber != null ? String(targetNumber).padStart(numCols, '0') : null;

  const getColumnResult = useCallback((idx: number): 'correct' | 'incorrect' | null => {
    if (!showResult || targetStr === null || !(idx in placedDigits)) return null;
    return String(placedDigits[idx]) === targetStr[idx] ? 'correct' : 'incorrect';
  }, [showResult, targetStr, placedDigits]);

  return (
    <div className="flex flex-col items-center gap-6">
      <div
        role="grid"
        aria-label="Place value chart"
        style={gridStyle}
        className="grid gap-px"
      >
        {showLabels && columns.map((col) => (
          <div
            key={col.label}
            className="flex items-center justify-center h-14 bg-soft-blue text-white font-semibold text-sm rounded-t-md"
            aria-hidden="true"
          >
            {col.label}
          </div>
        ))}
        {columns.map((col, idx) => {
          const digit = idx in placedDigits ? placedDigits[idx] : undefined;
          const isEmpty = digit === undefined;
          const isActiveCol = activeColumn === idx;
          const colResult = getColumnResult(idx);

          return (
            <div
              key={col.label}
              role="gridcell"
              aria-label={col.ariaLabel}
              tabIndex={0}
              className={cn(
                "flex items-center justify-center w-14 h-14 text-2xl font-bold select-none transition-colors duration-150 rounded-md",
                isEmpty && "border-2 border-dashed border-soft-blue bg-warm-off-white",
                !isEmpty && "bg-warm-off-white",
                isActiveCol && "!bg-[#5D87B1]/5",
                !isEmpty && "cursor-pointer",
                colResult === 'correct' && "!border-[#8FB996] !border-2",
                colResult === 'incorrect' && "!border-[#E5989B] !border-2"
              )}
              onClick={() => {
                if (isEmpty && activeColumn === idx) {
                  if (selectedDigit != null) {
                    onPlaceDigit(idx);
                  }
                } else if (!isEmpty) {
                  onRemoveDigit(idx);
                }
              }}
            >
              {digit !== undefined ? digit : ''}
            </div>
          );
        })}
      </div>

      <div role="radiogroup" aria-label="Digit bank" className="flex flex-wrap gap-2 justify-center">
        {draggableDigits.map((digit, idx) => (
          <button
            key={`${digit}-${idx}`}
            type="button"
            role="radio"
            aria-checked={selectedDigit === digit}
            aria-label={`Digit ${digit}`}
            className={cn(
              "w-14 h-14 rounded-lg border-2 text-xl font-bold transition-colors duration-150",
              selectedDigit === digit
                ? "bg-[#5D87B1] text-white border-[#5D87B1]"
                : "bg-white border-soft-blue text-slate-text hover:bg-soft-blue/10"
            )}
            onClick={() => onSelectDigit(digit)}
          >
            {digit}
          </button>
        ))}
      </div>
    </div>
  );
}
