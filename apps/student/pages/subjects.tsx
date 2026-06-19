import type { NextPage } from "next";
import { useRouter } from "next/router";
import { fetchSubjects } from "../lib/api";
import type { Subject } from "../lib/mockData";
import { COPY, AppShell, Breadcrumb, DataState } from "@learn-easy/ui";
import { useApi } from "../lib/use-api";

const Subjects: NextPage = () => {
  const router = useRouter();
  const { data: subjects, loading } = useApi<Subject[]>(
    () => fetchSubjects(),
    [],
  );

  if (loading) {
    return (
      <AppShell variant="student">
        <DataState status="loading" />
      </AppShell>
    );
  }

  const subjectList = subjects ?? [];

  return (
    <AppShell variant="student">
      <div className="mx-auto max-w-content">
        <Breadcrumb items={[{ label: COPY.chooseSubject }]} />
        <h1 className="mb-2 text-center text-2xl font-bold text-slate-text">
          {COPY.chooseSubject}
        </h1>
        <p className="mb-8 text-center text-base text-on-surface-variant">
          {COPY.selectSubject}
        </p>
        {subjectList.length === 0 ? (
          <DataState
            status="empty"
            title={COPY.noSubjectsYet}
            body="Ask your parent to add a subject for you."
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {subjectList.map((subject) => (
              <button
                key={subject.id}
                onClick={() => router.push(`/subjects/${subject.id}/chapters`)}
                className="flex min-h-[160px] flex-col items-center justify-center rounded-xl border-2 border-outline-variant bg-white p-8 text-left transition-colors hover:border-soft-blue hover:bg-soft-blue/5 focus:outline-none focus:ring-2 focus:ring-soft-blue focus:ring-offset-2"
              >
                <span className="mb-4 text-5xl" aria-hidden="true">
                  {subject.emoji}
                </span>
                <h2 className="text-lg font-bold text-slate-text">{subject.title}</h2>
                <p className="mt-2 text-sm text-on-surface-variant">{subject.description}</p>
              </button>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
};

export default Subjects;
