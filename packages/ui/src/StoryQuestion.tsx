import { cn } from "./utils";
import { ScenarioCard } from "./ScenarioCard";
import { OptionCard } from "./OptionCard";

export interface StoryQuestionItem {
  question: string;
  options: string[];
  correctIndex: number;
}

export interface StoryQuestionProps {
  scenario: string;
  questions: StoryQuestionItem[];
  currentQuestionIndex: number;
  selectedIndex: number | null;
  onSelect: (index: number) => void;
  showResult?: boolean;
  visual?: string;
}

const LETTERS = ["A", "B", "C", "D", "E", "F", "G", "H"];

export function StoryQuestion({
  scenario,
  questions,
  currentQuestionIndex,
  selectedIndex,
  onSelect,
  showResult,
  visual,
}: StoryQuestionProps) {
  const currentQuestion = questions[currentQuestionIndex];

  if (!currentQuestion) {
    return (
      <div className="flex flex-col items-center gap-4">
        <p className="text-lg font-semibold text-slate-text">No questions available</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div
        className="text-sm font-medium text-muted-teal"
        aria-live="polite"
      >
        Question {currentQuestionIndex + 1} of {questions.length}
      </div>

      <ScenarioCard text={scenario} visual={visual} />

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
          {currentQuestion.options.map((option, index) => (
            <OptionCard
              key={`${currentQuestionIndex}-${index}`}
              letter={LETTERS[index]}
              label={option}
              isSelected={selectedIndex === index}
              isCorrect={showResult ? index === currentQuestion.correctIndex : undefined}
              showResult={showResult}
              onClick={() => onSelect(index)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
