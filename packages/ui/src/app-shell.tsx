import type { ReactNode } from "react";
import { StudentFooter } from "./student-footer";

export interface AppShellProps {
  children: ReactNode;
  variant?: "student" | "parent";
  /** Omit to render the default <StudentFooter /> for student variant.
   *  Pass null to suppress the footer entirely (e.g. Calm Zone, onboarding).
   *  Pass a ReactNode to render custom footer content. */
  footer?: ReactNode | null;
  primaryNav?: ReactNode;
}

export function AppShell({
  children,
  variant = "student",
  footer,
  primaryNav,
}: AppShellProps) {
  // Default to StudentFooter for student variant when caller omits footer entirely
  const resolvedFooter =
    variant === "student" && footer === undefined ? <StudentFooter /> : footer;

  return (
    <div className="min-h-screen bg-warm-off-white flex flex-col motion-safe:transition-colors">
      {/* Primary navigation: used for parent variant tabs */}
      {variant === "parent" && primaryNav && (
        <nav className="border-b border-outline-variant bg-white">
          <div className="mx-auto max-w-5xl px-4">{primaryNav}</div>
        </nav>
      )}

      {/* Main content area */}
      <main className="flex-1 mx-auto w-full max-w-content px-4 py-8">
        {children}
      </main>

      {/* Footer: auto-renders StudentFooter for student variant unless caller overrides or suppresses */}
      {variant === "student" && resolvedFooter !== null && (
        <>{resolvedFooter}</>
      )}
    </div>
  );
}
