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
import { GridCounter, computePerimeter } from "./GridCounter";
import { ChartReader } from "./ChartReader";
import { ClockWidget } from "./ClockWidget";
import { ScaleReader } from "./ScaleReader";
import { FillBlank } from "./FillBlank";

const OBSERVE_STEP_AUTO_COMPLETABLE_TYPES = [
  "fraction_visual",
  "place_value_chart",
  "chart_reader",
  "grid_area",
  "clock_time",
  "measurement_scale",
  "fill_blank",
] as const;

/**
 * Normalizes content from a YAML activity into the prop shape the corresponding
 * UI component expects. The pipeline (EPIC-13) may emit several different shapes
 * for the same activity type; this function translates them all into the canonical
 * shape documented in `knowledge/curriculum/content-creation-guide.md`.
 *
 * For each activity type, the function:
 *   1. Reads the canonical field first
 *   2. Falls back to common pipeline variants
 *   3. Coerces types where the pipeline emits strings instead of numbers
 *
 * Adding a new normalization branch: add an `if (t === "<type>")` block.
 */
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
      id: p.id ?? `pair-${i}`,
      itemA: p.itemA ?? p.number ?? p.value ?? String(p[p.key ? Object.keys(p)[0] : ''] ?? ''),
      itemB: p.itemB ?? p.name ?? String(p.value ?? ''),
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

  // Handle YAML sequencing shape: { question, numbers: [12, 5, 8] }
  if (t === "sequencing" && !Array.isArray(n.items) && Array.isArray(n.numbers)) {
    n.items = (n.numbers as number[]).map((num, i) => ({
      id: `item-${i}`,
      label: String(num),
    }));
    n.correctOrder = (n.items as Array<{ id: string }>).map((item) => item.id);
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

  // Handle YAML drag_drop shape: { prompt, items: [{ value, place }] }
  if ((t === "drag_drop" || t === "dragdrop") && !n.groups && Array.isArray(n.items) && typeof n.items[0] === "object" && n.items[0] !== null && ("value" in n.items[0] || "place" in n.items[0])) {
    const items = n.items as Array<{ value: string; place: string }>;
    n.items = items.map((item, i) => ({
      id: `item-${i}`,
      label: item.value,
    }));
    const placeSet = new Set(items.map((item) => item.place));
    const targets = Array.from(placeSet);
    n.targets = targets.map((place, i) => ({
      id: `target-${i}`,
      label: place,
    }));
    const expected: Record<string, string> = {};
    items.forEach((item, i) => {
      const targetIdx = targets.indexOf(item.place);
      expected[`item-${i}`] = `target-${targetIdx}`;
    });
    n.expectedPositions = expected;
  }

  // Handle YAML drag_drop shape: { prompt, options: [{ digit, place }] }
  if ((t === "drag_drop" || t === "dragdrop") && Array.isArray(n.options) && n.options.length > 0 && typeof n.options[0] === "object" && n.options[0] !== null && ("digit" in n.options[0] || "value" in n.options[0])) {
    const opts = n.options as Array<{ digit?: string; value?: string; place: string }>;
    n.items = opts.map((o, i) => ({ id: `item-${i}`, label: o.digit ?? o.value ?? "" }));
    const placeSet = new Set(opts.map((o) => o.place));
    const targets = Array.from(placeSet);
    n.targets = targets.map((p, i) => ({ id: `target-${i}`, label: p }));
    const expected: Record<string, string> = {};
    opts.forEach((o, i) => {
      expected[`item-${i}`] = `target-${targets.indexOf(o.place)}`;
    });
    n.expectedPositions = expected;
    delete n.options;
  }

  // Handle YAML drag_drop shape: { question, options: { thousands: [1,3], ... } }
  if ((t === "drag_drop" || t === "dragdrop") && n.options && typeof n.options === "object" && !Array.isArray(n.options)) {
    const groups = Object.entries(n.options as Record<string, unknown[]>).map(([label, values]) => ({
      label,
      target: values.map(String),
    }));
    const allItems: Array<{ id: string; label: string }> = [];
    const expected: Record<string, string> = {};
    groups.forEach((g, gIdx) => {
      g.target.forEach((val) => {
        const id = `item-${allItems.length}`;
        allItems.push({ id, label: val });
        expected[id] = `target-${gIdx}`;
      });
    });
    n.items = allItems;
    n.targets = groups.map((g, i) => ({ id: `target-${i}`, label: g.label }));
    n.expectedPositions = expected;
    delete n.options;
  }

  // Handle fill_blank YAML shapes: { statement, answers } or { question, answer } or { prompt, answer }
  // For the template, prefer the equation-like text (statement/question) over descriptive prompt text.
  if (t === "fill_blank") {
    if (!n.template && (n.statement || n.question || n.prompt)) {
      const rawTemplate = (n.statement || n.question || n.prompt) as string;
      const answer = n.answer ?? n.answers;
      if (answer) {
        const answers = Array.isArray(answer) ? answer : [answer];
        n.blanks = (answers as (string | number)[]).map((a, i) => ({
          id: `blank-${i}`,
          position: i,
          correctAnswer: a,
        }));
        n.template = rawTemplate;
      }
    }
  }

  // Handle fraction_visual YAML shapes: pipeline variant uses description instead of label
  if (t === "fraction_visual") {
    if (!n.label && typeof n.description === "string") {
      n.label = n.description;
    }
    if (n.compare && typeof n.compare === "object") {
      n.compare = {
        numerator: Number((n.compare as any).numerator ?? 0),
        denominator: Number((n.compare as any).denominator ?? 1),
      };
    }
  }

  // Handle grid_area YAML shapes: pipeline variant uses cells instead of highlighted
  if (t === "grid_area") {
    if (!n.highlighted && Array.isArray(n.cells)) {
      n.highlighted = n.cells;
    }
    if (n.highlighted && !Array.isArray(n.highlighted)) {
      n.highlighted = [];
    }
  }

  // Handle chart_reader YAML shapes: pipeline variant uses categories instead of data
  if (t === "chart_reader") {
    if (!n.data && Array.isArray(n.categories)) {
      n.data = (n.categories as any[]).map((c) => ({
        label: c.name ?? c.label ?? "",
        value: Number(c.count ?? c.value ?? 0),
        emoji: c.emoji,
      }));
      delete n.categories;
    }
    if (Array.isArray(n.data)) {
      n.data = (n.data as any[]).map((d) => ({
        label: String(d.label ?? d.name ?? ""),
        value: Number(d.value ?? d.count ?? 0),
        emoji: d.emoji,
      }));
    }
  }

  // Handle clock_time YAML shapes: pipeline variant uses time field
  if (t === "clock_time") {
    if (n.time && typeof n.time === "object") {
      const t = n.time as any;
      n.hour = Number(n.hour ?? t.hour ?? t.h ?? 12);
      n.minute = Number(n.minute ?? t.minute ?? t.m ?? 0);
      delete n.time;
    }
    if (n.targetTime && typeof n.targetTime === "object") {
      const tt = n.targetTime as any;
      n.targetTime = {
        hour: Number(tt.hour ?? tt.h ?? 12),
        minute: Number(tt.minute ?? tt.m ?? 0),
      };
    }
  }

  // Handle measurement_scale YAML shapes: pipeline variant uses range/reading
  if (t === "measurement_scale") {
    if (n.range && typeof n.range === "object") {
      const r = n.range as any;
      n.min = Number(n.min ?? r.from ?? r.min ?? 0);
      n.max = Number(n.max ?? r.to ?? r.max ?? 10);
      delete n.range;
    }
    if (n.reading !== undefined && n.value === undefined) {
      n.value = Number(n.reading);
      delete n.reading;
    }
  }

  // Handle place_value_chart YAML shapes
  if (t === "place_value_chart") {
    const chart = n.chart as unknown;
    if (chart && typeof chart === "object" && !Array.isArray(chart)) {
      const obj = chart as Record<string, unknown>;
      if (obj.thousands !== undefined) {
        n.digits = [obj.thousands, obj.hundreds, obj.tens, obj.ones].map((v) => (v != null ? Number(v) : null));
        n.maxPlaces = "lakh";
      } else if (Array.isArray(obj.columns)) {
        const cols = obj.columns as string[];
        n.maxPlaces = cols.length <= 6 ? "lakh" : "crore";
      }
    }
    if (Array.isArray(chart) && chart.length > 0 && typeof chart[0] === "object" && chart[0] !== null) {
      const first = chart[0] as Record<string, unknown>;
      if (first.digit !== undefined) {
        n.digits = (chart as Array<Record<string, unknown>>).map((e) => Number(e.digit));
        // Size the grid to the actual number of entries, not a fixed crore.
        n.maxPlaces = chart.length <= 6 ? "lakh" : "crore";
      }
    }
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
  /**
   * Delay in ms before the observe-step auto-completes for visual types.
   * Default: 1500. Set to 0 for instant auto-complete.
   */
  observeStepAutoCompleteDelayMs?: number;
  /**
   * If true, the observe-step auto-complete is disabled entirely.
   * Useful for testing or for types that have their own observe logic.
   */
  disableObserveStepAutoComplete?: boolean;
}

export function ActivityRenderer({
  activity,
  onComplete,
  className,
  promptLevel = 1,
  stepLabel,
  observeStepAutoCompleteDelayMs = 1500,
  disableObserveStepAutoComplete = false,
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

  // Observe-step auto-complete: for visual types, auto-complete after a brief delay
  // so the learner can see the visual without needing to answer.
  // Also auto-completes non-interactive activities in any step (no user input required).
  const autoCompleteScheduledRef = useRef(false);
  useEffect(() => {
    if (disableObserveStepAutoComplete) {
      autoCompleteScheduledRef.current = false;
      return;
    }
    if (!(OBSERVE_STEP_AUTO_COMPLETABLE_TYPES as readonly string[]).includes(type)) {
      autoCompleteScheduledRef.current = false;
      return;
    }

    const isObserve = stepLabel === "observe";
    const interactive = (normalizedContent.interactive as boolean) ?? false;
    // Auto-complete fires when: this is the observe step, OR the activity is non-interactive
    if (!isObserve && interactive) {
      autoCompleteScheduledRef.current = false;
      return;
    }

    if (autoCompleteScheduledRef.current) return;
    autoCompleteScheduledRef.current = true;

    const timer = setTimeout(() => {
      handleComplete({ observed: true, activityType: type });
    }, observeStepAutoCompleteDelayMs);

    return () => clearTimeout(timer);
  }, [activity.id, type, stepLabel, normalizedContent.interactive, disableObserveStepAutoComplete, observeStepAutoCompleteDelayMs]);

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

        // Description-only observe step (no structured count data)
        const description = (activity.content.description as string) ?? "";
        if (isDemonstration && !count && description) {
          return (
            <div className="flex flex-col items-center gap-4 rounded-xl bg-warm-off-white p-6">
              <p className="text-lg text-slate-text">{description}</p>
            </div>
          );
        }

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
        // Handle YAML data shape: { questions: [{ question/text, options: string[], correctIndex }] }
        const rawQuestions = activity.content.questions as Array<{
          question?: string;
          text?: string;
          options: string[];
          correctIndex: number;
        }> | undefined;
        const questions = rawQuestions?.map((q) => ({
          question: q.question || q.text || "",
          options: q.options,
          correctIndex: q.correctIndex,
        }));

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
            onShade={(shaded) => {
              // Only fire handleComplete when the activity is interactive
              if ((normalizedContent.interactive as boolean) ?? false) {
                handleComplete({ shaded });
              }
            }}
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
            onPlaceDigit={(col, digit) => handleComplete({ placed: { col, digit } })}
            onRemoveDigit={(col) => handleComplete({ removed: { col } })}
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
            onHighlight={(cells) => {
              const mode = (normalizedContent.mode as 'area' | 'perimeter') ?? 'area';
              const count = mode === 'perimeter'
                ? computePerimeter(cells, (normalizedContent.rows as number) ?? 5, (normalizedContent.cols as number) ?? 5)
                : cells.length;
              handleComplete({ highlighted: cells, count });
            }}
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
            onSelect={(label) => {
              // Only fire when interactive (not a stimulus)
              if ((normalizedContent.interactive as boolean) ?? false) {
                handleComplete({ selectedLabel: label });
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
