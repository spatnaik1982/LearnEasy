import type { NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { fetchSubject } from "../../../lib/api";
import type { Subject } from "../../../lib/mockData";

const Chapters: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [subject, setSubject] = useState<Subject | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    fetchSubject(id as string).then((res) => {
      if (res.data) setSubject(res.data);
      setLoading(false);
    });
  }, [id]);

  if (loading || !id) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-warm-off-white">
        <p className="text-lg text-on-surface-variant">Loading chapters...</p>
      </div>
    );
  }

  if (!subject) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-warm-off-white">
        <p className="text-lg text-on-surface-variant">Subject not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-warm-off-white px-4 py-8">
      <div className="mx-auto max-w-content">
        <button
          onClick={() => router.push("/subjects")}
          className="mb-6 min-h-[56px] text-left text-base text-on-surface-variant hover:text-slate-text focus:outline-none focus:underline"
        >
          &larr; Back to subjects
        </button>
        <div className="mb-6 text-sm text-on-surface-variant">
          Subjects &gt; {subject.title}
        </div>
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
    </div>
  );
};

export default Chapters;