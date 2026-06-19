import { useMemo } from "react";
import { Check } from "lucide-react";
import { cn } from "./utils";

export interface VisualScheduleProps {
  steps: string[];
  currentStep: number;
  completedSteps: number[];
  className?: string;
}

export function VisualSchedule({
  steps,
  currentStep,
  completedSteps,
  className,
}: VisualScheduleProps) {
  const completedSet = useMemo(
    () => new Set(completedSteps),
    [completedSteps],
  );

  return (
    <div
      className={cn("flex flex-col items-center", className)}
      role="group"
      aria-label="Visual schedule"
    >
      <span
        className="mb-4 text-sm font-medium text-slate-text"
        aria-live="polite"
        aria-atomic="true"
      >
        Step {currentStep + 1} of {steps.length}
      </span>

      <div className="flex items-start gap-3">
        {steps.map((step, index) => {
          const isCurrent = index === currentStep;
          const isCompleted = completedSet.has(index);
          const isFuture = !isCurrent && !isCompleted;

          return (
            <div
              key={`${step}-${index}`}
              className="flex flex-col items-center gap-2"
            >
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold transition-opacity duration-200",
                  isCurrent && "bg-soft-blue text-white ring-2 ring-soft-blue ring-offset-2",
                  isCompleted && "bg-muted-green text-white",
                  isFuture && "border-2 border-slate-300 bg-white text-slate-400",
                )}
                aria-current={isCurrent ? "step" : undefined}
                aria-label={`${step}${isCurrent ? " (current step)" : ""}`}
              >
                {isCompleted ? (
                  <Check className="h-5 w-5" aria-hidden="true" />
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>

              <span
                className={cn(
                  "max-w-[80px] text-center text-xs font-medium leading-tight",
                  isCurrent && "text-soft-blue font-semibold",
                  isCompleted && "text-muted-green",
                  isFuture && "text-slate-400",
                )}
              >
                {step}
              </span>
            </div>
          );
        })}
      </div>

      <div
        className="mt-4 text-center text-sm text-slate-text"
        aria-live="polite"
        aria-atomic="true"
      >
        {steps[currentStep] && (
          <span>Working on: <strong>{steps[currentStep]}</strong></span>
        )}
      </div>
    </div>
  );
}
