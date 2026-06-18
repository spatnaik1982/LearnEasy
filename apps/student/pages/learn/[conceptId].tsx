import type { NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect, useState, useCallback } from "react";
import {
  VisualCounter,
  Matching,
  MultipleChoice,
  Sequencing,
  PositiveCompletion,
  ProgressBar,
} from "@learn-easy/ui";
import { fetchParentIds, fetchConcept } from "../../lib/api";
import type { Concept } from "../../lib/mockData";

const STEPS = ["Observe", "Guided Practice", "Independent Practice", "Mastery Check", "Completion"];

const TRANSITIONS: Record<number, { title: string; button: string } | null> = {
  0: null,
  1: { title: "Next: Guided Practice", button: "Start Practice" },
  2: { title: "Next: Independent Practice", button: "Continue Lesson" },
  3: { title: "Next: Mastery Check", button: "Continue Lesson" },
  4: null,
};

const Learn: NextPage = () => {
  const router = useRouter();
  const { conceptId } = router.query;
  const [concept, setConcept] = useState<Concept | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [showTransition, setShowTransition] = useState(false);
  const [pendingStep, setPendingStep] = useState<number | null>(null);

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
    if (nextStep >= STEPS.length - 1) {
      setCurrentStep(nextStep);
      return;
    }
    setPendingStep(nextStep);
    setShowTransition(true);
  }, [currentStep]);

  const handleStartTransition = useCallback(() => {
    if (pendingStep !== null) {
      setCurrentStep(pendingStep);
      setPendingStep(null);
    }
    setShowTransition(false);
  }, [pendingStep]);

  const handleComplete = useCallback(() => {
    router.push("/subjects");
  }, [router]);

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
  const visualActivity = activities.find((a) => a.type === "visual-counter");
  const matchingActivity = activities.find((a) => a.type === "matching");
  const sequencingActivity = activities.find((a) => a.type === "sequencing");
  const mcActivity = activities.find((a) => a.type === "multiple-choice");

  const transition = TRANSITIONS[currentStep];

  if (showTransition && transition) {
    return (
      <div className="min-h-screen bg-warm-off-white px-4 py-8">
        <div className="mx-auto max-w-content">
          <div className="flex flex-col items-center justify-center py-20">
            <h2 className="mb-6 text-2xl font-bold text-slate-text text-center">{transition.title}</h2>
            <button
              onClick={handleStartTransition}
              className="min-h-[56px] rounded-lg bg-soft-blue px-8 py-3 text-base font-semibold text-white hover:bg-primary transition-opacity duration-200 focus:outline-none focus:ring-2 focus:ring-soft-blue focus:ring-offset-2"
            >
              {transition.button}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-warm-off-white px-4 py-8">
      <div className="mx-auto max-w-content">
        <button
          onClick={() => router.back()}
          className="mb-4 min-h-[56px] text-left text-base text-on-surface-variant hover:text-slate-text focus:outline-none focus:underline"
        >
          &larr; Back
        </button>

        <h1 className="mb-6 text-2xl font-bold text-slate-text">{concept.title}</h1>

        <ProgressBar steps={STEPS} currentStep={currentStep} className="mb-10" />

        {currentStep === 0 && (
          <section aria-label="Observe step">
            <h2 className="mb-4 text-lg font-semibold text-slate-text">Observe</h2>
            <p className="mb-6 text-base text-on-surface-variant">
              Look at the visual below. Count what you see.
            </p>
            {visualActivity && (
              <VisualCounter
                count={visualActivity.config.count as number}
                emoji={visualActivity.config.emoji as string}
                size="lg"
                className="mb-8"
              />
            )}
            <button
              onClick={handleNext}
              className="min-h-[56px] w-full rounded-xl bg-soft-blue px-6 py-3 text-base font-semibold text-white transition-opacity duration-200 hover:bg-primary focus:outline-none focus:ring-2 focus:ring-soft-blue focus:ring-offset-2"
            >
              Continue Lesson
            </button>
          </section>
        )}

        {currentStep === 1 && (
          <section aria-label="Guided Practice step">
            <h2 className="mb-4 text-lg font-semibold text-slate-text">
              Guided Practice
            </h2>
            <p className="mb-6 text-base text-on-surface-variant">
              Match the items below. Hints are available to help you.
            </p>
            {matchingActivity && (
              <div className="mb-8">
                <p className="mb-3 text-sm font-medium text-soft-blue">
                  💡 Hint: Look carefully at each item before matching
                </p>
                <Matching
                  pairs={matchingActivity.config.pairs as Array<{ id: string; itemA: string; itemB: string }>}
                  onMatch={() => {}}
                />
              </div>
            )}
            <button
              onClick={handleNext}
              className="min-h-[56px] w-full rounded-xl bg-soft-blue px-6 py-3 text-base font-semibold text-white transition-opacity duration-200 hover:bg-primary focus:outline-none focus:ring-2 focus:ring-soft-blue focus:ring-offset-2"
            >
              Continue Lesson
            </button>
          </section>
        )}

        {currentStep === 2 && (
          <section aria-label="Independent Practice step">
            <h2 className="mb-4 text-lg font-semibold text-slate-text">
              Independent Practice
            </h2>
            <p className="mb-6 text-base text-on-surface-variant">
              Try this on your own. No hints this time!
            </p>
            {sequencingActivity ? (
              <div className="mb-8">
                <Sequencing
                  items={sequencingActivity.config.items as Array<{ id: string; label: string; emoji?: string }>}
                  correctOrder={sequencingActivity.config.correctOrder as string[]}
                  onComplete={() => {}}
                />
              </div>
            ) : matchingActivity ? (
              <div className="mb-8">
                <Matching
                  pairs={matchingActivity.config.pairs as Array<{ id: string; itemA: string; itemB: string }>}
                  onMatch={() => {}}
                />
              </div>
            ) : null}
            <button
              onClick={handleNext}
              className="min-h-[56px] w-full rounded-xl bg-soft-blue px-6 py-3 text-base font-semibold text-white transition-opacity duration-200 hover:bg-primary focus:outline-none focus:ring-2 focus:ring-soft-blue focus:ring-offset-2"
            >
              Submit Answer
            </button>
          </section>
        )}

        {currentStep === 3 && (
          <section aria-label="Mastery Check step">
            <h2 className="mb-4 text-lg font-semibold text-slate-text">
              Mastery Check
            </h2>
            <p className="mb-6 text-base text-on-surface-variant">
              Show what you've learned!
            </p>
            {mcActivity && (
              <div className="mb-8">
                <MultipleChoice
                  question={mcActivity.config.question as string}
                  options={mcActivity.config.options as Array<{ id: string; label: string; emoji?: string }>}
                  correctIndex={mcActivity.config.correctIndex as number}
                  onSelect={() => {}}
                />
              </div>
            )}
            <button
              onClick={handleNext}
              className="min-h-[56px] w-full rounded-xl bg-soft-blue px-6 py-3 text-base font-semibold text-white transition-opacity duration-200 hover:bg-primary focus:outline-none focus:ring-2 focus:ring-soft-blue focus:ring-offset-2"
            >
              Continue Lesson
            </button>
          </section>
        )}

        {currentStep === 4 && (
          <PositiveCompletion
            message={`Great job completing "${concept.title}"!`}
            emoji={"🎉"}
            onContinue={handleComplete}
          />
        )}
      </div>
    </div>
  );
};

export default Learn;