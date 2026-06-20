import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import DashboardLayout from "../../lib/dashboard-layout";
import { getStudentInsights } from "../../lib/api";
import { type Insight } from "../../lib/mockData";
import { COPY } from "@learn-easy/ui";

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
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!child) return;
    getStudentInsights(child as string).then((res) => {
      if (res.data) setInsights(res.data);
      setLoading(false);
    });
  }, [child]);

  return (
    <DashboardLayout title="Insights">
      {loading ? (
        <p className="text-lg text-on-surface-variant">{COPY.loadingReports}</p>
      ) : insights.length === 0 ? (
        <div className="rounded-xl border border-outline-variant bg-white p-8 text-center">
          <p className="text-4xl">&#x1F9E0;</p>
          <p className="mt-3 text-lg text-on-surface-variant">
            AI analysis will appear here
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {insights.map((insight, i) => (
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
