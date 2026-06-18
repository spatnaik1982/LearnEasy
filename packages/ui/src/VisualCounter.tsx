import { cn } from "./utils";

export interface VisualCounterProps {
  count: number;
  emoji: string;
  size?: "sm" | "md" | "lg";
  className?: string;
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
  className,
}: VisualCounterProps) {
  const config = sizeConfig[size];
  const items = Array.from({ length: count }, (_, i) => i);

  return (
    <div
      className={cn("flex flex-col items-center", className)}
      role="img"
      aria-label={`${count} items shown`}
    >
      <div className={cn("grid place-items-center", config.cols, config.gap)}>
        {items.map((i) => (
          <span key={i} className={config.emoji} aria-hidden="true">
            {emoji}
          </span>
        ))}
      </div>
      <span className="mt-3 text-lg font-semibold text-slate-700">
        {count}
      </span>
    </div>
  );
}