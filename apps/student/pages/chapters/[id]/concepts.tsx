import type { NextPage } from "next";
import { useRouter } from "next/router";
import { fetchConcepts } from "../../../lib/api";
import type { Concept } from "../../../lib/mockData";
import { COPY, AppShell, Breadcrumb, MasteryChip, DataState } from "@learn-easy/ui";
import { useApi } from "../../../lib/use-api";

const Concepts: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const chapterId = typeof id === "string" ? id : null;

  const { data: concepts, loading } = useApi<Concept[]>(
    () =>
      chapterId
        ? fetchConcepts("", chapterId)
        : Promise.resolve({ data: null, error: null }),
    [chapterId],
  );

  if (loading || !chapterId) {
    return (
      <AppShell variant="student">
        <DataState status="loading" />
      </AppShell>
    );
  }

  const conceptList = concepts ?? [];

  return (
    <AppShell variant="student">
      <div className="mx-auto max-w-content">
        {/* TODO: fetch subject/chapter names dynamically in follow-up */}
        <Breadcrumb
          items={[
            { label: "Subjects", href: "/subjects" },
            { label: "Progress", href: "#" },
            { label: "Concepts" },
          ]}
        />
        <button
          onClick={() => router.back()}
          className="mb-6 min-h-[56px] text-left text-base text-on-surface-variant hover:text-slate-text focus:outline-none focus:underline"
        >
          &larr; {COPY.backToChapters}
        </button>
        <h1 className="mb-2 text-2xl font-bold text-slate-text">
          {COPY.chooseConcept}
        </h1>
        <p className="mb-8 text-base text-on-surface-variant">{COPY.selectConcept}</p>
        {conceptList.length === 0 ? (
          <DataState
            status="empty"
            title={COPY.noConcepts}
            body="Check back later or ask your parent to add concepts."
          />
        ) : (
          <div className="flex flex-col gap-4">
            {conceptList.map((concept) => (
              <button
                key={concept.id}
                onClick={() => router.push(`/learn/${concept.id}`)}
                className="flex min-h-[88px] flex-col items-start justify-center rounded-xl border-2 border-outline-variant bg-white px-6 py-5 text-left transition-colors hover:border-soft-blue hover:bg-soft-blue/5 focus:outline-none focus:ring-2 focus:ring-soft-blue focus:ring-offset-2"
              >
                <div className="flex items-center gap-3">
                  <MasteryChip state="not-started" />
                  <h2 className="text-lg font-bold text-slate-text">{concept.title}</h2>
                </div>
                <p className="mt-1 text-sm text-on-surface-variant ml-9">{concept.description}</p>
              </button>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
};

export default Concepts;
