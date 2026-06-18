import type { NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { fetchChapter, fetchSubject } from "../../../lib/api";
import type { Chapter, Subject } from "../../../lib/mockData";

const Concepts: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [subject, setSubject] = useState<Subject | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const chapterId = id as string;

    fetchChapter(chapterId, "").then((res) => {
      if (res.data) setChapter(res.data as unknown as Chapter);
    });
    fetchSubject(chapterId).then((res) => {
      if (res.data) {
        const foundChapter = res.data.chapters.find((c) => c.id === chapterId);
        if (foundChapter) setChapter(foundChapter);
        setSubject(res.data);
      }
      setLoading(false);
    });
  }, [id]);

  if (loading || !id) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-warm-off-white">
        <p className="text-lg text-on-surface-variant">Loading concepts...</p>
      </div>
    );
  }

  if (!chapter) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-warm-off-white">
        <p className="text-lg text-on-surface-variant">Chapter not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-warm-off-white px-4 py-8">
      <div className="mx-auto max-w-content">
        <button
          onClick={() =>
            router.push(
              subject ? `/subjects/${subject.id}/chapters` : "/subjects",
            )
          }
          className="mb-6 min-h-[56px] text-left text-base text-on-surface-variant hover:text-slate-text focus:outline-none focus:underline"
        >
          &larr; Back to chapters
        </button>
        <div className="mb-6 text-sm text-on-surface-variant">
          {subject ? `${subject.title} > ` : ""}{chapter.title}
        </div>
        <h1 className="mb-2 text-2xl font-bold text-slate-text">
          {chapter.title}
        </h1>
        <p className="mb-8 text-base text-on-surface-variant">{chapter.description}</p>
        <div className="flex flex-col gap-4">
          {chapter.concepts.map((concept, index) => (
            <button
              key={concept.id}
              onClick={() => router.push(`/learn/${concept.id}`)}
              className="flex min-h-[88px] flex-col items-start justify-center rounded-xl border-2 border-outline-variant bg-white px-6 py-5 text-left transition-colors hover:border-soft-blue hover:bg-soft-blue/5 focus:outline-none focus:ring-2 focus:ring-soft-blue focus:ring-offset-2"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-outline-variant text-xs font-bold text-on-surface-variant">
                  {index + 1}
                </span>
                <h2 className="text-lg font-bold text-slate-text">{concept.title}</h2>
              </div>
              <p className="mt-1 text-sm text-on-surface-variant ml-9">{concept.description}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Concepts;