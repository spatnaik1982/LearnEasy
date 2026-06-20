import type { NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect, useState, useCallback } from "react";
import { ArrowLeft, ArrowRight, Home } from "lucide-react";
import {
  PositiveCompletion,
  TransitionScreen,
  ActivityRenderer,
  VisualSchedule,
  LearningCard,
  StudentFooter,
  COPY,
} from "@learn-easy/ui";
import { useAuth } from "../../lib/auth";
import { useSession } from "../../lib/session";
import {
  fetchParentIds,
  fetchConcept,
  recordAttempt,
} from "../../lib/api";
import type { Concept } from "../../lib/mockData";

const STEPS = [
  COPY.stepObserve,
  COPY.stepGuided,
  COPY.stepIndependent,
  COPY.stepMastery,
  "Completion",
];

const LEARN_STEPS = STEPS.slice(0, -1);

const STEP_ACTIVITY_TYPES: Record<number, string[]> = {
  0: ["visual_counter", "visual_counting", "story_question"],
  1: ["matching", "story_question"],
  2: ["sequencing", "drag_drop", "matching"],
  3: ["multiple_choice"],
};

const ACTIVITY_WORK_LABELS: Record<string, string> = {
  visual_counter: COPY.completionVisualCounting,
  visual_counting: COPY.completionVisualCounting,
  matching: COPY.completionMatching,
  drag_drop: COPY.completionDragDrop,
  dragdrop: COPY.completionDragDrop,
  sequencing: COPY.completionSequencing,
  multiple_choice: COPY.completionMultipleChoice,
  story_question: COPY.completionStoryQuestion,
  real_world: COPY.completionRealWorld,
  real_world_task: COPY.completionRealWorld,
};

