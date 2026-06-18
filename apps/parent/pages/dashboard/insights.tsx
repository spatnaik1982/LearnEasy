import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import DashboardLayout from "../../lib/dashboard-layout";
import { getStudentInsights } from "../../lib/api";
import { type Insight } from "../../lib/mockData";

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

const BORDER_MAP: Record<Insight["category"], string> = {
  strength: "border-emerald-300",
  "area-for-growth": "border-amber-300",
  suggestion: "border-indigo-300",
};

export default function InsightsPage() {
  const router = useRouter();
  const { child } = router.query;
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!child) return;
    setLoading(true);
    getStudentInsights(child as string).then((res) => {
      if (res.data) setInsights(res.data);
      setLoading(false);
    });
  }, [child]);

  return (
    <DashboardLayout title="Insights">
      {loading ? (
        <p className="text-lg text-slate-500">Loading insights...</p>
      ) : insights.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
          <p className="text-4xl">&#x1F9E0;</p>
          <p className="mt-3 text-lg text-slate-500">
            AI analysis will appear here
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {insights.map((insight, i) => (
            <div
              key={i}
              className={`rounded-xl border-l-4 bg-white p-5 shadow-sm ${BORDER_MAP[insight.category]}`}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl" aria-hidden="true">
                  {ICON_MAP[insight.category]}
                </span>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {LABEL_MAP[insight.category]}
                  </p>
                  <p className="mt-1 text-base text-slate-700">{insight.text}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}