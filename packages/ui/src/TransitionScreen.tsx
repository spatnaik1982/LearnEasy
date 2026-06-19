import { useEffect, useRef } from "react";
import { cn } from "./utils";
import { COPY } from "./copy";

export interface TransitionScreenProps {
  fromStep: string;
  toStep: string;
  currentStep: number;
  totalSteps: number;
  onStart: () => void;
  onBreak?: () => void;
  className?: string;
}

export function TransitionScreen({
  fromStep,
  toStep,
  currentStep,
  totalSteps,
  onStart,
  onBreak,
  className,
}: TransitionScreenProps) {
  const startButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    // Focus moves to start button on mount
    if (startButtonRef.current) {
      startButtonRef.current.focus();
    }
  }, []);

  return (
    <div
      className={cn(
        "flex min-h-[300px] flex-col items-center justify-center gap-6 rounded-2xl bg-warm-off-white p-8 text-center animate-in fade-in duration-200",
        className,
      )}
      role="region"
      aria-label="Transition between steps"
    >
      {/* Positive reinforcement */}
      <div aria-live="polite">
        <p className="text-lg font-semibold text-muted-green">
          🎉 Great work completing{" "}
          <span className="font-bold">{fromStep}</span>!
        </p>
      </div>

      {/* Next step info */}
      <div>
        <p className="text-base text-slate-text">
          Next:{" "}
          <span className="font-bold text-soft-blue">{toStep}</span>
        </p>
      </div>

      {/* Progress indicator */}
      <div
        className="flex items-center gap-2 text-sm text-muted-teal"
        aria-live="polite"
      >
        <span>You've completed {currentStep} of {totalSteps} steps</span>
        <span className="flex gap-1" aria-hidden="true">
          {Array.from({ length: totalSteps }, (_, i) => (
            <span
              key={i}
              className={cn(
                "h-2 w-2 rounded-full",
                i < currentStep ? "bg-muted-green" : "bg-slate-300",
              )}
            />
          ))}
        </span>
      </div>

      {/* Start button */}
      <button
        ref={startButtonRef}
        onClick={onStart}
        className={cn(
          "min-h-[56px] w-full max-w-xs rounded-full bg-soft-blue px-8 py-4 text-lg font-semibold text-white motion-safe:active:scale-[0.98]",
          "focus:outline-none focus:ring-2 focus:ring-soft-blue focus:ring-offset-2",
          "hover:bg-soft-blue/90 active:bg-soft-blue/80",
          "transition-colors duration-200",
        )}
        aria-label={`Start ${toStep}`}
      >
        Start {toStep}
      </button>

      {/* Optional break link */}
      {onBreak && (
        <button
          onClick={onBreak}
          className={cn(
            "text-sm font-medium text-muted-teal underline",
            "focus:outline-none focus:ring-2 focus:ring-soft-blue focus:ring-offset-2 rounded",
            "hover:text-muted-teal/80",
          )}
          aria-label={COPY.takeBreak}
        >
          {COPY.takeBreak}
        </button>
      )}
    </div>
  );
}
