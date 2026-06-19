import { useState, useCallback, useRef, useEffect } from "react";

export function CalmBreathing() {
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState<"inhale" | "exhale" | "idle">("idle");
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const handleStart = useCallback(() => {
    if (isActive) return;
    setIsActive(true);
    setPhase("inhale");

    // Cycle: 4s inhale → 4s exhale → 4s inhale → ...
    let isInhale = true;
    setPhase("inhale");

    timerRef.current = setInterval(() => {
      isInhale = !isInhale;
      setPhase(isInhale ? "inhale" : "exhale");
    }, 4000);
  }, [isActive]);

  const handleStop = useCallback(() => {
    setIsActive(false);
    setPhase("idle");
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Animated circle */}
      <div className="relative flex h-48 w-48 items-center justify-center">
        <div
          className={`h-40 w-40 rounded-full bg-soft-blue/20 transition-all duration-[4000ms] ease-in-out ${
            phase === "inhale"
              ? "scale-125 opacity-100"
              : phase === "exhale"
                ? "scale-100 opacity-60"
                : "scale-100 opacity-60"
          }`}
          aria-hidden="true"
        />
        <span
          className="absolute text-lg font-semibold text-slate-text"
          aria-live="polite"
        >
          {phase === "idle" && "Press start to begin"}
          {phase === "inhale" && "Breathe In"}
          {phase === "exhale" && "Breathe Out"}
        </span>
      </div>

      {/* Controls */}
      {!isActive ? (
        <button
          onClick={handleStart}
          className="min-h-[56px] min-w-[160px] rounded-xl bg-soft-blue px-8 py-4 text-base font-semibold text-white hover:bg-soft-blue/90 focus:outline-none focus:ring-2 focus:ring-soft-blue focus:ring-offset-2 transition-colors duration-200"
        >
          Start Breathing
        </button>
      ) : (
        <button
          onClick={handleStop}
          className="min-h-[56px] min-w-[160px] rounded-xl bg-soft-coral px-8 py-4 text-base font-semibold text-white hover:bg-soft-coral/90 focus:outline-none focus:ring-2 focus:ring-soft-coral focus:ring-offset-2 transition-colors duration-200"
        >
          Stop
        </button>
      )}

      {/* Instructions */}
      <p className="text-sm text-on-surface-variant text-center max-w-xs">
        {phase === "idle" &&
          "Follow the circle. Breathe in as it grows, breathe out as it shrinks."}
        {phase === "inhale" && "Slowly breathe in through your nose..."}
        {phase === "exhale" && "Gently breathe out through your mouth..."}
      </p>
    </div>
  );
}
