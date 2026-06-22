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
  onPlaceItem: (itemId: string, targetId: string) => void;
  onRemoveItem: (itemId: string) => void;
  showResult?: boolean;
  correctPlacements?: Record<string, string>;
}

function DraggableItem({
  item,
  isSelected,
  showResult: _showResult,
  result,
  onSelect,
}: {
  item: DragDropItem;
  isSelected: boolean;
  showResult?: boolean;
  result?: "correct" | "incorrect";
  onSelect: () => void;
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
      onClick={onSelect}
      className={cn(
        "min-h-[56px] rounded-lg border-2 px-4 py-2 text-base font-medium text-slate-text",
        "focus:outline-none focus:ring-2 focus:ring-soft-blue focus:ring-offset-2",
        "touch-none select-none",
        isDragging && "opacity-50",
        isSelected
          ? "border-soft-blue bg-soft-blue/10 ring-2 ring-soft-blue ring-offset-2"
          : "border-slate-300 bg-white hover:border-slate-400",
        result === "correct" && "!border-muted-green",
        result === "incorrect" && "!border-soft-coral",
      )}
      aria-label={item.label}
      aria-pressed={isSelected}
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
  onPlaceSelected,
  isDragOver,
}: {
  target: DragDropTarget;
  placedItems: DragDropItem[];
  selectedItemId: string | null;
  showResult?: boolean;
  getResult: (itemId: string) => "correct" | "incorrect" | undefined;
  onRemoveItem: (itemId: string) => void;
  onPlaceSelected: () => void;
  isDragOver: boolean;
}) {
  const isEmpty = placedItems.length === 0;
  const { setNodeRef, isOver } = useDroppable({
    id: `target-${target.id}`,
    data: { target },
  });

  const highlightDrop = isDragOver || isOver;
  const canPlace = !showResult && selectedItemId !== null;

  return (
    <div
      ref={setNodeRef}
      data-target={target.id}
      onClick={() => {
        if (canPlace) onPlaceSelected();
      }}
      className={cn(
        "flex flex-col gap-3 rounded-lg border-2 px-4 py-3 transition-colors duration-150",
        isEmpty
          ? "border-dashed border-slate-300 bg-slate-50"
          : "border-solid border-slate-300 bg-white",
        highlightDrop && "!border-soft-blue !bg-soft-blue/5",
        canPlace && "cursor-pointer hover:!border-soft-blue hover:!bg-soft-blue/5",
      )}
      role="button"
      tabIndex={canPlace ? 0 : -1}
      aria-label={`Target: ${target.label}${isEmpty ? ", empty" : ""}${canPlace ? ", click to place selected item" : ""}`}
      onKeyDown={(e) => {
        if (canPlace && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onPlaceSelected();
        }
      }}
    >
      <span className="text-sm font-medium text-on-surface-variant">
        {target.label}
      </span>
      {isEmpty && (
        <span className="text-sm text-on-surface-variant">
          {canPlace ? "Click to place item here" : "Drop items here"}
        </span>
      )}
      {placedItems.map((item) => {
        const result = getResult(item.id);
        return (
          <div
            key={item.id}
            data-result={result || undefined}
            className={cn(
              "dd-drop flex items-center gap-2 rounded-lg border px-3 py-2",
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
                className="flex h-10 w-10 min-h-[44px] min-w-[44px] items-center justify-center rounded text-slate-400 hover:bg-slate-100 hover:text-slate-600 focus:outline-none focus:ring-2 focus:ring-soft-blue"
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
  selectedItemId,
  onSelectItem,
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
    const itemId = (active.data.current?.item as DragDropItem | undefined)?.id;
    if (!itemId) return;
    onPlaceItem(itemId, targetId);
  }, [onPlaceItem]);

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
  @media (prefers-reduced-motion: reduce) {
    .dd-drop { animation: none !important; }
  }
`}</style>
      <div className="flex flex-col gap-6" role="group" aria-label="Drag and drop activity">
        <div role="group" aria-label="Available items">
          <p className="mb-2 text-sm font-medium text-on-surface-variant">
            Drag items to targets, or tap an item then tap a target
          </p>
          <div className="flex flex-wrap gap-4" role="list" aria-label="Items to place">
            {unplacedItems.map((item) => (
              <DraggableItem
                key={item.id}
                item={item}
                isSelected={selectedItemId === item.id}
                showResult={showResult}
                result={getResult(item.id)}
                onSelect={() => onSelectItem(item.id)}
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
                selectedItemId={selectedItemId}
                showResult={showResult}
                getResult={getResult}
                onRemoveItem={onRemoveItem}
                onPlaceSelected={() => {
                  if (selectedItemId) onPlaceItem(selectedItemId, target.id);
                }}
                isDragOver={activeItem !== null}
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
