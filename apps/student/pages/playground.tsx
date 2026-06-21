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
  rawYaml: string;
  examples: ActivityExample[];
}

function yamlBlock(raw: string, index: number): string {
  const stripped = raw.replace(/^(#[^\n]*\n|\s*\n)+/, "");
  const docs = stripped.split(/\n(?=- )/);
  return docs[index] || "";
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

const Playground: NextPage<PlaygroundProps> = ({ rawYaml, examples }) => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

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
          Browse all 14 activity types. Expand a card to see its YAML definition
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

                {isExpanded && (
                  <div className="border-t border-outline-variant px-6 py-4">
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                      <div className="overflow-auto rounded-lg bg-warm-off-white p-4">
                        <h3 className="mb-2 text-sm font-semibold text-on-surface-variant">
                          YAML Definition
                        </h3>
                        <pre className="overflow-x-auto text-xs leading-relaxed font-mono text-slate-text">
                          {yamlBlock(rawYaml, i)}
                        </pre>
                      </div>
                      <div>
                        <h3 className="mb-2 text-sm font-semibold text-on-surface-variant">
                          Live Preview
                        </h3>
                        <ActivityRenderer
                          activity={{
                            id: `playground-${i}`,
                            type: example.type,
                            content: example.content,
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
                )}
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
        rawYaml,
        examples,
      },
    };
  } catch {
    return { notFound: true };
  }
};

export default Playground;
