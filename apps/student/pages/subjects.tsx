import type { NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { fetchSubjects, fetchStudentProfile } from "../lib/api";
import { useAuth } from "../lib/auth";
import type { Subject } from "../lib/mockData";
import { COPY, AppShell, Breadcrumb } from "@learn-easy/ui";

const Subjects: NextPage = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      let level = user?.level || "A";
      // Fetch fresh profile from API so level updates (e.g. DB change) take effect
      if (user?.id) {
        const profile = await fetchStudentProfile(user.id);
        if (profile.data) level = profile.data.level;
      }
      const res = await fetchSubjects(level);
      if (res.data) setSubjects(res.data);
      setLoading(false);
    }
    load();
  }, [user?.id]);

  if (loading) {
    return (
      <AppShell variant="student">
        <div className="flex items-center justify-center min-h-[60vh]">
          <p className="text-lg text-on-surface-variant">{COPY.loadingSubjects}</p>
        </div>
      </AppShell>
    );
  }

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
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {subjects.map((subject) => (
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
      </div>
    </AppShell>
  );
};

export default Subjects;
