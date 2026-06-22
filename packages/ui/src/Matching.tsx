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
  onConnect: (leftId: string, rightId: string) => void;
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
  isSelected,
  result,
  onSelect,
}: {
  pair: MatchingPair;
  isMatched: boolean;
  isDragging: boolean;
  isSelected: boolean;
  result?: "correct" | "incorrect";
  onSelect: () => void;
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
      style={{ ...style, animation: isMatched ? "dropAppear 200ms ease-out" : undefined }}
      onClick={onSelect}
      className={cn(
        "min-h-[56px] rounded-lg px-4 py-3 text-left text-lg font-medium text-slate-text",
        "border-l-4 border-soft-blue focus:outline-none focus:ring-2 focus:ring-soft-blue focus:ring-offset-2",
        "touch-none select-none",
        isMatched && "border-muted-green opacity-70",
        isDragging && "opacity-50 shadow-lg",
        !isMatched && isSelected && "bg-soft-blue/10 ring-2 ring-soft-blue ring-offset-2",
        !isMatched && !isSelected && "bg-white",
        result === "incorrect" && "border-soft-coral",
      )}
      aria-label={`Match: ${pair.itemA}${isSelected ? ", selected" : ""}`}
      aria-pressed={isSelected}
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
      style={{ animation: isMatched ? "dropAppear 200ms ease-out" : undefined }}
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
  onConnect,
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
      onConnect(leftId, rightId);
    }
  }, [onConnect]);

  const hasConnections = Object.keys(connections).length > 0;

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
      <div className="flex flex-col gap-4" role="group" aria-label="Matching activity">
        <p className="text-sm font-medium text-on-surface-variant">
          {selectedLeftId
            ? "Now tap the matching item on the right"
            : "Drag a left item to its match on the right, or tap a left item then tap its match"}
        </p>
        <div className="flex flex-col gap-6 sm:flex-row sm:gap-6">
          <div className="flex flex-1 flex-col gap-4" role="list" aria-label="Left column items">
            {pairs.map((pair) => {
              const matched = isMatched(pair.id);
              const result = getResult(pair.id);
              return (
                <DraggableLeftItem
                  key={pair.id}
                  pair={pair}
                  isMatched={matched}
                  isDragging={draggingLeftId === pair.id}
                  isSelected={selectedLeftId === pair.id}
                  result={result}
                  onSelect={() => !matched && onSelectLeft(pair.id)}
                />
              );
            })}
          </div>

          <div className="flex flex-1 flex-col gap-4" role="list" aria-label="Right column items">
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
        </div>

        {hasConnections && (
          <button
            onClick={onUndo}
            className="self-start rounded-lg px-4 py-2 min-h-[44px] text-sm font-medium text-slate-text hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-soft-blue focus:ring-offset-2"
            aria-label="Undo last match"
            type="button"
          >
            Undo last match
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
