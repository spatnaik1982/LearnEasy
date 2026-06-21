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
            style={{ animation: "dropAppear 200ms ease-out" }}
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
      <style>{`
  @keyframes dropAppear {
    from { opacity: 0; transform: scale(0.9); }
    to { opacity: 1; transform: scale(1); }
  }
`}</style>
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
