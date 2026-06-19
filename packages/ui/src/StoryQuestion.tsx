import { useState, useCallback } from "react";
import { cn } from "./utils";

export interface StoryQuestionItem {
  question: string;
  options: string[];
  correctIndex: number;
}

export interface QuestionResponse {
  questionIndex: number;
  selectedIndex: number;
  correct: boolean;
}

export interface StoryQuestionProps {
  scenario: string;
  questions: StoryQuestionItem[];
  visual?: string;
  onComplete: (responses: QuestionResponse[]) => void;
  className?: string;
}

export function StoryQuestion({
  scenario,
  questions,
  visual,
  onComplete,
  className,
}: StoryQuestionProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<QuestionResponse[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];

  const handleOptionClick = useCallback(
    (index: number) => {
      if (hasAnswered) return;

      setSelectedIndex(index);
      setHasAnswered(true);

      const correct = index === currentQuestion.correctIndex;
      setIsCorrect(correct);

      if (correct) {
        // Advance to next question after a brief delay
        setTimeout(() => {
          const newResponses: QuestionResponse[] = [
            ...responses,
            {
              questionIndex: currentQuestionIndex,
              selectedIndex: index,
              correct: true,
            },
          ];

          if (currentQuestionIndex >= questions.length - 1) {
            // All questions answered
            onComplete(newResponses);
          } else {
            setResponses(newResponses);
            setCurrentQuestionIndex((prev) => prev + 1);
            setSelectedIndex(null);
            setIsCorrect(null);
            setHasAnswered(false);
          }
        }, 600);
      }
    },
    [hasAnswered, currentQuestion, currentQuestionIndex, questions.length, responses, onComplete],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, index: number) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleOptionClick(index);
      }
    },
    [handleOptionClick],
  );

  if (!currentQuestion) {
    return (
      <div className={cn("flex flex-col items-center gap-4", className)}>
        <p className="text-lg font-semibold text-slate-text">No questions available</p>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-6", className)}>
      {/* Progress indicator */}
      <div
        className="text-sm font-medium text-muted-teal"
        aria-live="polite"
      >
        Question {currentQuestionIndex + 1} of {questions.length}
      </div>

      {/* Scenario */}
      <div
        className="rounded-xl border-2 border-soft-amber/30 bg-soft-amber/5 p-5"
        role="region"
        aria-label="Scenario"
      >
        {visual && (
          <span className="mb-3 block text-3xl" aria-hidden="true">
            {visual}
          </span>
        )}
        <p className="text-base leading-relaxed text-slate-text">
          {scenario}
        </p>
      </div>

      {/* Current question */}
      <div role="group" aria-label={`Question ${currentQuestionIndex + 1}`}>
        <p
          className="mb-4 text-lg font-semibold text-slate-text"
          id={`question-${currentQuestionIndex}`}
        >
          {currentQuestion.question}
        </p>

        <div
          className="flex flex-col gap-3"
          role="listbox"
          aria-labelledby={`question-${currentQuestionIndex}`}
        >
          {currentQuestion.options.map((option, index) => {
            const isSelected = selectedIndex === index;
            const showCorrect =
              hasAnswered && index === currentQuestion.correctIndex;
            const showIncorrect =
              hasAnswered && isSelected && !isCorrect;

            return (
              <button
                key={`${currentQuestionIndex}-${index}`}
                onClick={() => handleOptionClick(index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                role="option"
                aria-selected={isSelected}
                disabled={hasAnswered && isCorrect !== null}
                className={cn(
                  "min-h-[56px] rounded-lg border-2 px-4 py-3 text-left text-base font-medium text-slate-text",
                  "focus:outline-none focus:ring-2 focus:ring-soft-blue focus:ring-offset-2",
                  "transition-colors duration-150",
                  !hasAnswered &&
                    "border-slate-300 bg-white hover:border-slate-400",
                  showCorrect &&
                    "border-muted-green bg-muted-green/10 text-muted-green",
                  showIncorrect &&
                    "border-soft-coral bg-soft-coral/10 text-soft-coral",
                  hasAnswered &&
                    !isSelected &&
                    index !== currentQuestion.correctIndex &&
                    "border-slate-200 bg-slate-50 text-slate-400",
                )}
              >
                <span className="flex items-center gap-3">
                  <span
                    className={cn(
                      "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold",
                      !hasAnswered && "bg-slate-100 text-slate-500",
                      showCorrect && "bg-muted-green text-white",
                      showIncorrect && "bg-soft-coral text-white",
                    )}
                  >
                    {String.fromCharCode(65 + index)}
                  </span>
                  <span>{option}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Feedback */}
      {hasAnswered && isCorrect !== null && (
        <div
          className={cn(
            "rounded-lg px-4 py-3 text-center text-base font-semibold",
            isCorrect
              ? "bg-muted-green/10 text-muted-green"
              : "bg-soft-coral/10 text-soft-coral",
          )}
          aria-live="polite"
          role="alert"
        >
          {isCorrect ? "That's right! Well done." : "Let's try again"}
        </div>
      )}
    </div>
  );
}
