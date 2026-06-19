import type { NextPage } from "next";
import { useRouter } from "next/router";
import { AppShell, COPY } from "@learn-easy/ui";

const Welcome: NextPage = () => {
  const router = useRouter();

  const handleIKnowHow = () => {
    localStorage.setItem("learn-easy.onboardedAt", new Date().toISOString());
    router.replace("/subjects");
  };

  return (
    <AppShell variant="student" footer={null}>
      <div className="flex min-h-[70vh] flex-col items-center justify-center text-center">
        <span className="mb-6 text-8xl" aria-hidden="true">
          🎓
        </span>
        <h1 className="mb-4 text-2xl font-bold text-slate-text">
          {COPY.welcomeTitle}
        </h1>
        <p className="mb-8 max-w-md text-base text-on-surface-variant">
          {COPY.welcomeBody}
        </p>
        <button
          onClick={() => router.push("/onboarding/tour")}
          className="mb-4 min-h-[56px] w-full max-w-xs rounded-xl bg-soft-blue px-8 py-3 text-base font-semibold text-white hover:bg-primary motion-safe:transition-colors motion-safe:duration-200 focus:outline-none focus:ring-2 focus:ring-soft-blue focus:ring-offset-2"
        >
          {COPY.onboardingShowMe}
        </button>
        <button
          onClick={handleIKnowHow}
          className="min-h-[44px] text-sm font-medium text-soft-blue underline"
        >
          {COPY.onboardingIKnowHow}
        </button>
      </div>
    </AppShell>
  );
};

export default Welcome;
