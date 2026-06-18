import type { NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { fetchSubjects } from "../lib/api";
import type { Subject } from "../lib/mockData";

const Subjects: NextPage = () => {
  const router = useRouter();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubjects().then((res) => {
      if (res.data) setSubjects(res.data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-lg text-slate-500">Loading subjects...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-2 text-center text-2xl font-bold text-slate-800">
          Choose a Subject
        </h1>
        <p className="mb-8 text-center text-base text-slate-500">
          Select a subject to start learning
        </p>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {subjects.map((subject) => (
            <button
              key={subject.id}
              onClick={() => router.push(`/subjects/${subject.id}/chapters`)}
              className="flex min-h-[160px] flex-col items-center justify-center rounded-xl border-2 border-slate-200 bg-white p-8 text-center transition-colors hover:border-slate-300 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <span className="mb-4 text-5xl" aria-hidden="true">
                {subject.emoji}
              </span>
              <h2 className="text-lg font-bold text-slate-800">{subject.title}</h2>
              <p className="mt-2 text-sm text-slate-500">{subject.description}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Subjects;