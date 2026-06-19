import { useState } from "react";
import { useRouter } from "next/router";
import DashboardLayout from "../../lib/dashboard-layout";
import { getStudentProgress } from "../../lib/api";
import { type ConceptProgress } from "../../lib/mockData";
import { COPY, DataState } from "@learn-easy/ui";
import { useApi } from "../../lib/use-api";

export default function ProgressPage() {
  const router = useRouter();
  const { child } = router.query;
  const childId = typeof child === "string" ? child : null;
  const [activeChapter, setActiveChapter] = useState<string>("All");

  const { data, loading, error, refetch } = useApi<ConceptProgress[]>(
    () =>
      childId
        ? getStudentProgress(childId)
        : Promise.resolve({ data: null, error: null }),
    [childId],
  );

  const progressList = data ?? [];
  const chapters = ["All", ...new Set(progressList.map((c) => c.chapter))];

  const filtered =
    activeChapter === "All"
      ? progressList
      : progressList.filter((c) => c.chapter === activeChapter);

  return (
    <DashboardLayout title="Progress">
      {loading ? (
        <DataState status="loading" />
      ) : error ? (
        <DataState status="error" onRetry={refetch} title={COPY.errorTitle} body={COPY.errorBody} />
      ) : (
        <>
          <div className="mb-6 flex flex-wrap gap-2" role="tablist" aria-label="Filter by chapter">
            {chapters.map((ch) => (
              <button
                key={ch}
                role="tab"
                aria-selected={activeChapter === ch}
                onClick={() => setActiveChapter(ch)}
                className={`min-h-[56px] rounded-lg px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-soft-blue ${
                  activeChapter === ch
                    ? "bg-soft-blue/10 text-soft-blue"
                    : "bg-outline-variant/30 text-on-surface-variant hover:bg-outline-variant/50"
                }`}
              >
                {ch}
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <DataState
              status="empty"
              title="No progress yet"
              body="Start a lesson with your child to see progress here."
            />
          ) : (
            <div className="space-y-4">
              {filtered.map((concept, i) => (
                <ProgressRow key={i} concept={concept} />
              ))}
            </div>
          )}
        </>
      )}
    </DashboardLayout>
  );
}

function ProgressRow({ concept }: { concept: ConceptProgress }) {
  const statusLabel = concept.completed
    ? "Completed"
    : concept.mastery > 0
      ? "In Progress"
      : "Not Started";

  const barColor = concept.completed
    ? "bg-muted-green"
    : concept.mastery > 0
      ? "bg-soft-amber"
      : "bg-outline-variant";

  return (
    <div className="min-h-[56px] rounded-xl border border-outline-variant bg-white p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-base font-semibold text-slate-text">{concept.conceptName}</p>
        <span
          className={`rounded-full px-3 py-0.5 text-xs font-medium ${
            concept.completed
              ? "bg-muted-green/10 text-muted-green"
              : concept.mastery > 0
                ? "bg-soft-amber/10 text-soft-amber"
                : "bg-outline-variant/30 text-on-surface-variant"
          }`}
        >
          {statusLabel}
        </span>
      </div>

      <div className="mt-3 flex items-center gap-3">
        <div className="flex-1 overflow-hidden rounded-full bg-outline-variant/30" role="progressbar" aria-valuenow={concept.mastery} aria-label={`${concept.conceptName} mastery`}>
          <div
            className={`h-3 rounded-full transition-all duration-200 ${barColor}`}
            style={{ width: `${concept.mastery}%` }}
          />
        </div>
        <span className="w-10 text-right text-sm font-medium text-on-surface-variant">
          {concept.mastery}%
        </span>
      </div>
    </div>
  );
}
