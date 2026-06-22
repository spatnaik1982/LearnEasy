import fs from "fs";
import path from "path";
import { useMemo, useState } from "react";
import { ActivityRenderer, AppShell, normalizeContent, needsNormalization } from "@learn-easy/ui";
import { validateActivity } from "@learn-easy/db/dist/activity-schema";
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

interface ValidationResult {
  valid: boolean;
  errors: string[];
}

type FilterStatus = "all" | "valid" | "invalid";

const ALL_TYPES = "all" as const;
const ALL_STEPS = "all" as const;

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

const ACTIVITY_TYPES = [
  "visual_counting",
  "matching",
  "drag_drop",
  "sequencing",
  "multiple_choice",
  "story_question",
  "real_world",
  "fraction_visual",
  "place_value_chart",
  "grid_area",
  "chart_reader",
  "clock_time",
  "measurement_scale",
  "fill_blank",
] as const;

const LESSON_STEPS = [
  "observe",
  "guided_practice",
  "independent_practice",
  "mastery_check",
] as const;

function buildActivityCandidate(
  type: string,
  step: string,
  content: Record<string, unknown>,
): unknown {
  return {
    step,
    type,
    order: 1,
    content: {
      type,
      content,
    },
  };
}

function validateExampleContent(
  type: string,
  step: string,
  content: Record<string, unknown>,
): ValidationResult {
  const candidate = buildActivityCandidate(type, step, content);
  const result = validateActivity(candidate);
  if (result.success) {
    return { valid: true, errors: [] };
  }
  return { valid: false, errors: result.errors };
}

