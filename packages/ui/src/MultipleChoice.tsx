import { useState, useCallback } from "react";
import { cn } from "./utils";

export interface MultipleChoiceOption {
  id: string;
  label: string;
  emoji?: string;
}

export interface MultipleChoiceProps {
  question: string;
  options: MultipleChoiceOption[];
  correctIndex: number;
  onSelect: (isCorrect: boolean) => void;
  className?: string;
}

export function MultipleChoice({
  question,
  options,
  correctIndex,
  onSelect,
  className,
}: MultipleChoiceProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const handleSelect = useCallback(
    (index: number) => {
      if (hasAnswered) return;

      const correct = index === correctIndex;
      setSelectedId(options[index].id);
      setHasAnswered(true);
      setIsCorrect(correct);
      onSelect(correct);
    },
    [hasAnswered, correctIndex, options, onSelect],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, index: number) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleSelect(index);
      }
    },
    [handleSelect],
  );

  return (
    <div className={cn("flex flex-col", className)} role="group" aria-label="Multiple choice question">
      <p className="mb-4 text-lg font-semibold text-slate-800" id="mc-question">
        {question}
      </p>
      <div className="flex flex-col gap-3" role="listbox" aria-labelledby="mc-question">
        {options.map((option, index) => {
          const isSelected = selectedId === option.id;
          return (
            <button
              key={option.id}
              onClick={() => handleSelect(index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              role="option"
              aria-selected={isSelected}
              className={cn(
                "min-h-[44px] rounded-lg border-2 px-4 py-3 text-left text-base font-medium text-slate-700",
                "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
                !hasAnswered && "border-slate-300 bg-white hover:border-slate-400",
                hasAnswered &&
                  isSelected &&
                  isCorrect &&
                  "border-green-500 bg-green-50 text-green-700",
                hasAnswered &&
                  isSelected &&
                  !isCorrect &&
                  "border-red-400 bg-red-50 text-red-600",
                hasAnswered &&
                  !isSelected &&
                  index === correctIndex &&
                  "border-green-400 bg-green-50/50 text-green-700",
                hasAnswered && !isSelected && index !== correctIndex && "border-slate-200 bg-slate-50 text-slate-400",
              )}
              disabled={hasAnswered}
            >
              {option.emoji && <span className="mr-3" aria-hidden="true">{option.emoji}</span>}
              <span>{option.label}</span>
              {hasAnswered && isSelected && (
                <span className="ml-auto text-sm font-semibold" aria-live="polite">
                  {isCorrect ? "Correct!" : "Incorrect"}
                </span>
              )}
            </button>
          );
        })}
      </div>
      {hasAnswered && (
        <p
          className={cn(
            "mt-4 text-center text-base font-semibold",
            isCorrect ? "text-green-600" : "text-red-500",
          )}
          aria-live="polite"
        >
          {isCorrect ? "That's right! Well done." : "Not quite. Try the next one."}
        </p>
      )}
    </div>
  );
}