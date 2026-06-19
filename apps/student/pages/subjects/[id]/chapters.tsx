import type { NextPage } from "next";
import { useRouter } from "next/router";
import { useApi } from "../../../lib/use-api";
import { fetchSubject } from "../../../lib/api";
import type { Subject } from "../../../lib/mockData";
import { COPY, AppShell, Breadcrumb, DataState } from "@learn-easy/ui";

const Chapters: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const subjectId = typeof id === "string" ? id : null;

  const { data: subject, loading, error, refetch } = useApi<Subject | null>(
    () => (subjectId ? fetchSubject(subjectId) : Promise.resolve({ data: null, error: null })),
    [subjectId],
  );

  if (loading || !subjectId) {
    return (
      <AppShell variant="student">
        <DataState status="loading" />
      </AppShell>
    );
  }

  if (!subject || error) {
    return (
      <AppShell variant="student">
        <DataState status="error" onRetry={refetch} title={COPY.errorTitle} body={error ?? COPY.conceptNotFound} />
      </AppShell>
    );
  }

  return (
    <AppShell variant="student">
      <div className="mx-auto max-w-content">
        <button
          onClick={() => router.push("/subjects")}
          className="mb-6 min-h-[56px] text-left text-base text-on-surface-variant hover:text-slate-text focus:outline-none focus:underline"
        >
          &larr; {COPY.backToSubjects}
        </button>
        <Breadcrumb
          items={[
            { label: COPY.subjects, href: "/subjects" },
            { label: subject.title },
          ]}
        />
        <h1 className="mb-2 text-2xl font-bold text-slate-text">
          {subject.emoji} {subject.title}
        </h1>
        <p className="mb-8 text-base text-on-surface-variant">{subject.description}</p>
        <div className="flex flex-col gap-4">
          {subject.chapters.map((chapter) => (
            <button
              key={chapter.id}
              onClick={() => router.push(`/chapters/${chapter.id}/concepts`)}
              className="flex min-h-[88px] flex-col items-start justify-center rounded-xl border-2 border-outline-variant bg-white px-6 py-5 text-left transition-colors hover:border-soft-blue hover:bg-soft-blue/5 focus:outline-none focus:ring-2 focus:ring-soft-blue focus:ring-offset-2"
            >
              <h2 className="text-lg font-bold text-slate-text">{chapter.title}</h2>
              <p className="mt-1 text-sm text-on-surface-variant">{chapter.description}</p>
            </button>
          ))}
        </div>
      </div>
    </AppShell>
  );
};

export default Chapters;
