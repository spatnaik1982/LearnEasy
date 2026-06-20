import { useCallback, useMemo } from "react";
import { cn } from "./utils";

export interface ScaleReaderProps {
  type: "ruler" | "thermometer" | "cylinder";
  min: number;
  max: number;
  step: number;
  unit: string;
  value?: number;
  interactive?: boolean;
  targetValue?: number;
  onValueChange?: (value: number) => void;
  showReading?: boolean;
  showLabels?: boolean;
  height?: number;
  width?: number;
  className?: string;
}

function clampAndSnap(v: number, min: number, max: number, step: number) {
  const clamped = Math.max(min, Math.min(max, v));
  return Math.round(clamped / step) * step;
}

export function ScaleReader({
  type,
  min,
  max,
  step,
  unit,
  value,
  interactive = false,
  targetValue,
  onValueChange,
  showReading = false,
  showLabels = true,
  height,
  width,
  className,
}: ScaleReaderProps) {
  if (min >= max) {
    return (
      <div
        className={cn("flex items-center justify-center p-4 text-red-500", className)}
        role="alert"
      >
        Invalid scale range
      </div>
    );
  }

  const safeValue = value != null ? clampAndSnap(value, min, max, step) : min;
  const ratio = (safeValue - min) / (max - min);
  const reading = `${safeValue} ${unit}`;
  const ariaLabel = `${type} scale from ${min} to ${max} ${unit}${value != null ? `. Reading: ${reading}` : ""}`;

  const handleSliderChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newVal = parseFloat(e.target.value);
      onValueChange?.(clampAndSnap(newVal, min, max, step));
    },
    [min, max, step, onValueChange]
  );

  const majorMarks = useMemo(() => {
    const marks: { value: number; pos: number }[] = [];
    const span = max - min;
    for (let v = min; v <= max + step / 2; v += step) {
      const clamped = Math.min(v, max);
      marks.push({ value: clamped, pos: (clamped - min) / span });
    }
    return marks;
  }, [min, max, step]);

  const minorMarks = useMemo(() => {
    const marks: { pos: number }[] = [];
    const span = max - min;
    const subStep = step / 5;
    for (let v = min; v <= max - step / 2; v += step) {
      for (let j = 1; j < 5; j++) {
        const mv = v + j * subStep;
        if (mv >= max) break;
        marks.push({ pos: (mv - min) / span });
      }
    }
    return marks;
  }, [min, max, step]);

  const slider = interactive ? (
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={safeValue}
      onChange={handleSliderChange}
      role="slider"
      aria-label={`${type} slider`}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={safeValue}
      className="mt-1 w-full"
    />
  ) : null;

  const readingDisplay = showReading ? (
    <div className="text-center text-lg font-semibold text-slate-text mt-1" aria-live="polite">
      {reading}
    </div>
  ) : null;

  if (type === "ruler") {
    const w = width ?? 300;
    const h = height ?? 60;
    const pad = 20;
    const drawableW = w - 2 * pad;

    return (
      <div className={cn("flex flex-col", className)}>
        <svg
          width={w}
          height={h}
          viewBox={`0 0 ${w} ${h}`}
          role="img"
          aria-label={ariaLabel}
        >
          <rect width={w} height={h} fill="white" stroke="#374151" strokeWidth={1} rx={4} />
          {minorMarks.map((m, i) => (
            <line
              key={`minor-${i}`}
              x1={pad + m.pos * drawableW}
              y1={0}
              x2={pad + m.pos * drawableW}
              y2={h - 20}
              stroke="#374151"
              strokeWidth={0.75}
            />
          ))}
          {majorMarks.map((m) => {
            const x = pad + m.pos * drawableW;
            return (
              <g key={`major-${m.value}`}>
                <line x1={x} y1={0} x2={x} y2={h - 10} stroke="#374151" strokeWidth={1.5} />
                {showLabels && (
                  <text x={x} y={h - 2} textAnchor="middle" fontSize={9} fill="#374151">
                    {m.value}
                  </text>
                )}
              </g>
            );
          })}
          {value != null && (
            <g>
              <line
                x1={pad + ratio * drawableW}
                y1={0}
                x2={pad + ratio * drawableW}
                y2={h}
                stroke="#E5989B"
                strokeWidth={2}
              />
              <polygon
                points={`${pad + ratio * drawableW - 5},0 ${pad + ratio * drawableW + 5},0 ${pad + ratio * drawableW},5`}
                fill="#E5989B"
              />
            </g>
          )}
          {targetValue != null && (
            <line
              x1={pad + ((targetValue - min) / (max - min)) * drawableW}
              y1={0}
              x2={pad + ((targetValue - min) / (max - min)) * drawableW}
              y2={h}
              stroke="#76A5AF"
              strokeWidth={2}
              strokeDasharray="4 2"
            />
          )}
        </svg>
        {slider}
        {readingDisplay}
      </div>
    );
  }

  const svgH = height ?? 250;
  const isThermometer = type === "thermometer";
  const columnWidth = isThermometer ? 12 : (width ?? 30);
  const centerX = isThermometer ? (width ?? 40) / 2 : 25 + columnWidth / 2;
  const columnColor = isThermometer ? "#E5989B" : "#5D87B1";
  const svgWidth = isThermometer ? (width ?? 40) + 30 : 25 + (width ?? 30) + 20;

  const pad = 5;
  const bulbRadius = isThermometer ? 10 : 0;
  const bulbCenterY = svgH - pad - bulbRadius;
  const columnBottom = isThermometer ? bulbCenterY - bulbRadius : svgH - pad;
  const columnTop = pad;
  const columnH = columnBottom - columnTop;

  const containerLeft = isThermometer ? centerX - columnWidth / 2 : 25;
  const scaleX = isThermometer ? 2 : 2;

  return (
    <div className={cn("flex flex-col items-center", className)}>
      <svg
        width={svgWidth}
        height={svgH}
        viewBox={`0 0 ${svgWidth} ${svgH}`}
        role="img"
        aria-label={ariaLabel}
      >
        {majorMarks.map((m) => {
          const y = columnBottom - m.pos * columnH;
          return (
            <g key={`major-${m.value}`}>
              <line x1={scaleX} y1={y} x2={scaleX + 10} y2={y} stroke="#374151" strokeWidth={1} />
              {showLabels && (
                <text x={scaleX + 12} y={y + 3} fontSize={8} fill="#374151">
                  {m.value}
                </text>
              )}
            </g>
          );
        })}
        {!isThermometer && (
          <rect
            x={containerLeft}
            y={columnTop}
            width={columnWidth}
            height={columnH}
            fill="none"
            stroke="#374151"
            strokeWidth={1.5}
            rx={2}
          />
        )}
        {value != null && (
          <rect
            x={containerLeft}
            y={columnBottom - ratio * columnH}
            width={columnWidth}
            height={ratio * columnH}
            fill={columnColor}
            opacity={0.8}
            rx={2}
          />
        )}
        {isThermometer && (
          <circle cx={centerX} cy={bulbCenterY} r={bulbRadius} fill="#E5989B" />
        )}
        {targetValue != null && (
          <line
            x1={containerLeft + columnWidth + 2}
            y1={columnBottom - ((targetValue - min) / (max - min)) * columnH}
            x2={containerLeft + columnWidth + 10}
            y2={columnBottom - ((targetValue - min) / (max - min)) * columnH}
            stroke="#76A5AF"
            strokeWidth={2}
          />
        )}
      </svg>
      {readingDisplay}
    </div>
  );
}
