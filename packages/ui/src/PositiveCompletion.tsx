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
      <h2 className="mt-6 text-2xl font-bold text-slate-800 text-center">
        {message}
      </h2>
      {onContinue && (
        <button
          onClick={onContinue}
          className={cn(
            "mt-8 min-h-[44px] rounded-lg bg-blue-600 px-8 py-3 text-base font-semibold text-white",
            "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
            "hover:bg-blue-700",
          )}
        >
          Continue
        </button>
      )}
    </div>
  );
}