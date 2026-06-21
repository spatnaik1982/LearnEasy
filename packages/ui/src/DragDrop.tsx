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
  const placedIds = new Set(Object.keys(placements));
  const unplacedItems = items.filter((item) => !placedIds.has(item.id));

  const getResult = (itemId: string): "correct" | "incorrect" | undefined => {
    if (!showResult || !correctPlacements) return undefined;
    return correctPlacements[itemId] === placements[itemId]
      ? "correct"
      : "incorrect";
  };

  return (
    <div className="flex flex-col gap-6" role="group" aria-label="Drag and drop activity">
      <div role="group" aria-label="Available items">
        <div className="flex flex-wrap gap-4" role="list" aria-label="Items to place">
          {unplacedItems.map((item) => {
            const isSelected = selectedItemId === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectItem(item.id)}
                className={cn(
                  "min-h-[56px] rounded-lg border-2 px-4 py-2 text-base font-medium text-slate-text",
                  "focus:outline-none focus:ring-2 focus:ring-soft-blue focus:ring-offset-2",
                  isSelected
                    ? "border-soft-blue bg-soft-blue/10"
                    : "border-slate-300 bg-white hover:border-slate-400",
                )}
                role="listitem"
                aria-pressed={isSelected}
              >
                {item.emoji && <span className="mr-2" aria-hidden="true">{item.emoji}</span>}
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2" role="group" aria-label="Target zones">
        {targets.map((target) => {
          const targetItems = items.filter(
            (item) => placements[item.id] === target.id,
          );
          const isEmpty = targetItems.length === 0;

          return (
            <div
              key={target.id}
              data-target={target.id}
              className={cn(
                "flex flex-col gap-3 rounded-lg border-2 px-4 py-3",
                "focus:outline-none focus:ring-2 focus:ring-soft-blue focus:ring-offset-2",
                isEmpty
                  ? "border-dashed border-slate-300 bg-slate-50"
                  : "border-solid border-slate-300 bg-white",
                selectedItemId && !isEmpty && "cursor-pointer",
              )}
              role="button"
              tabIndex={0}
              aria-label={`Target: ${target.label}${isEmpty ? ", empty" : ""}`}
              onClick={() => selectedItemId && onPlaceItem(target.id)}
              onKeyDown={(e) => {
                if ((e.key === "Enter" || e.key === " ") && selectedItemId) {
                  e.preventDefault();
                  onPlaceItem(target.id);
                }
              }}
            >
              <span className="text-sm font-medium text-on-surface-variant">
                {target.label}
              </span>
              {isEmpty && (
                <span className="text-sm text-on-surface-variant">
                  Drop items here
                </span>
              )}
              {targetItems.map((item) => {
                const result = getResult(item.id);
                return (
                  <div
                    key={item.id}
                    data-result={result || undefined}
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
                        className="flex h-8 w-8 items-center justify-center rounded text-slate-400 hover:bg-slate-100 hover:text-slate-600 focus:outline-none focus:ring-2 focus:ring-soft-blue"
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
        })}
      </div>
    </div>
  );
}
