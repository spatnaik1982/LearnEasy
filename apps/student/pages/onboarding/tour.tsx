import type { NextPage } from "next";
import { useRouter } from "next/router";
import { AppShell, VisualSchedule } from "@learn-easy/ui";

const Tour: NextPage = () => {
  const router = useRouter();

  return (
    <AppShell variant="student" footer={null}>
      <div className="flex min-h-[70vh] flex-col items-center justify-center text-center">
        <h1 className="mb-6 text-2xl font-bold text-slate-text">
          Every lesson has 4 short parts
        </h1>
        <div className="mb-8">
          <VisualSchedule
            steps={[
              "Observe",
              "Practice",
              "Try on your own",
              "Show what you know",
            ]}
            currentStep={0}
            completedSteps={[]}
          />
        </div>
        <button
          onClick={() => router.push("/onboarding/calm")}
          className="min-h-[56px] w-full max-w-xs rounded-xl bg-soft-blue px-8 py-3 text-base font-semibold text-white hover:bg-primary motion-safe:transition-colors motion-safe:duration-200 focus:outline-none focus:ring-2 focus:ring-soft-blue focus:ring-offset-2"
        >
          Show me Calm Zone
        </button>
      </div>
    </AppShell>
  );
};

export default Tour;
