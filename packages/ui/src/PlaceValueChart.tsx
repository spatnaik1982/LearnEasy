import { useState, useEffect, useCallback } from "react";
import { cn } from "./utils";

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
  digits: controlledDigits,
  interactive: interactiveProp,
  draggableDigits,
  targetNumber,
  showLabels = true,
  onPlaceDigit,
  onRemoveDigit,
  className,
}: PlaceValueChartProps) {
  const columns = maxPlaces === 'crore' ? COLUMNS_CRORE : COLUMNS_LAKH;
  const numCols = columns.length;

  const isControlled = controlledDigits !== undefined;
  const [localDigits, setLocalDigits] = useState<(number | null)[]>(
    () => controlledDigits ?? Array(numCols).fill(null)
  );
  const digits = isControlled ? controlledDigits! : localDigits;

  const interactive = interactiveProp ?? (!!onPlaceDigit || !!draggableDigits || !!onRemoveDigit);
  const isDragMode = !!draggableDigits;

  const [activeColumn, setActiveColumn] = useState<number | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<number | null>(null);
  const [feedbackState, setFeedbackState] = useState<'correct' | 'incorrect' | null>(null);
  const [lastActiveColumn, setLastActiveColumn] = useState<number | null>(null);

  const getSwapDigits = useCallback((column: number, digit: number): (number | null)[] => {
    const newDigits = [...digits];
    const existingCol = digits.indexOf(digit);
    if (existingCol !== -1) {
      newDigits[existingCol] = null;
    }
    newDigits[column] = digit;
    return newDigits;
  }, [digits]);

  const handleCellClick = useCallback((column: number) => {
    if (!interactive || isDragMode) return;
    if (digits[column] !== null) {
      const newDigits = [...digits];
      newDigits[column] = null;
      if (!isControlled) setLocalDigits(newDigits);
      onRemoveDigit?.(column);
      setActiveColumn(null);
    } else {
      setActiveColumn(activeColumn === column ? null : column);
    }
  }, [interactive, isDragMode, digits, isControlled, onRemoveDigit, activeColumn]);

  const handleDigitSelect = useCallback((digit: number) => {
    if (activeColumn === null) return;
    const newDigits = getSwapDigits(activeColumn, digit);
    if (!isControlled) setLocalDigits(newDigits);
    onPlaceDigit?.(activeColumn, digit);
    setActiveColumn(null);
  }, [activeColumn, getSwapDigits, isControlled, onPlaceDigit]);

  const handleDragStart = useCallback((e: React.DragEvent, digit: number) => {
    e.dataTransfer.setData('text/plain', String(digit));
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, column: number) => {
    if (!isDragMode) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverColumn(column);
  }, [isDragMode]);

  const handleDragLeave = useCallback(() => {
    setDragOverColumn(null);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, column: number) => {
    if (!isDragMode) return;
    e.preventDefault();
    const digit = parseInt(e.dataTransfer.getData('text/plain'), 10);
    if (isNaN(digit)) return;
    const newDigits = getSwapDigits(column, digit);
    if (!isControlled) setLocalDigits(newDigits);
    onPlaceDigit?.(column, digit);
    setDragOverColumn(null);
  }, [isDragMode, getSwapDigits, isControlled, onPlaceDigit]);

  const handleBankKeyDown = useCallback((e: React.KeyboardEvent, digit: number) => {
    if (lastActiveColumn === null) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      const newDigits = getSwapDigits(lastActiveColumn, digit);
      if (!isControlled) setLocalDigits(newDigits);
      onPlaceDigit?.(lastActiveColumn, digit);
    }
  }, [lastActiveColumn, getSwapDigits, isControlled, onPlaceDigit]);

  useEffect(() => {
    if (targetNumber === undefined) {
      setFeedbackState(null);
      return;
    }
    const allFilled = digits.every(d => d !== null);
    if (!allFilled) {
      setFeedbackState(null);
      return;
    }
    const digitStr = digits.join('');
    const targetStr = String(targetNumber).padStart(numCols, '0');
    setFeedbackState(digitStr === targetStr ? 'correct' : 'incorrect');
    const timer = setTimeout(() => setFeedbackState(null), 2000);
    return () => clearTimeout(timer);
  }, [digits, targetNumber, numCols]);

  const gridStyle = {
    gridTemplateColumns: `repeat(${numCols}, 56px)`,
  };

  return (
    <div className={cn("flex flex-col items-center gap-6", className)}>
      <div
        role="grid"
        aria-label="Place value chart"
        style={gridStyle}
        className={cn(
          "grid gap-px",
          feedbackState === 'correct' && 'ring-4 ring-muted-green rounded-lg',
          feedbackState === 'incorrect' && 'ring-4 ring-soft-amber rounded-lg'
        )}
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
          const digit = digits[idx];
          const isEmpty = digit === null;
          const isDragOver = dragOverColumn === idx;

          return (
            <div
              key={col.label}
              role="gridcell"
              aria-label={col.ariaLabel}
              tabIndex={interactive ? 0 : -1}
              className={cn(
                "flex items-center justify-center w-14 h-14 text-2xl font-bold select-none transition-colors duration-150",
                isEmpty && !isDragOver && "border-2 border-dashed border-soft-blue bg-warm-off-white rounded-md",
                !isEmpty && "bg-warm-off-white rounded-md",
                isDragOver && "bg-soft-blue/20 border-2 border-soft-blue rounded-md",
                interactive && "cursor-pointer",
                !interactive && "cursor-default"
              )}
              onClick={() => handleCellClick(idx)}
              onDragOver={(e) => handleDragOver(e, idx)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, idx)}
              onFocus={() => setLastActiveColumn(idx)}
            >
              {digit !== null ? digit : ''}
            </div>
          );
        })}
      </div>

      {interactive && activeColumn !== null && !isDragMode && (
        <div
          role="radiogroup"
          aria-label="Select a digit"
          className="flex flex-wrap gap-2 justify-center"
        >
          {Array.from({ length: 10 }, (_, i) => i).map((digit) => (
            <button
              key={digit}
              type="button"
              role="option"
              aria-label={`Digit ${digit}`}
              aria-selected={digits[activeColumn] === digit}
              className="w-14 h-14 rounded-lg bg-white border-2 border-soft-blue text-xl font-bold text-slate-text hover:bg-soft-blue/10 focus:ring-2 focus:ring-soft-blue focus:outline-none"
              onClick={() => handleDigitSelect(digit)}
            >
              {digit}
            </button>
          ))}
        </div>
      )}

      {isDragMode && draggableDigits && (
        <div className="flex flex-wrap gap-2 justify-center" aria-label="Digit bank">
          {draggableDigits.map((digit, idx) => (
            <div
              key={`${digit}-${idx}`}
              draggable
              role="button"
              aria-label={`Digit ${digit}, drag to place in chart`}
              tabIndex={0}
              className="w-14 h-14 rounded-lg bg-white border-2 border-soft-blue text-xl font-bold text-slate-text flex items-center justify-center cursor-grab active:cursor-grabbing select-none"
              onDragStart={(e) => handleDragStart(e, digit)}
              onKeyDown={(e) => handleBankKeyDown(e, digit)}
            >
              {digit}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
