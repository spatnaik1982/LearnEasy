import { useRouter } from "next/router";
import DashboardLayout from "../../lib/dashboard-layout";
import { getStudentInsights } from "../../lib/api";
import { type Insight } from "../../lib/mockData";
import { COPY, DataState } from "@learn-easy/ui";
import { useApi } from "../../lib/use-api";

const ICON_MAP: Record<Insight["category"], string> = {
  strength: "\u2B50",
  "area-for-growth": "\uD83C\uDFAF",
  suggestion: "\uD83D\uDCA1",
};

const LABEL_MAP: Record<Insight["category"], string> = {
  strength: "Strength",
  "area-for-growth": "Area for Growth",
  suggestion: "Suggestion",
};

const BORDER_COLORS: Record<Insight["category"], string> = {
  strength: "#8FB996",
  "area-for-growth": "#EBC06D",
  suggestion: "#5D87B1",
};

export default function InsightsPage() {
  const router = useRouter();
  const { child } = router.query;
  const childId = typeof child === "string" ? child : null;

  const { data: insights, loading, error, refetch } = useApi<Insight[]>(
    () =>
      childId
        ? getStudentInsights(childId)
        : Promise.resolve({ data: null, error: null }),
    [childId],
  );

  const insightList = insights ?? [];

  return (
    <DashboardLayout title="Insights">
      {loading ? (
        <DataState status="loading" />
      ) : error ? (
        <DataState status="error" onRetry={refetch} title={COPY.errorTitle} body={COPY.errorBody} />
      ) : insightList.length === 0 ? (
        <DataState
          status="empty"
          title="No insights yet"
          body="We're still learning your child's patterns. Check back in a few days."
        />
      ) : (
        <div className="space-y-4">
          {insightList.map((insight, i) => (
            <div
              key={i}
              className="rounded-xl border border-outline-variant bg-white p-5 shadow-sm"
              style={{ borderLeft: `4px solid ${BORDER_COLORS[insight.category]}` }}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl" aria-hidden="true">
                  {ICON_MAP[insight.category]}
                </span>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-on-surface-variant">
                    {LABEL_MAP[insight.category]}
                  </p>
                  <p className="mt-1 text-base text-slate-text">{insight.text}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
