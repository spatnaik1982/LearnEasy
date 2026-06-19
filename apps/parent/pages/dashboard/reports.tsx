import { useRouter } from "next/router";
import DashboardLayout from "../../lib/dashboard-layout";
import { getStudentReports } from "../../lib/api";
import { type WeeklyReport } from "../../lib/mockData";
import { COPY, DataState } from "@learn-easy/ui";
import { useApi } from "../../lib/use-api";

export default function ReportsPage() {
  const router = useRouter();
  const { child } = router.query;
  const childId = typeof child === "string" ? child : null;

  const { data: report, loading, error, refetch } = useApi<WeeklyReport | null>(
    () =>
      childId
        ? getStudentReports(childId)
        : Promise.resolve({ data: null, error: null }),
    [childId],
  );

  return (
    <DashboardLayout title="Reports">
      {loading ? (
        <DataState status="loading" />
      ) : error ? (
        <DataState status="error" onRetry={refetch} title={COPY.errorTitle} body={COPY.errorBody} />
      ) : report ? (
        <>
          <div className="mb-6 grid grid-cols-2 gap-4">
            <div className="rounded-xl border border-outline-variant bg-white p-4">
              <p className="text-sm font-medium text-on-surface-variant">This week</p>
              <p className="mt-1 text-3xl font-bold text-slate-text">
                {report.dailyActivity.reduce((a, b) => a + b, 0)} activities
              </p>
              <p className="mt-1 text-xs text-on-surface-variant">
                Total: {report.totalTimeMinutes} min
              </p>
            </div>
            <div className="rounded-xl border border-outline-variant bg-white p-4">
              <p className="text-sm font-medium text-on-surface-variant">Last week</p>
              <p className="mt-1 text-3xl font-bold text-on-surface-variant">
                -- activities
              </p>
              <p className="mt-1 text-xs text-on-surface-variant">
                Total: -- min
              </p>
            </div>
          </div>

          <h2 className="mb-3 text-lg font-semibold text-slate-text">
            Daily Activity
          </h2>

          <div className="rounded-xl border border-outline-variant bg-white p-6">
            <div className="flex items-end gap-3" style={{ height: 180 }}>
              {report.dailyActivity.map((value, i) => {
                const maxVal = Math.max(...report.dailyActivity, 1);
                const heightPct = (value / maxVal) * 100;
                return (
                  <div key={i} className="flex flex-1 flex-col items-center gap-2">
                    <span className="text-xs font-medium text-on-surface-variant">
                      {value}
                    </span>
                    <div
                      className="w-full rounded-md bg-soft-blue transition-all duration-200"
                      style={{ height: `${heightPct}%`, minHeight: value > 0 ? 4 : 0 }}
                      role="img"
                      aria-label={`${report.days[i]}: ${value} activities`}
                    />
                    <span className="text-xs text-on-surface-variant">{report.days[i]}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      ) : (
        <DataState
          status="empty"
          title="No reports yet"
          body="Weekly reports will appear here after a few days of activity."
        />
      )}
    </DashboardLayout>
  );
}
