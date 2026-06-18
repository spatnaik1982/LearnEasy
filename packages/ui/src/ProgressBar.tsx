import { Check } from "lucide-react";
import { cn } from "./utils";

export interface ProgressBarProps {
  steps: string[];
  currentStep: number;
  className?: string;
}

export function ProgressBar({ steps, currentStep, className }: ProgressBarProps) {
  return (
    <nav
      className={cn("flex flex-col items-center", className)}
      aria-label="Progress"
    >
      <div
        className="flex items-center w-full"
        role="progressbar"
        aria-valuenow={currentStep + 1}
        aria-valuemin={1}
        aria-valuemax={steps.length}
      >
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          const isLast = index === steps.length - 1;

          return (
            <div key={step} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold",
                    isCompleted && "bg-muted-green text-white",
                    isCurrent && "bg-soft-blue text-white",
                    !isCompleted && !isCurrent && "bg-outline-variant text-on-surface-variant",
                  )}
                  aria-current={isCurrent ? "step" : undefined}
                >
                  {isCompleted ? (
                    <Check className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>
                <span
                  className={cn(
                    "mt-1 text-xs font-medium",
                    isCurrent && "text-soft-blue",
                    isCompleted && "text-muted-green",
                    !isCompleted && !isCurrent && "text-on-surface-variant",
                  )}
                >
                  {step}
                </span>
              </div>
              {!isLast && (
                <div
                  className={cn(
                    "mx-1 h-1 flex-1 rounded",
                    index < currentStep ? "bg-muted-green" : "bg-outline-variant",
                  )}
                  aria-hidden="true"
                />
              )}
            </div>
          );
        })}
      </div>
      <span className="mt-2 text-sm font-medium text-on-surface-variant">
        Step {currentStep + 1} of {steps.length}
      </span>
    </nav>
  );
}