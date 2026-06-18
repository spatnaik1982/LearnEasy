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

const Learn: NextPage = () => {
  const router = useRouter();
  const { conceptId } = router.query;
  const [concept, setConcept] = useState<Concept | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);

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
    setCurrentStep((s) => Math.min(s + 1, STEPS.length - 1));
  }, []);

  const handleComplete = useCallback(() => {
    router.push("/subjects");
  }, [router]);

  if (loading || !conceptId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-lg text-slate-500">Loading lesson...</p>
      </div>
    );
  }

  if (!concept) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-lg text-slate-500">Concept not found</p>
      </div>
    );
  }

  const activities = concept.activities;
  const visualActivity = activities.find((a) => a.type === "visual-counter");
  const matchingActivity = activities.find((a) => a.type === "matching");
  const sequencingActivity = activities.find((a) => a.type === "sequencing");
  const mcActivity = activities.find((a) => a.type === "multiple-choice");

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="mx-auto max-w-2xl">
        <button
          onClick={() => router.back()}
          className="mb-4 min-h-[44px] text-left text-base text-slate-500 hover:text-slate-700 focus:outline-none focus:underline"
        >
          &larr; Back
        </button>

        <h1 className="mb-6 text-2xl font-bold text-slate-800">{concept.title}</h1>

        <ProgressBar steps={STEPS} currentStep={currentStep} className="mb-10" />

        {currentStep === 0 && (
          <section aria-label="Observe step">
            <h2 className="mb-4 text-lg font-semibold text-slate-700">Observe</h2>
            <p className="mb-6 text-base text-slate-500">
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
              className="min-h-[52px] w-full rounded-xl bg-blue-600 px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              I'm ready to practice
            </button>
          </section>
        )}

        {currentStep === 1 && (
          <section aria-label="Guided Practice step">
            <h2 className="mb-4 text-lg font-semibold text-slate-700">
              Guided Practice
            </h2>
            <p className="mb-6 text-base text-slate-500">
              Match the items below. Hints are available to help you.
            </p>
            {matchingActivity && (
              <div className="mb-8">
                <p className="mb-3 text-sm font-medium text-blue-600">
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
              className="min-h-[52px] w-full rounded-xl bg-blue-600 px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              I'm ready for independent practice
            </button>
          </section>
        )}

        {currentStep === 2 && (
          <section aria-label="Independent Practice step">
            <h2 className="mb-4 text-lg font-semibold text-slate-700">
              Independent Practice
            </h2>
            <p className="mb-6 text-base text-slate-500">
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
              className="min-h-[52px] w-full rounded-xl bg-blue-600 px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Check my understanding
            </button>
          </section>
        )}

        {currentStep === 3 && (
          <section aria-label="Mastery Check step">
            <h2 className="mb-4 text-lg font-semibold text-slate-700">
              Mastery Check
            </h2>
            <p className="mb-6 text-base text-slate-500">
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
              className="min-h-[52px] w-full rounded-xl bg-blue-600 px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Finish
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