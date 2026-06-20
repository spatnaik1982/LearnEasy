import { useEffect, useRef, useState, useCallback } from "react";
import { cn } from "./utils";
import { evaluateActivity, getHint, getLeveledHint, getActivityFeedback } from "./activity-utils";
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
  onComplete: (result: {
    correct: boolean;
    response: Record<string, unknown>;
    hintsUsed: number;
    timeSpent: number;
  }) => void;
  className?: string;
  /** Current ABA prompt level (1-5) for this student+concept */
  promptLevel?: number;
  /** Step label (observe/guided_practice/independent_practice/mastery_check).
   *  Used to control whether counting activities show or hide the answer. */
  stepLabel?: string;
}

export function ActivityRenderer({
  activity,
  onComplete,
  className,
  promptLevel = 1,
  stepLabel,
}: ActivityRendererProps) {
  const startTimeRef = useRef<number>(Date.now());
  const [hintsUsed, setHintsUsed] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [hintText, setHintText] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [feedbackType, setFeedbackType] = useState<"correct" | "incorrect" | null>(null);
  const [completed, setCompleted] = useState(false);
  const [multiQuestionIndex, setMultiQuestionIndex] = useState(0);
  const [multiQuestionResponses, setMultiQuestionResponses] = useState<
    { correct: boolean }[]
  >([]);

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
    setMultiQuestionIndex(0);
    setMultiQuestionResponses([]);
  }, [activity.id]);

  const matchedPairIdsRef = useRef<string[]>([]);
  const totalPairs = type === "matching" ? (activity.content.pairs as Array<unknown>)?.length ?? 0 : 0;

  useEffect(() => {
    matchedPairIdsRef.current = [];
  }, [activity.id]);

  const renderActivity = () => {
    switch (type) {
      case "visual_counter":
      case "visual_counting": {
        const count = (activity.content.count as number) ?? 0;
        const emoji = (activity.content.emoji as string) ?? (activity.content.items as string[])?.[0] ?? "🔢";
        const isDemonstration = stepLabel === "observe";
        const answerText = (activity.content.text as string) ?? `${count} ${emoji}`;

        if (isDemonstration) {
          return (
            <div className="flex flex-col items-center gap-4">
              <VisualCounter
                count={count}
                emoji={emoji}
                size={(activity.content.size as "sm" | "md" | "lg") ?? "md"}
                showCount
              />
              <p className="text-xl font-semibold text-slate-text" aria-live="polite">
                {answerText}
              </p>
            </div>
          );
        }

        const maxOption = Math.max(10, Math.min(count + 2, 20));
        return (
          <div className="flex flex-col items-center gap-6">
            <VisualCounter
              count={count}
              emoji={emoji}
              size={(activity.content.size as "sm" | "md" | "lg") ?? "md"}
              showCount={false}
            />
            <div className="flex flex-col items-center gap-3">
              <p className="text-lg font-semibold text-slate-text">
                How many do you see?
              </p>
              <div className="flex max-w-[340px] flex-wrap justify-center gap-3">
                {Array.from({ length: maxOption }, (_, i) => i + 1).map((n) => (
                  <button
                    key={n}
                    onClick={() => handleComplete({ count: n })}
                    disabled={completed}
                    className="flex h-14 w-14 items-center justify-center rounded-xl border-2 border-slate-300 bg-white text-lg font-bold text-slate-text hover:border-soft-blue focus:outline-none focus:ring-2 focus:ring-soft-blue disabled:cursor-not-allowed disabled:opacity-40 motion-safe:transition-colors motion-safe:duration-150"
                    aria-label={`Select ${n}`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );
      }

      case "matching":
        return (
          <Matching
            pairs={(activity.content.pairs as Array<{
              id: string;
              itemA: string;
              itemB: string;
            }>) ?? []}
            onMatch={(pairId) => {
              matchedPairIdsRef.current.push(pairId);
              if (matchedPairIdsRef.current.length >= totalPairs) {
                const pairs = matchedPairIdsRef.current.map((id) => ({ id, correct: true }));
                handleComplete({ pairs });
              }
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
            onComplete={(_isCorrect, userOrder) => {
              handleComplete({ order: userOrder });
            }}
          />
        );

      case "multiple_choice": {
        // Handle YAML data shape: { questions: [{ question, options: string[], correctIndex }] }
        const questions = activity.content.questions as Array<{
          question: string;
          options: string[];
          correctIndex: number;
        }> | undefined;

        if (questions?.length) {
          if (multiQuestionIndex >= questions.length) return null;
          const q = questions[multiQuestionIndex];
          const options = q.options.map((label, i) => ({
            id: String(i),
            label,
          }));
          return (
            <div className="flex flex-col gap-4">
              <span className="text-sm font-medium text-muted-teal">
                Question {multiQuestionIndex + 1} of {questions.length}
              </span>
              <MultipleChoice
                key={multiQuestionIndex}
                question={q.question}
                options={options}
                correctIndex={q.correctIndex}
                onSelect={(isCorrect) => {
                  const updated = [...multiQuestionResponses, { correct: isCorrect }];
                  if (multiQuestionIndex + 1 >= questions.length) {
                    const correctCount = updated.filter((r) => r.correct).length;
                    const allCorrect = correctCount === questions.length;
                    handleComplete({ correct: allCorrect, responses: updated });
                  } else {
                    setMultiQuestionResponses(updated);
                    setMultiQuestionIndex((prev) => prev + 1);
                  }
                }}
              />
            </div>
          );
        }

        // Fall back to mock data shape: { question, options: [{ id, label }], correctIndex }
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
            onSelect={(_isCorrect, selectedIndex) => {
              handleComplete({ selectedIndex });
            }}
          />
        );
      }

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
            "rounded-full border border-soft-amber px-4 py-2 text-sm font-medium text-soft-amber",
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
