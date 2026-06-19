import { useState, useRef, useCallback, useEffect } from "react";

export function CalmTimer() {
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const formatTime = (totalSeconds: number): string => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const handleStart = useCallback(() => {
    if (isRunning) return;
    setIsRunning(true);
    intervalRef.current = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);
  }, [isRunning]);

  const handlePause = useCallback(() => {
    setIsRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const handleReset = useCallback(() => {
    setIsRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setSeconds(0);
  }, []);

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Timer display */}
      <div
        className="text-5xl font-bold text-slate-text tabular-nums"
        aria-live="polite"
        aria-label={`Timer: ${formatTime(seconds)}`}
      >
        {formatTime(seconds)}
      </div>

      {/* Controls */}
      <div className="flex gap-4">
        {!isRunning ? (
          <button
            onClick={handleStart}
            disabled={false}
            className="min-h-[56px] min-w-[120px] rounded-xl bg-muted-green px-8 py-4 text-base font-semibold text-white hover:bg-muted-green/90 focus:outline-none focus:ring-2 focus:ring-muted-green focus:ring-offset-2 transition-colors duration-200 disabled:opacity-50"
          >
            Start
          </button>
        ) : (
          <button
            onClick={handlePause}
            className="min-h-[56px] min-w-[120px] rounded-xl bg-soft-amber px-8 py-4 text-base font-semibold text-white hover:bg-soft-amber/90 focus:outline-none focus:ring-2 focus:ring-soft-amber focus:ring-offset-2 transition-colors duration-200"
          >
            Pause
          </button>
        )}

        <button
          onClick={handleReset}
          className="min-h-[56px] min-w-[120px] rounded-xl bg-outline-variant px-8 py-4 text-base font-semibold text-slate-text hover:bg-outline-variant/80 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:ring-offset-2 transition-colors duration-200"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
