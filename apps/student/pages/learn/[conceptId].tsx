import type { NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect, useState, useCallback } from "react";
import {
  PositiveCompletion,
  VisualSchedule,
  WorkSystemLayout,
  TransitionScreen,
  ActivityRenderer,
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
  "Observe",
  "Guided Practice",
  "Independent Practice",
  "Mastery Check",
  "Completion",
];

// Maps step index → preferred activity types (first found wins)
const STEP_ACTIVITY_TYPES: Record<number, string[]> = {
  0: ["visual_counter", "visual_counting", "story_question"],
  1: ["matching", "story_question"],
  2: ["sequencing", "drag_drop", "matching"],
  3: ["multiple_choice"],
};

const Learn: NextPage = () => {
  const router = useRouter();
  const { conceptId } = router.query;
  const { user } = useAuth();
  const { sessionId, endSession } = useSession(user?.id);

  const [concept, setConcept] = useState<Concept | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [showTransition, setShowTransition] = useState(false);
  const [pendingStep, setPendingStep] = useState<number | null>(null);
  const [recordError, setRecordError] = useState<string | null>(null);

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

  const handleTakeBreak = useCallback(() => {
    if (conceptId) {
      router.push(`/calm-zone?return=/learn/${conceptId}`);
    }
  }, [router, conceptId]);

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

  // Find the activity for a given step based on the mapping
  const getActivityForStep = useCallback(
    (step: number) => {
      if (!concept) return null;
      const types = STEP_ACTIVITY_TYPES[step];
      if (!types) return null;
      return concept.activities.find((a) => types.includes(a.type)) ?? null;
    },
    [concept],
  );

  if (loading || !conceptId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-warm-off-white">
        <p className="text-lg text-on-surface-variant">Loading lesson...</p>
      </div>
    );
  }

  if (!concept) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-warm-off-white">
        <p className="text-lg text-on-surface-variant">Concept not found</p>
      </div>
    );
  }

  const activities = concept.activities;

  // Transition screen
  if (showTransition && pendingStep !== null) {
    const fromStep = STEPS[currentStep];
    const toStep = STEPS[pendingStep];
    return (
      <div className="min-h-screen bg-warm-off-white px-4 py-8">
        <div className="mx-auto max-w-content">
          <TransitionScreen
            fromStep={fromStep}
            toStep={toStep}
            currentStep={currentStep + 1}
            totalSteps={STEPS.length}
            onStart={handleStartTransition}
            onBreak={handleTakeBreak}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-warm-off-white px-4 py-8">
      <div className="mx-auto max-w-content">
        {/* Back button */}
        <button
          onClick={() => router.back()}
          className="mb-4 min-h-[56px] text-left text-base text-on-surface-variant hover:text-slate-text focus:outline-none focus:underline"
        >
          &larr; Back
        </button>

        {/* Visual Schedule */}
        <VisualSchedule
          steps={STEPS}
          currentStep={currentStep}
          completedSteps={completedSteps}
          className="mb-8"
        />

        {/* Error state */}
        {recordError && (
          <div
            className="mb-4 rounded-lg bg-soft-coral/10 px-4 py-3 text-sm text-soft-coral"
            role="alert"
          >
            {recordError}
          </div>
        )}

        {/* Step 0: Observe */}
        {currentStep === 0 && (
          <WorkSystemLayout
            stepName="Observe"
            conceptTitle={concept.title}
            currentStep={currentStep}
            totalSteps={STEPS.length}
            nextStep={STEPS[1]}
          >
            <section aria-label="Observe step">
              <p className="mb-6 text-base text-on-surface-variant">
                Look at the visual below. Count what you see.
              </p>
              {(() => {
                const act = getActivityForStep(0);
                return act ? (
                  <div className="mb-8">
                    <ActivityRenderer
                      activity={{
                        id: act.id,
                        type: act.type,
                        content: act.config,
                      }}
                      step="Observe"
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
              <button
                onClick={handleNext}
                className="min-h-[56px] w-full rounded-xl bg-soft-blue px-6 py-3 text-base font-semibold text-white transition-opacity duration-200 hover:bg-primary focus:outline-none focus:ring-2 focus:ring-soft-blue focus:ring-offset-2"
              >
                Continue Lesson
              </button>
            </section>
          </WorkSystemLayout>
        )}

        {/* Step 1: Guided Practice */}
        {currentStep === 1 && (
          <WorkSystemLayout
            stepName="Guided Practice"
            conceptTitle={concept.title}
            currentStep={currentStep}
            totalSteps={STEPS.length}
            nextStep={STEPS[2]}
          >
            <section aria-label="Guided Practice step">
              <p className="mb-6 text-base text-on-surface-variant">
                Match the items below. Hints are available to help you.
              </p>
              {(() => {
                const act = getActivityForStep(1);
                return act ? (
                  <div className="mb-8">
                    <ActivityRenderer
                      activity={{
                        id: act.id,
                        type: act.type,
                        content: act.config,
                      }}
                      step="Guided Practice"
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
              <button
                onClick={() => {
                  const act = getActivityForStep(1);
                  if (act) {
                    handleRecordAttempt(
                      act.id,
                      { completed: true },
                      0,
                      30,
                    );
                  }
                  handleNext();
                }}
                className="min-h-[56px] w-full rounded-xl bg-soft-blue px-6 py-3 text-base font-semibold text-white transition-opacity duration-200 hover:bg-primary focus:outline-none focus:ring-2 focus:ring-soft-blue focus:ring-offset-2"
              >
                Continue Lesson
              </button>
            </section>
          </WorkSystemLayout>
        )}

        {/* Step 2: Independent Practice */}
        {currentStep === 2 && (
          <WorkSystemLayout
            stepName="Independent Practice"
            conceptTitle={concept.title}
            currentStep={currentStep}
            totalSteps={STEPS.length}
            nextStep={STEPS[3]}
          >
            <section aria-label="Independent Practice step">
              <p className="mb-6 text-base text-on-surface-variant">
                Try this on your own. No hints this time!
              </p>
              {(() => {
                const act = getActivityForStep(2);
                return act ? (
                  <div className="mb-8">
                    <ActivityRenderer
                      activity={{
                        id: act.id,
                        type: act.type,
                        content: act.config,
                      }}
                      step="Independent Practice"
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
              <button
                onClick={() => {
                  const act = getActivityForStep(2);
                  if (act) {
                    handleRecordAttempt(
                      act.id,
                      { completed: true },
                      0,
                      30,
                    );
                  }
                  handleNext();
                }}
                className="min-h-[56px] w-full rounded-xl bg-soft-blue px-6 py-3 text-base font-semibold text-white transition-opacity duration-200 hover:bg-primary focus:outline-none focus:ring-2 focus:ring-soft-blue focus:ring-offset-2"
              >
                Submit Answer
              </button>
            </section>
          </WorkSystemLayout>
        )}

        {/* Step 3: Mastery Check */}
        {currentStep === 3 && (
          <WorkSystemLayout
            stepName="Mastery Check"
            conceptTitle={concept.title}
            currentStep={currentStep}
            totalSteps={STEPS.length}
            nextStep={STEPS[4]}
          >
            <section aria-label="Mastery Check step">
              <p className="mb-6 text-base text-on-surface-variant">
                Show what you've learned!
              </p>
              {(() => {
                const act = getActivityForStep(3);
                return act ? (
                  <div className="mb-8">
                    <ActivityRenderer
                      activity={{
                        id: act.id,
                        type: act.type,
                        content: act.config,
                      }}
                      step="Mastery Check"
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
              <button
                onClick={() => {
                  const act = getActivityForStep(3);
                  if (act) {
                    handleRecordAttempt(
                      act.id,
                      { selectedIndex: 0 },
                      0,
                      30,
                    );
                  }
                  handleNext();
                }}
                className="min-h-[56px] w-full rounded-xl bg-soft-blue px-6 py-3 text-base font-semibold text-white transition-opacity duration-200 hover:bg-primary focus:outline-none focus:ring-2 focus:ring-soft-blue focus:ring-offset-2"
              >
                Continue Lesson
              </button>
            </section>
          </WorkSystemLayout>
        )}

        {/* Step 4: Completion */}
        {currentStep === 4 && (
          <PositiveCompletion
            message={`Great job completing "${concept.title}"!`}
            emoji={"🎉"}
            onContinue={handleComplete}
          />
        )}

        {/* Take a Break button (shown during steps, not on completion) */}
        {currentStep < 4 && (
          <div className="mt-6 flex justify-center">
            <button
              onClick={handleTakeBreak}
              className="min-h-[56px] rounded-lg px-6 py-3 text-sm font-medium text-muted-teal underline hover:text-muted-teal/80 focus:outline-none focus:ring-2 focus:ring-soft-blue focus:ring-offset-2 transition-colors duration-200"
            >
              Take a Break
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Learn;
