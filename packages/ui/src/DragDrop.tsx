import { useState, useCallback, useRef } from "react";
import { cn } from "./utils";
import { useAccessibility } from "./useAccessibility";

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
  const itemsContainerRef = useRef<HTMLDivElement>(null);
  const targetsContainerRef = useRef<HTMLDivElement>(null);
  const { announce } = useAccessibility();

  const handleItemClick = useCallback(
    (itemId: string) => {
      setSelectedItem(itemId);
      const item = items.find((i) => i.id === itemId);
      announce(`Selected ${item?.label || itemId}. Press Tab to move to targets, then Enter to place.`);
    },
    [items, announce],
  );

  const handleTargetClick = useCallback(
    (targetId: string) => {
      if (!selectedItem) return;

      const item = items.find((i) => i.id === selectedItem);
      const target = targets.find((t) => t.id === targetId);
      setPlaced((prev) => new Map(prev).set(selectedItem, targetId));
      announce(`Placed ${item?.label || selectedItem} into ${target?.label || targetId}`);
      onDrop(selectedItem, targetId);
      setSelectedItem(null);
    },
    [selectedItem, onDrop, items, targets, announce],
  );

  const handleItemKeyDown = useCallback(
    (e: React.KeyboardEvent, itemId: string, index: number) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleItemClick(itemId);
        return;
      }
      if (e.key === "ArrowDown" || e.key === "ArrowRight") {
        e.preventDefault();
        const nextIndex = Math.min(index + 1, items.length - 1);
        const buttons = itemsContainerRef.current?.querySelectorAll("button");
        if (buttons && buttons[nextIndex]) {
          (buttons[nextIndex] as HTMLButtonElement).focus();
        }
        return;
      }
      if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
        e.preventDefault();
        const prevIndex = Math.max(index - 1, 0);
        const buttons = itemsContainerRef.current?.querySelectorAll("button");
        if (buttons && buttons[prevIndex]) {
          (buttons[prevIndex] as HTMLButtonElement).focus();
        }
        return;
      }
    },
    [handleItemClick, items.length],
  );

  const handleTargetKeyDown = useCallback(
    (e: React.KeyboardEvent, targetId: string, index: number) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleTargetClick(targetId);
        return;
      }
      if (e.key === "ArrowDown" || e.key === "ArrowRight") {
        e.preventDefault();
        const nextIndex = Math.min(index + 1, targets.length - 1);
        const buttons = targetsContainerRef.current?.querySelectorAll("button");
        if (buttons && buttons[nextIndex]) {
          (buttons[nextIndex] as HTMLButtonElement).focus();
        }
        return;
      }
      if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
        e.preventDefault();
        const prevIndex = Math.max(index - 1, 0);
        const buttons = targetsContainerRef.current?.querySelectorAll("button");
        if (buttons && buttons[prevIndex]) {
          (buttons[prevIndex] as HTMLButtonElement).focus();
        }
        return;
      }
    },
    [handleTargetClick, targets.length],
  );

  return (
    <div className={cn("flex gap-4", className)}>
      <div role="group" aria-label="Available items">
        <p className="mb-3 text-sm font-medium text-on-surface-variant">Items</p>
        <div ref={itemsContainerRef} className="flex flex-col gap-4" role="list" aria-label="Drag items list">
          {items.map((item, index) => {
            const isPlaced = placed.has(item.id);
            const isSelected = selectedItem === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleItemClick(item.id)}
                onKeyDown={(e) => handleItemKeyDown(e, item.id, index)}
                role="listitem"
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
                aria-describedby={isPlaced ? undefined : "drag-instructions"}
              >
                {item.emoji && <span className="mr-2" aria-hidden="true">{item.emoji}</span>}
                {item.label}
              </button>
            );
          })}
        </div>
        {items.length > 0 && (
          <div id="drag-instructions" className="sr-only">
            Use Arrow keys to move between items, Enter or Space to select, Tab to switch to targets.
          </div>
        )}
      </div>

      <div role="group" aria-label="Target zones">
        <p className="mb-3 text-sm font-medium text-on-surface-variant">Targets</p>
        <div ref={targetsContainerRef} className="flex flex-col gap-4" role="list" aria-label="Drop targets list">
          {targets.map((target, index) => {
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
                onKeyDown={(e) => handleTargetKeyDown(e, target.id, index)}
                role="listitem"
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
                aria-dropeffect={selectedItem && !placedItem ? "move" : "none"}
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
