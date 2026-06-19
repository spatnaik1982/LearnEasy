import { useState, useCallback } from "react";
import { cn } from "./utils";

export interface RealWorldTaskProps {
  scenario: string;
  taskDescription: string;
  visualExample?: string;
  hint?: string;
  onComplete: () => void;
  className?: string;
}

export function RealWorldTask({
  scenario,
  taskDescription,
  visualExample,
  hint,
  onComplete,
  className,
}: RealWorldTaskProps) {
  const [isCompleted, setIsCompleted] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const handleComplete = useCallback(() => {
    setIsCompleted(true);
    onComplete();
  }, [onComplete]);

  const toggleHint = useCallback(() => {
    setShowHint((prev) => !prev);
  }, []);

  return (
    <div className={cn("flex flex-col gap-6", className)}>
      {/* Scenario */}
      <div
        className="rounded-xl border-2 border-soft-amber/30 bg-soft-amber/5 p-5"
        role="region"
        aria-label="Scenario"
      >
        {visualExample && (
          <span className="mb-3 block text-3xl" aria-hidden="true">
            {visualExample}
          </span>
        )}
        <p className="text-base leading-relaxed text-slate-text">
          {scenario}
        </p>
      </div>

      {/* Task description */}
      <div>
        <p className="text-lg font-semibold text-slate-text" id="task-description">
          {taskDescription}
        </p>
      </div>

      {/* Hint toggle */}
      {hint && (
        <div className="flex flex-col gap-2">
          <button
            onClick={toggleHint}
            className={cn(
              "self-start rounded-lg border border-soft-amber px-4 py-2 text-sm font-medium text-soft-amber",
              "focus:outline-none focus:ring-2 focus:ring-soft-amber focus:ring-offset-2",
              "hover:bg-soft-amber/10 transition-colors duration-150",
            )}
            aria-expanded={showHint}
            aria-controls="task-hint"
          >
            {showHint ? "Hide hint" : "Need help?"}
          </button>

          {showHint && (
            <div
              id="task-hint"
              className="rounded-lg border border-soft-amber bg-soft-amber/10 px-4 py-3 text-sm text-slate-text"
              role="alert"
              aria-live="polite"
            >
              <span className="font-semibold">💡 Hint:</span> {hint}
            </div>
          )}
        </div>
      )}

      {/* Empty hint toggle placeholder */}
      {!hint && (
        <div className="flex flex-col gap-2">
          <button
            onClick={toggleHint}
            className={cn(
              "self-start rounded-lg border border-soft-amber px-4 py-2 text-sm font-medium text-soft-amber",
              "focus:outline-none focus:ring-2 focus:ring-soft-amber focus:ring-offset-2",
              "hover:bg-soft-amber/10 transition-colors duration-150",
            )}
            aria-expanded={showHint}
          >
            {showHint ? "Hide hint" : "Need help?"}
          </button>

          {showHint && (
            <div
              className="rounded-lg border border-soft-amber bg-soft-amber/10 px-4 py-3 text-sm text-slate-text"
              role="alert"
              aria-live="polite"
            >
              No additional hints available for this task.
            </div>
          )}
        </div>
      )}

      {/* I did it! button */}
      {!isCompleted && (
        <button
          onClick={handleComplete}
          className={cn(
            "min-h-[56px] w-full max-w-xs rounded-xl bg-muted-green px-8 py-4 text-lg font-semibold text-white",
            "focus:outline-none focus:ring-2 focus:ring-muted-green focus:ring-offset-2",
            "hover:bg-muted-green/90 active:bg-muted-green/80",
            "transition-colors duration-200",
          )}
          aria-label="I did it! Mark task as completed"
        >
          I did it! 🎉
        </button>
      )}

      {/* Completion message */}
      {isCompleted && (
        <div
          className="rounded-lg bg-muted-green/10 px-6 py-4 text-center"
          role="status"
          aria-live="polite"
        >
          <p className="text-lg font-bold text-muted-green">
            Great work completing the task! 🌟
          </p>
        </div>
      )}
    </div>
  );
}
