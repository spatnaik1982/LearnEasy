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
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-lg text-slate-500">Loading concepts...</p>
      </div>
    );
  }

  if (!chapter) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-lg text-slate-500">Chapter not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="mx-auto max-w-3xl">
        <button
          onClick={() =>
            router.push(
              subject ? `/subjects/${subject.id}/chapters` : "/subjects",
            )
          }
          className="mb-6 min-h-[44px] text-left text-base text-slate-500 hover:text-slate-700 focus:outline-none focus:underline"
        >
          &larr; Back to chapters
        </button>
        <h1 className="mb-2 text-2xl font-bold text-slate-800">
          {chapter.title}
        </h1>
        <p className="mb-8 text-base text-slate-500">{chapter.description}</p>
        <div className="flex flex-col gap-4">
          {chapter.concepts.map((concept) => (
            <button
              key={concept.id}
              onClick={() => router.push(`/learn/${concept.id}`)}
              className="flex min-h-[88px] flex-col items-start justify-center rounded-xl border-2 border-slate-200 bg-white px-6 py-5 text-left transition-colors hover:border-slate-300 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <h2 className="text-lg font-bold text-slate-800">{concept.title}</h2>
              <p className="mt-1 text-sm text-slate-500">{concept.description}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Concepts;