import type { NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { AppShell, COPY, DataState } from "@learn-easy/ui";
import { useAuth } from "../lib/auth";
import { fetchResumeState } from "../lib/api";
import { useApi } from "../lib/use-api";

const STEP_NAMES = [
  COPY.stepObserve,
  COPY.stepGuided,
  COPY.stepIndependent,
  COPY.stepMastery,
];

const Home: NextPage = () => {
  const { user } = useAuth();
  const {
    data: resumeInfo,
    loading: resumeLoading,
    error: resumeError,
  } = useApi(
    () =>
      user?.id
        ? fetchResumeState(user.id)
        : Promise.resolve({ data: null, error: null }),
    [user?.id],
  );

  // Check onboardedAt flag for Story 8
  const onboardedAt =
    typeof window !== "undefined"
      ? localStorage.getItem("learn-easy.onboardedAt")
      : null;

  const router = useRouter();

  const firstName = user?.name?.split(" ")[0] || "there";

  // Redirect to onboarding if not onboarded AND no resume
  useEffect(() => {
    if (
      !resumeLoading &&
      resumeInfo &&
      !onboardedAt &&
      !resumeInfo.hasResumableSession
    ) {
      router.replace("/onboarding/welcome");
    }
  }, [resumeLoading, resumeInfo, onboardedAt, router]);

  // Three states:
  const renderContent = () => {
    if (resumeLoading)
      return <DataState status="loading" label={COPY.checkingSavedProgress} />;
    if (resumeError)
      return (
        <DataState
          status="error"
          onRetry={() => window.location.reload()}
        />
      );

    // State 1: Resume available
    if (resumeInfo?.hasResumableSession) {
      return (
        <div className="text-center">
          <p className="mb-2 text-lg font-bold text-slate-text">
            Hi {firstName}!
          </p>
          <div className="mx-auto max-w-md rounded-xl border-2 border-muted-teal bg-white p-6">
            <p className="mb-1 text-sm font-medium text-slate-text">
              {COPY.resumableSession}
            </p>
            {resumeInfo.step !== undefined && resumeInfo.step < 4 && (
              <p className="mb-4 text-sm text-muted-teal">
                {COPY.lastStep.replace(
                  "{step}",
                  STEP_NAMES[resumeInfo.step],
                )}
              </p>
            )}
            <button
              onClick={() =>
                router.push(
                  resumeInfo.conceptId
                    ? `/learn/${resumeInfo.conceptId}`
                    : "/subjects",
                )
              }
              className="min-h-[56px] w-full rounded-xl bg-muted-teal px-8 py-3 text-base font-semibold text-white hover:bg-muted-teal/90 motion-safe:transition-colors motion-safe:duration-200 focus:outline-none focus:ring-2 focus:ring-muted-teal focus:ring-offset-2"
            >
              {COPY.resumeLesson}
            </button>
            <div className="mt-3">
              <button
                onClick={() => router.push("/subjects")}
                className="text-sm font-medium text-soft-blue underline"
              >
                {COPY.chooseDifferentLesson}
              </button>
            </div>
          </div>
        </div>
      );
    }

    // State 2: Session complete today
    // (Detectable via resumeInfo.completedAt or similar; falls through to default for now)

    // State 3: Default / no progress (show Start Today's Lesson)
    return (
      <div className="flex flex-col items-center text-center">
        <p className="mb-4 text-2xl font-bold text-slate-text">
          Hi {firstName}!
        </p>
        <span className="mb-6 text-8xl" aria-hidden="true">
          🎓
        </span>
        <p className="mb-8 text-base text-on-surface-variant">
          {COPY.readyToLearn}
        </p>
        <button
          onClick={() => router.push("/subjects")}
          className="min-h-[56px] w-full max-w-xs rounded-xl bg-soft-blue px-8 py-3 text-base font-semibold text-white hover:bg-primary motion-safe:transition-colors motion-safe:duration-200 focus:outline-none focus:ring-2 focus:ring-soft-blue focus:ring-offset-2"
        >
          {COPY.startTodaysLesson}
        </button>
      </div>
    );
  };

  return (
    <AppShell variant="student">
      <div className="flex min-h-[60vh] items-center justify-center">
        {renderContent()}
      </div>
    </AppShell>
  );
};

export default Home;
