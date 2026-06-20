import { cn } from "./utils";
import { useCallback, useEffect, useRef, useState } from "react";

export interface ClockWidgetProps {
  hour?: number;
  minute?: number;
  interactive?: boolean;
  mode?: "read" | "set";
  showDigital?: boolean;
  targetTime?: { hour: number; minute: number };
  onTimeChange?: (hour: number, minute: number) => void;
  size?: number;
  className?: string;
}

export function ClockWidget({
  hour = 12,
  minute = 0,
  interactive = false,
  mode = "set",
  showDigital = false,
  onTimeChange,
  size = 250,
  className,
}: ClockWidgetProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [dragHand, setDragHand] = useState<"hour" | "minute" | null>(null);

  const radius = size / 2;
  const center = size / 2;

  const hourAngle = ((hour % 12) / 12) * 360 + (minute / 60) * 30;
  const minuteAngle = (minute / 60) * 360;

  const getAngleFromEvent = useCallback(
    (clientX: number, clientY: number) => {
      const svg = svgRef.current;
      if (!svg) return 0;
      const rect = svg.getBoundingClientRect();
      const x = clientX - rect.left - center;
      const y = clientY - rect.top - center;
      const angle = Math.atan2(y, x) * (180 / Math.PI) + 90;
      return ((angle % 360) + 360) % 360;
    },
    [center]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!dragHand) return;
      const angle = getAngleFromEvent(e.clientX, e.clientY);
      if (dragHand === "hour") {
        const h = Math.round(angle / 30);
        onTimeChange?.(h === 0 ? 12 : h, minute);
      } else {
        const rawMinute = Math.round(angle / 6);
        const snappedMinute = Math.round(rawMinute / 5) * 5;
        onTimeChange?.(hour, snappedMinute === 60 ? 0 : snappedMinute);
      }
    },
    [dragHand, getAngleFromEvent, hour, minute, onTimeChange]
  );

  const handleMouseUp = useCallback(() => {
    setDragHand(null);
  }, []);

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!dragHand) return;
      e.preventDefault();
      const touch = e.touches[0];
      const angle = getAngleFromEvent(touch.clientX, touch.clientY);
      if (dragHand === "hour") {
        const h = Math.round(angle / 30);
        onTimeChange?.(h === 0 ? 12 : h, minute);
      } else {
        const rawMinute = Math.round(angle / 6);
        const snappedMinute = Math.round(rawMinute / 5) * 5;
        onTimeChange?.(hour, snappedMinute === 60 ? 0 : snappedMinute);
      }
    },
    [dragHand, getAngleFromEvent, hour, minute, onTimeChange]
  );

  const handleTouchEnd = useCallback(() => {
    setDragHand(null);
  }, []);

  useEffect(() => {
    if (!dragHand) return;
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("touchmove", handleTouchMove, { passive: false });
    window.addEventListener("touchend", handleTouchEnd);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [dragHand, handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd]);

  const startDrag =
    (hand: "hour" | "minute") => (e: React.MouseEvent | React.TouchEvent) => {
      if (!interactive) return;
      e.preventDefault();
      setDragHand(hand);
    };

  const numbers = Array.from({ length: 12 }, (_, i) => {
    const hourNum = i + 1;
    const angle = ((hourNum % 12) / 12) * 360 - 90;
    const rad = (angle * Math.PI) / 180;
    const numR = 0.82 * radius;
    return {
      num: hourNum,
      x: center + numR * Math.cos(rad),
      y: center + numR * Math.sin(rad),
    };
  });

  const canInteract = interactive && mode === "set";

  return (
    <div className={cn("flex flex-col items-center", className)}>
      <svg
        ref={svgRef}
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        role="img"
        aria-label={`Clock showing ${hour}:${String(minute).padStart(2, "0")}`}
      >
        <circle
          cx={center}
          cy={center}
          r={radius - 1}
          fill="white"
          stroke="#374151"
          strokeWidth={1}
        />
        {Array.from({ length: 60 }, (_, i) => {
          const angle = (i / 60) * 360;
          const isLarge = i % 5 === 0;
          const innerR = isLarge ? 0.85 * radius : 0.88 * radius;
          const outerR = 0.93 * radius;
          return (
            <line
              key={i}
              x1={center}
              y1={center - outerR}
              x2={center}
              y2={center - innerR}
              stroke="#374151"
              strokeWidth={isLarge ? 2 : 1}
              transform={`rotate(${angle}, ${center}, ${center})`}
            />
          );
        })}
        {numbers.map(({ num, x, y }) => (
          <text
            key={num}
            x={x}
            y={y}
            textAnchor="middle"
            dominantBaseline="central"
            fontFamily="Inter, sans-serif"
            fontSize={18}
            fill="#374151"
          >
            {num}
          </text>
        ))}
        <g
          style={{
            transform: `rotate(${hourAngle}deg)`,
            transformOrigin: `${center}px ${center}px`,
            cursor: canInteract ? "grab" : "default",
          }}
          onMouseDown={startDrag("hour")}
          onTouchStart={startDrag("hour")}
        >
          <rect
            x={center - 2}
            y={center - radius * 0.4}
            width={4}
            height={radius * 0.4}
            rx={2}
            fill="#374151"
          />
        </g>
        <g
          style={{
            transform: `rotate(${minuteAngle}deg)`,
            transformOrigin: `${center}px ${center}px`,
            cursor: canInteract ? "grab" : "default",
          }}
          onMouseDown={startDrag("minute")}
          onTouchStart={startDrag("minute")}
        >
          <rect
            x={center - 1}
            y={center - radius * 0.6}
            width={2}
            height={radius * 0.6}
            rx={1}
            fill="#374151"
          />
        </g>
        <circle cx={center} cy={center} r={4} fill="#374151" />
      </svg>
      {showDigital && (
        <span className="mt-2 text-lg font-semibold text-slate-text">
          {hour}:{String(minute).padStart(2, "0")}
        </span>
      )}
      {canInteract && (
        <div className="flex gap-4 mt-4">
          <label className="flex flex-col items-center text-slate-text text-sm">
            Hour
            <input
              type="range"
              min={1}
              max={12}
              step={1}
              value={hour}
              onChange={(e) =>
                onTimeChange?.(Number(e.target.value), minute)
              }
              className="w-24"
            />
          </label>
          <label className="flex flex-col items-center text-slate-text text-sm">
            Minute
            <input
              type="range"
              min={0}
              max={59}
              step={5}
              value={minute}
              onChange={(e) =>
                onTimeChange?.(hour, Number(e.target.value))
              }
              className="w-24"
            />
          </label>
        </div>
      )}
    </div>
  );
}
