import type { NextPage } from "next";
import { useRouter } from "next/router";
import { AppShell, COPY } from "@learn-easy/ui";

const CalmOnboarding: NextPage = () => {
  const router = useRouter();

  const handleStart = () => {
    localStorage.setItem("learn-easy.onboardedAt", new Date().toISOString());
    router.replace("/subjects");
  };

  return (
    <AppShell variant="student" footer={null}>
      <div className="flex min-h-[70vh] flex-col items-center justify-center text-center">
        <span className="mb-6 text-8xl" aria-hidden="true">
          🍃
        </span>
        <h1 className="mb-4 text-2xl font-bold text-slate-text">
          {COPY.onboardingCalmTitle}
        </h1>
        <div className="mb-8 flex h-32 w-full max-w-md items-center justify-center rounded-2xl bg-gradient-to-b from-[#E8F4F8] to-[#F0F7FA] shadow-sm">
          <span className="text-5xl" aria-hidden="true">
            📚
          </span>
        </div>
        <p className="mb-8 max-w-sm text-sm text-on-surface-variant">
          {COPY.onboardingCalmBody}
        </p>
        <button
          onClick={handleStart}
          className="min-h-[56px] w-full max-w-xs rounded-full bg-soft-blue px-8 py-3 text-base font-semibold text-white motion-safe:active:scale-[0.98] hover:bg-primary motion-safe:transition-colors motion-safe:duration-200 focus:outline-none focus:ring-2 focus:ring-soft-blue focus:ring-offset-2"
        >
          {COPY.onboardingStartLesson}
        </button>
      </div>
    </AppShell>
  );
};

export default CalmOnboarding;
