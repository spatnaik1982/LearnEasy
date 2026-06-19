import type { NextPage } from "next";
import { useRouter } from "next/router";
import { CalmBreathing } from "../components/CalmBreathing";
import { CalmTimer } from "../components/CalmTimer";
import { COPY, AppShell } from "@learn-easy/ui";

const CalmZone: NextPage = () => {
  const router = useRouter();
  const { return: returnUrl } = router.query;
  const returnPath =
    typeof returnUrl === "string" ? returnUrl : "/subjects";

  return (
    <AppShell variant="student" footer={null}>
      <div className="bg-gradient-to-b from-[#E8F4F8] to-[#F0F7FA] px-4 py-8 mx-auto max-w-content rounded-2xl">
        {/* Title */}
        <h1 className="mb-2 text-center text-2xl font-bold text-muted-teal">
          {COPY.takeBreak}
        </h1>
        <p className="mb-10 text-center text-base text-on-surface-variant">
          Use these calming tools whenever you need a moment to relax
        </p>

        {/* Breathing exercise */}
        <section
          className="mb-12 rounded-2xl bg-white p-8 shadow-sm"
          aria-labelledby="breathing-heading"
        >
          <h2
            id="breathing-heading"
            className="mb-6 text-center text-lg font-semibold text-slate-text"
          >
            🌬️ Breathing Exercise
          </h2>
          <CalmBreathing />
        </section>

        {/* Timer */}
        <section
          className="mb-12 rounded-2xl bg-white p-8 shadow-sm"
          aria-labelledby="timer-heading"
        >
          <h2
            id="timer-heading"
            className="mb-6 text-center text-lg font-semibold text-slate-text"
          >
            ⏱️ Visual Timer
          </h2>
          <CalmTimer />
        </section>

        {/* Return to lesson */}
        <div className="flex justify-center">
          <button
            onClick={() => router.push(returnPath)}
            className="min-h-[56px] min-w-[200px] rounded-xl bg-muted-teal px-8 py-4 text-base font-semibold text-white hover:bg-muted-teal/90 focus:outline-none focus:ring-2 focus:ring-muted-teal focus:ring-offset-2 transition-colors duration-200"
          >
            {COPY.returnToLesson}
          </button>
        </div>
      </div>
    </AppShell>
  );
};

export default CalmZone;
