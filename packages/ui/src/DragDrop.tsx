import { useState, useCallback } from "react";
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
  onDrop: (itemId: string, targetId: string) => void;
  className?: string;
}

export function DragDrop({ items, targets, onDrop, className }: DragDropProps) {
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [placed, setPlaced] = useState<Map<string, string>>(new Map());

  const handleItemClick = useCallback((itemId: string) => {
    setSelectedItem(itemId);
  }, []);

  const handleTargetClick = useCallback(
    (targetId: string) => {
      if (!selectedItem) return;

      setPlaced((prev) => new Map(prev).set(selectedItem, targetId));
      onDrop(selectedItem, targetId);
      setSelectedItem(null);
    },
    [selectedItem, onDrop],
  );

  const handleItemKeyDown = useCallback(
    (e: React.KeyboardEvent, itemId: string) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleItemClick(itemId);
      }
    },
    [handleItemClick],
  );

  const handleTargetKeyDown = useCallback(
    (e: React.KeyboardEvent, targetId: string) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleTargetClick(targetId);
      }
    },
    [handleTargetClick],
  );

  return (
    <div className={cn("flex gap-4", className)}>
      <div role="group" aria-label="Available items">
        <p className="mb-3 text-sm font-medium text-on-surface-variant">Items</p>
        <div className="flex flex-col gap-4">
          {items.map((item) => {
            const isPlaced = placed.has(item.id);
            const isSelected = selectedItem === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleItemClick(item.id)}
                onKeyDown={(e) => handleItemKeyDown(e, item.id)}
                className={cn(
                  "min-h-[56px] rounded-lg border-2 px-4 py-2 text-left text-base font-medium text-slate-text",
                  "focus:outline-none focus:ring-2 focus:ring-soft-blue focus:ring-offset-2",
                  isPlaced && "opacity-40",
                  isSelected && !isPlaced
                    ? "border-soft-blue bg-soft-blue/10"
                    : "border-slate-300 bg-white hover:border-slate-400",
                )}
                aria-pressed={isSelected}
                aria-disabled={isPlaced}
                disabled={isPlaced}
              >
                {item.emoji && <span className="mr-2" aria-hidden="true">{item.emoji}</span>}
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      <div role="group" aria-label="Target zones">
        <p className="mb-3 text-sm font-medium text-on-surface-variant">Targets</p>
        <div className="flex flex-col gap-4">
          {targets.map((target) => {
            const placedItemId = [...placed.entries()].find(
              ([, tId]) => tId === target.id,
            )?.[0];
            const placedItem = placedItemId
              ? items.find((i) => i.id === placedItemId)
              : null;

            return (
              <button
                key={target.id}
                onClick={() => handleTargetClick(target.id)}
                onKeyDown={(e) => handleTargetKeyDown(e, target.id)}
                className={cn(
                  "min-h-[56px] rounded-lg border-2 border-dashed px-4 py-2 text-left text-base font-medium",
                  "focus:outline-none focus:ring-2 focus:ring-soft-blue focus:ring-offset-2",
                  placedItem
                    ? "border-muted-green bg-muted-green/10 text-muted-green"
                    : selectedItem
                      ? "border-soft-blue bg-soft-blue/10 text-on-surface-variant"
                      : "border-slate-300 bg-slate-50 text-on-surface-variant",
                )}
                aria-label={`Target: ${target.label}${placedItem ? `, contains ${placedItem.label}` : ", empty"}`}
              >
                {placedItem ? (
                  <>
                    {placedItem.emoji && <span className="mr-2" aria-hidden="true">{placedItem.emoji}</span>}
                    {placedItem.label}
                  </>
                ) : (
                  target.label
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}