import { useRouter } from "next/router";
import { useApi } from "../lib/use-api";
import DashboardLayout from "../lib/dashboard-layout";
import { getStudentProgress, getChildren } from "../lib/api";
import { type ConceptProgress, type Child } from "../lib/mockData";
import { DataState } from "@learn-easy/ui";

const QUICK_LINKS = [
  { href: "/dashboard/progress", label: "View Full Progress" },
  { href: "/dashboard/reports", label: "Weekly Reports" },
  { href: "/dashboard/insights", label: "AI Insights" },
];

export default function DashboardPage() {
  const router = useRouter();
  const { child } = router.query;

  const { data: childrenList } = useApi<Child[]>(
    () => getChildren("parent-1"),
    [],
  );

  const {
    data: progress,
    loading,
    error,
    refetch,
  } = useApi<ConceptProgress[]>(
    () =>
      child
        ? getStudentProgress(child as string)
        : Promise.resolve({ data: null as ConceptProgress[] | null, error: null }),
    [child],
  );

  const selectedChildData = childrenList?.find((c) => c.id === child);
  const childName = selectedChildData?.name || "your child";

  const mastered = progress?.filter((p) => p.completed).length || 0;
  const total = progress?.length || 0;
  const avgMastery =
    progress && progress.length > 0
      ? Math.round(
          progress.reduce((s, p) => s + p.mastery, 0) / progress.length,
        )
      : 0;
  const streakDays = 0; // TODO: compute from activity timestamps when API provides it

  const lowestConcept =
    progress && progress.length > 0
      ? [...progress].sort((a, b) => a.mastery - b.mastery)[0]
      : null;

  const headline =
    mastered > 0
      ? `${childName} completed ${mastered} concepts and is on track for Level A.`
      : lowestConcept
        ? `${childName} needs help with ${lowestConcept.conceptName} — try a 5-minute practice together.`
        : `Welcome to LearnEasy! Track ${childName.toLowerCase()}'s progress here.`;

  const recent = progress
    ? [...progress]
        .sort(
          (a, b) =>
            new Date(b.lastActivity).getTime() -
            new Date(a.lastActivity).getTime(),
        )
        .slice(0, 5)
    : [];

  const getOutcomeIcon = (item: ConceptProgress) => {
    if (item.completed) return "\u2705";
    if (item.mastery > 0) return "\u21BB";
    return "\u2795";
  };

  return (
    <DashboardLayout title="Overview">
      {loading ? (
        <DataState status="loading" />
      ) : error ? (
        <DataState status="error" onRetry={refetch} />
      ) : (
        <div className="space-y-8">
          {/* Headline — always one sentence */}
          <p className="text-lg font-semibold text-slate-text">{headline}</p>

          {/* 3 stat cards */}
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard
              label="Concepts Mastered"
              value={mastered}
              sub={`out of ${total}`}
            />
            <StatCard
              label="Average Mastery"
              value={`${avgMastery}%`}
              sub="across all concepts"
            />
            {streakDays > 0 && (
              <StatCard
                label="Current Streak"
                value={`${streakDays} days`}
              />
            )}
          </div>

          {/* This week panel */}
          <section>
            <h3 className="mb-3 text-lg font-semibold text-slate-text">
              This week
            </h3>
            <div className="overflow-hidden rounded-xl border border-outline-variant bg-white">
              {recent.length === 0 ? (
                <DataState
                  status="empty"
                  title="No recent activity"
                  body="Start a lesson with your child to see progress here."
                />
              ) : (
                <ul className="divide-y divide-slate-100">
                  {recent.map((item) => (
                    <li
                      key={item.conceptName}
                      className="flex items-center justify-between px-4 py-3"
                    >
                      <span className="text-sm font-medium text-slate-text">
                        {item.conceptName}
                      </span>
                      <span
                        className="text-sm"
                        aria-label={
                          item.completed ? "completed" : "in progress"
                        }
                      >
                        {getOutcomeIcon(item)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>

          {/* Next step for you */}
          <section className="rounded-xl border border-outline-variant bg-white p-6">
            <h3 className="mb-2 text-lg font-semibold text-slate-text">
              Next step for you
            </h3>
            <p className="mb-4 text-sm text-on-surface-variant">
              {lowestConcept
                ? `${childName} is working on ${lowestConcept.conceptName}. A short daily practice session can help build confidence.`
                : "Set up a daily lesson time for your child to build a learning routine."}
            </p>
            <button
              onClick={() =>
                router.push(`/dashboard/reports?child=${child}`)
              }
              className="min-h-[56px] rounded-lg bg-soft-blue px-6 py-3 text-sm font-semibold text-white hover:bg-primary motion-safe:transition-colors motion-safe:duration-200 focus:outline-none focus:ring-2 focus:ring-soft-blue focus:ring-offset-2"
            >
              {lowestConcept
                ? "View Practice Recommendations"
                : "Set Up Schedule"}
            </button>
          </section>

          {/* Quick Links — text links at the bottom */}
          <div className="flex flex-wrap gap-4">
            {QUICK_LINKS.map((link) => (
              <button
                key={link.href}
                onClick={() => router.push(`${link.href}?child=${child}`)}
                className="text-sm font-medium text-soft-blue underline hover:text-soft-blue/80 focus:outline-none focus:ring-2 focus:ring-soft-blue rounded"
              >
                {link.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

function StatCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string | number;
  sub?: string;
}) {
  return (
    <div className="rounded-xl border border-outline-variant bg-white p-4">
      <p className="text-sm font-medium text-on-surface-variant">{label}</p>
      <p className="mt-1 text-3xl font-bold text-slate-text">{value}</p>
      {sub && <p className="mt-1 text-xs text-on-surface-variant">{sub}</p>}
    </div>
  );
}
