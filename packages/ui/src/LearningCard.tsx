import React from "react";

export interface LearningCardProps {
  children: React.ReactNode;
  className?: string;
}

export const LearningCard: React.FC<LearningCardProps> = ({
  children,
  className = "",
}) => {
  return (
    <div
      className={`bg-white rounded-xl shadow-[0_4px_24px_rgba(93,135,177,0.08)] p-gutter w-full max-w-3xl flex flex-col items-center ${className}`}
    >
      {children}
    </div>
  );
};
