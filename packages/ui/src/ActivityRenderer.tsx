import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { cn } from "./utils";
import { evaluateActivity, getHint, getLeveledHint, getActivityFeedback } from "./activity-utils";
import { VisualCounter } from "./VisualCounter";
import { Matching } from "./Matching";
import { DragDrop } from "./DragDrop";
import { Sequencing } from "./Sequencing";
import { MultipleChoice } from "./MultipleChoice";
import { StoryQuestion } from "./StoryQuestion";
import { RealWorldTask } from "./RealWorldTask";
import { FractionVisualizer } from "./FractionVisualizer";
import { PlaceValueChart } from "./PlaceValueChart";
import { GridCounter } from "./GridCounter";
import { ChartReader } from "./ChartReader";
import { ClockWidget } from "./ClockWidget";
import { ScaleReader } from "./ScaleReader";
import { FillBlank } from "./FillBlank";

function normalizeContent(type: string, content: Record<string, unknown>): Record<string, unknown> {
  const n = { ...content };
  const t = type.toLowerCase().replace(/-/g, "_");

  if (t === "story_question" && !n.scenario && n.story) {
    n.scenario = n.story;
  }

  if ((t === "real_world" || t === "real_world_task") && !n.taskDescription && n.prompt) {
    n.taskDescription = n.prompt;
  }

  if (t === "matching" && Array.isArray(n.pairs)) {
    n.pairs = (n.pairs as Array<Record<string, unknown>>).map((p, i) => ({
      ...p,
      id: p.id ?? `pair-${i}`,
    }));
  }

  if (t === "sequencing" && Array.isArray(n.items)) {
    if (typeof (n.items as unknown[])[0] === "string") {
      n.items = (n.items as string[]).map((s, i) => {
        const emojiMatch = s.match(/\p{Emoji}/u);
        return {
          id: `item-${i}`,
          label: s,
          emoji: emojiMatch ? emojiMatch[0] : undefined,
        };
      });
    }
    if (!n.correctOrder) {
      n.correctOrder = (n.items as Array<Record<string, unknown>>).map((item) => item.id as string);
    }
    if (n.shuffled) {
      const items = n.items as Array<{ id: string; label: string; emoji?: string }>;
      const shuffledLabels = n.shuffled as string[];
      const itemMap = new Map(items.map((i) => [i.label, i]));
      n.items = shuffledLabels
        .map((label) => itemMap.get(label))
        .filter(Boolean);
      delete n.shuffled;
    }
  }

  if ((t === "drag_drop" || t === "dragdrop") && n.groups) {
    const groups = n.groups as Array<{ label: string; target: string[] }>;
    n.targets = groups.map((g, i) => ({ id: `target-${i}`, label: g.label }));

    if (Array.isArray(n.items) && typeof (n.items as unknown[])[0] === "string") {
      n.items = (n.items as string[]).map((s, i) => {
        const emojiMatch = s.match(/\p{Emoji}/u);
        return {
          id: `item-${i}`,
          label: s,
          emoji: emojiMatch ? emojiMatch[0] : undefined,
        };
      });
    }

    const expected: Record<string, string> = {};
    groups.forEach((g, gIdx) => {
      g.target.forEach((itemStr) => {
        const items = n.items as Array<{ id: string; label: string }>;
        const item = items.find((i) => i.label === itemStr || i.id === itemStr);
        if (item) {
          expected[item.id] = `target-${gIdx}`;
        }
      });
    });
    n.expectedPositions = expected;
    delete n.groups;
  }

  return n;
}

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
  const [retryKey, setRetryKey] = useState(0);

  const type = activity.type?.toLowerCase().replace(/-/g, "_") ?? "";
  const normalizedContent = useMemo(
    () => normalizeContent(type, activity.content),
    [type, activity.content],
  );

  const handleComplete = useCallback(
    (response: Record<string, unknown>) => {
      if (completed) return;
      setCompleted(true);

      const timeSpent = Date.now() - startTimeRef.current;
      const result = evaluateActivity(type, response, normalizedContent);
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
          setRetryKey((k) => k + 1);
        }, 1200);
      }
    },
    [type, normalizedContent, hintsUsed, onComplete, completed],
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
  const totalPairs = type === "matching" ? (normalizedContent.pairs as Array<unknown>)?.length ?? 0 : 0;

  useEffect(() => {
    matchedPairIdsRef.current = [];
  }, [activity.id]);

  const renderActivity = () => {
    switch (type) {
      case "visual_counter":
      case "visual_counting": {
        const left = activity.content.left;
        const right = activity.content.right;
        const isAddition = Array.isArray(left) || Array.isArray(right) || typeof left === "number" || typeof right === "number";

        const additionSum = (activity.content.sum as number | undefined)
          ?? (Array.isArray(left) ? left.length : 0) + (Array.isArray(right) ? right.length : 0);
        const count = isAddition ? additionSum : ((normalizedContent.count as number) ?? 0);
        const emoji = (normalizedContent.emoji as string) ?? (normalizedContent.items as string[])?.[0] ?? "🔢";
        const isDemonstration = stepLabel === "observe";
        const answerText = (normalizedContent.text as string) ?? `${count} ${emoji}`;
        const size = (normalizedContent.size as "sm" | "md" | "lg") ?? "md";

        // Singular hint → add to hints array if not already present
        const singularHint = activity.content.hint as string | undefined;
        if (singularHint && !Array.isArray(activity.content.hints)) {
          (normalizedContent.hints as string[]) = [singularHint];
        }

        // ── Addition shape: show left + right groups with "+" separator ──
        if (isAddition) {
          const leftItems = Array.isArray(left) ? (left as string[]) : [];
          const rightItems = Array.isArray(right) ? (right as string[]) : [];
          const leftEmoji = leftItems[0] ?? (Array.isArray(right) ? right[0] : undefined) ?? "🔢";
          const rightEmoji = rightItems[0] ?? leftEmoji;

          const maxOption = Math.max(10, Math.min(count + 2, 20));
          const numberButtons = (
            <div className="flex flex-col items-center gap-3">
              <p className="text-lg font-semibold text-slate-text">
                How many in all?
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
          );

          if (isDemonstration) {
            return (
              <div className="flex flex-col items-center gap-6">
                <div className="flex items-center justify-center gap-4">
                  <VisualCounter count={leftItems.length} emoji={leftEmoji} size={size} showCount />
                  <span className="text-3xl font-bold text-slate-text">+</span>
                  <VisualCounter count={rightItems.length} emoji={rightEmoji} size={size} showCount />
                  <span className="text-3xl font-bold text-slate-text">=</span>
                  <span className="text-3xl font-bold text-slate-text">{count}</span>
                </div>
                <p className="text-xl font-semibold text-slate-text" aria-live="polite">
                  {answerText}
                </p>
              </div>
            );
          }

          return (
            <div className="flex flex-col items-center gap-6">
              <div className="flex items-center justify-center gap-4">
                <VisualCounter count={leftItems.length} emoji={leftEmoji} size={size} showCount={false} />
                <span className="text-3xl font-bold text-slate-text">+</span>
                <VisualCounter count={rightItems.length} emoji={rightEmoji} size={size} showCount={false} />
              </div>
              {numberButtons}
            </div>
          );
        }

        // ── Standard counting shape ──
        if (isDemonstration) {
          return (
            <div className="flex flex-col items-center gap-4">
              <VisualCounter
                count={count}
                emoji={emoji}
                size={size}
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
              size={size}
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
            pairs={(normalizedContent.pairs as Array<{
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
          <DragDrop key={retryKey}
            items={(normalizedContent.items as Array<{
              id: string;
              label: string;
              emoji?: string;
            }>) ?? []}
            targets={(normalizedContent.targets as Array<{
              id: string;
              label: string;
            }>) ?? []}
            onDrop={() => {}}
            onComplete={(placements) => {
              handleComplete({ droppedPositions: placements });
            }}
          />
        );

      case "sequencing":
        return (
          <Sequencing key={retryKey}
            items={(normalizedContent.items as Array<{
              id: string;
              label: string;
              emoji?: string;
            }>) ?? []}
            correctOrder={(normalizedContent.correctOrder as string[]) ?? []}
            onComplete={(_, userOrder) => {
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
                  if (!isCorrect) return;
                  const updated = [...multiQuestionResponses];
                  updated[multiQuestionIndex] = { correct: true };
                  if (multiQuestionIndex + 1 >= questions.length) {
                    handleComplete({ correct: true, responses: updated });
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
            scenario={(normalizedContent.scenario as string) ?? ""}
            questions={
              (normalizedContent.questions as Array<{
                question: string;
                options: string[];
                correctIndex: number;
              }>) ?? []
            }
            visual={(normalizedContent.visual as string) ?? undefined}
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
            scenario={(normalizedContent.scenario as string) ?? ""}
            taskDescription={(normalizedContent.taskDescription as string) ?? ""}
            visualExample={(normalizedContent.visualExample as string) ?? undefined}
            hint={(normalizedContent.hint as string) ?? undefined}
            onComplete={() => {
              handleComplete({ completed: true });
            }}
          />
        );

      case "fraction_visual":
        return (
          <FractionVisualizer
            numerator={(normalizedContent.numerator as number) ?? 1}
            denominator={(normalizedContent.denominator as number) ?? 2}
            mode={(normalizedContent.mode as 'bar' | 'circle') ?? 'bar'}
            label={normalizedContent.label as string}
            showLabel={(normalizedContent.showLabel as boolean) ?? false}
            interactive={(normalizedContent.interactive as boolean) ?? false}
            compare={normalizedContent.compare as { numerator: number; denominator: number } | undefined}
            onShade={(shaded) => handleComplete({ shaded })}
          />
        );

      case "place_value_chart":
        return (
          <PlaceValueChart
            maxPlaces={(normalizedContent.maxPlaces as 'lakh' | 'crore') ?? 'crore'}
            digits={normalizedContent.digits as (number | null)[]}
            interactive={(normalizedContent.interactive as boolean) ?? false}
            draggableDigits={normalizedContent.draggableDigits as number[]}
            targetNumber={normalizedContent.targetNumber as number}
            showLabels={(normalizedContent.showLabels as boolean) ?? true}
          />
        );

      case "grid_area":
        return (
          <GridCounter
            rows={(normalizedContent.rows as number) ?? 5}
            cols={(normalizedContent.cols as number) ?? 5}
            highlighted={normalizedContent.highlighted as { row: number; col: number }[]}
            mode={(normalizedContent.mode as 'area' | 'perimeter') ?? 'area'}
            interactive={(normalizedContent.interactive as boolean) ?? false}
            maxHighlights={normalizedContent.maxHighlights as number}
            cellSize={(normalizedContent.cellSize as number) ?? 40}
            showCount
            onHighlight={(cells) => handleComplete({ highlighted: cells, count: cells.length })}
          />
        );

      case "chart_reader":
        return (
          <ChartReader
            type={(normalizedContent.type as 'bar' | 'pictograph') ?? 'bar'}
            data={(normalizedContent.data as { label: string; value: number; emoji?: string }[]) ?? []}
            title={normalizedContent.title as string}
            showValues={(normalizedContent.showValues as boolean) ?? true}
            interactive={(normalizedContent.interactive as boolean) ?? false}
            onSelect={(label) => handleComplete({ selectedLabel: label })}
          />
        );

      case "clock_time":
        return (
          <ClockWidget
            hour={(normalizedContent.hour as number) ?? 12}
            minute={(normalizedContent.minute as number) ?? 0}
            interactive={(normalizedContent.interactive as boolean) ?? false}
            mode={(normalizedContent.mode as 'read' | 'set') ?? 'read'}
            showDigital={(normalizedContent.showDigital as boolean) ?? true}
            targetTime={normalizedContent.targetTime as { hour: number; minute: number } | undefined}
            onTimeChange={(h, m) => handleComplete({ hour: h, minute: m })}
          />
        );

      case "measurement_scale":
        return (
          <ScaleReader
            type={(normalizedContent.type as 'ruler' | 'thermometer' | 'cylinder') ?? 'ruler'}
            min={(normalizedContent.min as number) ?? 0}
            max={(normalizedContent.max as number) ?? 10}
            step={(normalizedContent.step as number) ?? 1}
            unit={(normalizedContent.unit as string) ?? 'cm'}
            value={normalizedContent.value as number | undefined}
            interactive={(normalizedContent.interactive as boolean) ?? false}
            targetValue={normalizedContent.targetValue as number | undefined}
            showReading
            onValueChange={(v) => handleComplete({ value: v })}
          />
        );

      case "fill_blank":
        return (
          <FillBlank
            template={(normalizedContent.template as string) ?? ''}
            blanks={(normalizedContent.blanks as { id: string; position: number; correctAnswer: string | number; options?: (string | number)[] }[]) ?? []}
            mode={(normalizedContent.mode as 'select' | 'type') ?? 'select'}
            onComplete={(answers) => handleComplete({ answers })}
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
