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
        "seq-drop flex items-center gap-3 rounded-lg border-2 px-3 py-2 bg-white",
        "touch-none",
        isDragging && "opacity-50 shadow-lg z-50",
        result === "correct" && "border-muted-green",
        result === "incorrect" && "border-soft-coral",
        !result && "border-slate-300",
      )}
      role="listitem"
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="flex h-10 w-10 min-h-[44px] min-w-[44px] cursor-grab items-center justify-center rounded text-slate-400 hover:bg-slate-100 hover:text-slate-600 focus:outline-none focus:ring-2 focus:ring-soft-blue active:cursor-grabbing"
        aria-label={`Drag to reorder ${item.label}`}
      >
        ⠿
      </button>

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

      <span className="flex-1 text-base font-medium text-slate-text">
        {item.emoji && <span className="mr-2" aria-hidden="true">{item.emoji}</span>}
        {item.label}
      </span>

      <button
        onClick={onRemove}
        className="flex h-10 w-10 min-h-[44px] min-w-[44px] items-center justify-center rounded text-slate-400 hover:bg-slate-100 hover:text-slate-600 focus:outline-none focus:ring-2 focus:ring-soft-blue"
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
      <style>{`
  @keyframes dropAppear {
    from { opacity: 0; transform: scale(0.9); }
    to { opacity: 1; transform: scale(1); }
  }
  @media (prefers-reduced-motion: reduce) {
    .seq-drop { animation: none !important; }
  }
`}</style>
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
            Drag ⠿ to reorder
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
