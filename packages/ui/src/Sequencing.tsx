import { useState, useCallback } from "react";
import { cn } from "./utils";

export interface SequencingItem {
  id: string;
  label: string;
  emoji?: string;
}

export interface SequencingProps {
  items: SequencingItem[];
  correctOrder: string[];
  onComplete: (isCorrect: boolean) => void;
  className?: string;
}

export function Sequencing({
  items,
  correctOrder,
  onComplete,
  className,
}: SequencingProps) {
  const [available, setAvailable] = useState<SequencingItem[]>(items);
  const [sequence, setSequence] = useState<SequencingItem[]>([]);
  const [isComplete, setIsComplete] = useState(false);

  const handleAddToSequence = useCallback(
    (item: SequencingItem) => {
      if (isComplete) return;

      const newSequence = [...sequence, item];
      const newAvailable = available.filter((a) => a.id !== item.id);
      setSequence(newSequence);
      setAvailable(newAvailable);

      if (newSequence.length === items.length) {
        setIsComplete(true);
        const correct = newSequence.every(
          (s, i) => s.id === correctOrder[i],
        );
        onComplete(correct);
      }
    },
    [sequence, available, items.length, correctOrder, onComplete, isComplete],
  );

  const handleRemoveFromSequence = useCallback(
    (item: SequencingItem) => {
      if (isComplete) return;

      setSequence((prev) => prev.filter((s) => s.id !== item.id));
      setAvailable((prev) => [...prev, item]);
    },
    [isComplete],
  );

  const handleMoveUp = useCallback(
    (index: number) => {
      if (index === 0 || isComplete) return;
      const newSequence = [...sequence];
      [newSequence[index - 1], newSequence[index]] = [
        newSequence[index],
        newSequence[index - 1],
      ];
      setSequence(newSequence);
    },
    [sequence, isComplete],
  );

  const handleMoveDown = useCallback(
    (index: number) => {
      if (index === sequence.length - 1 || isComplete) return;
      const newSequence = [...sequence];
      [newSequence[index], newSequence[index + 1]] = [
        newSequence[index + 1],
        newSequence[index],
      ];
      setSequence(newSequence);
    },
    [sequence, isComplete],
  );

  const handleAvailableKeyDown = useCallback(
    (e: React.KeyboardEvent, item: SequencingItem) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleAddToSequence(item);
      }
    },
    [handleAddToSequence],
  );

  const handleSequenceKeyDown = useCallback(
    (e: React.KeyboardEvent, item: SequencingItem) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleRemoveFromSequence(item);
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        const idx = sequence.findIndex((s) => s.id === item.id);
        handleMoveUp(idx);
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        const idx = sequence.findIndex((s) => s.id === item.id);
        handleMoveDown(idx);
      }
    },
    [handleRemoveFromSequence, handleMoveUp, handleMoveDown, sequence],
  );

  return (
    <div className={cn("flex flex-col gap-6", className)}>
      <div role="group" aria-label="Available items">
        <p className="mb-3 text-sm font-medium text-on-surface-variant">Click items to add to sequence</p>
        <div className="flex flex-wrap gap-4">
          {available.map((item) => (
            <button
              key={item.id}
              onClick={() => handleAddToSequence(item)}
              onKeyDown={(e) => handleAvailableKeyDown(e, item)}
              className={cn(
                "min-h-[56px] rounded-lg border-2 px-4 py-2 text-base font-medium text-slate-text",
                "focus:outline-none focus:ring-2 focus:ring-soft-blue focus:ring-offset-2",
                "border-slate-300 bg-white hover:border-slate-400",
              )}
            >
              {item.emoji && <span className="mr-2" aria-hidden="true">{item.emoji}</span>}
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div role="group" aria-label="Your sequence">
        <p className="mb-3 text-sm font-medium text-on-surface-variant">Your sequence (click to remove, arrow keys to reorder)</p>
        {sequence.length === 0 ? (
          <div className="flex min-h-[52px] items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-slate-50">
            <span className="text-sm text-on-surface-variant">Select items above to build your sequence</span>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {sequence.map((item, index) => (
              <div
                key={item.id}
                className={cn(
                  "flex items-center gap-2 rounded-lg border-2 px-4 py-2",
                  "border-slate-300 bg-white",
                )}
              >
                <span className="flex h-7 w-7 items-center justify-center rounded bg-slate-200 text-sm font-bold text-slate-600">
                  {index + 1}
                </span>
                <button
                  onClick={() => handleRemoveFromSequence(item)}
                  onKeyDown={(e) => handleSequenceKeyDown(e, item)}
                  className={cn(
                    "min-h-[56px] flex-1 text-left text-base font-medium text-slate-text",
                    "focus:outline-none focus:ring-2 focus:ring-soft-blue focus:ring-offset-2 rounded",
                    "px-2",
                  )}
                  aria-label={`${item.label} at position ${index + 1}. Press Enter to remove, Arrow keys to reorder.`}
                >
                  {item.emoji && <span className="mr-2" aria-hidden="true">{item.emoji}</span>}
                  {item.label}
                </button>
                <div className="flex flex-col gap-1">
                  <button
                    onClick={() => handleMoveUp(index)}
                    disabled={index === 0 || isComplete}
                    className={cn(
                      "flex h-5 w-7 items-center justify-center rounded text-xs font-bold",
                      "focus:outline-none focus:ring-2 focus:ring-soft-blue",
                      index > 0 && !isComplete
                        ? "bg-slate-200 text-slate-600 hover:bg-slate-300"
                        : "bg-slate-100 text-slate-300",
                    )}
                    aria-label={`Move ${item.label} up`}
                    tabIndex={-1}
                  >
                    ▲
                  </button>
                  <button
                    onClick={() => handleMoveDown(index)}
                    disabled={index === sequence.length - 1 || isComplete}
                    className={cn(
                      "flex h-5 w-7 items-center justify-center rounded text-xs font-bold",
                      "focus:outline-none focus:ring-2 focus:ring-soft-blue",
                      index < sequence.length - 1 && !isComplete
                        ? "bg-slate-200 text-slate-600 hover:bg-slate-300"
                        : "bg-slate-100 text-slate-300",
                    )}
                    aria-label={`Move ${item.label} down`}
                    tabIndex={-1}
                  >
                    ▼
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}