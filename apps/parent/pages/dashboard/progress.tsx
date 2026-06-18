import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import DashboardLayout from "../../lib/dashboard-layout";
import { getStudentProgress } from "../../lib/api";
import { type ConceptProgress } from "../../lib/mockData";

export default function ProgressPage() {
  const router = useRouter();
  const { child } = router.query;
  const [data, setData] = useState<ConceptProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeChapter, setActiveChapter] = useState<string>("All");

  useEffect(() => {
    if (!child) return;
    setLoading(true);
    getStudentProgress(child as string).then((res) => {
      if (res.data) setData(res.data);
      setLoading(false);
    });
  }, [child]);

  const chapters = ["All", ...new Set(data.map((c) => c.chapter))];

  const filtered =
    activeChapter === "All"
      ? data
      : data.filter((c) => c.chapter === activeChapter);

  return (
    <DashboardLayout title="Progress">
      {loading ? (
        <p className="text-lg text-on-surface-variant">Loading progress...</p>
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

          <div className="space-y-4">
            {filtered.map((concept, i) => (
              <ProgressRow key={i} concept={concept} />
            ))}
          </div>
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