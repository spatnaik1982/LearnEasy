import { useEffect, useRef } from "react";
import { cn } from "./utils";
import { CheckCircle2, RefreshCw, Lightbulb } from "lucide-react";

export interface ActivityShellProps {
  instruction: string;
  activityIcon: React.ReactNode;
  progressLabel?: string;
  stepLabel: string;
  isObserveStep?: boolean;
  isSelfReport?: boolean;
  hasInteracted: boolean;
  isCorrect?: boolean | null;
  feedbackMessage?: string;
  guidanceMessage?: string;
  hintAvailable?: boolean;
  hintLevel?: number;
  onCheckAnswer: () => void;
  onShowHint: () => void;
  onContinue: () => void;
  onTryAgain: () => void;
  children: React.ReactNode;
}

function getHintLabel(level: number): string | null {
  if (level >= 3) return null;
  switch (level) {
    case 0: return "Show Hint";
    case 1: return "Show Another Hint";
    case 2: return "Show Answer";
    default: return "Show Hint";
  }
}

export function ActivityShell({
  instruction,
  activityIcon,
  progressLabel,
  stepLabel: _stepLabel,
  isObserveStep = false,
  isSelfReport = false,
  hasInteracted,
  isCorrect,
  feedbackMessage,
  guidanceMessage,
  hintAvailable = false,
  hintLevel = 0,
  onCheckAnswer,
  onShowHint,
  onContinue,
  onTryAgain,
  children,
}: ActivityShellProps) {
  const hintLabel = getHintLabel(hintLevel);
  const showHintButton = !isObserveStep && hintAvailable && hintLabel !== null && isCorrect !== true;

  const continueButtonRef = useRef<HTMLButtonElement>(null);
  const tryAgainButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isCorrect === true) {
      continueButtonRef.current?.focus();
    } else if (isCorrect === false) {
      tryAgainButtonRef.current?.focus();
    }
  }, [isCorrect]);

  return (
    <div className="flex flex-col">
      <style>{`
        @keyframes activityShellFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>

      {/* Zone 1 — Instruction Bar */}
      <div
        style={{
          backgroundColor: "#F9F7F2",
          borderBottom: "1px solid #E5E7EB",
          padding: "12px 16px",
        }}
      >
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">{activityIcon}</div>
          <div className="flex flex-col">
            <span
              style={{
                fontFamily: "Inter, sans-serif",
                fontSize: "20px",
                fontWeight: 500,
                lineHeight: 1.5,
              }}
              className="text-slate-text"
            >
              {instruction}
            </span>
            {progressLabel && (
              <span className="text-sm text-muted-teal">{progressLabel}</span>
            )}
          </div>
        </div>
      </div>

      {/* Zone 2 — Interaction Area */}
      <div
        className="min-h-[200px] p-6"
        style={{ backgroundColor: "#FFFFFF" }}
      >
        {children}
      </div>

      {/* Zone 3 — Action Bar */}
      <div className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-center">
        {isObserveStep ? (
          <button
            onClick={onContinue}
            style={{ backgroundColor: "#5D87B1", height: "56px" }}
            className="w-full rounded-lg px-6 text-[18px] font-semibold text-white sm:w-auto"
          >
            Continue
          </button>
        ) : isSelfReport ? (
          <button
            onClick={onCheckAnswer}
            style={{ backgroundColor: "#8FB996", height: "56px" }}
            className="w-full rounded-lg px-6 text-[18px] font-semibold text-white sm:w-auto"
          >
            I Completed This Task
          </button>
        ) : isCorrect === false ? (
          <button
            onClick={onTryAgain}
            style={{
              border: "2px solid #E5989B",
              backgroundColor: "transparent",
              height: "56px",
            }}
            className="w-full rounded-lg px-6 text-[18px] font-semibold text-soft-coral sm:w-auto"
          >
            Try Again
          </button>
        ) : isCorrect === true ? null : (
          <button
            onClick={onCheckAnswer}
            disabled={!hasInteracted}
            style={{
              backgroundColor: "#8FB996",
              height: "56px",
            }}
            className={cn(
              "w-full rounded-lg px-6 text-[18px] font-semibold text-white sm:w-auto",
              "disabled:cursor-not-allowed disabled:opacity-50",
            )}
          >
            Check My Answer
          </button>
        )}

        {showHintButton && (
          <button
            onClick={onShowHint}
            style={{ color: "#5D87B1", height: "56px" }}
            className="flex w-full items-center justify-center gap-1 rounded-lg bg-transparent px-4 text-[16px] font-medium underline-offset-2 hover:underline sm:w-auto"
          >
            <Lightbulb className="h-4 w-4" />
            {hintLabel}
          </button>
        )}
      </div>

      {/* Zone 4 — Feedback Zone */}
      {isCorrect !== null && isCorrect !== undefined && (
        <div
          role="status"
          aria-live="polite"
          data-testid="feedback-zone"
          className={cn("motion-reduce:animate-none")}
          style={{
            animation: "activityShellFadeIn 200ms ease-in",
          }}
        >
          <div
            className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between"
            style={{
              backgroundColor: isCorrect ? "#8FB9961A" : "#E5989B1A",
              borderLeft: isCorrect
                ? "4px solid #8FB996"
                : "4px solid #E5989B",
            }}
          >
            <div className="flex items-center gap-3">
              {isCorrect ? (
                <CheckCircle2
                  className="h-6 w-6 flex-shrink-0"
                  style={{ color: "#8FB996" }}
                />
              ) : (
                <RefreshCw
                  className="h-6 w-6 flex-shrink-0"
                  style={{ color: "#E5989B" }}
                />
              )}
              <div>
                <p
                  className="text-slate-text"
                  style={{ fontSize: "18px", fontWeight: 500 }}
                >
                  {feedbackMessage}
                </p>
                {!isCorrect && guidanceMessage && (
                  <p
                    className="mt-1 text-slate-text"
                    style={{ fontSize: "16px", fontWeight: 400 }}
                  >
                    {guidanceMessage}
                  </p>
                )}
              </div>
            </div>
            {isCorrect ? (
              <button
                ref={continueButtonRef}
                onClick={onContinue}
                style={{
                  backgroundColor: "#8FB996",
                  height: "56px",
                }}
                className="w-full rounded-lg px-6 text-[18px] font-semibold text-white sm:w-auto"
              >
                Continue Lesson
              </button>
            ) : (
              <button
                ref={tryAgainButtonRef}
                onClick={onTryAgain}
                style={{
                  border: "2px solid #E5989B",
                  backgroundColor: "transparent",
                  height: "56px",
                }}
                className="w-full rounded-lg px-6 text-[18px] font-semibold text-soft-coral sm:w-auto"
              >
                Try Again
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