const Learn: NextPage = () => {
  const router = useRouter();
  const { conceptId } = router.query;
  const { user } = useAuth();
  const { endSession } = useSession(user?.id);

  const [concept, setConcept] = useState<Concept | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [showTransition, setShowTransition] = useState(false);
  const [pendingStep, setPendingStep] = useState<number | null>(null);
  const [recordError, setRecordError] = useState<string | null>(null);
  const [activityCompleted, setActivityCompleted] = useState(false);

  useEffect(() => {
    setActivityCompleted(false);
  }, [currentStep]);

  useEffect(() => {
    if (!conceptId) return;
    const cId = conceptId as string;

    fetchParentIds(cId).then((parentRes) => {
      if (!parentRes.data) {
        setLoading(false);
        return;
      }
      fetchConcept(parentRes.data.subjectId, parentRes.data.chapterId, cId).then(
        (res) => {
          if (res.data) setConcept(res.data);
          setLoading(false);
        },
      );
    });
  }, [conceptId]);

  const handleNext = useCallback(() => {
    const nextStep = currentStep + 1;
    const newCompleted = [...completedSteps, currentStep];
    setCompletedSteps(newCompleted);

    if (nextStep >= STEPS.length - 1) {
      setCurrentStep(nextStep);
      return;
    }
    setPendingStep(nextStep);
    setShowTransition(true);
  }, [currentStep, completedSteps]);

  const handleStartTransition = useCallback(() => {
    if (pendingStep !== null) {
      setCurrentStep(pendingStep);
      setPendingStep(null);
    }
    setShowTransition(false);
  }, [pendingStep]);

  const handleComplete = useCallback(() => {
    endSession().then(() => {
      router.push("/subjects");
    });
  }, [endSession, router]);

  const STEP_LABELS = ["observe", "guided_practice", "independent_practice", "mastery_check"];

  const getActivityForStep = useCallback(
    (step: number) => {
      if (!concept) return null;

      // Prefer matching by step field (from API/curriculum data)
      const stepLabel = STEP_LABELS[step];
      if (stepLabel) {
        const byStep = concept.activities.find((a) => a.step === stepLabel);
        if (byStep) return byStep;
      }

      // Fall back to type matching (for mock data without step field)
      const types = STEP_ACTIVITY_TYPES[step];
      if (!types) return null;
      return concept.activities.find((a) => types.includes(a.type.replace(/-/g, "_"))) ?? null;
    },
    [concept],
  );

  const handleTakeBreak = useCallback(() => {
    if (conceptId) {
      const currentActivity = getActivityForStep(currentStep);
      const activityId = currentActivity?.id || "";
      router.push(
        `/calm-zone?return=/learn/${conceptId}&step=${currentStep}&activity=${activityId}`,
      );
    }
  }, [router, conceptId, currentStep, getActivityForStep]);

  const handleRecordAttempt = useCallback(
    async (
      activityId: string,
      response: Record<string, unknown>,
      hintsUsed = 0,
      timeSpent = 0,
    ) => {
      setRecordError(null);
      const res = await recordAttempt(activityId, response, hintsUsed, timeSpent);
      if (res.error) {
        setRecordError(res.error);
      }
      return res;
    },
    [],
  );

  if (loading || !conceptId) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <p className="text-lg text-on-surface-variant">{COPY.loadingLesson}</p>
      </div>
    );
  }

  if (!concept) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <p className="text-lg text-on-surface-variant">{COPY.conceptNotFound}</p>
      </div>
    );
  }

  // Transition screen
  if (showTransition && pendingStep !== null) {
    const fromStep = STEPS[currentStep];
    const toStep = STEPS[pendingStep];
    return (
      <div className="min-h-screen bg-surface flex flex-col">
        <header className="flex items-center justify-between px-margin-mobile md:px-margin-desktop py-4 border-b border-outline-variant">
          <button
            onClick={() => router.back()}
            className="hover:bg-surface-container-low p-2 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-soft-blue"
            aria-label="Go back"
          >
            <ArrowLeft className="w-6 h-6 text-soft-blue" />
          </button>
          <h1 className="text-lg font-semibold text-soft-blue">{concept.title}</h1>
          <button
            onClick={() => router.push("/subjects")}
            className="hover:bg-surface-container-low p-2 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-soft-blue"
            aria-label="Go to home"
          >
            <Home className="w-6 h-6 text-soft-blue" />
          </button>
        </header>
        <main className="flex-1 flex items-center justify-center px-margin-mobile md:px-margin-desktop">
          <TransitionScreen
            fromStep={fromStep}
            toStep={toStep}
            currentStep={currentStep + 1}
            totalSteps={STEPS.length}
            onStart={handleStartTransition}
            onBreak={handleTakeBreak}
          />
        </main>
        <StudentFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      {/* Top bar */}
      <header className="flex items-center justify-between px-margin-mobile md:px-margin-desktop py-4 border-b border-outline-variant bg-surface">
        <button
          onClick={() => router.back()}
          className="hover:bg-surface-container-low p-2 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-soft-blue"
          aria-label="Go back"
        >
          <ArrowLeft className="w-6 h-6 text-soft-blue" />
        </button>
        <h1 className="text-lg font-semibold text-soft-blue">{concept.title}</h1>
        <button
          onClick={() => router.push("/subjects")}
          className="hover:bg-surface-container-low p-2 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-soft-blue"
          aria-label="Go to home"
        >
          <Home className="w-6 h-6 text-soft-blue" />
        </button>
      </header>

      {/* Sticky VisualSchedule */}
      <div className="sticky top-0 z-10 bg-surface border-b border-outline-variant">
        <div className="max-w-3xl mx-auto px-margin-mobile md:px-margin-desktop py-4">
          <VisualSchedule
            steps={LEARN_STEPS}
            currentStep={currentStep}
            completedSteps={completedSteps}
          />
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1 w-full max-w-3xl mx-auto px-margin-mobile md:px-margin-desktop py-8 space-y-6">
        {/* Error state */}
        {recordError && (
          <div
            className="rounded-lg bg-soft-coral/10 px-4 py-3 text-sm text-soft-coral"
            role="alert"
          >
            {recordError}
          </div>
        )}

        {/* Step 0: Observe */}
        {currentStep === 0 && (
          <>
            <LearningCard>
              <div className="w-full">
                {(() => {
                  const act = getActivityForStep(0);
                  return (
                    <div className="mb-6">
                      <p className="text-sm font-semibold uppercase tracking-wide text-slate-text">
                        {COPY.whatAmIDoing}
                      </p>
                      <p className="text-lg font-medium text-slate-text">
                        {act?.title ?? concept.title}
                      </p>
                      <p className="mt-1 text-sm text-muted-teal">
                        {COPY.howMuchWork}: {act ? (ACTIVITY_WORK_LABELS[act.type.replace(/-/g, "_")] ?? "Complete the activity") : "1 activity"}
                      </p>
                    </div>
                  );
                })()}

                <section aria-label={`${COPY.stepObserve} step`}>
                  {(() => {
                    const act = getActivityForStep(0);
                    return act ? (
                      <div className="mb-4">
                        <ActivityRenderer
                          activity={{
                            id: act.id,
                            type: act.type,
                            content: act.config,
                          }}
                          stepLabel={STEP_LABELS[0]}
                          onComplete={(result) => {
                            handleRecordAttempt(
                              act.id,
                              result.response,
                              result.hintsUsed,
                              result.timeSpent,
                            );
                          }}
                        />
                      </div>
                    ) : null;
                  })()}
                </section>
              </div>
            </LearningCard>

            <div className="flex justify-center">
              <button
                onClick={handleNext}
                className="h-[56px] px-8 bg-soft-blue hover:bg-primary text-white font-semibold text-lg rounded-full shadow-sm hover:shadow-md transition-all motion-safe:active:scale-[0.98] flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-soft-blue focus:ring-offset-2"
              >
                {COPY.continueConcept}
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </>
        )}

        {/* Step 1: Guided Practice */}
        {currentStep === 1 && (
          <>
            <LearningCard>
              <div className="w-full">
                {(() => {
                  const act = getActivityForStep(1);
                  return (
                    <div className="mb-6">
                      <p className="text-sm font-semibold uppercase tracking-wide text-slate-text">
                        {COPY.whatAmIDoing}
                      </p>
                      <p className="text-lg font-medium text-slate-text">
                        {act?.title ?? "Match the items below"}
                      </p>
                      <p className="mt-1 text-sm text-muted-teal">
                        {COPY.howMuchWork}: {act ? (ACTIVITY_WORK_LABELS[act.type.replace(/-/g, "_")] ?? "Complete the activity") : "Match all pairs"}
                      </p>
                    </div>
                  );
                })()}

                <section aria-label={`${COPY.stepGuided} step`}>
                  {(() => {
                    const act = getActivityForStep(1);
                    return act ? (
                      <div className="mb-4">
                        <ActivityRenderer
                          activity={{
                            id: act.id,
                            type: act.type,
                            content: act.config,
                          }}
                          stepLabel={STEP_LABELS[1]}
                          onComplete={(result) => {
                            if (result.correct) setActivityCompleted(true);
                            handleRecordAttempt(
                              act.id,
                              result.response,
                              result.hintsUsed,
                              result.timeSpent,
                            );
                          }}
                        />
                      </div>
                    ) : null;
                  })()}
                </section>
              </div>
            </LearningCard>

            <div className="flex justify-center">
              <button
                onClick={handleNext}
                disabled={!activityCompleted}
                className={`h-[56px] px-8 font-semibold text-lg rounded-full shadow-sm flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-soft-blue focus:ring-offset-2 ${
                  activityCompleted
                    ? "bg-soft-blue hover:bg-primary text-white hover:shadow-md transition-all motion-safe:active:scale-[0.98]"
                    : "bg-slate-200 text-slate-400 cursor-not-allowed"
                }`}
              >
                {COPY.continueConcept}
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </>
        )}

        {/* Step 2: Independent Practice */}
        {currentStep === 2 && (
          <>
            <LearningCard>
              <div className="w-full">
                {(() => {
                  const act = getActivityForStep(2);
                  return (
                    <div className="mb-6">
                      <p className="text-sm font-semibold uppercase tracking-wide text-slate-text">
                        {COPY.whatAmIDoing}
                      </p>
                      <p className="text-lg font-medium text-slate-text">
                        {act?.title ?? "Try on your own"}
                      </p>
                      <p className="mt-1 text-sm text-muted-teal">
                        {COPY.howMuchWork}: {act ? (ACTIVITY_WORK_LABELS[act.type.replace(/-/g, "_")] ?? "Complete the activity") : "Complete the activity"}
                      </p>
                    </div>
                  );
                })()}

                <section aria-label={`${COPY.stepIndependent} step`}>
                  {(() => {
                    const act = getActivityForStep(2);
                    return act ? (
                      <div className="mb-4">
                        <ActivityRenderer
                          activity={{
                            id: act.id,
                            type: act.type,
                            content: act.config,
                          }}
                          stepLabel={STEP_LABELS[2]}
                          onComplete={(result) => {
                            if (result.correct) setActivityCompleted(true);
                            handleRecordAttempt(
                              act.id,
                              result.response,
                              result.hintsUsed,
                              result.timeSpent,
                            );
                          }}
                        />
                      </div>
                    ) : null;
                  })()}
                </section>
              </div>
            </LearningCard>

            <div className="flex justify-center">
              <button
                onClick={handleNext}
                disabled={!activityCompleted}
                className={`h-[56px] px-8 font-semibold text-lg rounded-full shadow-sm flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-soft-blue focus:ring-offset-2 ${
                  activityCompleted
                    ? "bg-soft-blue hover:bg-primary text-white hover:shadow-md transition-all motion-safe:active:scale-[0.98]"
                    : "bg-slate-200 text-slate-400 cursor-not-allowed"
                }`}
              >
                {COPY.continueConcept}
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </>
        )}

        {/* Step 3: Mastery Check */}
        {currentStep === 3 && (
          <>
            <LearningCard>
              <div className="w-full">
                {(() => {
                  const act = getActivityForStep(3);
                  return (
                    <div className="mb-6">
                      <p className="text-sm font-semibold uppercase tracking-wide text-slate-text">
                        {COPY.whatAmIDoing}
                      </p>
                      <p className="text-lg font-medium text-slate-text">
                        {act?.title ?? "Show what you've learned"}
                      </p>
                      <p className="mt-1 text-sm text-muted-teal">
                        {COPY.howMuchWork}: {act ? (ACTIVITY_WORK_LABELS[act.type.replace(/-/g, "_")] ?? "Complete the activity") : "Answer all questions"}
                      </p>
                    </div>
                  );
                })()}

                <section aria-label={`${COPY.stepMastery} step`}>
                  {(() => {
                    const act = getActivityForStep(3);
                    return act ? (
                      <div className="mb-4">
                        <ActivityRenderer
                          activity={{
                            id: act.id,
                            type: act.type,
                            content: act.config,
                          }}
                          stepLabel={STEP_LABELS[3]}
                          onComplete={(result) => {
                            if (result.correct) setActivityCompleted(true);
                            handleRecordAttempt(
                              act.id,
                              result.response,
                              result.hintsUsed,
                              result.timeSpent,
                            );
                          }}
                        />
                      </div>
                    ) : null;
                  })()}
                </section>
              </div>
            </LearningCard>

            <div className="flex justify-center">
              <button
                onClick={handleNext}
                disabled={!activityCompleted}
                className={`h-[56px] px-8 font-semibold text-lg rounded-full shadow-sm flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-soft-blue focus:ring-offset-2 ${
                  activityCompleted
                    ? "bg-soft-blue hover:bg-primary text-white hover:shadow-md transition-all motion-safe:active:scale-[0.98]"
                    : "bg-slate-200 text-slate-400 cursor-not-allowed"
                }`}
              >
                {COPY.continueConcept}
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </>
        )}

        {/* Step 4: Completion */}
        {currentStep === 4 && (
          <PositiveCompletion
            message={`Great job completing "${concept.title}"!`}
            emoji={"🎉"}
            onContinue={handleComplete}
          />
        )}

        {/* Take a Break link */}
        {currentStep < 4 && (
          <div className="flex justify-center">
            <button
              onClick={handleTakeBreak}
              className="min-h-[56px] rounded-lg px-6 py-3 text-sm font-medium text-muted-teal underline hover:text-muted-teal/80 focus:outline-none focus:ring-2 focus:ring-soft-blue focus:ring-offset-2 motion-safe:transition-colors motion-safe:duration-200"
            >
              {COPY.takeBreak}
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <StudentFooter />
    </div>
  );
};

export default Learn;
