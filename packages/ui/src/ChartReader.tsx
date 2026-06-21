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

const CHART_HEIGHT = 300;

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
        className={cn("flex items-center justify-center text-slate-400", className)}
        style={{ minHeight: CHART_HEIGHT }}
      >
        No data to display
      </div>
    );
  }

  const effectiveMax = maxValue ?? computeMax(data);

  const chartAriaLabel = title
    ? `Chart showing ${title}: ${data.map((d) => `${d.label} ${d.value}`).join(", ")}`
    : `Chart with ${data.length} items: ${data.map((d) => `${d.label} ${d.value}`).join(", ")}`;

  const gridlines = [25, 50, 75, 100].map((pct) => ({
    pct,
    value: Math.round((effectiveMax * pct) / 100),
  }));

  if (type === "bar") {
    return (
      <div
        role="img"
        aria-label={chartAriaLabel}
        className={cn("relative", className)}
        style={{ height: CHART_HEIGHT }}
      >
        <svg
          width="100%"
          height="100%"
          viewBox={`0 0 ${data.length * 80 + 60} ${CHART_HEIGHT}`}
          className="overflow-visible"
        >
          {gridlines.map((gl) => (
            <g key={gl.pct}>
              <line
                x1={50}
                y1={CHART_HEIGHT - (gl.pct / 100) * (CHART_HEIGHT - 40) - 10}
                x2={data.length * 80 + 50}
                y2={CHART_HEIGHT - (gl.pct / 100) * (CHART_HEIGHT - 40) - 10}
                stroke="#E5E7EB"
                strokeWidth={1}
              />
              <text
                x={45}
                y={CHART_HEIGHT - (gl.pct / 100) * (CHART_HEIGHT - 40) - 5}
                textAnchor="end"
                fontSize={14}
                fill="#6B7280"
              >
                {gl.value}
              </text>
            </g>
          ))}
          {data.map((item, idx) => {
            const pct = effectiveMax > 0 ? (item.value / effectiveMax) * 100 : 0;
            const isSelected = selectedLabel === item.label;
            const barHeight = Math.max((pct / 100) * (CHART_HEIGHT - 60), 2);
            const barX = 60 + idx * 80;
            const barWidth = 48;
            return (
              <g key={item.label}>
                <rect
                  x={barX}
                  y={CHART_HEIGHT - 30 - barHeight}
                  width={barWidth}
                  height={barHeight}
                  fill="#5D87B1"
                  rx={4}
                  style={{
                    transition: "height 300ms ease-out",
                    animation: "none",
                  }}
                  className={cn(
                    interactive && "cursor-pointer",
                    isSelected && "ring-2 ring-[#76A5AF]"
                  )}
                  role={interactive ? "button" : "presentation"}
                  tabIndex={interactive ? 0 : undefined}
                  aria-label={`${item.label}: ${item.value}`}
                  aria-pressed={interactive ? isSelected : undefined}
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
                {showValues && (
                  <text
                    x={barX + barWidth / 2}
                    y={CHART_HEIGHT - 40 - barHeight}
                    textAnchor="middle"
                    fontSize={14}
                    fill="#374151"
                  >
                    {item.value}
                  </text>
                )}
                <text
                  x={barX + barWidth / 2}
                  y={CHART_HEIGHT - 10}
                  textAnchor="middle"
                  fontSize={14}
                  fill="#6B7280"
                >
                  {item.label}
                </text>
              </g>
            );
          })}
        </svg>

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
      className={cn("flex flex-col gap-3 py-4", className)}
    >
      <div className="text-sm text-slate-500 mb-1">Each {data[0]?.emoji ?? "●"} = 1</div>
      {data.map((item) => {
        const isSelected = selectedLabel === item.label;
        const emoji = item.emoji ?? "●";
        const showAll = item.value <= 20;
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
              {!showAll && <span>...({item.value})</span>}
            </span>
            {showAll && (
              <span className="text-sm text-slate-500">({item.value})</span>
            )}
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
