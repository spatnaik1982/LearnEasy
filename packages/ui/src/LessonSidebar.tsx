import React from "react";
import { Check } from "lucide-react";

export interface LessonSidebarProps {
  steps: string[];
  currentStep: number;
  completedSteps: number[];
  className?: string;
}

export const LessonSidebar: React.FC<LessonSidebarProps> = ({
  steps,
  currentStep,
  completedSteps,
  className = "",
}) => {
  return (
    <aside
      className={`hidden md:flex flex-col py-8 px-4 gap-4 fixed left-0 top-0 h-full w-64 bg-surface-container-low shadow-sm z-30 pt-24 ${className}`}
    >
      <h2 className="text-lg font-semibold text-slate-800">Lesson Progress</h2>
      <p className="text-sm text-slate-500">
        Step {currentStep + 1} of {steps.length}
      </p>

      <nav className="flex flex-col gap-0 mt-2">
        {steps.map((step, index) => {
          const isCurrent = index === currentStep;
          const isCompleted = completedSteps.includes(index);
          const isFuture = !isCurrent && !isCompleted;

          let circleClasses =
            "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium shrink-0";
          let labelClasses = "text-sm font-medium ml-3";

          if (isCurrent) {
            circleClasses += " bg-soft-blue text-white";
            labelClasses += " text-soft-blue font-bold";
          } else if (isCompleted) {
            circleClasses += " bg-muted-green text-white";
            labelClasses += " text-muted-green";
          } else {
            circleClasses += " border-2 border-slate-300 text-transparent";
            labelClasses += " text-slate-400";
          }

          return (
            <div key={index}>
              <div className="flex items-center py-3">
                <div className={circleClasses}>
                  {isCompleted ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>
                <span className={labelClasses}>{step}</span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`h-6 w-0.5 ml-4 ${
                    isCompleted ? "bg-muted-green" : "bg-slate-200"
                  }`}
                />
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
};