const Playground: NextPage<PlaygroundProps> = ({ examples }) => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [jsonStrings, setJsonStrings] = useState<Record<number, string>>(() => {
    const initial: Record<number, string> = {};
    examples.forEach((ex, i) => { initial[i] = JSON.stringify(ex.content, null, 2); });
    return initial;
  });
  const [filterType, setFilterType] = useState<string>(ALL_TYPES);
  const [filterStep, setFilterStep] = useState<string>(ALL_STEPS);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [showNormalized, setShowNormalized] = useState<Record<number, boolean>>({});

  const handleJsonChange = (i: number, value: string) => {
    setJsonStrings((prev) => ({ ...prev, [i]: value }));
  };

  const filteredExamples = useMemo(() => {
    return examples.filter((ex, i) => {
      if (filterType !== ALL_TYPES && ex.type !== filterType) return false;
      if (filterStep !== ALL_STEPS && ex.step !== filterStep) return false;
      if (filterStatus !== "all") {
        const rawJson = jsonStrings[i];
        let parsed: Record<string, unknown> | null = null;
        try { parsed = JSON.parse(rawJson); } catch { /* invalid json */ }
        const contentToValidate = parsed ?? ex.content;
        const { valid } = validateExampleContent(ex.type, ex.step, contentToValidate);
        if (filterStatus === "valid" && !valid) return false;
        if (filterStatus === "invalid" && valid) return false;
      }
      return true;
    });
  }, [examples, filterType, filterStep, filterStatus, jsonStrings]);

  const resetFilters = () => {
    setFilterType(ALL_TYPES);
    setFilterStep(ALL_STEPS);
    setFilterStatus("all");
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
        <p className="mb-6 text-base text-on-surface-variant">
          Browse all 14 activity types. Expand a card to see its JSON definition,
          validation status, and a live preview.
        </p>

        <div className="mb-6 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <label htmlFor="type-filter" className="text-sm font-medium text-slate-text">
              Activity Type
            </label>
            <select
              id="type-filter"
              value={filterType}
              onChange={(e) => { setExpandedIndex(null); setFilterType(e.target.value); }}
              className="rounded-lg border border-outline-variant bg-white px-3 py-2 text-sm text-slate-text focus:outline-none focus:ring-2 focus:ring-soft-blue"
            >
              <option value={ALL_TYPES}>Show All</option>
              {ACTIVITY_TYPES.map((t) => (
                <option key={t} value={t}>{t.replace(/_/g, " ")}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="step-filter" className="text-sm font-medium text-slate-text">
              Lesson Step
            </label>
            <select
              id="step-filter"
              value={filterStep}
              onChange={(e) => { setExpandedIndex(null); setFilterStep(e.target.value); }}
              className="rounded-lg border border-outline-variant bg-white px-3 py-2 text-sm text-slate-text focus:outline-none focus:ring-2 focus:ring-soft-blue"
            >
              <option value={ALL_STEPS}>Show All</option>
              {LESSON_STEPS.map((s) => (
                <option key={s} value={s}>{stepBadge[s] || s}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-text">
              Validation
            </span>
            <div className="flex rounded-lg border border-outline-variant bg-white overflow-hidden">
              {(["all", "valid", "invalid"] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => { setExpandedIndex(null); setFilterStatus(status); }}
                  className={`px-3 py-2 text-sm font-medium transition-colors ${
                    filterStatus === status
                      ? status === "valid"
                        ? "bg-muted-green/20 text-muted-green"
                        : status === "invalid"
                          ? "bg-soft-coral/20 text-soft-coral"
                          : "bg-soft-blue/10 text-soft-blue"
                      : "text-on-surface-variant hover:bg-warm-off-white"
                  }`}
                >
                  {status === "all" ? "Show All" : status === "valid" ? "Valid" : "Invalid"}
                </button>
              ))}
            </div>
          </div>
        </div>

        <p className="mb-4 text-sm text-on-surface-variant">
          Showing {filteredExamples.length} of {examples.length} examples.
          {examples.length === 0 && (
            <span className="ml-2 text-soft-coral">
              Could not load example data file.
            </span>
          )}
          {filteredExamples.length === 0 && examples.length > 0 && (
            <span className="ml-2">
              No examples match the current filters.
              <button
                onClick={resetFilters}
                className="ml-1 underline text-soft-blue hover:text-soft-blue/80"
              >
                Reset filters
              </button>
            </span>
          )}
        </p>

        <div className="space-y-4">
          {filteredExamples.map((example, filteredIdx) => {
            const originalIdx = examples.indexOf(example);
            const isExpanded = expandedIndex === filteredIdx;
            const jsonText = jsonStrings[originalIdx];

            let parsedContent: Record<string, unknown> | null = null;
            let parseError: string | null = null;
            try {
              parsedContent = JSON.parse(jsonText);
            } catch (e) {
              parseError = (e as Error).message;
            }

            const displayContent = parsedContent ?? example.content;
            const schemaResult = validateExampleContent(example.type, example.step, displayContent);
            const containsLegacy = needsNormalization(example.type, example.content);

            const normalized = normalizeContent(example.type, displayContent);
            const normalizedValid = validateExampleContent(example.type, example.step, normalized);
            const normalizationChanged = JSON.stringify(normalized) !== JSON.stringify(displayContent);

            const showNorm = showNormalized[originalIdx] ?? false;

            return (
              <div
                key={`${example.type}-${example.step}-${originalIdx}`}
                className="rounded-xl border border-outline-variant bg-white shadow-sm"
              >
                <button
                  onClick={() =>
                    setExpandedIndex(isExpanded ? null : filteredIdx)
                  }
                  className="flex w-full items-center gap-3 px-6 py-4 text-left focus:outline-none focus:ring-2 focus:ring-soft-blue focus:ring-inset rounded-xl"
                  aria-expanded={isExpanded}
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-soft-blue/10 text-sm font-bold text-soft-blue">
                    {filteredIdx + 1}
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
                  <span className={`flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    schemaResult.valid
                      ? "bg-muted-green/10 text-muted-green"
                      : "bg-soft-coral/10 text-soft-coral"
                  }`}>
                    <span className={`inline-block h-1.5 w-1.5 rounded-full ${
                      schemaResult.valid ? "bg-muted-green" : "bg-soft-coral"
                    }`} />
                    {schemaResult.valid ? "Valid" : "Invalid"}
                  </span>
                  {containsLegacy && (
                    <span className="rounded bg-soft-amber/10 px-2 py-0.5 text-xs font-medium text-soft-amber">
                      Legacy
                    </span>
                  )}
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
                      <div>
                        <h3 className="mb-2 text-sm font-semibold text-on-surface-variant">
                          JSON Definition
                        </h3>
                        <div className="overflow-auto rounded-lg bg-warm-off-white p-4">
                          <textarea
                            value={jsonText}
                            onChange={(e) => handleJsonChange(originalIdx, e.target.value)}
                            className="w-full min-h-[24rem] font-mono text-xs leading-relaxed bg-transparent border-0 resize-y focus:outline-none text-slate-text"
                            spellCheck={false}
                          />
                          {parseError && (
                            <p className="mt-2 text-xs text-soft-coral font-mono whitespace-pre-wrap">
                              JSON Parse Error: {parseError}
                            </p>
                          )}
                          {!parseError && !schemaResult.valid && (
                            <div className="mt-2">
                              <p className="text-xs font-semibold text-soft-coral mb-1">
                                Schema Errors:
                              </p>
                              {schemaResult.errors.map((err, ei) => (
                                <p key={ei} className="text-xs text-soft-coral font-mono whitespace-pre-wrap ml-2">
                                  • {err}
                                </p>
                              ))}
                            </div>
                          )}
                          {!parseError && schemaResult.valid && (
                            <p className="mt-2 text-xs text-muted-green font-medium">
                              Schema valid
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col gap-4">
                        <div>
                          <h3 className="mb-2 text-sm font-semibold text-on-surface-variant">
                            Live Preview
                          </h3>
                          <div className="rounded-lg border border-outline-variant p-4">
                            <ActivityRenderer
                              activity={{
                                id: `playground-${originalIdx}`,
                                type: example.type,
                                content: displayContent,
                              }}
                              stepLabel={example.step}
                              onComplete={(result) => {
                                console.log(
                                  `Activity ${originalIdx} completed:`,
                                  result,
                                );
                              }}
                            />
                          </div>
                        </div>

                        <div>
                          <button
                            onClick={() =>
                              setShowNormalized((prev) => ({
                                ...prev,
                                [originalIdx]: !(prev[originalIdx] ?? false),
                              }))
                            }
                            className="flex items-center gap-2 text-sm font-medium text-soft-blue hover:text-soft-blue/80"
                          >
                            <svg
                              className={`h-4 w-4 transition-transform ${
                                showNorm ? "rotate-90" : ""
                              }`}
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={2}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M9 5l7 7-7 7"
                              />
                            </svg>
                            {showNorm
                              ? "Hide Normalized Content"
                              : "Show Normalized Content"}
                            {normalizationChanged && !showNorm && (
                              <span className="rounded bg-soft-amber/10 px-2 py-0.5 text-xs font-medium text-soft-amber">
                                Modified
                              </span>
                            )}
                          </button>

                          {showNorm && (
                            <div className="mt-2 overflow-auto rounded-lg bg-warm-off-white p-4">
                              <div className="mb-3">
                                <h4 className="text-xs font-semibold text-on-surface-variant mb-1">
                                  Normalized Content
                                </h4>
                                <pre className="font-mono text-xs leading-relaxed text-slate-text whitespace-pre-wrap">
                                  {JSON.stringify(normalized, null, 2)}
                                </pre>
                                {normalizationChanged ? (
                                  <p className="mt-2 text-xs text-soft-amber">
                                    Normalization modified the content shape.
                                  </p>
                                ) : (
                                  <p className="mt-2 text-xs text-muted-green">
                                    No normalization needed
                                  </p>
                                )}
                              </div>
                              <div>
                                <h4 className="text-xs font-semibold text-on-surface-variant mb-1">
                                  Normalized Validation
                                </h4>
                                {normalizedValid.valid ? (
                                  <p className="text-xs text-muted-green font-medium">
                                    Schema valid
                                  </p>
                                ) : (
                                  normalizedValid.errors.map((err, ei) => (
                                    <p key={ei} className="text-xs text-soft-coral font-mono whitespace-pre-wrap ml-2">
                                      • {err}
                                    </p>
                                  ))
                                )}
                              </div>
                            </div>
                          )}
                        </div>
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
    const filePath = path.join(process.cwd(), "lib", "activity-examples.json");
    const rawJson = fs.readFileSync(filePath, "utf-8");
    const examples = JSON.parse(rawJson) as ActivityExample[];

    return {
      props: {
        examples,
      },
    };
  } catch {
    return {
      props: {
        examples: [],
      },
    };
  }
};

export default Playground;
