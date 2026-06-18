import type { NextPage } from "next";
import Link from "next/link";

const Home: NextPage = () => {
  return (
    <div className="min-h-screen bg-warm-off-white px-4 py-8">
      <div className="mx-auto max-w-content">
        <h1 className="mb-2 text-center text-2xl font-bold text-slate-text">
          LearnEasy - Student App
        </h1>
        <p className="mb-8 text-center text-base text-on-surface-variant">
          Autism-first learning platform for NIOS education
        </p>
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