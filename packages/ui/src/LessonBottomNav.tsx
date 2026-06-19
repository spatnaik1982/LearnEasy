import React from "react";
import { Volume2, VolumeX, RotateCcw, Play } from "lucide-react";

export interface LessonBottomNavProps {
  onContinue: () => void;
  onMute: () => void;
  onReplay: () => void;
  isMuted: boolean;
  className?: string;
}

export const LessonBottomNav: React.FC<LessonBottomNavProps> = ({
  onContinue,
  onMute,
  onReplay,
  isMuted,
  className = "",
}) => {
  const iconButtonClasses =
    "flex flex-col items-center justify-center min-h-[56px] min-w-[56px] focus:outline-none focus:ring-2 focus:ring-soft-blue rounded-lg transition-colors";

  return (
    <nav
      className={`md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 py-4 h-24 bg-warm-off-white rounded-t-xl border-t-2 border-outline-variant shadow-md ${className}`}
    >
      {/* Mute button */}
      <button onClick={onMute} className={iconButtonClasses} aria-label="Mute">
        {isMuted ? (
          <VolumeX className="w-6 h-6 text-slate-600" />
        ) : (
          <Volume2 className="w-6 h-6 text-slate-600" />
        )}
        <span className="text-xs text-slate-600 mt-1">Mute</span>
      </button>

      {/* Volume button (always visible) */}
      <button
        onClick={onMute}
        className={iconButtonClasses}
        aria-label="Volume"
      >
        <Volume2 className="w-6 h-6 text-slate-600" />
        <span className="text-xs text-slate-600 mt-1">Volume</span>
      </button>

      {/* Replay button */}
      <button
        onClick={onReplay}
        className={iconButtonClasses}
        aria-label="Replay"
      >
        <RotateCcw className="w-6 h-6 text-slate-600" />
        <span className="text-xs text-slate-600 mt-1">Replay</span>
      </button>

      {/* Continue button */}
      <button
        onClick={onContinue}
        className="flex flex-col items-center justify-center min-h-[56px] min-w-[56px] focus:outline-none focus:ring-2 focus:ring-soft-blue rounded-full transition-colors"
        aria-label="Continue"
      >
        <span className="bg-soft-blue text-white rounded-full px-6 py-2 flex items-center gap-2 text-sm font-semibold">
          <Play className="w-4 h-4 fill-white" />
          Continue
        </span>
      </button>
    </nav>
  );
};
