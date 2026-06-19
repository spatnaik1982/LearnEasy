import type { ReactNode } from "react";

export interface AppShellProps {
  children: ReactNode;
  variant?: "student" | "parent";
  footer?: ReactNode;
  primaryNav?: ReactNode;
}

export function AppShell({
  children,
  variant = "student",
  footer,
  primaryNav,
}: AppShellProps) {
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

      {/* Footer: used for student variant */}
      {variant === "student" && footer !== null && (
        <>
          {footer}
        </>
      )}
    </div>
  );
}
