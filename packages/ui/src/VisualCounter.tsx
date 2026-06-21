import { cn } from "./utils";

export interface VisualCounterProps {
  count: number;
  emoji: string;
  size?: "sm" | "md" | "lg";
  showCount?: boolean;
  interactive?: boolean;
  selectedNumber?: number | null;
  onNumberSelect?: (n: number) => void;
  showResult?: boolean;
}

const sizeConfig = {
  sm: { emoji: "text-xl", gap: "gap-1", cols: "grid-cols-4" },
  md: { emoji: "text-3xl", gap: "gap-2", cols: "grid-cols-5" },
  lg: { emoji: "text-5xl", gap: "gap-3", cols: "grid-cols-6" },
} as const;

export function VisualCounter({
  count,
  emoji,
  size = "md",
  showCount = false,
  interactive = false,
  selectedNumber = null,
  onNumberSelect,
  showResult = false,
}: VisualCounterProps) {
  const config = sizeConfig[size];
  const items = Array.from({ length: count }, (_, i) => i);

  const minButton = Math.max(1, count - 3);
  const maxButton = count + 3;
  const numberOptions = Array.from({ length: maxButton - minButton + 1 }, (_, i) => minButton + i);

  return (
    <div className={cn("flex flex-col items-center gap-4")} role="img" aria-label={showCount ? `${count} items shown` : "Items to count"}>
      <div className={cn("grid place-items-center", config.cols, config.gap)}>
        {items.map((i) => (
          <span
            key={i}
            className={cn(
              config.emoji,
              i > 0 && i % 5 === 0 && "border-l-2 border-dashed border-gray-300 pl-2"
            )}
            aria-hidden="true"
          >
            {emoji}
          </span>
        ))}
      </div>
      {showCount && (
        <span className="mt-3 text-lg font-semibold text-slate-text text-left">
          There are <strong>{count}</strong> items
        </span>
      )}
      {interactive && (
        <div role="radiogroup" aria-label="Select the number of items" className="flex flex-wrap gap-2 justify-center">
          {numberOptions.map((n) => {
            let btnStyle = "border-soft-blue bg-white";
            if (selectedNumber === n && showResult) {
              btnStyle = count === n ? "bg-[#8FB996] border-[#8FB996] text-white" : "bg-[#E5989B] border-[#E5989B] text-white";
            } else if (selectedNumber === n) {
              btnStyle = "bg-[#5D87B1] border-[#5D87B1] text-white";
            }
            return (
              <button
                key={n}
                type="button"
                role="radio"
                aria-checked={selectedNumber === n}
                aria-label={`${n} items`}
                className={cn(
                  "flex items-center justify-center rounded-lg border-2 text-xl font-bold transition-colors duration-150",
                  btnStyle
                )}
                style={{ width: "56px", height: "56px" }}
                onClick={() => onNumberSelect?.(n)}
              >
                {n}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
