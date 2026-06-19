import React from "react";
import { ArrowLeft, Home } from "lucide-react";

export interface LessonTopBarProps {
  subjectName: string;
  onBack: () => void;
  onHome: () => void;
}

export const LessonTopBar: React.FC<LessonTopBarProps> = ({
  subjectName,
  onBack,
  onHome,
}) => {
  const buttonClasses =
    "hover:bg-surface-container-low p-2 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-soft-blue";

  return (
    <header className="fixed top-0 w-full bg-warm-off-white border-b border-outline-variant flex justify-between items-center px-margin-mobile h-touch-target-min z-40 md:px-margin-desktop">
      <div className="flex items-center gap-2">
        <button
          onClick={onBack}
          className={buttonClasses}
          aria-label="Go back"
        >
          <ArrowLeft className="w-6 h-6 text-soft-blue" />
        </button>
        <h1 className="text-headline-md-mobile md:text-headline-md text-soft-blue font-semibold">
          {subjectName}
        </h1>
      </div>
      <button
        onClick={onHome}
        className={buttonClasses}
        aria-label="Go to home"
      >
        <Home className="w-6 h-6 text-soft-blue" />
      </button>
    </header>
  );
};
