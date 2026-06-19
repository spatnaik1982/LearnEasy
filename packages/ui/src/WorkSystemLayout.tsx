import { cn } from "./utils";
import { COPY } from "./copy";

export interface WorkSystemLayoutProps {
  stepName: string;
  conceptTitle: string;
  currentStep: number;
  totalSteps: number;
  nextStep: string;
  children: React.ReactNode;
  className?: string;
}

export function WorkSystemLayout({
  stepName,
  conceptTitle,
  currentStep,
  totalSteps,
  nextStep,
  children,
  className,
}: WorkSystemLayoutProps) {
  const isLastStep = currentStep >= totalSteps - 1;
  const isComplete = currentStep >= totalSteps;

  return (
    <div className={cn("flex flex-col", className)}>
      {/* Header: Concept Title */}
      <header className="mb-6">
        <h1
          className="text-2xl font-bold text-slate-text"
          id="concept-title"
        >
          {conceptTitle}
        </h1>
      </header>

      {/* What am I doing? */}
      <section
        className="mb-4"
        aria-labelledby="what-doing-label"
      >
        <h2
          id="what-doing-label"
          className="text-sm font-semibold uppercase tracking-wide text-slate-text"
        >
          {COPY.whatAmIDoing}
        </h2>
        <p className="mt-1 text-lg font-medium text-slate-text">
          {stepName}
        </p>
      </section>

      {/* Step X of Y — How much work? */}
      <section
        className="mb-4"
        aria-labelledby="work-progress-label"
      >
        <h2
          id="work-progress-label"
          className="text-sm font-semibold uppercase tracking-wide text-slate-text"
        >
          {COPY.howMuchWork}
        </h2>
        <p
          className="mt-1 text-base font-medium text-muted-teal"
          aria-live="polite"
        >
          Step {isComplete ? totalSteps : currentStep + 1} of {totalSteps}
        </p>
      </section>

      {/* How do I know I'm done? */}
      <section
        className="mb-6"
        aria-labelledby="completion-label"
      >
        <h2
          id="completion-label"
          className="text-sm font-semibold uppercase tracking-wide text-slate-text"
        >
          {COPY.howDoIKnowImDone}
        </h2>
        <p className="mt-1 text-base font-medium text-muted-teal">
          {isComplete
            ? COPY.allStepsCompleted
            : COPY.completeThisStep}
        </p>
      </section>

      {/* Children area */}
      <main className="mb-4" aria-label="Activity content">
        {children}
      </main>

      {/* Next step indicator */}
      {!isComplete && (
        <footer
          className="mt-2 border-t border-slate-200 pt-4"
          aria-live="polite"
        >
          <p className="text-sm font-medium text-muted-teal">
            {isLastStep
              ? COPY.thisIsTheLastStep
              : COPY.nextUp.replace("{title}", nextStep)}
          </p>
        </footer>
      )}
    </div>
  );
}
