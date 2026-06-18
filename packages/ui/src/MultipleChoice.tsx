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
      <p className="mb-4 text-lg font-semibold text-slate-text" id="mc-question">
        {question}
      </p>
      <div className="flex flex-col gap-4" role="listbox" aria-labelledby="mc-question">
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
                "min-h-[56px] rounded-lg border-2 px-4 py-3 text-left text-base font-medium text-slate-text",
                "focus:outline-none focus:ring-2 focus:ring-soft-blue focus:ring-offset-2",
                !hasAnswered && "border-slate-300 bg-white hover:border-slate-400",
                hasAnswered &&
                  isSelected &&
                  isCorrect &&
                  "border-muted-green bg-muted-green/10 text-muted-green",
                hasAnswered &&
                  isSelected &&
                  !isCorrect &&
                  "border-soft-coral bg-soft-coral/10 text-soft-coral",
                hasAnswered &&
                  !isSelected &&
                  index === correctIndex &&
                  "border-muted-green bg-muted-green/10 text-muted-green",
                hasAnswered && !isSelected && index !== correctIndex && "border-outline-variant bg-slate-50 text-on-surface-variant",
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
            isCorrect ? "text-muted-green" : "text-soft-coral",
          )}
          aria-live="polite"
        >
          {isCorrect ? "That's right! Well done." : "Let's try that again"}
        </p>
      )}
    </div>
  );
}