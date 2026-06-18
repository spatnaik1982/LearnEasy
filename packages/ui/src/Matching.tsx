import { useState, useCallback } from "react";
import { cn } from "./utils";

export interface MatchingPair {
  id: string;
  itemA: string;
  itemB: string;
}

export interface MatchingProps {
  pairs: MatchingPair[];
  onMatch: (pairId: string) => void;
  className?: string;
}

type FeedbackState = "idle" | "correct" | "incorrect";

export function Matching({ pairs, onMatch, className }: MatchingProps) {
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<FeedbackState>("idle");
  const [feedbackPairId, setFeedbackPairId] = useState<string | null>(null);
  const [matchedIds, setMatchedIds] = useState<Set<string>>(new Set());

  const handleLeftClick = useCallback((pairId: string) => {
    setSelectedLeft(pairId);
    setFeedback("idle");
    setFeedbackPairId(null);
  }, []);

  const handleRightClick = useCallback(
    (pairId: string) => {
      if (!selectedLeft) return;

      if (selectedLeft === pairId) {
        setFeedback("correct");
        setFeedbackPairId(pairId);
        setMatchedIds((prev) => new Set(prev).add(pairId));
        onMatch(pairId);
      } else {
        setFeedback("incorrect");
        setFeedbackPairId(pairId);
      }

      setTimeout(() => {
        setSelectedLeft(null);
        setFeedback("idle");
        setFeedbackPairId(null);
      }, 800);
    },
    [selectedLeft, onMatch],
  );

  const handleKeyDownLeft = useCallback(
    (e: React.KeyboardEvent, pairId: string) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleLeftClick(pairId);
      }
    },
    [handleLeftClick],
  );

  const handleKeyDownRight = useCallback(
    (e: React.KeyboardEvent, pairId: string) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleRightClick(pairId);
      }
    },
    [handleRightClick],
  );

  return (
    <div className={cn("flex gap-8", className)} role="group" aria-label="Matching activity">
      <div className="flex flex-col gap-3" role="list" aria-label="Left column items">
        {pairs.map((pair) => {
          const isSelected = selectedLeft === pair.id;
          const isMatched = matchedIds.has(pair.id);
          return (
            <button
              key={pair.id}
              onClick={() => handleLeftClick(pair.id)}
              onKeyDown={(e) => handleKeyDownLeft(e, pair.id)}
              className={cn(
                "min-h-[44px] rounded-lg border-2 px-4 py-2 text-left text-base font-medium text-slate-700",
                "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
                isMatched && "opacity-50",
                isSelected
                  ? "border-blue-500 bg-blue-50"
                  : "border-slate-300 bg-white hover:border-slate-400",
              )}
              role="listitem"
              aria-pressed={isSelected}
              aria-disabled={isMatched}
              disabled={isMatched}
            >
              {pair.itemA}
            </button>
          );
        })}
      </div>

      <div className="flex flex-col gap-3" role="list" aria-label="Right column items">
        {pairs.map((pair) => {
          const isMatched = matchedIds.has(pair.id);
          const showFeedback = feedbackPairId === pair.id && feedback !== "idle";
          const isSelectedFeedback = selectedLeft !== null && !isMatched;

          return (
            <button
              key={pair.id}
              onClick={() => handleRightClick(pair.id)}
              onKeyDown={(e) => handleKeyDownRight(e, pair.id)}
              className={cn(
                "min-h-[44px] rounded-lg border-2 px-4 py-2 text-left text-base font-medium",
                "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
                isMatched && "border-green-500 bg-green-50 text-green-700 opacity-50",
                !isMatched &&
                  showFeedback &&
                  feedback === "correct" &&
                  "border-green-500 bg-green-50 text-green-700",
                !isMatched &&
                  showFeedback &&
                  feedback === "incorrect" &&
                  "border-red-400 bg-red-50 text-red-600",
                !isMatched &&
                  !showFeedback &&
                  isSelectedFeedback &&
                  "border-slate-300 bg-white hover:border-slate-400",
                !isMatched && !showFeedback && !isSelectedFeedback && "border-slate-300 bg-white",
              )}
              role="listitem"
              aria-disabled={isMatched}
              disabled={isMatched}
            >
              {pair.itemB}
              {showFeedback && feedback === "correct" && (
                <span className="ml-2 text-green-600" aria-label="Correct match">
                  ✓
                </span>
              )}
              {showFeedback && feedback === "incorrect" && (
                <span className="ml-2 text-red-500" aria-label="Incorrect match">
                  ✗
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}