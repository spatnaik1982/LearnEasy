import { useState, useCallback, useEffect, useRef } from "react";
import { cn } from "./utils";
import { useAccessibility } from "./useAccessibility";

export interface FillBlankProps {
  template: string;
  blanks: {
    id: string;
    position: number;
    correctAnswer: string | number;
    options?: (string | number)[];
  }[];
  mode?: "select" | "type";
  onComplete?: (answers: Record<string, string | number>) => void;
  showResult?: boolean;
  className?: string;
}

export function FillBlank({
  template,
  blanks,
  mode = "select",
  onComplete,
  showResult = false,
  className,
}: FillBlankProps) {
  const [blankValues, setBlankValues] = useState<
    Record<string, string | number>
  >({});
  const [activeBlank, setActiveBlank] = useState<string | null>(null);
  const [resultFlash, setResultFlash] = useState<"correct" | "incorrect" | null>(null);
  const hasCompletedRef = useRef(false);
  const { announce } = useAccessibility();

  const segments = template.split("___");
  const sortedBlanks = [...blanks].sort((a, b) => a.position - b.position);

  const isComplete = sortedBlanks.every(
    (b) => blankValues[b.id] !== undefined && blankValues[b.id] !== "",
  );

  const checkCompletion = useCallback(
    (values: Record<string, string | number>) => {
      const allFilled = sortedBlanks.every(
        (b) => values[b.id] !== undefined && values[b.id] !== "",
      );
      if (allFilled && !hasCompletedRef.current) {
        hasCompletedRef.current = true;
        onComplete?.(values);

        if (showResult) {
          const allCorrect = sortedBlanks.every(
            (b) => String(values[b.id]) === String(b.correctAnswer),
          );
          setResultFlash(allCorrect ? "correct" : "incorrect");
        }
      }
    },
    [sortedBlanks, onComplete, showResult],
  );

  const handleOptionSelect = useCallback(
    (blankId: string, value: string | number) => {
      setBlankValues((prev) => {
        const next = { ...prev, [blankId]: value };
        checkCompletion(next);
        return next;
      });
      setActiveBlank(null);
      announce(`Selected ${value}`);
    },
    [checkCompletion, announce],
  );

  const handleBlankClear = useCallback((blankId: string) => {
    setBlankValues((prev) => {
      const next = { ...prev };
      delete next[blankId];
      hasCompletedRef.current = false;
      setResultFlash(null);
      return next;
    });
  }, []);

  const handleBlankClick = useCallback((blankId: string) => {
    setActiveBlank((prev) => (prev === blankId ? null : blankId));
  }, []);

  const handleTypeChange = useCallback(
    (blankId: string, value: string) => {
      setBlankValues((prev) => {
        const next = { ...prev, [blankId]: value };
        checkCompletion(next);
        return next;
      });
    },
    [checkCompletion],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, blankId: string) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleBlankClick(blankId);
      }
    },
    [handleBlankClick],
  );

  useEffect(() => {
    if (!isComplete) {
      hasCompletedRef.current = false;
    }
  }, [isComplete]);

  useEffect(() => {
    if (resultFlash) {
      const timer = setTimeout(() => setResultFlash(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [resultFlash]);

  useEffect(() => {
    announce(`Fill in the blank: ${template}`);
  }, []);

  const renderBlank = (
    blank: (typeof sortedBlanks)[0],
    index: number,
  ) => {
    const value = blankValues[blank.id];
    const isFilled = value !== undefined && value !== "";
    const isActive = activeBlank === blank.id;
    const showOptions = !isFilled && isActive && blank.options;

    if (mode === "select") {
      return (
        <span
          key={blank.id}
          className="inline-flex flex-col items-center gap-1"
        >
          <button
            onClick={() => {
              if (isFilled) {
                handleBlankClear(blank.id);
              } else {
                handleBlankClick(blank.id);
              }
            }}
            onKeyDown={(e) => handleKeyDown(e, blank.id)}
            className={cn(
              "inline-flex min-h-[56px] min-w-[60px] items-center justify-center",
              "rounded-lg border-2 px-3 text-lg font-bold text-slate-text",
              "focus:outline-none focus:ring-2 focus:ring-soft-blue focus:ring-offset-2",
              isFilled
                ? "border-solid border-soft-blue bg-soft-blue/10"
                : "border-dashed border-soft-blue bg-white",
            )}
            aria-label={`Blank ${index + 1}${isFilled ? `, current value ${value}` : ", fill in the missing value"}`}
          >
            {isFilled ? value : "___"}
          </button>
          {showOptions && (
            <span
              role="radiogroup"
              aria-label={`Options for blank ${index + 1}`}
              className="flex gap-2"
            >
              {blank.options!.map((opt) => (
                <button
                  key={String(opt)}
                  role="option"
                  aria-selected={value === opt}
                  onClick={() => handleOptionSelect(blank.id, opt)}
                  className={cn(
                    "min-h-[56px] min-w-[56px] rounded-lg border-2 border-soft-blue",
                    "text-lg font-bold text-slate-text",
                    "focus:outline-none focus:ring-2 focus:ring-soft-blue focus:ring-offset-2",
                  )}
                  aria-label={String(opt)}
                >
                  {opt}
                </button>
              ))}
            </span>
          )}
        </span>
      );
    }

    return (
      <span
        key={blank.id}
        className="inline-flex flex-col items-center gap-1"
      >
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={
            blankValues[blank.id] !== undefined
              ? String(blankValues[blank.id])
              : ""
          }
          onChange={(e) => handleTypeChange(blank.id, e.target.value)}
          className={cn(
            "w-16 border-b-2 bg-transparent text-center text-xl font-bold text-slate-text",
            "focus:outline-none focus:border-soft-blue",
            blankValues[blank.id] !== undefined && blankValues[blank.id] !== ""
              ? "border-soft-blue"
              : "border-dashed border-soft-blue",
          )}
          aria-label={`Blank ${index + 1}${blankValues[blank.id] ? `, current value ${blankValues[blank.id]}` : ", fill in the missing value"}`}
        />
      </span>
    );
  };

  return (
    <div
      className={cn(
        "inline-flex flex-wrap items-center gap-2 rounded-lg p-2",
        resultFlash === "correct" && "bg-muted-green/20",
        resultFlash === "incorrect" && "bg-soft-amber/20",
        className,
      )}
      aria-live="polite"
      role="group"
      aria-label="Fill in the blank activity"
    >
      {segments.map((seg, i) => (
        <span key={i}>
          <span className="text-xl text-slate-text">{seg}</span>
          {i < sortedBlanks.length && renderBlank(sortedBlanks[i], i)}
        </span>
      ))}
    </div>
  );
}
