import { useEffect, useRef, useState, useCallback } from "react";
import { cn } from "./utils";
import { evaluateActivity, getHint, getLeveledHint, PROMPT_LEVELS, getActivityFeedback } from "./activity-utils";
import { VisualCounter } from "./VisualCounter";
import { Matching } from "./Matching";
import { DragDrop } from "./DragDrop";
import { Sequencing } from "./Sequencing";
import { MultipleChoice } from "./MultipleChoice";
import { StoryQuestion } from "./StoryQuestion";
import { RealWorldTask } from "./RealWorldTask";

export interface ActivityRendererProps {
  activity: {
    id: string;
    type: string;
    content: Record<string, unknown>;
  };
  step: string;
  onComplete: (result: {
    correct: boolean;
    response: Record<string, unknown>;
    hintsUsed: number;
    timeSpent: number;
  }) => void;
  className?: string;
  /** Current ABA prompt level (1-5) for this student+concept */
  promptLevel?: number;
}

export function ActivityRenderer({
  activity,
  step,
  onComplete,
  className,
  promptLevel = 1,
}: ActivityRendererProps) {
  const startTimeRef = useRef<number>(Date.now());
  const [hintsUsed, setHintsUsed] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [hintText, setHintText] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [feedbackType, setFeedbackType] = useState<"correct" | "incorrect" | null>(null);
  const [completed, setCompleted] = useState(false);

  const type = activity.type?.toLowerCase().replace(/-/g, "_") ?? "";

  const handleComplete = useCallback(
    (response: Record<string, unknown>) => {
      if (completed) return;
      setCompleted(true);

      const timeSpent = Date.now() - startTimeRef.current;
      const result = evaluateActivity(type, response, activity.content);
      const fb = getActivityFeedback(result.correct);

      setFeedback(fb);
      setFeedbackType(result.correct ? "correct" : "incorrect");

      // Briefly show feedback before calling onComplete for incorrect answers
      if (result.correct) {
        onComplete({
          correct: true,
          response,
          hintsUsed,
          timeSpent,
        });
      } else {
        // For incorrect, reset after a brief delay so user sees feedback
        setTimeout(() => {
          setCompleted(false);
          setFeedback(null);
          setFeedbackType(null);
        }, 1200);
      }
    },
    [type, activity.content, hintsUsed, onComplete, completed],
  );

  const handleHintClick = useCallback(async () => {
    const nextLevel = hintsUsed + 1;

    // First try to get a prompt from the API
    try {
      const response = await fetch(`/api/activities/${activity.id}/prompts?level=${nextLevel}`, {
        headers: { Authorization: `Bearer ${localStorage?.getItem('token') ?? ''}` },
      });
      if (response.ok) {
        const data = await response.json();
        if (data.hint) {
          setHintsUsed(nextLevel);
          setHintText(data.hint);
          setShowHint(true);
          return;
        }
      }
    } catch {
      // API not available — fall back to local hints
    }

    // Fallback to local hint resolution
    const hint = getLeveledHint(activity, nextLevel + promptLevel - 1) ?? getHint(activity, nextLevel);
    if (hint) {
      setHintsUsed(nextLevel);
      setHintText(hint);
      setShowHint(true);
    } else {
      // If no more hints, just toggle
      setShowHint((prev) => !prev);
    }
  }, [hintsUsed, activity, promptLevel]);

  // Reset timer when activity id changes
  useEffect(() => {
    startTimeRef.current = Date.now();
    setHintsUsed(0);
    setShowHint(false);
    setHintText(null);
    setFeedback(null);
    setFeedbackType(null);
    setCompleted(false);
  }, [activity.id]);

  const renderActivity = () => {
    switch (type) {
      case "visual_counter":
      case "visual_counting":
        return (
          <VisualCounter
            count={(activity.content.count as number) ?? 0}
            emoji={(activity.content.emoji as string) ?? "🔢"}
            size={(activity.content.size as "sm" | "md" | "lg") ?? "md"}
          />
        );

      case "matching":
        return (
          <Matching
            pairs={(activity.content.pairs as Array<{
              id: string;
              itemA: string;
              itemB: string;
            }>) ?? []}
            onMatch={() => {
              // Individual match handled internally;
              // we track completion via the overall pairs
            }}
          />
        );

      case "drag_drop":
      case "dragdrop":
        return (
          <DragDrop
            items={(activity.content.items as Array<{
              id: string;
              label: string;
              emoji?: string;
            }>) ?? []}
            targets={(activity.content.targets as Array<{
              id: string;
              label: string;
            }>) ?? []}
            onDrop={() => {}}
          />
        );

      case "sequencing":
        return (
          <Sequencing
            items={(activity.content.items as Array<{
              id: string;
              label: string;
              emoji?: string;
            }>) ?? []}
            correctOrder={(activity.content.correctOrder as string[]) ?? []}
            onComplete={() => {}}
          />
        );

      case "multiple_choice":
        return (
          <MultipleChoice
            question={(activity.content.question as string) ?? ""}
            options={
              (activity.content.options as Array<{
                id: string;
                label: string;
                emoji?: string;
              }>) ?? []
            }
            correctIndex={(activity.content.correctIndex as number) ?? 0}
            onSelect={() => {}}
          />
        );

      case "story_question":
        return (
          <StoryQuestion
            scenario={(activity.content.scenario as string) ?? ""}
            questions={
              (activity.content.questions as Array<{
                question: string;
                options: string[];
                correctIndex: number;
              }>) ?? []
            }
            visual={(activity.content.visual as string) ?? undefined}
            onComplete={(responses) => {
              const lastResponse = responses[responses.length - 1];
              handleComplete({
                selectedIndex: lastResponse?.selectedIndex ?? -1,
                correct: lastResponse?.correct ?? false,
                responses,
              });
            }}
          />
        );

      case "real_world":
      case "real_world_task":
        return (
          <RealWorldTask
            scenario={(activity.content.scenario as string) ?? ""}
            taskDescription={(activity.content.taskDescription as string) ?? ""}
            visualExample={(activity.content.visualExample as string) ?? undefined}
            hint={(activity.content.hint as string) ?? undefined}
            onComplete={() => {
              handleComplete({ completed: true });
            }}
          />
        );

      default:
        return (
          <div className="rounded-lg border-2 border-soft-coral/30 bg-soft-coral/5 p-6 text-center">
            <p className="text-lg font-medium text-slate-text">
              Activity not available
            </p>
            <p className="mt-2 text-sm text-muted-teal">
              The activity type "{activity.type}" is not recognized.
            </p>
          </div>
        );
    }
  };

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {/* Step label */}
      <div
        className="text-sm font-medium text-muted-teal"
        aria-live="polite"
      >
        Step: {step}
      </div>

      {/* ABA Prompt Level indicator */}
      {promptLevel > 0 && promptLevel <= 5 && (
        <div
          className="text-xs font-medium text-soft-coral"
          aria-label={`Prompt level: ${PROMPT_LEVELS[promptLevel - 1]}`}
        >
          Prompt: {PROMPT_LEVELS[promptLevel - 1]}
        </div>
      )}

      {/* Activity content */}
      <div aria-label={`Activity: ${type}`}>
        {renderActivity()}
      </div>

      {/* Feedback message */}
      {feedback && (
        <div
          className={cn(
            "rounded-lg px-4 py-3 text-center text-base font-semibold transition-opacity duration-200",
            feedbackType === "correct"
              ? "bg-muted-green/10 text-muted-green"
              : "bg-soft-coral/10 text-soft-coral",
          )}
          aria-live="polite"
          role="alert"
        >
          {feedback}
        </div>
      )}

      {/* Hint section */}
      {showHint && hintText && (
        <div
          className="rounded-lg border border-soft-amber bg-soft-amber/10 px-4 py-3 text-sm text-slate-text"
          role="alert"
          aria-live="polite"
        >
          <span className="font-semibold">💡 Hint:</span> {hintText}
        </div>
      )}

      {/* Need help button */}
      <div className="flex justify-center">
        <button
          onClick={handleHintClick}
          className={cn(
            "rounded-lg border border-soft-amber px-4 py-2 text-sm font-medium text-soft-amber",
            "focus:outline-none focus:ring-2 focus:ring-soft-amber focus:ring-offset-2",
            "hover:bg-soft-amber/10 transition-colors duration-150",
          )}
          aria-label="Need help? Get a hint"
        >
          {showHint ? "Hide hint" : "Need help?"}
        </button>
      </div>
    </div>
  );
}
