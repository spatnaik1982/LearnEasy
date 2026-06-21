import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { cn } from "./utils";
import { ActivityShell } from "./ActivityShell";
import { normalizeContent } from "./normalize-content";
import {
  evaluateActivity,
  getActivityFeedback,
  getGuidanceMessage,
  getHintText,
} from "./activity-utils";
import { VisualCounter } from "./VisualCounter";
import { Matching } from "./Matching";
import { DragDrop } from "./DragDrop";
import { Sequencing } from "./Sequencing";
import { MultipleChoice } from "./MultipleChoice";
import { StoryQuestion } from "./StoryQuestion";
import { RealWorldTask } from "./RealWorldTask";
import { FractionVisualizer } from "./FractionVisualizer";
import { PlaceValueChart } from "./PlaceValueChart";
import { GridCounter, computePerimeter } from "./GridCounter";
import { ChartReader } from "./ChartReader";
import { ClockWidget } from "./ClockWidget";
import { ScaleReader } from "./ScaleReader";
import { FillBlank } from "./FillBlank";

const OBSERVE_STEP_AUTO_COMPLETABLE_TYPES = [
  "visual_counter", "visual_counting", "fraction_visual",
  "place_value_chart", "grid_area", "chart_reader",
  "clock_time", "measurement_scale",
] as const;

type LifecycleState = "idle" | "interacting" | "submitted" | "correct" | "incorrect";

interface MultiQuestionResponse {
  correct: boolean;
  response?: Record<string, unknown>;
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
    attempts: number;
    timeSpent: number;
    independenceScore: number;
  }) => void;
  className?: string;
  promptLevel?: number;
  stepLabel?: string;
  observeStepAutoCompleteDelayMs?: number;
  disableObserveStepAutoComplete?: boolean;
}

function computeIndependenceScore(hintsUsed: number, attempts: number): number {
  return Math.max(0, 1 - (hintsUsed * 0.2) - ((attempts - 1) * 0.1));
}

