type MasteryState = "not-started" | "in-progress" | "mastered";

interface MasteryChipProps {
  state: MasteryState;
  size?: "sm" | "md";
}

const SIZE_MAP: Record<string, string> = {
  sm: "h-5 w-5",
  md: "h-6 w-6",
};

const STATE_COLORS: Record<MasteryState, string> = {
  "not-started": "bg-soft-blue/20 text-soft-blue",
  "in-progress": "bg-soft-amber/20 text-soft-amber",
  mastered: "bg-muted-green/20 text-muted-green",
};

const STATE_LABELS: Record<MasteryState, string> = {
  "not-started": "Not started",
  "in-progress": "In progress",
  mastered: "Mastered",
};

function MasteryChip({ state, size = "md" }: MasteryChipProps): JSX.Element {
  return (
    <span
      className={`inline-flex items-center justify-center rounded-full ${SIZE_MAP[size]} ${STATE_COLORS[state]}`}
      aria-label={STATE_LABELS[state]}
    >
      {state === "mastered" && (
        <svg
          className="h-3 w-3"
          viewBox="0 0 16 16"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z" />
        </svg>
      )}
      {state === "in-progress" && (
        <span className="block h-2 w-2 rounded-full bg-current" />
      )}
      {state === "not-started" && (
        <span className="block h-2 w-2 rounded-sm border border-current" />
      )}
    </span>
  );
}

export { MasteryChip };
export type { MasteryChipProps, MasteryState };
