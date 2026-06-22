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
import { getAdapter } from "./adapters";
import type { LifecycleState } from "./adapters/adapter-interface";

const OBSERVE_STEP_AUTO_COMPLETABLE_TYPES = [
  "visual_counter", "visual_counting", "fraction_visual",
  "place_value_chart", "grid_area", "chart_reader",
  "clock_time", "measurement_scale",
] as const;

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
  onContinueStep?: () => void;
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
  onContinueStep,
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

  // Per-type adapter state (replaces all per-type state vars)
  const [adapterState, setAdapterState] = useState<Record<string, unknown>>({});

  const type = activity.type?.toLowerCase().replace(/-/g, "_") ?? "";
  const isObserveStep = stepLabel === "observe";
  const isSelfReport = type === "real_world" || type === "real_world_task";

  const normalizedContent = useMemo(
    () => normalizeContent(type, activity.content),
    [type, activity.content],
  );

  const adapter = useMemo(() => getAdapter(type), [type]);

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
      onContinueStep?.();
    } else if (isObserveStep) {
      onComplete({
        correct: true,
        response: { observed: true },
        hintsUsed: 0,
        attempts: 1,
        timeSpent: Date.now() - startTimeRef.current,
        independenceScore: 1,
      });
      onContinueStep?.();
    }
  }, [lifecycle, isObserveStep, onComplete, onContinueStep]);

  const handleHintClick = useCallback(() => {
    const nextIndex = hintsUsed;
    const hint = getHintText(type, activity.content, nextIndex);
    if (hint) {
      setHintsUsed((prev) => prev + 1);
      setHintText(hint);
    } else {
      setHintText(hintText ? null : "Read the instructions again. Try one step at a time.");
    }
  }, [hintsUsed, type, activity.content, hintText]);

  // Reset and initialize adapter state on activity change
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
    if (adapter) {
      setAdapterState(adapter.getInitialState(normalizedContent));
    }
  }, [activity.id, adapter, normalizedContent]);

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

  const renderActivityContent = useCallback(() => {
    if (!adapter) {
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

    return adapter.render({
      content: normalizedContent,
      adapterState,
      lifecycle,
      isObserveStep,
      multiQuestionIndex,
      multiTotal,
      userResponse,
      onResponse: handleResponse,
      onAdapterStateChange: (updates) => setAdapterState((prev) => ({ ...prev, ...updates })),
    });
  }, [adapter, normalizedContent, adapterState, lifecycle, isObserveStep, multiQuestionIndex, multiTotal, userResponse, handleResponse, activity.type]);

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
