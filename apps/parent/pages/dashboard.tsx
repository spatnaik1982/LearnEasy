import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import DashboardLayout from "../lib/dashboard-layout";
import { getStudentProgress } from "../lib/api";
import { type ConceptProgress } from "../lib/mockData";

export default function DashboardPage() {
  const router = useRouter();
  const { child } = router.query;
  const [progress, setProgress] = useState<ConceptProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!child) return;
    setLoading(true);
    getStudentProgress(child as string).then((res) => {
      if (res.data) setProgress(res.data);
      setLoading(false);
    });
  }, [child]);

  const mastered = progress.filter((p) => p.completed).length;
  const totalActivities = progress.length;
  const avgMastery = progress.length > 0
    ? Math.round(progress.reduce((s, p) => s + p.mastery, 0) / progress.length)
    : 0;

  const recent = [...progress]
    .sort((a, b) => new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime())
    .slice(0, 5);

  const QUICK_LINKS = [
    { href: "/dashboard/progress", label: "View Full Progress", desc: "See all concepts and mastery levels" },
    { href: "/dashboard/reports", label: "Weekly Reports", desc: "Daily activity and time spent" },
    { href: "/dashboard/insights", label: "AI Insights", desc: "Personalized learning observations" },
  ];

  return (
    <DashboardLayout title="Overview">
      {loading ? (
        <p className="text-lg text-slate-400">Loading dashboard...</p>
      ) : (
        <div className="space-y-8">
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard label="Concepts Mastered" value={mastered} sub={`out of ${totalActivities}`} />
            <StatCard label="Average Mastery" value={`${avgMastery}%`} sub="across all concepts" />
            <StatCard label="Current Streak" value="3 days" sub="keep it going!" />
          </div>

          <section>
            <h3 className="mb-3 text-lg font-semibold text-slate-700">Recent Activity</h3>
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
              {recent.length === 0 ? (
                <p className="p-4 text-slate-400">No recent activity</p>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {recent.map((item) => (
                    <li key={item.conceptName} className="flex items-center justify-between px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span
                          className={`inline-block h-2 w-2 rounded-full ${
                            item.completed ? "bg-emerald-400" : "bg-amber-400"
                          }`}
                        />
                        <span className="text-sm font-medium text-slate-700">{item.conceptName}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-slate-400">{item.mastery}%</span>
                        <span className="text-xs text-slate-400">{item.lastActivity}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>

          <section>
            <h3 className="mb-3 text-lg font-semibold text-slate-700">Quick Links</h3>
            <div className="grid gap-3 sm:grid-cols-3">
              {QUICK_LINKS.map((link) => (
                <button
                  key={link.href}
                  onClick={() => router.push(`${link.href}?child=${child}`)}
                  className="rounded-xl border border-slate-200 bg-white p-4 text-left transition-colors hover:border-indigo-200 hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                >
                  <h4 className="font-semibold text-indigo-600">{link.label}</h4>
                  <p className="mt-1 text-sm text-slate-500">{link.desc}</p>
                </button>
              ))}
            </div>
          </section>
        </div>
      )}
    </DashboardLayout>
  );
}

function StatCard({ label, value, sub }: { label: string; value: string | number; sub: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-1 text-3xl font-bold text-slate-800">{value}</p>
      <p className="mt-1 text-xs text-slate-400">{sub}</p>
    </div>
  );
}