export function ActivityRenderer({
  activity,
  onComplete,
  className,
  promptLevel = 1,
  stepLabel,
  observeStepAutoCompleteDelayMs = 3000,
  disableObserveStepAutoComplete = false,
}: ActivityRendererProps) {
  const startTimeRef = useRef<number>(Date.now());
  const attemptsRef = useRef<number>(0);
  const [lifecycle, setLifecycle] = useState<LifecycleState>("idle");
  const [hintsUsed, setHintsUsed] = useState(0);
  const [hintText, setHintText] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [guidanceMessage, setGuidanceMessage] = useState<string | null>(null);
  const [userResponse, setUserResponse] = useState<Record<string, unknown> | null>(null);
  const [hasInteracted, setHasInteracted] = useState(false);

  // Multi-question state (used by multiple_choice with questions[] and story_question)
  const [multiQuestionIndex, setMultiQuestionIndex] = useState(0);
  const [multiQuestionResponses, setMultiQuestionResponses] = useState<MultiQuestionResponse[]>([]);

  // Fill-blank specific state
  const [filledAnswers, setFilledAnswers] = useState<Record<string, string | number>>({});
  const [activeBlankId, setActiveBlankId] = useState<string | null>(null);

  // Matching-specific state
  const [matchingConnections, setMatchingConnections] = useState<Record<string, string>>({});
  const [matchingSelectedLeft, setMatchingSelectedLeft] = useState<string | null>(null);
  const [matchingSelectedRight, setMatchingSelectedRight] = useState<string | null>(null);

  // DragDrop-specific state
  const [dragPlacements, setDragPlacements] = useState<Record<string, string>>({});
  const [dragSelectedItem, setDragSelectedItem] = useState<string | null>(null);

  // Sequencing-specific state
  const [seqUserOrder, setSeqUserOrder] = useState<string[]>([]);

  // RealWorldTask-specific state
  const [realWorldResponse, setRealWorldResponse] = useState("");

  // GridCounter-specific state
  const [gridHighlighted, setGridHighlighted] = useState<{ row: number; col: number }[]>([]);

  // PlaceValueChart-specific state
  const [pvcPlacedDigits, setPvcPlacedDigits] = useState<Record<number, number>>({});
  const [pvcSelectedDigit, setPvcSelectedDigit] = useState<number | null>(null);
  const [pvcActiveColumn, setPvcActiveColumn] = useState<number | null>(null);

  const type = activity.type?.toLowerCase().replace(/-/g, "_") ?? "";
  const isObserveStep = stepLabel === "observe";
  const isSelfReport = type === "real_world" || type === "real_world_task";

  const normalizedContent = useMemo(
    () => normalizeContent(type, activity.content),
    [type, activity.content],
  );

  const activityLabel = type.replace(/_/g, ' ');

  const instruction = useMemo(() => {
    if (isSelfReport) {
      return (activity.content.scenario as string) ?? (activity.content.taskDescription as string) ?? (activity.content.instruction as string) ?? "";
    }
    return (activity.content.instruction as string)
      ?? (activity.content.question as string)
      ?? (activity.content.text as string)
      ?? (activity.content.prompt as string)
      ?? (activity.content.description as string)
      ?? "Complete the activity";
  }, [activity.content, isSelfReport]);

  const activityIcon = useMemo(() => {
    const emoji = (normalizedContent.emoji as string) ?? (normalizedContent.items as Array<{ emoji?: string }>)?.[0]?.emoji ?? "📝";
    return <span className="text-2xl">{emoji}</span>;
  }, [normalizedContent]);

  const progressLabel = useMemo(() => {
    const rawQuestions = activity.content.questions as Array<unknown> | undefined;
    const storyQuestions = normalizedContent.questions as Array<unknown> | undefined;
    const total = rawQuestions?.length ?? storyQuestions?.length ?? 0;
    if (total > 1) {
      return `Question ${multiQuestionIndex + 1} of ${total}`;
    }
    return undefined;
  }, [activity.content.questions, normalizedContent.questions, multiQuestionIndex]);

  const multiTotal = useMemo(() => {
    const rawQuestions = activity.content.questions as Array<unknown> | undefined;
    const storyQuestions = normalizedContent.questions as Array<unknown> | undefined;
    return rawQuestions?.length ?? storyQuestions?.length ?? 0;
  }, [activity.content.questions, normalizedContent.questions]);

  const handleResponse = useCallback((response: Record<string, unknown>) => {
    setUserResponse(response);
    setHasInteracted(true);
  }, []);

  const handleCheckAnswer = useCallback(() => {
    if (!userResponse) return;
    attemptsRef.current += 1;
    setLifecycle("submitted");

    const timeSpent = Date.now() - startTimeRef.current;
    const result = evaluateActivity(type, userResponse, normalizedContent);
    const fb = getActivityFeedback(result.correct);
    const gm = result.correct ? null : getGuidanceMessage(type);

    setFeedbackMessage(fb);
    setGuidanceMessage(gm);
    setLifecycle(result.correct ? "correct" : "incorrect");

    if (result.correct) {
      onComplete({
        correct: true,
        response: userResponse,
        hintsUsed,
        attempts: attemptsRef.current,
        timeSpent,
        independenceScore: computeIndependenceScore(hintsUsed, attemptsRef.current),
      });
    }
  }, [userResponse, type, normalizedContent, onComplete, hintsUsed]);

  const handleTryAgain = useCallback(() => {
    setLifecycle("idle");
    setFeedbackMessage(null);
    setGuidanceMessage(null);
    setUserResponse(null);
    setHasInteracted(false);
  }, []);

  const handleContinue = useCallback(() => {
    if (lifecycle === "correct") {
      // onComplete already fired; nothing more to do
    } else if (isObserveStep) {
      onComplete({
        correct: true,
        response: { observed: true },
        hintsUsed: 0,
        attempts: 1,
        timeSpent: Date.now() - startTimeRef.current,
        independenceScore: 1,
      });
    }
  }, [lifecycle, isObserveStep, onComplete]);

  const handleHintClick = useCallback(() => {
    const nextIndex = hintsUsed;
    const hint = getHintText(type, activity.content, nextIndex);
    if (hint) {
      setHintsUsed((prev) => prev + 1);
      setHintText(hint);
    } else {
      setHintText(hintText ? null : "Think about what the question is asking you.");
    }
  }, [hintsUsed, type, activity.content, hintText]);

  // Reset on activity change
  useEffect(() => {
    startTimeRef.current = Date.now();
    attemptsRef.current = 0;
    setLifecycle("idle");
    setHintsUsed(0);
    setHintText(null);
    setFeedbackMessage(null);
    setGuidanceMessage(null);
    setUserResponse(null);
    setHasInteracted(false);
    setMultiQuestionIndex(0);
    setMultiQuestionResponses([]);
    setFilledAnswers({});
    setActiveBlankId(null);
    setMatchingConnections({});
    setMatchingSelectedLeft(null);
    setMatchingSelectedRight(null);
    setDragPlacements({});
    setDragSelectedItem(null);
    setSeqUserOrder([]);
    setRealWorldResponse("");
    setGridHighlighted([]);
    setPvcPlacedDigits({});
    setPvcSelectedDigit(null);
    setPvcActiveColumn(null);
  }, [activity.id]);

  // Observe-step auto-complete timer
  const autoCompleteScheduledRef = useRef(false);
  useEffect(() => {
    if (disableObserveStepAutoComplete) {
      autoCompleteScheduledRef.current = false;
      return;
    }
    if (!(OBSERVE_STEP_AUTO_COMPLETABLE_TYPES as readonly string[]).includes(type as any)) {
      autoCompleteScheduledRef.current = false;
      return;
    }
    if (!isObserveStep) {
      autoCompleteScheduledRef.current = false;
      return;
    }
    if (autoCompleteScheduledRef.current) return;
    autoCompleteScheduledRef.current = true;

    const timer = setTimeout(() => {
      onComplete({
        correct: true,
        response: { observed: true, activityType: type },
        hintsUsed: 0,
        attempts: 1,
        timeSpent: Date.now() - startTimeRef.current,
        independenceScore: 1,
      });
    }, observeStepAutoCompleteDelayMs);

    return () => clearTimeout(timer);
  }, [activity.id, type, isObserveStep, disableObserveStepAutoComplete, observeStepAutoCompleteDelayMs, onComplete]);

  const renderActivityContent = () => {
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
        const size = (normalizedContent.size as "sm" | "md" | "lg") ?? "md";

        if (isAddition && isObserveStep) {
          const leftItems = Array.isArray(left) ? (left as string[]) : [];
          const rightItems = Array.isArray(right) ? (right as string[]) : [];
          const leftEmoji = leftItems[0] ?? (Array.isArray(right) ? right[0] : undefined) ?? "🔢";
          const rightEmoji = rightItems[0] ?? leftEmoji;
          return (
            <div className="flex flex-col items-center gap-4 sm:gap-6">
              <div className="flex items-center justify-center gap-4">
                <VisualCounter count={leftItems.length} emoji={leftEmoji} size={size} showCount />
                <span className="text-3xl font-bold text-slate-text">+</span>
                <VisualCounter count={rightItems.length} emoji={rightEmoji} size={size} showCount />
                <span className="text-3xl font-bold text-slate-text">=</span>
                <span className="text-3xl font-bold text-slate-text">{additionSum}</span>
              </div>
            </div>
          );
        }

        if (isAddition) {
          const leftItems = Array.isArray(left) ? (left as string[]) : [];
          const rightItems = Array.isArray(right) ? (right as string[]) : [];
          const leftEmoji = leftItems[0] ?? (Array.isArray(right) ? right[0] : undefined) ?? "🔢";
          const rightEmoji = rightItems[0] ?? leftEmoji;
          return (
            <div className="flex flex-col items-center gap-4 sm:gap-6">
              <div className="flex items-center justify-center gap-4">
                <VisualCounter count={leftItems.length} emoji={leftEmoji} size={size} showCount={false} />
                <span className="text-3xl font-bold text-slate-text">+</span>
                <VisualCounter count={rightItems.length} emoji={rightEmoji} size={size} showCount={false} />
              </div>
              <div className="flex flex-wrap justify-center gap-3">
                {Array.from({ length: Math.max(10, Math.min(additionSum + 2, 20)) }, (_, i) => i + 1).map((n) => (
                  <button
                    key={n}
                    onClick={() => handleResponse({ count: n })}
                    className={cn(
                      "flex h-14 w-14 items-center justify-center rounded-xl border-2 text-lg font-bold motion-safe:transition-colors motion-safe:duration-150",
                      userResponse?.count === n
                        ? "border-soft-blue bg-soft-blue/10 text-soft-blue"
                        : "border-slate-300 bg-white text-slate-text hover:border-soft-blue focus:outline-none focus:ring-2 focus:ring-soft-blue"
                    )}
                    aria-label={`Select ${n}`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
          );
        }

        if (isObserveStep) {
          return (
            <div className="flex flex-col items-center gap-4">
              <VisualCounter count={count} emoji={emoji} size={size} showCount />
            </div>
          );
        }

        return (
          <div className="flex flex-col items-center gap-4 sm:gap-6">
            <VisualCounter count={count} emoji={emoji} size={size} showCount={false} />
            <div className="flex flex-wrap justify-center gap-3">
              {Array.from({ length: Math.max(10, Math.min(count + 2, 20)) }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  onClick={() => handleResponse({ count: n })}
                  className={cn(
                    "flex h-14 w-14 items-center justify-center rounded-xl border-2 text-lg font-bold motion-safe:transition-colors motion-safe:duration-150",
                    userResponse?.count === n
                      ? "border-soft-blue bg-soft-blue/10 text-soft-blue"
                      : "border-slate-300 bg-white text-slate-text hover:border-soft-blue focus:outline-none focus:ring-2 focus:ring-soft-blue"
                  )}
                  aria-label={`Select ${n}`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
        );
      }

      case "matching": {
        const matchingPairs = (normalizedContent.pairs as Array<{ id: string; itemA: string; itemB: string }>) ?? [];
        const matchingCorrectPairs: Record<string, string> = {};
        matchingPairs.forEach((p) => { matchingCorrectPairs[p.id] = p.id; });
        return (
          <Matching
            pairs={matchingPairs}
            connections={matchingConnections}
            selectedLeftId={matchingSelectedLeft}
            selectedRightId={matchingSelectedRight}
            onSelectLeft={(id) => {
              setMatchingSelectedLeft(id);
              if (matchingSelectedRight) {
                const updated = { ...matchingConnections, [id]: matchingSelectedRight };
                setMatchingConnections(updated);
                setMatchingSelectedLeft(null);
                setMatchingSelectedRight(null);
                handleResponse({ pairs: Object.keys(updated).map((k) => ({ id: k, correct: updated[k] === matchingCorrectPairs[k] })) });
              }
            }}
            onSelectRight={(id) => {
              setMatchingSelectedRight(id);
              if (matchingSelectedLeft) {
                const updated = { ...matchingConnections, [matchingSelectedLeft]: id };
                setMatchingConnections(updated);
                setMatchingSelectedLeft(null);
                setMatchingSelectedRight(null);
                handleResponse({ pairs: Object.keys(updated).map((k) => ({ id: k, correct: updated[k] === matchingCorrectPairs[k] })) });
              }
            }}
            onUndo={() => {
              const keys = Object.keys(matchingConnections);
              if (keys.length === 0) return;
              const lastKey = keys[keys.length - 1];
              const updated = { ...matchingConnections };
              delete updated[lastKey];
              setMatchingConnections(updated);
              handleResponse({ pairs: Object.keys(updated).map((k) => ({ id: k, correct: updated[k] === matchingCorrectPairs[k] })) });
            }}
            showResult={lifecycle === "correct" || lifecycle === "incorrect"}
            correctPairs={matchingCorrectPairs}
          />
        );
      }

      case "drag_drop":
      case "dragdrop": {
        const dragItems = (normalizedContent.items as Array<{ id: string; label: string; emoji?: string }>) ?? [];
        const dragTargets = (normalizedContent.targets as Array<{ id: string; label: string }>) ?? [];
        return (
          <DragDrop
            items={dragItems}
            targets={dragTargets}
            placements={dragPlacements}
            selectedItemId={dragSelectedItem}
            onSelectItem={(id) => setDragSelectedItem(id === dragSelectedItem ? null : id)}
            onPlaceItem={(targetId) => {
              if (!dragSelectedItem) return;
              const updated = { ...dragPlacements, [dragSelectedItem]: targetId };
              setDragPlacements(updated);
              setDragSelectedItem(null);
              const allPlaced = dragItems.every((item) => item.id in updated || item.id === dragSelectedItem);
              handleResponse({ droppedPositions: updated });
            }}
            onRemoveItem={(itemId) => {
              const updated = { ...dragPlacements };
              delete updated[itemId];
              setDragPlacements(updated);
              handleResponse({ droppedPositions: updated });
            }}
            showResult={lifecycle === "correct" || lifecycle === "incorrect"}
            correctPlacements={normalizedContent.expectedPositions as Record<string, string> | undefined}
          />
        );
      }

      case "sequencing": {
        const seqItems = (normalizedContent.items as Array<{ id: string; label: string; emoji?: string }>) ?? [];
        return (
          <Sequencing
            items={seqItems}
            userOrder={seqUserOrder}
            onAddItem={(id) => {
              const updated = [...seqUserOrder, id];
              setSeqUserOrder(updated);
              handleResponse({ order: updated });
            }}
            onRemoveItem={(id) => {
              const updated = seqUserOrder.filter((i) => i !== id);
              setSeqUserOrder(updated);
              handleResponse({ order: updated });
            }}
            onReorder={(fromIndex, toIndex) => {
              const updated = [...seqUserOrder];
              const [moved] = updated.splice(fromIndex, 1);
              updated.splice(toIndex, 0, moved);
              setSeqUserOrder(updated);
              handleResponse({ order: updated });
            }}
            showResult={lifecycle === "correct" || lifecycle === "incorrect"}
            correctOrder={normalizedContent.correctOrder as string[] | undefined}
          />
        );
      }

      case "multiple_choice": {
        const rawQuestions = activity.content.questions as Array<{
          question?: string;
          text?: string;
          options: string[];
          correctIndex: number;
        }> | undefined;

        if (rawQuestions?.length && multiTotal > 1) {
          const currentIdx = multiQuestionIndex;
          if (currentIdx >= rawQuestions.length) return null;
          const q = rawQuestions[currentIdx];
          const options = q.options.map((label, i) => ({ id: String(i), label }));
          const isLast = currentIdx + 1 >= rawQuestions.length;

          if (lifecycle === "correct" && isLast) {
            return null;
          }

          return (
            <div className="flex flex-col gap-4">
              <MultipleChoice
                key={`mc-${currentIdx}`}
                question={q.question ?? q.text ?? ""}
                options={options}
                selectedIndex={userResponse?.selectedIndex as number | null}
                onSelect={(index) => {
                  handleResponse({ selectedIndex: index, questionIndex: currentIdx });
                }}
                showResult={lifecycle === "correct" || lifecycle === "incorrect"}
                correctIndex={q.correctIndex}
              />
            </div>
          );
        }

        return (
          <MultipleChoice
            question={(activity.content.question as string) ?? ""}
            options={(activity.content.options as Array<{ id: string; label: string; emoji?: string }>) ?? []}
            selectedIndex={userResponse?.selectedIndex as number | null}
            onSelect={(index) => {
              handleResponse({ selectedIndex: index });
            }}
            showResult={lifecycle === "correct" || lifecycle === "incorrect"}
            correctIndex={(activity.content.correctIndex as number) ?? 0}
          />
        );
      }

      case "story_question": {
        const storyQuestions = (normalizedContent.questions as Array<{
          question: string;
          options: string[];
          correctIndex: number;
        }>) ?? [];
        const currentIdx = multiQuestionIndex;
        if (currentIdx >= storyQuestions.length) return null;
        const currentSQ = storyQuestions[currentIdx];
        const isLast = currentIdx + 1 >= storyQuestions.length;

        if (lifecycle === "correct" && isLast) return null;

        return (
          <StoryQuestion
            scenario={(normalizedContent.scenario as string) ?? ""}
            questions={storyQuestions}
            currentQuestionIndex={currentIdx}
            selectedIndex={userResponse?.selectedIndex as number | null}
            onSelect={(index) => {
              handleResponse({ selectedIndex: index, questionIndex: currentIdx });
            }}
            showResult={lifecycle === "correct" || lifecycle === "incorrect"}
            visual={(normalizedContent.visual as string) ?? undefined}
          />
        );
      }

      case "real_world":
      case "real_world_task":
        return (
          <RealWorldTask
            scenario={(normalizedContent.scenario as string) ?? ""}
            taskDescription={(normalizedContent.taskDescription as string) ?? ""}
            visualExample={(normalizedContent.visualExample as string) ?? undefined}
            hint={(normalizedContent.hint as string) ?? undefined}
            response={realWorldResponse}
            onResponseChange={setRealWorldResponse}
          />
        );

      case "fraction_visual":
        return (
          <FractionVisualizer
            numerator={(normalizedContent.numerator as number) ?? 1}
            denominator={(normalizedContent.denominator as number) ?? 2}
            mode={(normalizedContent.mode as "bar" | "circle") ?? "bar"}
            label={normalizedContent.label as string}
            showLabel={(normalizedContent.showLabel as boolean) ?? false}
            interactive={(normalizedContent.interactive as boolean) ?? false}
            compare={normalizedContent.compare as { numerator: number; denominator: number } | undefined}
            onShade={(shaded) => {
              handleResponse({ shaded });
            }}
          />
        );

      case "place_value_chart": {
        const pvcDraggableDigits = (normalizedContent.draggableDigits as number[]) ?? [];
        return (
          <PlaceValueChart
            maxPlaces={(normalizedContent.maxPlaces as "lakh" | "crore") ?? "crore"}
            placedDigits={pvcPlacedDigits}
            draggableDigits={pvcDraggableDigits}
            selectedDigit={pvcSelectedDigit}
            activeColumn={pvcActiveColumn}
            onSelectDigit={(digit) => setPvcSelectedDigit(digit === pvcSelectedDigit ? null : digit)}
            onPlaceDigit={(column) => {
              if (pvcSelectedDigit == null) return;
              setPvcPlacedDigits((prev) => ({ ...prev, [column]: pvcSelectedDigit }));
              setPvcActiveColumn(null);
              setPvcSelectedDigit(null);
            }}
            onRemoveDigit={(column) => {
              setPvcPlacedDigits((prev) => {
                const updated = { ...prev };
                delete updated[column];
                return updated;
              });
            }}
            targetNumber={normalizedContent.targetNumber as number | undefined}
            showResult={lifecycle === "correct" || lifecycle === "incorrect"}
            showLabels={(normalizedContent.showLabels as boolean) ?? true}
          />
        );
      }

      case "grid_area": {
        const gridRows = (normalizedContent.rows as number) ?? 5;
        const gridCols = (normalizedContent.cols as number) ?? 5;
        return (
          <GridCounter
            rows={gridRows}
            cols={gridCols}
            highlighted={gridHighlighted}
            mode={(normalizedContent.mode as "area" | "perimeter") ?? "area"}
            interactive={(normalizedContent.interactive as boolean) ?? false}
            maxHighlights={normalizedContent.maxHighlights as number}
            cellSize={(normalizedContent.cellSize as number) ?? 40}
            showCount
            onHighlight={(cells) => {
              setGridHighlighted(cells);
              const mode = (normalizedContent.mode as "area" | "perimeter") ?? "area";
              const count = mode === "perimeter"
                ? computePerimeter(cells, gridRows, gridCols)
                : cells.length;
              handleResponse({ highlighted: cells, count });
            }}
            onClearAll={() => {
              setGridHighlighted([]);
              handleResponse({ highlighted: [], count: 0 });
            }}
          />
        );
      }

      case "chart_reader":
        return (
          <ChartReader
            type={(normalizedContent.type as "bar" | "pictograph") ?? "bar"}
            data={(normalizedContent.data as { label: string; value: number; emoji?: string }[]) ?? []}
            title={normalizedContent.title as string}
            showValues={(normalizedContent.showValues as boolean) ?? true}
            interactive={(normalizedContent.interactive as boolean) ?? false}
            onSelect={(label) => {
              if ((normalizedContent.interactive as boolean) ?? false) {
                handleResponse({ selectedLabel: label });
              }
            }}
          />
        );

      case "clock_time":
        return (
          <ClockWidget
            hour={(normalizedContent.hour as number) ?? 12}
            minute={(normalizedContent.minute as number) ?? 0}
            interactive={(normalizedContent.interactive as boolean) ?? false}
            mode={(normalizedContent.mode as "read" | "set") ?? "read"}
            showDigital={(normalizedContent.showDigital as boolean) ?? true}
            targetTime={normalizedContent.targetTime as { hour: number; minute: number } | undefined}
            onTimeChange={(h, m) => handleResponse({ hour: h, minute: m })}
          />
        );

      case "measurement_scale":
        return (
          <ScaleReader
            type={(normalizedContent.type as "ruler" | "thermometer" | "cylinder") ?? "ruler"}
            min={(normalizedContent.min as number) ?? 0}
            max={(normalizedContent.max as number) ?? 10}
            step={(normalizedContent.step as number) ?? 1}
            unit={(normalizedContent.unit as string) ?? "cm"}
            value={normalizedContent.value as number | undefined}
            interactive={(normalizedContent.interactive as boolean) ?? false}
            targetValue={normalizedContent.targetValue as number | undefined}
            showReading
            onValueChange={(v) => handleResponse({ value: v })}
          />
        );

      case "fill_blank":
        return (
          <FillBlank
            template={(normalizedContent.template as string) ?? ""}
            blanks={(normalizedContent.blanks as { id: string; position: number; correctAnswer: string | number; options?: (string | number)[] }[]) ?? []}
            mode={(normalizedContent.mode as "select" | "type") ?? "select"}
            filledAnswers={filledAnswers}
            activeBlankId={activeBlankId}
            onBlankActivate={(id) => setActiveBlankId(id)}
            onBlankFill={(id, value) => {
              setFilledAnswers((prev) => ({ ...prev, [id]: value }));
              setActiveBlankId(null);
              handleResponse({ answers: { ...filledAnswers, [id]: value } });
            }}
            onBlankClear={(id) => {
              setFilledAnswers((prev) => {
                const next = { ...prev };
                delete next[id];
                return next;
              });
            }}
            showResult={lifecycle === "correct" || lifecycle === "incorrect"}
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

  // Handle multi-question check answer: evaluate current sub-question
  const handleMultiCheckAnswer = useCallback(() => {
    if (!userResponse) return;

    const rawQuestions = activity.content.questions as Array<{ correctIndex: number }> | undefined;
    const storyQuestions = normalizedContent.questions as Array<{ correctIndex: number }> | undefined;
    const questions = rawQuestions ?? storyQuestions ?? [];
    const currentIdx = multiQuestionIndex;
    const currentQ = questions[currentIdx];
    if (!currentQ) return;

    const selectedIndex = userResponse.selectedIndex as number | undefined;
    const isCorrect = selectedIndex === currentQ.correctIndex;
    const fb = getActivityFeedback(isCorrect);
    const gm = isCorrect ? null : getGuidanceMessage(type);

    setFeedbackMessage(fb);
    setGuidanceMessage(gm);

    if (isCorrect) {
      const updated = [...multiQuestionResponses, { correct: true, response: userResponse }];
      setMultiQuestionResponses(updated);

      if (currentIdx + 1 >= questions.length) {
        attemptsRef.current += 1;
        setLifecycle("correct");
        onComplete({
          correct: true,
          response: { correct: true, responses: updated },
          hintsUsed,
          attempts: attemptsRef.current,
          timeSpent: Date.now() - startTimeRef.current,
          independenceScore: computeIndependenceScore(hintsUsed, attemptsRef.current),
        });
      } else {
        setMultiQuestionIndex((prev) => prev + 1);
        setLifecycle("idle");
        setUserResponse(null);
        setHasInteracted(false);
        setFeedbackMessage(null);
        setGuidanceMessage(null);
      }
    } else {
      attemptsRef.current += 1;
      setLifecycle("incorrect");
    }
  }, [userResponse, activity.content.questions, normalizedContent.questions, multiQuestionIndex, multiQuestionResponses, type, onComplete, hintsUsed]);

  const effectiveOnCheckAnswer = multiTotal > 1 ? handleMultiCheckAnswer : handleCheckAnswer;

  const isCorrect = lifecycle === "correct" ? true : lifecycle === "incorrect" ? false : null;

  return (
    <div className={cn("flex flex-col", className)}>
      {isObserveStep ? (
        <ActivityShell
          instruction={instruction}
          activityIcon={activityIcon}
          stepLabel={stepLabel ?? "observe"}
          isObserveStep
          hasInteracted={false}
          isCorrect={null}
          feedbackMessage=""
          guidanceMessage=""
          hintAvailable={false}
          hintLevel={0}
          onCheckAnswer={() => {}}
          onShowHint={() => {}}
          onContinue={handleContinue}
          onTryAgain={() => {}}
        >
          <div role="region" aria-label={`${activityLabel} activity`}>
            {renderActivityContent()}
          </div>
        </ActivityShell>
      ) : isSelfReport ? (
        <ActivityShell
          instruction={instruction}
          activityIcon={activityIcon}
          progressLabel={progressLabel}
          stepLabel={stepLabel ?? "guided_practice"}
          isSelfReport
          hasInteracted={hasInteracted}
          isCorrect={isCorrect}
          feedbackMessage={feedbackMessage ?? ""}
          guidanceMessage={guidanceMessage ?? ""}
          hintAvailable={hintText !== null}
          hintLevel={hintsUsed}
          onCheckAnswer={() => handleResponse({ completed: true })}
          onShowHint={handleHintClick}
          onContinue={handleContinue}
          onTryAgain={handleTryAgain}
        >
          <div role="region" aria-label={`${activityLabel} activity`}>
            {renderActivityContent()}
          </div>
        </ActivityShell>
      ) : (
        <ActivityShell
          instruction={instruction}
          activityIcon={activityIcon}
          progressLabel={progressLabel}
          stepLabel={stepLabel ?? "guided_practice"}
          isObserveStep={false}
          isSelfReport={false}
          hasInteracted={hasInteracted}
          isCorrect={isCorrect}
          feedbackMessage={feedbackMessage ?? ""}
          guidanceMessage={guidanceMessage ?? ""}
          hintAvailable={hintText !== null || ((activity.content.hints as string[] | undefined)?.length ?? 0) > 0}
          hintLevel={hintsUsed}
          onCheckAnswer={effectiveOnCheckAnswer}
          onShowHint={handleHintClick}
          onContinue={handleContinue}
          onTryAgain={handleTryAgain}
        >
          <div role="region" aria-label={`${activityLabel} activity`}>
            {renderActivityContent()}
          </div>
        </ActivityShell>
      )}
    </div>
  );
}
