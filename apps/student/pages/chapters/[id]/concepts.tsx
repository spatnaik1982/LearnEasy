import type { NextPage } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import { useApi } from "../../../lib/use-api";
import { fetchConcepts } from "../../../lib/api";
import type { Concept } from "../../../lib/mockData";
import {
  COPY,
  AppShell,
  Breadcrumb,
  DataState,
  MasteryChip,
} from "@learn-easy/ui";
import type { MasteryState } from "@learn-easy/ui";

const Concepts: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const chapterId = typeof id === "string" ? id : null;

  const { data: conceptList, loading, error, refetch } = useApi<Concept[]>(
    () => (chapterId ? fetchConcepts("", chapterId) : Promise.resolve({ data: null, error: null })),
    [chapterId],
  );

  function masteryToState(mastery?: number): MasteryState {
    if (!mastery) return "not-started";
    if (mastery >= 100) return "mastered";
    return "in-progress";
  }

  if (loading || !chapterId) {
    return (
      <AppShell variant="student">
        <DataState status="loading" />
      </AppShell>
    );
  }

  if (error) {
    return (
      <AppShell variant="student">
        <DataState status="error" onRetry={refetch} title={COPY.errorTitle} body={error} />
      </AppShell>
    );
  }

  const conceptListData = conceptList ?? [];
  const firstUnmasteredIndex = conceptListData.findIndex(c => !c.mastery || c.mastery < 100);

  return (
    <AppShell variant="student">
      <div className="mx-auto max-w-content">
        {/* TODO: fetch subject/chapter names dynamically in follow-up */}
        <Breadcrumb
          items={[
            { label: COPY.subjects, href: "/subjects" },
            { label: COPY.progress, href: "#" },
            { label: COPY.concepts },
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
        {firstUnmasteredIndex > 0 && (
          <Link
            href={`/learn/${conceptListData[firstUnmasteredIndex].id}`}
            className="mb-4 block rounded-lg border border-soft-amber bg-soft-amber/5 px-4 py-3 text-sm font-medium text-slate-text hover:bg-soft-amber/10 motion-safe:transition-colors motion-safe:duration-150"
          >
            {COPY.nextUp.replace("{title}", conceptListData[firstUnmasteredIndex].title)}
          </Link>
        )}
        {conceptListData.length === 0 ? (
          <DataState status="empty" title={COPY.noConcepts} body="Check back later or ask your parent to add concepts." />
        ) : (
          <div className="flex flex-col gap-4">
            {conceptListData.map((concept) => (
              <button
                key={concept.id}
                onClick={() => router.push(`/learn/${concept.id}`)}
                className="flex min-h-[88px] flex-col items-start justify-center rounded-xl border-2 border-outline-variant bg-white px-6 py-5 text-left transition-colors hover:border-soft-blue hover:bg-soft-blue/5 focus:outline-none focus:ring-2 focus:ring-soft-blue focus:ring-offset-2"
              >
                <div className="flex items-center gap-3">
                  <MasteryChip state={masteryToState(concept.mastery)} />
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
