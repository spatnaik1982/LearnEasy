
import { OptionCard } from "./OptionCard";

export interface MultipleChoiceOption {
  id: string;
  label: string;
  emoji?: string;
}

export interface MultipleChoiceProps {
  question: string;
  options: MultipleChoiceOption[];
  selectedIndex: number | null;
  onSelect: (index: number) => void;
  showResult?: boolean;
  correctIndex?: number;
}

const LETTERS = ["A", "B", "C", "D", "E", "F", "G", "H"];

export function MultipleChoice({
  question,
  options,
  selectedIndex,
  onSelect,
  showResult,
  correctIndex,
}: MultipleChoiceProps) {
  return (
    <div className="flex flex-col" role="group" aria-label="Multiple choice question">
      <p className="mb-4 text-lg font-semibold text-slate-text" id="mc-question">
        {question}
      </p>
      <div className="flex flex-col gap-3" role="listbox" aria-labelledby="mc-question">
        {options.map((option, index) => (
          <OptionCard
            key={option.id}
            letter={LETTERS[index]}
            label={option.label}
            emoji={option.emoji}
            isSelected={selectedIndex === index}
            isCorrect={showResult && index === correctIndex}
            showResult={showResult}
            onClick={() => onSelect(index)}
          />
        ))}
      </div>
    </div>
  );
}
