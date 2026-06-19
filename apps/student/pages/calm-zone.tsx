import type { NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { CalmBreathing } from "../components/CalmBreathing";
import { CalmTimer } from "../components/CalmTimer";
import { COPY, AppShell } from "@learn-easy/ui";
import { pauseSession, resumeSession } from "../lib/session";

const STEPS = [
  COPY.stepObserve,
  COPY.stepGuided,
  COPY.stepIndependent,
  COPY.stepMastery,
];

const CalmZone: NextPage = () => {
  const router = useRouter();
  const { return: returnUrl, step, activity: activityId } = router.query;
  const returnPath =
    typeof returnUrl === "string" ? returnUrl : "/subjects";
  const stepNum = step ? parseInt(step as string, 10) : 0;
  const actId = typeof activityId === "string" ? activityId : undefined;

  const [paused, setPaused] = useState(false);
  const [sessionId] = useState<string>(
    typeof window !== "undefined"
      ? localStorage.getItem("learn-easy.currentSessionId") || ""
      : "",
  );

  // Pause session on mount if we have a sessionId
  useEffect(() => {
    if (!paused && sessionId) {
      pauseSession(sessionId, stepNum, actId).then(() => {
        setPaused(true);
      });
    }
  }, [sessionId, stepNum, actId, paused]);

  const handleReturn = async () => {
    if (sessionId) {
      await resumeSession(sessionId);
    }
    router.push(returnPath);
  };

  const stepName = STEPS[stepNum] || "";
  const buttonLabel = stepName
    ? `Return to Step ${stepNum + 1}: ${stepName}`
    : COPY.returnToLesson;

  return (
    <AppShell variant="student" footer={null}>
      <div className="bg-gradient-to-b from-[#E8F4F8] to-[#F0F7FA] px-4 py-8 mx-auto max-w-content rounded-2xl">
        {/* Title */}
        <h1 className="mb-2 text-center text-2xl font-bold text-muted-teal">
          {COPY.takeBreak}
        </h1>
        <p className="mb-10 text-center text-base text-on-surface-variant">
          {COPY.calmZoneDescription}
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
            onClick={handleReturn}
            className="min-h-[56px] min-w-[200px] rounded-xl bg-muted-teal px-8 py-4 text-base font-semibold text-white hover:bg-muted-teal/90 focus:outline-none focus:ring-2 focus:ring-muted-teal focus:ring-offset-2 transition-colors duration-200"
          >
            {buttonLabel}
          </button>
        </div>
      </div>
    </AppShell>
  );
};

export default CalmZone;
