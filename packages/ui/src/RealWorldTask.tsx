import { useState, useCallback } from "react";
import { cn } from "./utils";
import { ScenarioCard } from "./ScenarioCard";

export interface RealWorldTaskProps {
  scenario: string;
  taskDescription: string;
  visualExample?: string;
  hint?: string;
  response?: string;
  onResponseChange: (text: string) => void;
  isCompleted?: boolean;
}

export function RealWorldTask({
  scenario,
  taskDescription,
  visualExample,
  hint,
  response = "",
  onResponseChange,
}: RealWorldTaskProps) {
  const [showHint, setShowHint] = useState(false);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      onResponseChange(e.target.value);
    },
    [onResponseChange],
  );

  const toggleHint = useCallback(() => {
    setShowHint((prev) => !prev);
  }, []);

  const hasHint = hint !== undefined && hint !== "";

  return (
    <div className="flex flex-col gap-6">
      <ScenarioCard
        text={scenario}
        visual={visualExample}
        collapsible={false}
        readAloud={true}
      />

      <div>
        <p
          className="text-[20px] font-semibold text-slate-text"
          style={{ fontWeight: 500 }}
          id="task-description"
        >
          {taskDescription}
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <label
          htmlFor="task-response"
          className="text-base font-medium text-slate-text"
        >
          What did you find?
        </label>
        <textarea
          id="task-response"
          value={response}
          onChange={handleChange}
          placeholder="Type what you observed..."
          className={cn(
            "w-full rounded-lg border border-gray-300 bg-white px-4 py-3",
            "text-[18px] text-slate-text placeholder-gray-400",
            "focus:outline-none focus:ring-2 focus:ring-soft-blue focus:border-transparent",
            "resize-none",
          )}
          style={{ minHeight: "56px" }}
          rows={1}
        />
      </div>

      {hasHint && (
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
            {showHint ? "Hide hint" : "Need Help?"}
          </button>

          {showHint && (
            <div
              id="task-hint"
              className="rounded-lg border border-soft-amber bg-soft-amber/10 px-4 py-3 text-sm text-slate-text"
              role="alert"
              aria-live="polite"
            >
              <span className="font-semibold">Hint:</span> {hint}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
