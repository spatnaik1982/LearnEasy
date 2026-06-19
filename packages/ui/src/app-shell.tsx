import type { ReactNode } from "react";
import { StudentFooter } from "./student-footer";

export interface AppShellProps {
  children: ReactNode;
  variant?: "student" | "parent";
  /**
   * Override the default student footer.
   * - Pass a ReactNode to render custom footer content.
   * - Pass null to suppress the footer entirely (e.g. for Calm Zone, onboarding).
   * - Omit to render the default <StudentFooter />.
   */
  footer?: ReactNode | null;
  primaryNav?: ReactNode;
}

export function AppShell({
  children,
  variant = "student",
  footer,
  primaryNav,
}: AppShellProps) {
  // For student variant, default to <StudentFooter /> unless caller overrides or suppresses.
  // The `footer` prop is null when the caller wants no footer (e.g. Calm Zone).
  // If `footer` is undefined, we use the default.
  // If `footer` is a ReactNode, we use that custom footer.
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

      {/* Footer: used for student variant. Renders default StudentFooter unless overridden. */}
      {variant === "student" && resolvedFooter !== null && (
        <>{resolvedFooter}</>
      )}
    </div>
  );
}
