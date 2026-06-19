import React from "react";
import { BookOpen, FileEdit, HelpCircle, CheckCircle } from "lucide-react";

export interface LessonSidebarProps {
  currentStep: number;
  totalSteps: number;
  className?: string;
}

const NAV_ITEMS = [
  { label: "Learn", icon: BookOpen },
  { label: "Practice", icon: FileEdit },
  { label: "Quiz", icon: HelpCircle },
  { label: "Complete", icon: CheckCircle },
];

function getActiveIndex(currentStep: number, totalSteps: number): number {
  if (currentStep >= totalSteps - 1) return 3;
  if (currentStep === 0) return 0;
  if (currentStep === 1) return 1;
  return 2;
}

export const LessonSidebar: React.FC<LessonSidebarProps> = ({
  currentStep,
  totalSteps,
  className = "",
}) => {
  const activeIndex = getActiveIndex(currentStep, totalSteps);

  return (
    <aside
      className={`hidden md:flex flex-col py-8 px-4 gap-4 fixed left-0 top-0 h-full w-[256px] bg-surface-container-low shadow-sm z-30 pt-[96px] ${className}`}
    >
      <div className="mb-8 px-4">
        <h2 className="text-[24px] font-[500] text-primary leading-[1.5]">
          Lesson Progress
        </h2>
        <p className="text-on-surface-variant mt-1 text-sm">
          Step {Math.min(currentStep + 1, totalSteps)} of {totalSteps}
        </p>
      </div>

      <nav className="flex flex-col gap-2">
        {NAV_ITEMS.map((item, index) => {
          const isActive = index === activeIndex;
          const Icon = item.icon;

          return (
            <a
              key={item.label}
              href="#"
              onClick={(e) => e.preventDefault()}
              className={`flex items-center gap-3 p-3 rounded-lg transition-colors duration-200 ${
                isActive
                  ? "bg-secondary-container text-on-secondary-container font-bold"
                  : "text-on-surface-variant hover:bg-surface-variant"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-sm font-semibold tracking-wider uppercase">
                {item.label}
              </span>
            </a>
          );
        })}
      </nav>
    </aside>
  );
};
