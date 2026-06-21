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

export function Sequencing({
  items,
  userOrder,
  onAddItem,
  onRemoveItem,
  onReorder,
  showResult,
  correctOrder,
}: SequencingProps) {
  const sequencedIds = new Set(userOrder);
  const availableItems = items.filter((item) => !sequencedIds.has(item.id));
  const sequencedItems = userOrder
    .map((id) => items.find((item) => item.id === id))
    .filter(Boolean) as SequencingItem[];

  const getResult = (itemId: string, index: number): "correct" | "incorrect" | undefined => {
    if (!showResult || !correctOrder) return undefined;
    return correctOrder[index] === itemId ? "correct" : "incorrect";
  };

  return (
    <div className="flex flex-col gap-6" role="group" aria-label="Sequencing activity">
      <div role="group" aria-label="Available items">
        <p className="mb-3 text-sm font-medium text-on-surface-variant">
          Click items to add to sequence
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
          Your sequence
        </p>
        {sequencedItems.length === 0 ? (
          <div className="flex min-h-[52px] items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-slate-50">
            <span className="text-sm text-on-surface-variant">
              Select items above to build your sequence
            </span>
          </div>
        ) : (
          <div className="flex flex-col gap-2" role="list" aria-label="Your ordered sequence">
            {sequencedItems.map((item, index) => {
              const result = getResult(item.id, index);
              return (
                <div
                  key={item.id}
                  data-result={result || undefined}
                  className={cn(
                    "flex items-center gap-3 rounded-lg border-2 px-3 py-2",
                    result === "correct" && "border-muted-green",
                    result === "incorrect" && "border-soft-coral",
                    !result && "border-slate-300",
                  )}
                  role="listitem"
                >
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
                  <button
                    onClick={() => onRemoveItem(item.id)}
                    className="min-h-[56px] flex-1 rounded px-2 text-left text-base font-medium text-slate-text focus:outline-none focus:ring-2 focus:ring-soft-blue"
                    type="button"
                    aria-label={`Remove ${item.label}`}
                  >
                    {item.emoji && <span className="mr-2" aria-hidden="true">{item.emoji}</span>}
                    {item.label}
                  </button>
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={() => onReorder(index, index - 1)}
                      disabled={index === 0}
                      className="flex h-14 w-14 items-center justify-center rounded-lg border-2 border-soft-blue text-sm font-bold text-soft-blue hover:bg-soft-blue/10 focus:outline-none focus:ring-2 focus:ring-soft-blue disabled:cursor-not-allowed disabled:opacity-40"
                      aria-label={`Move ${item.label} up`}
                      type="button"
                    >
                      ▲
                    </button>
                    <button
                      onClick={() => onReorder(index, index + 1)}
                      disabled={index === sequencedItems.length - 1}
                      className="flex h-14 w-14 items-center justify-center rounded-lg border-2 border-soft-blue text-sm font-bold text-soft-blue hover:bg-soft-blue/10 focus:outline-none focus:ring-2 focus:ring-soft-blue disabled:cursor-not-allowed disabled:opacity-40"
                      aria-label={`Move ${item.label} down`}
                      type="button"
                    >
                      ▼
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
