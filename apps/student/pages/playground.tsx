import fs from "fs";
import path from "path";
import yaml from "js-yaml";
import { useState } from "react";
import { ActivityRenderer, AppShell } from "@learn-easy/ui";
import type { GetStaticProps, NextPage } from "next";
import Head from "next/head";

interface ActivityExample {
  type: string;
  step: string;
  description: string;
  content: Record<string, unknown>;
}

interface PlaygroundProps {
  examples: ActivityExample[];
}

const typeBadge: Record<string, string> = {
  visual_counting: "VC",
  matching: "MA",
  drag_drop: "DD",
  sequencing: "SQ",
  multiple_choice: "MC",
  story_question: "ST",
  real_world: "RW",
  fraction_visual: "FV",
  place_value_chart: "PV",
  grid_area: "GA",
  chart_reader: "CR",
  clock_time: "CT",
  measurement_scale: "MS",
  fill_blank: "FB",
};

const stepBadge: Record<string, string> = {
  observe: "Observe",
  guided_practice: "Guided",
  independent_practice: "Practice",
  mastery_check: "Quiz",
};

const Playground: NextPage<PlaygroundProps> = ({ examples }) => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [jsonStrings, setJsonStrings] = useState<Record<number, string>>(() => {
    const initial: Record<number, string> = {};
    examples.forEach((ex, i) => { initial[i] = JSON.stringify(ex.content, null, 2); });
    return initial;
  });
  const [jsonErrors, setJsonErrors] = useState<Record<number, string | null>>({});

  const handleJsonChange = (i: number, value: string) => {
    setJsonStrings((prev) => ({ ...prev, [i]: value }));
    try {
      JSON.parse(value);
      setJsonErrors((prev) => ({ ...prev, [i]: null }));
    } catch (e) {
      setJsonErrors((prev) => ({ ...prev, [i]: (e as Error).message }));
    }
  };

  return (
    <>
      <Head>
        <title>Activity Playground — Arin Learn</title>
      </Head>
      <AppShell variant="student" footer={null}>
      <div className="mx-auto max-w-content px-4 py-8">
        <h1 className="mb-2 text-3xl font-bold text-slate-text">
          Activity Type Playground
        </h1>
        <p className="mb-8 text-base text-on-surface-variant">
          Browse all 14 activity types. Expand a card to see its JSON definition
          and a live preview.
        </p>

        <div className="space-y-4">
          {examples.map((example, i) => {
            const isExpanded = expandedIndex === i;
            return (
              <div
                key={i}
                className="rounded-xl border border-outline-variant bg-white shadow-sm"
              >
                <button
                  onClick={() =>
                    setExpandedIndex(isExpanded ? null : i)
                  }
                  className="flex w-full items-center gap-3 px-6 py-4 text-left focus:outline-none focus:ring-2 focus:ring-soft-blue focus:ring-inset rounded-xl"
                  aria-expanded={isExpanded}
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-soft-blue/10 text-sm font-bold text-soft-blue">
                    {i + 1}
                  </span>
                  <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                    {typeBadge[example.type] ||
                      example.type.slice(0, 2).toUpperCase()}
                  </span>
                  <span className="rounded-full bg-muted-teal/10 px-3 py-0.5 text-xs font-medium text-muted-teal">
                    {stepBadge[example.step] || example.step}
                  </span>
                  <span className="flex-1 font-medium text-slate-text">
                    {example.type.replace(/_/g, " ")}
                  </span>
                  <svg
                    className={`h-5 w-5 text-on-surface-variant transition-transform ${
                      isExpanded ? "rotate-180" : ""
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {isExpanded && (() => {
                  const jsonText = jsonStrings[i];
                  let parsedContent: Record<string, unknown> | null = null;
                  try {
                    parsedContent = JSON.parse(jsonText);
                  } catch {}
                  const displayContent = parsedContent ?? example.content;

                  return (
                    <div className="border-t border-outline-variant px-6 py-4">
                      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                        <div className="overflow-auto rounded-lg bg-warm-off-white p-4">
                          <h3 className="mb-2 text-sm font-semibold text-on-surface-variant">
                            JSON Definition
                          </h3>
                          <textarea
                            value={jsonText}
                            onChange={(e) => handleJsonChange(i, e.target.value)}
                            className="w-full min-h-[24rem] font-mono text-xs leading-relaxed bg-transparent border-0 resize-y focus:outline-none text-slate-text"
                            spellCheck={false}
                          />
                          {jsonErrors[i] && (
                            <p className="mt-2 text-xs text-soft-coral font-mono whitespace-pre-wrap">
                              {jsonErrors[i]}
                            </p>
                          )}
                        </div>
                        <div>
                          <h3 className="mb-2 text-sm font-semibold text-on-surface-variant">
                            Live Preview
                          </h3>
                          <ActivityRenderer
                            activity={{
                              id: `playground-${i}`,
                              type: example.type,
                              content: displayContent,
                            }}
                            stepLabel={example.step}
                            onComplete={(result) => {
                              console.log(
                                `Activity ${i} completed:`,
                                result,
                              );
                            }}
                          />
                        </div>
                      </div>
                      <p className="mt-4 text-sm text-on-surface-variant leading-relaxed whitespace-pre-line">
                        {example.description}
                      </p>
                    </div>
                  );
                })()}
              </div>
            );
          })}
        </div>
      </div>
    </AppShell>
    </>
  );
};

export const getStaticProps: GetStaticProps<PlaygroundProps> = async () => {
  try {
    const filePath = path.join(process.cwd(), "lib", "activity-examples.yaml");
    const rawYaml = fs.readFileSync(filePath, "utf-8");
    const examples = yaml.load(rawYaml) as ActivityExample[];

    return {
      props: {
        examples,
      },
    };
  } catch {
    return { notFound: true };
  }
};

export default Playground;
