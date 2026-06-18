import { cn } from "./utils";

export interface PositiveCompletionProps {
  message: string;
  emoji?: string;
  onContinue?: () => void;
  className?: string;
}

export function PositiveCompletion({
  message,
  emoji = "🌟",
  onContinue,
  className,
}: PositiveCompletionProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-12",
        className,
      )}
      role="status"
      aria-label={message}
    >
      <span className="text-6xl" aria-hidden="true">
        {emoji}
      </span>
      <h2 className="mt-6 text-2xl font-bold text-slate-text text-center">
        {message}
      </h2>
      {onContinue && (
        <button
          onClick={onContinue}
          className={cn(
            "mt-8 min-h-[56px] rounded-lg bg-soft-blue px-8 py-3 text-base font-semibold text-white",
            "focus:outline-none focus:ring-2 focus:ring-soft-blue focus:ring-offset-2",
            "hover:bg-primary transition-opacity duration-200",
          )}
        >
          Continue Lesson
        </button>
      )}
    </div>
  );
}