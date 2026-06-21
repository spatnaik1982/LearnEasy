import { cn } from "./utils";

export interface OptionCardProps {
  letter: string;
  label: string;
  emoji?: string;
  isSelected: boolean;
  isCorrect?: boolean;
  showResult?: boolean;
  disabled?: boolean;
  onClick: () => void;
}

export function OptionCard({
  letter,
  label,
  emoji,
  isSelected,
  isCorrect,
  showResult,
  disabled,
  onClick,
}: OptionCardProps) {
  const showCorrect = showResult && isCorrect;
  const showIncorrect = showResult && isSelected && !isCorrect;

  const ariaLabel = [
    `Option ${letter}: ${label}`,
    isSelected && !showResult && 'selected',
    showCorrect && 'correct answer',
    showIncorrect && 'incorrect',
  ]
    .filter(Boolean)
    .join(', ');

  const borderColor = showCorrect
    ? "#8FB996"
    : showIncorrect
      ? "#E5989B"
      : isSelected
        ? "#5D87B1"
        : "#E5E7EB";

  const bgColor = showCorrect
    ? "#8FB9961A"
    : showIncorrect
      ? "#E5989B1A"
      : isSelected
        ? "#5D87B10D"
        : "transparent";

  const badgeBg = showCorrect ? "#8FB996" : showIncorrect ? "#E5989B" : "#5D87B1";

  const badgeContent = showCorrect ? "✓" : showIncorrect ? "✗" : letter;

  return (
    <button
      type="button"
      role="option"
      aria-selected={isSelected}
      aria-disabled={disabled}
      disabled={disabled}
      aria-label={ariaLabel}
      onClick={onClick}
      data-testid="option-card"
      className={cn(
        "flex items-center gap-3 rounded-lg border-2 p-3 w-full text-left transition-colors duration-150",
        disabled ? "opacity-50" : "cursor-pointer",
      )}
      style={{
        minHeight: "56px",
        padding: "12px 16px",
        borderColor,
        backgroundColor: bgColor,
      }}
    >
      <span
        data-testid="option-badge"
        className="flex items-center justify-center rounded-full text-white font-bold shrink-0"
        style={{
          width: "32px",
          height: "32px",
          fontSize: "14px",
          backgroundColor: badgeBg,
        }}
      >
        {badgeContent}
      </span>
      {emoji && (
        <span data-testid="option-emoji" style={{ fontSize: "20px" }} aria-hidden="true">
          {emoji}
        </span>
      )}
      <span
        data-testid="option-label"
        className="text-slate-text"
        style={{ fontSize: "18px", fontWeight: 400 }}
      >
        {label}
      </span>
    </button>
  );
}
