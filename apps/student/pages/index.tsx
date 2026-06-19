import type { NextPage } from "next";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "../lib/auth";
import { fetchResumeState } from "../lib/api";

interface ResumeInfo {
  hasResumableSession: boolean;
  conceptId?: string;
  chapterId?: string;
  subjectId?: string;
  step?: number;
  activityId?: string;
}

const STEP_NAMES = [
  "Observe",
  "Guided Practice",
  "Independent Practice",
  "Mastery Check",
];

const Home: NextPage = () => {
  const { user } = useAuth();
  const [resumeInfo, setResumeInfo] = useState<ResumeInfo | null>(null);
  const [resumeLoading, setResumeLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) {
      setResumeLoading(false);
      return;
    }

    fetchResumeState(user.id).then((res) => {
      if (res.data) {
        setResumeInfo(res.data);
      }
      setResumeLoading(false);
    });
  }, [user?.id]);

  return (
    <div className="min-h-screen bg-warm-off-white px-4 py-8">
      <div className="mx-auto max-w-content">
        <h1 className="mb-2 text-center text-2xl font-bold text-slate-text">
          LearnEasy - Student App
        </h1>
        <p className="mb-8 text-center text-base text-on-surface-variant">
          Autism-first learning platform for NIOS education
        </p>

        {/* Resume Learning Section */}
        {resumeLoading && user?.id && (
          <div className="mb-8 text-center">
            <p className="text-sm text-on-surface-variant">
              Checking for saved progress...
            </p>
          </div>
        )}

        {!resumeLoading && resumeInfo?.hasResumableSession && (
          <div className="mb-8">
            <div className="rounded-xl border-2 border-muted-teal bg-white p-6">
              <h2 className="mb-2 text-lg font-bold text-slate-text">
                📚 Resume Learning
              </h2>
              <p className="mb-1 text-sm text-on-surface-variant">
                You have a lesson in progress
              </p>
              {resumeInfo.step !== undefined && resumeInfo.step < 4 && (
                <p className="mb-4 text-sm text-muted-teal">
                  Last step: {STEP_NAMES[resumeInfo.step]}
                </p>
              )}
              <Link
                href={
                  resumeInfo.conceptId
                    ? `/learn/${resumeInfo.conceptId}`
                    : "/subjects"
                }
                className="inline-flex min-h-[56px] items-center rounded-lg bg-muted-teal px-8 py-3 text-base font-semibold text-white hover:bg-muted-teal/90 transition-opacity duration-200 focus:outline-none focus:ring-2 focus:ring-muted-teal focus:ring-offset-2"
              >
                Resume Lesson
              </Link>
            </div>
          </div>
        )}

        {/* Start Learning */}
        <div className="flex justify-center">
          <Link
            href="/subjects"
            className="min-h-[56px] rounded-lg bg-soft-blue px-8 py-3 text-base font-semibold text-white hover:bg-primary transition-opacity duration-200 focus:outline-none focus:ring-2 focus:ring-soft-blue focus:ring-offset-2 inline-flex items-center"
          >
            Start Learning
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
