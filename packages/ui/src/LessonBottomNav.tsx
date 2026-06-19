import React from "react";
import { Volume2, VolumeX, RotateCcw, ArrowRight } from "lucide-react";

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
  return (
    <nav
      className={`md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 py-4 h-24 bg-surface rounded-t-xl border-t-2 border-surface-container-high shadow-md ${className}`}
    >
      {/* Mute button */}
      <button
        onClick={onMute}
        className="flex flex-col items-center justify-center text-secondary p-2 active:scale-90 transition-all duration-150 hover:bg-secondary-fixed-dim rounded-lg min-h-[56px] min-w-[56px] focus:outline-none focus:ring-2 focus:ring-soft-blue"
        aria-label={isMuted ? "Unmute" : "Mute"}
      >
        {isMuted ? (
          <VolumeX className="w-6 h-6" />
        ) : (
          <Volume2 className="w-6 h-6" />
        )}
        <span className="text-xs font-semibold mt-1">{isMuted ? "Unmute" : "Mute"}</span>
      </button>

      {/* Volume button */}
      <button
        onClick={onMute}
        className="flex flex-col items-center justify-center bg-primary-container text-on-primary-container rounded-full px-6 py-2 active:scale-90 transition-all duration-150 min-h-[56px] focus:outline-none focus:ring-2 focus:ring-soft-blue"
        aria-label="Volume"
      >
        <Volume2 className="w-6 h-6" />
        <span className="text-xs font-semibold mt-1">Volume</span>
      </button>

      {/* Replay button */}
      <button
        onClick={onReplay}
        className="flex flex-col items-center justify-center text-secondary p-2 active:scale-90 transition-all duration-150 hover:bg-secondary-fixed-dim rounded-lg min-h-[56px] min-w-[56px] focus:outline-none focus:ring-2 focus:ring-soft-blue"
        aria-label="Replay"
      >
        <RotateCcw className="w-6 h-6" />
        <span className="text-xs font-semibold mt-1">Replay</span>
      </button>

      {/* Continue button */}
      <button
        onClick={onContinue}
        className="flex flex-col items-center justify-center text-secondary p-2 active:scale-90 transition-all duration-150 hover:bg-secondary-fixed-dim rounded-lg min-h-[56px] min-w-[56px] focus:outline-none focus:ring-2 focus:ring-soft-blue"
        aria-label="Continue"
      >
        <ArrowRight className="w-6 h-6" />
        <span className="text-xs font-semibold mt-1">Continue</span>
      </button>
    </nav>
  );
};
