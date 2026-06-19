import { useEffect, useRef, type ReactNode } from "react";
import { announcementId } from "./accessibility-utils";
import { cn } from "./utils";

export interface AccessibilityWrapperProps {
  children: ReactNode;
  /** aria-label for the wrapper region */
  ariaLabel?: string;
  /** If true, focus the wrapper element on mount (uses tabIndex={-1}) */
  onMountFocus?: boolean;
  className?: string;
}

/**
 * Wrapper component that adds an aria-live polite region for announcements
 * and optionally manages focus on mount.
 */
export function AccessibilityWrapper({
  children,
  ariaLabel,
  onMountFocus = false,
  className,
}: AccessibilityWrapperProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (onMountFocus && wrapperRef.current) {
      wrapperRef.current.focus();
    }
  }, [onMountFocus]);

  return (
    <div
      ref={wrapperRef}
      aria-label={ariaLabel}
      tabIndex={onMountFocus ? -1 : undefined}
      className={cn("focus:outline-none", className)}
    >
      {children}
      {/* Screen reader announcement region — visually hidden */}
      <div
        id={announcementId}
        aria-live="polite"
        aria-relevant="additions text"
        role="status"
        className="sr-only"
        style={{
          position: "absolute",
          width: "1px",
          height: "1px",
          padding: 0,
          margin: "-1px",
          overflow: "hidden",
          clip: "rect(0, 0, 0, 0)",
          whiteSpace: "nowrap",
          border: 0,
        }}
      />
    </div>
  );
}
