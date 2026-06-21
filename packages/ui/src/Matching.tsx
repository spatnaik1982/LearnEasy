import { useMemo } from "react";
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

export function Matching({
  pairs,
  connections,
  selectedLeftId,
  selectedRightId,
  onSelectLeft,
  onSelectRight,
  onUndo,
  showResult,
  correctPairs,
}: MatchingProps) {
  const isMatched = (id: string) => id in connections;

  const getResult = (id: string): "correct" | "incorrect" | undefined => {
    if (!showResult || !correctPairs) return undefined;
    return correctPairs[id] === connections[id] ? "correct" : "incorrect";
  };

  const shuffled = useMemo(() => {
    const seed = pairs.map((p) => p.id).join("-");
    return seededShuffle(pairs, seed);
  }, [pairs]);

  return (
    <div className="flex gap-6" role="group" aria-label="Matching activity">
      <div className="flex flex-col gap-4" role="list" aria-label="Left column items">
        {pairs.map((pair) => {
          const matched = isMatched(pair.id);
          const selected = selectedLeftId === pair.id;
          const result = getResult(pair.id);
          return (
            <button
              key={pair.id}
              onClick={() => onSelectLeft(pair.id)}
              className={cn(
                "min-h-[56px] rounded-lg px-4 py-3 text-left text-lg font-medium text-slate-text",
                "border-l-4 border-soft-blue focus:outline-none focus:ring-2 focus:ring-soft-blue focus:ring-offset-2",
                matched && "border-muted-green opacity-70",
                !matched && selected && "bg-soft-blue/10",
                !matched && !selected && "bg-white",
                result === "incorrect" && "border-soft-coral",
              )}
              role="listitem"
              data-matched={matched || undefined}
              data-result={result || undefined}
              aria-pressed={selected}
              aria-disabled={matched}
              disabled={matched}
            >
              {pair.itemA}
            </button>
          );
        })}
      </div>

      <div className="flex flex-col gap-4" role="list" aria-label="Right column items">
        {shuffled.map((pair) => {
          const matched = isMatched(pair.id);
          const selected = selectedRightId === pair.id;
          const result = getResult(pair.id);
          return (
            <button
              key={pair.id}
              onClick={() => !matched && onSelectRight(pair.id)}
              className={cn(
                "min-h-[56px] rounded-lg px-4 py-3 text-left text-lg font-medium text-slate-text",
                "border-l-4 border-muted-teal focus:outline-none focus:ring-2 focus:ring-muted-teal focus:ring-offset-2",
                matched && "border-muted-green opacity-70",
                !matched && selected && "bg-muted-teal/10",
                !matched && !selected && "bg-white",
                result === "incorrect" && "border-soft-coral",
              )}
              role="listitem"
              data-matched={matched || undefined}
              data-result={result || undefined}
              aria-pressed={selected}
              aria-disabled={matched}
              disabled={matched}
            >
              {pair.itemB}
            </button>
          );
        })}
      </div>

      {Object.keys(connections).length > 0 && (
        <button
          onClick={onUndo}
          className="self-start rounded-lg px-3 py-2 text-sm font-medium text-slate-text hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-soft-blue"
          aria-label="Undo last match"
        >
          Undo
        </button>
      )}
    </div>
  );
}
