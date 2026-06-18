import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import DashboardLayout from "../../lib/dashboard-layout";
import { getStudentReports } from "../../lib/api";
import { type WeeklyReport } from "../../lib/mockData";

export default function ReportsPage() {
  const router = useRouter();
  const { child } = router.query;
  const [report, setReport] = useState<WeeklyReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!child) return;
    setLoading(true);
    getStudentReports(child as string).then((res) => {
      if (res.data) setReport(res.data);
      setLoading(false);
    });
  }, [child]);

  return (
    <DashboardLayout title="Reports">
      {loading ? (
        <p className="text-lg text-slate-500">Loading reports...</p>
      ) : report ? (
        <>
          <div className="mb-6 grid grid-cols-2 gap-4">
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-sm font-medium text-slate-500">This week</p>
              <p className="mt-1 text-3xl font-bold text-slate-800">
                {report.dailyActivity.reduce((a, b) => a + b, 0)} activities
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Total: {report.totalTimeMinutes} min
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-sm font-medium text-slate-500">Last week</p>
              <p className="mt-1 text-3xl font-bold text-slate-400">
                -- activities
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Total: -- min
              </p>
            </div>
          </div>

          <h2 className="mb-3 text-lg font-semibold text-slate-700">
            Daily Activity
          </h2>

          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <div className="flex items-end gap-3" style={{ height: 180 }}>
              {report.dailyActivity.map((value, i) => {
                const maxVal = Math.max(...report.dailyActivity, 1);
                const heightPct = (value / maxVal) * 100;
                return (
                  <div key={i} className="flex flex-1 flex-col items-center gap-2">
                    <span className="text-xs font-medium text-slate-500">
                      {value}
                    </span>
                    <div
                      className="w-full rounded-md bg-indigo-400 transition-all duration-500"
                      style={{ height: `${heightPct}%`, minHeight: value > 0 ? 4 : 0 }}
                      role="img"
                      aria-label={`${report.days[i]}: ${value} activities`}
                    />
                    <span className="text-xs text-slate-500">{report.days[i]}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      ) : null}
    </DashboardLayout>
  );
}