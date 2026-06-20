import { useState, useCallback } from "react";
import { cn } from "./utils";

export interface GridCounterProps {
  rows: number;
  cols: number;
  highlighted?: { row: number; col: number }[];
  showGridLines?: boolean;
  mode?: "area" | "perimeter";
  interactive?: boolean;
  maxHighlights?: number;
  onHighlight?: (cells: { row: number; col: number }[]) => void;
  showCount?: boolean;
  cellSize?: number;
  className?: string;
}

function cellKey(row: number, col: number) {
  return `${row},${col}`;
}

export function GridCounter({
  rows,
  cols,
  highlighted: externalHighlights,
  showGridLines = true,
  mode = "area",
  interactive = false,
  maxHighlights,
  onHighlight,
  showCount = false,
  cellSize = 40,
  className,
}: GridCounterProps) {
  const [internalHighlights, setInternalHighlights] = useState<
    { row: number; col: number }[]
  >([]);

  const isControlled = externalHighlights !== undefined;
  const highlights = isControlled ? externalHighlights : internalHighlights;
  const highlightedSet = new Set(highlights.map((c) => cellKey(c.row, c.col)));

  const label = mode === "area" ? "Area" : "Perimeter";
  const unit = mode === "area" ? (highlights.length === 1 ? "square" : "squares") : (highlights.length === 1 ? "unit" : "units");

  const handleCellClick = useCallback(
    (row: number, col: number) => {
      if (!interactive || isControlled) return;

      const key = cellKey(row, col);
      let updated: { row: number; col: number }[];

      if (highlightedSet.has(key)) {
        updated = highlights.filter(
          (c) => !(c.row === row && c.col === col),
        );
      } else {
        if (maxHighlights !== undefined && highlights.length >= maxHighlights)
          return;
        updated = [...highlights, { row, col }];
      }

      setInternalHighlights(updated);
      onHighlight?.(updated);
    },
    [
      interactive,
      isControlled,
      highlights,
      highlightedSet,
      maxHighlights,
      onHighlight,
    ],
  );

  const cells = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const key = cellKey(r, c);
      const isHighlighted = highlightedSet.has(key);
      const cellContent = interactive ? (
        <button
          type="button"
          role="gridcell"
          aria-label={`Row ${r + 1}, Column ${c + 1}, ${isHighlighted ? "highlighted" : "empty"}`}
          aria-pressed={isHighlighted}
          onClick={() => handleCellClick(r, c)}
          data-highlighted={isHighlighted}
          className={cn(
            "border",
            showGridLines ? "border-gray-200" : "border-transparent",
            "focus:outline-none focus:ring-2 focus:ring-muted-teal focus:ring-inset",
            "cursor-pointer",
            isHighlighted ? "bg-[#76A5AF]" : "bg-white",
          )}
          style={{ width: cellSize, height: cellSize, minWidth: cellSize, minHeight: cellSize }}
        />
      ) : (
        <div
          role="gridcell"
          aria-label={`Row ${r + 1}, Column ${c + 1}, ${isHighlighted ? "highlighted" : "empty"}`}
          data-highlighted={isHighlighted}
          className={cn(
            "border",
            showGridLines ? "border-gray-200" : "border-transparent",
            isHighlighted ? "bg-[#76A5AF]" : "bg-white",
          )}
          style={{ width: cellSize, height: cellSize, minWidth: cellSize, minHeight: cellSize }}
        />
      );
      cells.push(
        <div key={key} className="flex items-center justify-center">
          {cellContent}
        </div>,
      );
    }
  }

  return (
    <div className={cn("flex flex-col items-center gap-4", className)}>
      <div
        role="grid"
        aria-label={`${rows} by ${cols} grid, ${mode} mode`}
        className="inline-grid"
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`,
        }}
      >
        {cells}
      </div>
      {showCount && (
        <div
          aria-live="polite"
          className="text-lg font-semibold text-slate-text text-left"
        >
          {label}: {highlights.length} {unit}
        </div>
      )}
    </div>
  );
}
