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
        <p className="text-lg text-slate-500">Loading progress...</p>
      ) : (
        <>
          <div className="mb-6 flex flex-wrap gap-2" role="tablist" aria-label="Filter by chapter">
            {chapters.map((ch) => (
              <button
                key={ch}
                role="tab"
                aria-selected={activeChapter === ch}
                onClick={() => setActiveChapter(ch)}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-400 ${
                  activeChapter === ch
                    ? "bg-indigo-100 text-indigo-700"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {ch}
              </button>
            ))}
          </div>

          <div className="space-y-3">
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
    ? "bg-emerald-500"
    : concept.mastery > 0
      ? "bg-amber-500"
      : "bg-slate-300";

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-base font-semibold text-slate-800">{concept.conceptName}</p>
        <span
          className={`rounded-full px-3 py-0.5 text-xs font-medium ${
            concept.completed
              ? "bg-emerald-100 text-emerald-700"
              : concept.mastery > 0
                ? "bg-amber-100 text-amber-700"
                : "bg-slate-100 text-slate-500"
          }`}
        >
          {statusLabel}
        </span>
      </div>

      <div className="mt-3 flex items-center gap-3">
        <div className="flex-1 overflow-hidden rounded-full bg-slate-100" role="progressbar" aria-valuenow={concept.mastery} aria-label={`${concept.conceptName} mastery`}>
          <div
            className={`h-3 rounded-full transition-all duration-500 ${barColor}`}
            style={{ width: `${concept.mastery}%` }}
          />
        </div>
        <span className="w-10 text-right text-sm font-medium text-slate-600">
          {concept.mastery}%
        </span>
      </div>
    </div>
  );
}