import React from "react";
import { cn } from "./utils";

export interface ChartReaderProps {
  type: "bar" | "pictograph";
  data: {
    label: string;
    value: number;
    emoji?: string;
  }[];
  title?: string;
  showValues?: boolean;
  interactive?: boolean;
  maxValue?: number;
  onSelect?: (label: string) => void;
  selectedLabel?: string;
  className?: string;
}

function computeMax(data: { value: number }[]): number {
  return Math.max(...data.map((d) => d.value), 0);
}

export const ChartReader: React.FC<ChartReaderProps> = ({
  type,
  data,
  title,
  showValues = false,
  interactive = false,
  maxValue,
  onSelect,
  selectedLabel,
  className,
}) => {
  if (data.length === 0) {
    return (
      <div
        role="img"
        aria-label={title ?? "No data to display"}
        className={cn("flex items-center justify-center min-h-[200px] text-slate-400", className)}
      >
        No data to display
      </div>
    );
  }

  const effectiveMax = maxValue ?? computeMax(data);

  const chartAriaLabel = title
    ? `Chart showing ${title}: ${data.map((d) => `${d.label} ${d.value}`).join(", ")}`
    : `Chart with ${data.length} items: ${data.map((d) => `${d.label} ${d.value}`).join(", ")}`;

  if (type === "bar") {
    return (
      <div
        role="img"
        aria-label={chartAriaLabel}
        className={cn("min-h-[200px] flex items-end justify-center gap-4 py-4", className)}
      >
        {data.map((item) => {
          const pct = effectiveMax > 0 ? (item.value / effectiveMax) * 100 : 0;
          const isSelected = selectedLabel === item.label;
          return (
            <div key={item.label} className="flex flex-col items-center gap-1">
              {showValues && (
                <span className="text-sm font-medium text-slate-600">{item.value}</span>
              )}
              <div
                data-bar
                role={interactive ? "button" : "presentation"}
                tabIndex={interactive ? 0 : undefined}
                aria-label={`${item.label}: ${item.value}`}
                aria-pressed={interactive ? isSelected : undefined}
                className={cn(
                  "w-12 rounded-t-sm transition-all duration-200",
                  interactive && "cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#76A5AF]",
                  isSelected ? "ring-2 ring-[#76A5AF]" : ""
                )}
                style={{
                  height: `${Math.max(pct, 1)}%`,
                  backgroundColor: "#5D87B1",
                  filter: interactive && !isSelected ? undefined : undefined,
                }}
                onMouseEnter={(e) => {
                  if (interactive) (e.currentTarget as HTMLElement).style.filter = "brightness(1.1)";
                }}
                onMouseLeave={(e) => {
                  if (interactive) (e.currentTarget as HTMLElement).style.filter = "";
                }}
                onClick={() => {
                  if (interactive && onSelect) onSelect(item.label);
                }}
                onKeyDown={(e) => {
                  if (interactive && onSelect && (e.key === "Enter" || e.key === " ")) {
                    e.preventDefault();
                    onSelect(item.label);
                  }
                }}
              />
              <span className="text-sm text-slate-600">{item.label}</span>
            </div>
          );
        })}

        <table className="sr-only">
          <caption>{title ?? "Chart data"}</caption>
          <thead>
            <tr>
              <th>Category</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr key={item.label}>
                <td>{item.label}</td>
                <td>{item.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div
      role="img"
      aria-label={chartAriaLabel}
      className={cn("min-h-[200px] flex flex-col gap-3 py-4", className)}
    >
      {data.map((item) => {
        const isSelected = selectedLabel === item.label;
        const emoji = item.emoji ?? "●";
        const repeatCount = Math.min(item.value, 20);
        return (
          <div
            key={item.label}
            role={interactive ? "button" : "presentation"}
            tabIndex={interactive ? 0 : undefined}
            aria-label={`${item.label}: ${item.value}`}
            aria-pressed={interactive ? isSelected : undefined}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200",
              interactive && "cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#76A5AF]",
              isSelected ? "ring-2 ring-[#76A5AF] bg-[#76A5AF]/10" : ""
            )}
            onClick={() => {
              if (interactive && onSelect) onSelect(item.label);
            }}
            onKeyDown={(e) => {
              if (interactive && onSelect && (e.key === "Enter" || e.key === " ")) {
                e.preventDefault();
                onSelect(item.label);
              }
            }}
          >
            <span className="text-sm font-medium text-slate-700 w-20 shrink-0">{item.label}</span>
            <span className="text-lg" aria-hidden="true">
              {Array.from({ length: repeatCount }, (_, i) => (
                <span key={i}>{emoji}</span>
              ))}
            </span>
            <span className="text-sm text-slate-500">({item.value})</span>
          </div>
        );
      })}

      <table className="sr-only">
        <caption>{title ?? "Chart data"}</caption>
        <thead>
          <tr>
            <th>Category</th>
            <th>Value</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={item.label}>
              <td>{item.label}</td>
              <td>{item.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
