import { cn } from "../utils";
import { VisualCounter } from "../VisualCounter";
import type { ActivityAdapter } from "./adapter-interface";

export const visualCountingAdapter: ActivityAdapter = {
  types: ["visual_counter", "visual_counting"],

  getInitialState() {
    return {};
  },

  render({ content, isObserveStep, onResponse, userResponse }) {
    const left = content.left;
    const right = content.right;
    const isAddition = Array.isArray(left) || Array.isArray(right) || typeof left === "number" || typeof right === "number";
    const additionSum = (content.sum as number | undefined)
      ?? (Array.isArray(left) ? left.length : 0) + (Array.isArray(right) ? right.length : 0);
    const count = isAddition ? additionSum : ((content.count as number) ?? 0);
    const emoji = (content.emoji as string) ?? (content.items as string[])?.[0] ?? "🔢";
    const size = (content.size as "sm" | "md" | "lg") ?? "md";

    if (isAddition && isObserveStep) {
      const leftItems = Array.isArray(left) ? (left as string[]) : [];
      const rightItems = Array.isArray(right) ? (right as string[]) : [];
      const leftEmoji = leftItems[0] ?? (Array.isArray(right) ? right[0] : undefined) ?? "🔢";
      const rightEmoji = rightItems[0] ?? leftEmoji;
      return (
        <div className="flex flex-col items-center gap-4 sm:gap-6">
          <div className="flex items-center justify-center gap-4">
            <VisualCounter count={leftItems.length} emoji={leftEmoji} size={size} showCount />
            <span className="text-3xl font-bold text-slate-text">+</span>
            <VisualCounter count={rightItems.length} emoji={rightEmoji} size={size} showCount />
            <span className="text-3xl font-bold text-slate-text">=</span>
            <span className="text-3xl font-bold text-slate-text">{additionSum}</span>
          </div>
        </div>
      );
    }

    if (isAddition) {
      const leftItems = Array.isArray(left) ? (left as string[]) : [];
      const rightItems = Array.isArray(right) ? (right as string[]) : [];
      const leftEmoji = leftItems[0] ?? (Array.isArray(right) ? right[0] : undefined) ?? "🔢";
      const rightEmoji = rightItems[0] ?? leftEmoji;
      return (
        <div className="flex flex-col items-center gap-4 sm:gap-6">
          <div className="flex items-center justify-center gap-4">
            <VisualCounter count={leftItems.length} emoji={leftEmoji} size={size} showCount={false} />
            <span className="text-3xl font-bold text-slate-text">+</span>
            <VisualCounter count={rightItems.length} emoji={rightEmoji} size={size} showCount={false} />
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {Array.from({ length: Math.max(10, Math.min(additionSum + 2, 20)) }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                onClick={() => onResponse({ count: n })}
                className={cn(
                  "flex h-14 w-14 items-center justify-center rounded-xl border-2 text-lg font-bold motion-safe:transition-colors motion-safe:duration-150",
                  userResponse?.count === n
                    ? "border-soft-blue bg-soft-blue/10 text-soft-blue"
                    : "border-slate-300 bg-white text-slate-text hover:border-soft-blue focus:outline-none focus:ring-2 focus:ring-soft-blue"
                )}
                aria-label={`Select ${n}`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
      );
    }

    if (isObserveStep) {
      return (
        <div className="flex flex-col items-center gap-4">
          <VisualCounter count={count} emoji={emoji} size={size} showCount />
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center gap-4 sm:gap-6">
        <VisualCounter count={count} emoji={emoji} size={size} showCount={false} />
        <div className="flex flex-wrap justify-center gap-3">
          {Array.from({ length: Math.max(10, Math.min(count + 2, 20)) }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              onClick={() => onResponse({ count: n })}
              className={cn(
                "flex h-14 w-14 items-center justify-center rounded-xl border-2 text-lg font-bold motion-safe:transition-colors motion-safe:duration-150",
                userResponse?.count === n
                  ? "border-soft-blue bg-soft-blue/10 text-soft-blue"
                  : "border-slate-300 bg-white text-slate-text hover:border-soft-blue focus:outline-none focus:ring-2 focus:ring-soft-blue"
              )}
              aria-label={`Select ${n}`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>
    );
  },
};
