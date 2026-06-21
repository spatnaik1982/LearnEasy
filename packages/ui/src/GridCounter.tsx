import { useState, useCallback, useRef } from "react";
import { cn } from "./utils";

export interface GridCounterProps {
  rows: number;
  cols: number;
  highlighted: { row: number; col: number }[];
  mode?: "area" | "perimeter";
  interactive?: boolean;
  maxHighlights?: number;
  cellSize?: number;
  showCount?: boolean;
  onHighlight: (cells: { row: number; col: number }[]) => void;
  onClearAll: () => void;
}

function cellKey(row: number, col: number) {
  return `${row},${col}`;
}

export function computePerimeter(
  cells: { row: number; col: number }[],
  rows: number,
  cols: number
): number {
  if (cells.length === 0) return 0;
  const cellSet = new Set(cells.map((c) => cellKey(c.row, c.col)));

  let perimeter = 0;
  for (const cell of cells) {
    const up = cellSet.has(cellKey(cell.row - 1, cell.col));
    const down = cellSet.has(cellKey(cell.row + 1, cell.col));
    const left = cellSet.has(cellKey(cell.row, cell.col - 1));
    const right = cellSet.has(cellKey(cell.row, cell.col + 1));
    if (!up) perimeter++;
    if (!down) perimeter++;
    if (!left) perimeter++;
    if (!right) perimeter++;
  }
  return perimeter;
}

export function GridCounter({
  rows,
  cols,
  highlighted,
  mode = "area",
  interactive = false,
  maxHighlights,
  cellSize: cellSizeProp,
  showCount = false,
  onHighlight,
  onClearAll,
}: GridCounterProps) {
  const [dragging, setDragging] = useState(false);
  const highlightedSet = new Set(highlighted.map((c) => cellKey(c.row, c.col)));
  const gridRef = useRef<HTMLDivElement>(null);

  const responsiveSize = cellSizeProp ?? Math.min(48, Math.max(32, Math.floor(600 / cols)));

  const label = mode === "area" ? "Area" : "Perimeter";
  const count = mode === "perimeter"
    ? computePerimeter(highlighted, rows, cols)
    : highlighted.length;
  const unit = mode === "area"
    ? (count === 1 ? "square" : "squares")
    : (count === 1 ? "unit" : "units");

  const handleCellPointerDown = useCallback(
    (_row: number, _col: number) => (e: React.PointerEvent) => {
      if (!interactive) return;
      e.preventDefault();
      setDragging(true);
    },
    [interactive]
  );

  const handlePointerEnter = useCallback(
    (row: number, col: number) => () => {
      if (!dragging || !interactive) return;
      const key = cellKey(row, col);
      const isHighlighted = highlightedSet.has(key);
      if (isHighlighted) return;
      if (maxHighlights !== undefined && highlighted.length >= maxHighlights) return;
      onHighlight([...highlighted, { row, col }]);
    },
    [dragging, interactive, highlightedSet, highlighted, maxHighlights, onHighlight]
  );

  const handlePointerUp = useCallback(() => {
    setDragging(false);
  }, []);

  const cells = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const key = cellKey(r, c);
      const isHighlighted = highlightedSet.has(key);

      const perimeterEdges = mode === "perimeter" && isHighlighted
        ? {
            borderTop: !highlightedSet.has(cellKey(r - 1, c)),
            borderBottom: !highlightedSet.has(cellKey(r + 1, c)),
            borderLeft: !highlightedSet.has(cellKey(r, c - 1)),
            borderRight: !highlightedSet.has(cellKey(r, c + 1)),
          }
        : null;

      cells.push(
        <div
          key={key}
          className="flex items-center justify-center"
          onPointerDown={handleCellPointerDown(r, c)}
          onPointerEnter={handlePointerEnter(r, c)}
          onPointerUp={handlePointerUp}
          onClick={() => {
            if (!interactive) return;
            const keyH = cellKey(r, c);
            const isHighlighted = highlightedSet.has(keyH);
            if (isHighlighted) {
              onHighlight(highlighted.filter((cell) => !(cell.row === r && cell.col === c)));
            } else {
              if (maxHighlights !== undefined && highlighted.length >= maxHighlights) return;
              onHighlight([...highlighted, { row: r, col: c }]);
            }
          }}
        >
          <div
            role={interactive ? "button" : "gridcell"}
            aria-label={`Row ${r + 1}, Column ${c + 1}, ${isHighlighted ? "highlighted" : "empty"}`}
            aria-pressed={interactive ? isHighlighted : undefined}
            tabIndex={interactive ? 0 : undefined}
            data-highlighted={isHighlighted}
            className={cn(
              "border",
              "border-gray-200",
              "select-none",
              interactive && "cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#76A5AF] focus-visible:ring-inset",
              isHighlighted && "bg-[#76A5AF]",
              !isHighlighted && "bg-white",
              perimeterEdges?.borderTop && "!border-t-[3px] !border-t-[#76A5AF]",
              perimeterEdges?.borderBottom && "!border-b-[3px] !border-b-[#76A5AF]",
              perimeterEdges?.borderLeft && "!border-l-[3px] !border-l-[#76A5AF]",
              perimeterEdges?.borderRight && "!border-r-[3px] !border-r-[#76A5AF]",
            )}
            style={{ width: responsiveSize, height: responsiveSize, minWidth: responsiveSize, minHeight: responsiveSize }}
            onKeyDown={(e) => {
              if (!interactive) return;
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                if (isHighlighted) {
                  onHighlight(highlighted.filter((cell) => !(cell.row === r && cell.col === c)));
                } else {
                  if (maxHighlights !== undefined && highlighted.length >= maxHighlights) return;
                  onHighlight([...highlighted, { row: r, col: c }]);
                }
              }
            }}
          />
        </div>
      );
    }
  }

  return (
    <div className={cn("flex flex-col items-center gap-4")}>
      <div
        ref={gridRef}
        role="grid"
        aria-label={`${rows} by ${cols} grid, ${mode} mode`}
        className="inline-grid"
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${cols}, ${responsiveSize}px)`,
        }}
      >
        {cells}
      </div>
      {showCount && (
        <div aria-live="polite" className="text-lg font-semibold text-slate-text text-left">
          {label}: {count} {unit}
        </div>
      )}
      {interactive && highlighted.length > 0 && (
        <button
          type="button"
          onClick={onClearAll}
          className="px-4 py-2 text-sm font-medium text-white bg-[#5D87B1] rounded-lg hover:opacity-90"
        >
          Clear All
        </button>
      )}
    </div>
  );
}
