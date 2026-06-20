# EPIC-13: PDF-to-Curriculum Pipeline

## Objective

Build an automated pipeline that ingests NIOS OBE PDF curriculum documents and generates validated curriculum YAML files for any level (A, B, C) and subject (Math, Language, EVS). The pipeline uses LangGraph.js for orchestration and configurable LLM providers for content generation.

## Background

All curriculum content is currently hand-authored as YAML files in `curriculum/level-a/`. This approach doesn't scale to Levels B and C (30+ concepts each). NIOS publishes official PDF textbooks with structured chapters, examples, and exercises — a natural source for automated extraction. A LangGraph.js pipeline can extract, chunk, generate, and validate curriculum YAMLs from these PDFs with minimal human review.

## User Value

Curriculum authors can generate complete, validated Level B (and future Level C) curriculum from official NIOS PDFs in minutes instead of weeks. The pipeline enforces ALX guidelines and schema validation automatically.

## Scope

- Configurable LLM provider system (OpenAI, Anthropic, etc.) via environment config
- PDF text extraction module
- Content chunking (chapter → topics → concepts)
- LLM-powered concept spec generation (reuses existing Zod schemas as structured output)
- LLM-powered activity generation (5-step sequence per concept)
- Validation against existing curriculum pipeline + retry loop for failures
- LangGraph.js state graph orchestrator with conditional branching
- CLI entry point: `pnpm curriculum:generate --pdf <path> --level B --subject math`
- YAML output to `curriculum/level-<code>/<subject>/`

## Stories

- **Story 13.1** — LLM Provider Configuration System
- **Story 13.2** — PDF Text Extraction Module
- **Story 13.3** — Content Chunking & Topic Extraction
- **Story 13.4** — Concept Generation Module
- **Story 13.5** — Activity Generation Module
- **Story 13.6** — Validation & Retry Loop
- **Story 13.7** — YAML Output Writer
- **Story 13.8** — LangGraph Pipeline Orchestrator
- **Story 13.9** — CLI Entry Point & Integration

## Dependencies

- EPIC-0 (concept schema, curriculum pipeline, validation CLI — all exist and are used as tooling)
- `packages/db/src/concept-schema.ts` — Zod schemas reused as LLM structured output formats
- `packages/db/src/curriculum-pipeline.ts` — validation logic reused in retry loop
- New dependency: `@langchain/langgraph` (LangGraph.js)
- New dependency: `pdf-parse` or `pdfjs-dist` for PDF text extraction

## Success Criteria

- `pnpm curriculum:generate --pdf pdf/Math_Level_B_english_medium.pdf --level B --subject math` produces valid YAML files in `curriculum/level-b/math/`
- All generated YAMLs pass `pnpm curriculum:validate`
- Pipeline handles PDFs with 5–12 chapters, producing 25–35 concepts per subject
- LLM provider is configurable via environment variable (no hardcoded provider)
- Failed generations are retried up to 3 times with error feedback
- Pipeline produces a summary report: "8 chapters, 31 concepts, 155 activities generated. 0 validation errors."

## Out Of Scope

- PDF image/chart extraction (text extraction only)
- UI for the pipeline (CLI only)
- Incremental updates (always full generation)
- Non-NIOS curriculum PDFs (format-specific parsing)
- Audio/visual asset generation

---

## Story 13.1 — LLM Provider Configuration System

### Goal

Create a configurable LLM provider abstraction that allows the pipeline to use different LLM providers (OpenAI, Anthropic, etc.) and models based on environment configuration, without hardcoding.

### Background

The existing `packages/ai` hardcodes `gpt-4o-mini` as the model and `openai` as the provider. The pipeline needs to support configurable providers because:
- Different models have different costs (cheap for chunking, powerful for generation)
- Users may prefer Anthropic or Google models
- The configuration should live in environment variables, not code

### User Story

As a pipeline operator, I want to configure the LLM provider and model via environment variables so that I can choose the best model for cost and quality without code changes.

### Functional Requirements

- Create `packages/llm-config/` (or add to `packages/config/`) with a provider abstraction:
  - `LlmProvider` interface with `generateStructured(prompt: string, schema: ZodSchema): Promise<T>` method
  - `OpenAIProvider` implementation using the existing `openai` npm package
  - `AnthropicProvider` implementation (optional, stub if no API key)
- Configuration from environment variables:
  - `LLM_PROVIDER` — `"openai"` | `"anthropic"` (default: `"openai"`)
  - `LLM_MODEL` — model name string (default: `"gpt-4o-mini"`)
  - `LLM_API_KEY` — API key (falls back to `OPENAI_API_KEY` or `ANTHROPIC_API_KEY`)
  - `LLM_MAX_TOKENS` — max tokens for generation (default: `4096`)
  - `LLM_TEMPERATURE` — temperature (default: `0.3` for consistent generation)
- Provider factories: `createLlmProvider(): LlmProvider` that reads env vars and instantiates the correct provider
- Error handling: provider initialization failure returns a clear error message indicating which env vars are missing
- Structured output: all providers must support Zod-schema-guided generation (OpenAI via `zodResponseFormat`, Anthropic via tool use)

### Technical Requirements

- New package: `packages/llm-config/` with `package.json`, `tsconfig.json`, `src/index.ts`
- Interface in `packages/llm-config/src/types.ts`:
  ```typescript
  export interface LlmProvider {
    generateStructured<T>(
      prompt: string,
      schema: z.ZodType<T>,
      options?: { temperature?: number; maxTokens?: number }
    ): Promise<T>;
  }
  ```
- OpenAI implementation: reuse the `openai` SDK pattern from `packages/ai/src/index.ts` (already has `OpenAI` client + `zodResponseFormat`)
- Import from `packages/llm-config` in the pipeline (not directly from openai SDK)
- Unit test: verify provider selection from env vars, verify `generateStructured` returns typed output

### Deliverables

- `packages/llm-config/package.json`
- `packages/llm-config/tsconfig.json`
- `packages/llm-config/src/index.ts` (barrel export)
- `packages/llm-config/src/types.ts`
- `packages/llm-config/src/providers/openai-provider.ts`
- `packages/llm-config/src/providers/anthropic-provider.ts` (stub)
- `packages/llm-config/src/__tests__/provider.test.ts`
- Root `pnpm-workspace.yaml` update to include `packages/llm-config`

### Acceptance Criteria

- [ ] `createLlmProvider()` returns OpenAIProvider when `LLM_PROVIDER=openai`
- [ ] `createLlmProvider()` reads `LLM_MODEL` env var and passes it to the provider
- [ ] `generateStructured` returns typed, Zod-validated output
- [ ] Provider throws clear error if API key is missing
- [ ] All tests pass
- [ ] Workspace builds without errors (`pnpm build`)

### Files Expected To Change

- `packages/llm-config/` (new directory)
- `pnpm-workspace.yaml` (add new package)
- Root `package.json` scripts

### Testing Requirements

- Unit test: provider selection logic
- Unit test: `generateStructured` returns correct type
- Integration test (optional, requires API key): actual LLM call returns Zod-validated content

### Definition Of Done

- [ ] Package builds and exports
- [ ] All tests pass
- [ ] Documentation in `knowledge/llm-config/README.md`

### Out Of Scope

- Streaming support
- Multi-modal inputs
- Rate limiting / retry (handled by caller)
- Caching

---

## Story 13.2 — PDF Text Extraction Module

### Goal

Build a module that extracts clean, structured text from NIOS OBE PDF textbooks, preserving chapter/section headings and exercise boundaries.

### Background

NIOS PDFs are scanned/text-based textbooks with consistent structure: chapter headings, numbered sections, examples, "Let us see what you have learnt" exercises, and answer keys. Text extraction must preserve this structure for downstream chunking.

### User Story

As the pipeline, I want to extract structured text from a PDF file so that downstream modules can split it into chapters and topics for concept generation.

### Functional Requirements

- Accept a PDF file path as input
- Extract text content preserving:
  - Chapter headings (e.g., "Lesson 1", "Chapter 1")
  - Section headings (e.g., "1.1 Place Value", "1.2 Comparing Numbers")
  - Body text
  - Examples (with "Example" prefix)
  - Exercises (sections starting with "Let us see", "Exercise", "Practice")
  - Answer keys (sections starting with "Answer", "Answers")
- Return structured output: `{ pages: Page[], metadata: { title, totalPages } }` where `Page = { pageNumber, text, headings: string[] }`
- Strip headers/footers (page numbers, running headers)
- Handle both digital PDFs (selectable text) and fallback for image-only PDFs (return error with suggestion to OCR first)
- Minimum 95% text fidelity for NIOS-style PDFs

### Technical Requirements

- New file: `packages/pipeline/src/extract/index.ts`
- Use `pdfjs-dist` (already common in Node.js ecosystem) or `pdf-parse` npm package
- Heading detection: regex patterns for NIOS chapter/section numbering (e.g., `/^(Lesson|Chapter)\s+\d+/i`, `/^\d+\.\d+\s+/`)
- Exercise boundary detection: regex for "Let us see what you have learnt", "Exercise", "Answers"
- Output type:
  ```typescript
  interface ExtractedPDF {
    metadata: { title: string; totalPages: number };
    chapters: ChapterChunk[];
  }
  interface ChapterChunk {
    chapterNumber: number;
    chapterTitle: string;
    sections: SectionChunk[];
    pages: number[];
  }
  interface SectionChunk {
    heading: string;
    body: string;
    examples: string[];
    exercises: string[];
  }
  ```
- Handle file-not-found, permission-denied, non-PDF files with typed errors
- Unit test with a small sample PDF (create a 2-page test PDF with known content)

### Deliverables

- `packages/pipeline/src/extract/index.ts`
- `packages/pipeline/src/extract/__tests__/extract.test.ts`
- `packages/pipeline/package.json`
- `packages/pipeline/tsconfig.json`

### Acceptance Criteria

- [ ] Extracts text from "Math_Level_B_english_medium.pdf" and returns 8 chapters matching the PDF's structure
- [ ] Chapter headings correctly identified: "Numbers", "Addition, Subtraction, Multiplication, Division", "Fractions", etc.
- [ ] Section headings preserved within each chapter
- [ ] Examples and exercises separated from body text
- [ ] Non-PDF files return a clear error, not a crash
- [ ] Missing file returns a clear error
- [ ] All tests pass

### Files Expected To Change

- `packages/pipeline/` (new directory)
- `pnpm-workspace.yaml` (add package)

### Testing Requirements

- Unit test with a known 2-page test PDF
- Integration test with actual `Math_Level_B_english_medium.pdf` (skip if file not present)
- Error path tests: missing file, invalid PDF, empty PDF

### Definition Of Done

- [ ] Extraction working against real Level B PDF
- [ ] All tests pass
- [ ] Output structure matches spec

### Out Of Scope

- Image/chart extraction (text only)
- OCR for scanned PDFs
- Table extraction
- Language detection

---

## Story 13.3 — Content Chunking & Topic Extraction

### Goal

Build a module that takes extracted PDF text (chapters + sections) and uses an LLM to identify distinct teachable concepts within each chapter, producing a structured list of concept candidates ready for YAML generation.

### Background

A PDF chapter like "Fractions" (Chapter 3 of Level B) covers multiple sub-topics: fraction basics, equivalent fractions, proper/improper/mixed fractions, comparison, and operations. Each sub-topic should become a separate concept YAML file. An LLM can analyze the chapter content and identify these natural splits, extracting learning objectives and core ideas.

### User Story

As the pipeline, I want to split each textbook chapter into individual teachable concepts with suggested learning objectives and core ideas, so that downstream modules can generate full concept specs.

### Functional Requirements

- Input: `ExtractedPDF` (from Story 13.2), LLM provider (from Story 13.1)
- For each chapter, use the LLM to identify 3–6 discrete concepts
- For each concept, extract from the chapter text:
  - `conceptId` suggestion (lowercase_with_underscores)
  - `learningObjective` (concrete, ≤12 words)
  - `coreIdea` (one-sentence takeaway)
  - `examples` (2-3 from the textbook examples)
  - `misconceptions` (1-2 common mistakes, inferred from exercises)
  - `dependencies` (prerequisite concept IDs, referencing existing Level A and earlier Level B concepts)
  - `estimatedDuration` (minutes, based on content density)
- Output type:
  ```typescript
  interface ConceptCandidate {
    chapterNumber: number;
    chapterName: string;
    conceptId: string;
    learningObjective: string;
    coreIdea: string;
    examples: string[];
    misconceptions: string[];
    suggestedDependencies: string[];
    sourceSections: string[];   // Which PDF sections this concept comes from
    supportingText: string;     // Raw text from PDF that backs this concept
    estimatedDuration: number;
  }
  ```
- The LLM prompt must include:
  - Full chapter text (section by section)
  - List of existing Level A concept IDs (so it can suggest accurate dependencies)
  - ALX guidelines for writing learning objectives (concrete, literal, ≤12 words, action-oriented)
- Handle edge case: chapter too large for LLM context window → split into multiple LLM calls
- Handle edge case: LLM returns fewer/more concepts than expected → accept and continue

### Technical Requirements

- New file: `packages/pipeline/src/chunk/index.ts`
- LLM prompt template in a separate file: `packages/pipeline/src/chunk/prompts/chapter-concepts.txt`
- Structured output schema using Zod (reuse pattern from Story 13.1):
  ```typescript
  const conceptCandidatesSchema = z.object({
    concepts: z.array(z.object({
      conceptId: z.string(),
      learningObjective: z.string(),
      coreIdea: z.string(),
      examples: z.array(z.string()).min(2).max(5),
      misconceptions: z.array(z.string()).min(0).max(3),
      suggestedDependencies: z.array(z.string()),
      estimatedDuration: z.number().positive(),
      sourceSections: z.array(z.string()),
    })).min(1).max(10),
  });
  ```
- Prompt must request JSON conforming to this schema via structured output
- Token counting: if chapter text exceeds ~60k tokens, split by section groups
- Error handling: if LLM output fails Zod validation, retry once with error message as feedback
- Unit test: mock LLM provider, verify correct prompt construction and output parsing

### Deliverables

- `packages/pipeline/src/chunk/index.ts`
- `packages/pipeline/src/chunk/prompts/chapter-concepts.txt`
- `packages/pipeline/src/chunk/__tests__/chunk.test.ts`

### Acceptance Criteria

- [ ] Chapter 3 (Fractions) produces 4–6 concept candidates
- [ ] Each candidate has valid conceptId format, learningObjective ≥10 chars, ≥2 examples
- [ ] Dependencies reference existing Level A conceptIds (e.g., `fractions_intro` depends on `counting_1_10`, `addition_1_10`)
- [ ] LLM prompt includes ALX guidelines and existing concept list
- [ ] Oversized chapters are split into multiple LLM calls
- [ ] Zod validation failures trigger a retry with error feedback
- [ ] All tests pass

### Files Expected To Change

- `packages/pipeline/src/chunk/` (new directory)

### Testing Requirements

- Unit test with mock LLM returning valid/invalid concept arrays
- Integration test with LLM provider (optional, requires API key)
- Test chapter splitting logic

### Definition Of Done

- [ ] Chunking works end-to-end with real Level B PDF output
- [ ] All tests pass

### Out Of Scope

- Activity generation (Story 13.5)
- Final validation (Story 13.6)
- Cross-chapter dependency resolution (handled in concept generation)

---

## Story 13.4 — Concept Generation Module

### Goal

Build a module that takes concept candidates (from Story 13.3) and generates fully-specified concept metadata conforming to the existing `ConceptSpec` Zod schema, plus chapter grouping and cross-chapter dependency resolution.

### Background

Concept candidates from chunking have basic fields. This module enriches them with the complete `ConceptSpec` shape required by the curriculum pipeline: proper `conceptId` format, `masteryCriteria`, `difficulty` level, `supports`, and cross-referenced `dependencies` that connect concepts both within Level B and to existing Level A concepts.

### User Story

As the pipeline, I want to generate complete, validated concept specifications from concept candidates so that downstream modules can generate activities for each concept.

### Functional Requirements

- Input: `ConceptCandidate[]` (from Story 13.3)
- For each candidate, use the LLM to fill in:
  - `masteryCriteria` (0.7–0.85 for Level B, depending on difficulty)
  - `difficulty` (beginner / intermediate / advanced)
  - `supports` (visual: true for all math concepts)
  - `dependencies` (validated against all known Level A + Level B concept IDs)
  - `misconceptions` (refined from candidate)
- Cross-chapter dependency resolution:
  - Maintain a registry of ALL concept IDs being generated (across all chapters)
  - When resolving dependencies, check both Level A (existing) and Level B (in-progress) concepts
  - Flag unresolvable dependencies (concept IDs that don't exist anywhere)
- Output: `GeneratedConcept[]` conforming to `ConceptSpec` type (from `packages/db`), plus `chapterCode` and `chapterName`
- Validate each output against `conceptSpecSchema` (from `packages/db/src/concept-schema.ts`) before accepting
- If Zod validation fails, retry once with the validation errors as feedback to the LLM
- Dependency resolution must avoid circular dependencies (use `detectCircularDependencies` from `packages/db/src/dependency-graph.ts`)

### Technical Requirements

- New file: `packages/pipeline/src/generate-concept/index.ts`
- Reuse `conceptSpecSchema` from `@learn-easy/db` for Zod validation
- Reuse `detectCircularDependencies` from `@learn-easy/db` for cycle checking
- LLM prompt template: `packages/pipeline/src/generate-concept/prompts/enrich-concept.txt`
- Structured output schema mirrors `ConceptSpec`:
  ```typescript
  const generatedConceptSchema = conceptSpecSchema.extend({
    chapterCode: z.string(),
    chapterName: z.string(),
  });
  ```
- Dependency registry:
  ```typescript
  class ConceptRegistry {
    private knownIds: Set<string>;
    constructor(levelAConcepts: string[], levelBConcepts: string[]);
    register(id: string): void;
    validateDependencies(deps: string[]): { valid: string[]; missing: string[] };
    getLearningPath(): string[][];
  }
  ```
- Batch processing: process 3-5 concepts per LLM call (context permitting) for efficiency
- Error handling: unresolvable dependency → mark as warning, skip that dependency, continue

### Deliverables

- `packages/pipeline/src/generate-concept/index.ts`
- `packages/pipeline/src/generate-concept/prompts/enrich-concept.txt`
- `packages/pipeline/src/generate-concept/concept-registry.ts`
- `packages/pipeline/src/generate-concept/__tests__/generate-concept.test.ts`

### Acceptance Criteria

- [ ] All generated concepts pass `conceptSpecSchema` validation
- [ ] Dependencies correctly reference both Level A (e.g., `counting_1_10`) and Level B (e.g., `fractions_intro` depends on `addition_1_10`)
- [ ] No circular dependencies detected by `detectCircularDependencies`
- [ ] Chapter codes follow pattern (CH1–CH8 for Level B Math)
- [ ] `masteryCriteria` values are 0.7–0.85 and appropriate for difficulty level
- [ ] Visual support is enabled for all math concepts
- [ ] Unresolvable dependencies produce warnings but don't block generation
- [ ] All tests pass

### Files Expected To Change

- `packages/pipeline/src/generate-concept/` (new directory)

### Testing Requirements

- Unit test with mock LLM: verify concept spec validation
- Unit test: ConceptRegistry correctly validates/resolves dependencies
- Unit test: circular dependency detection rejects invalid chains
- Integration test (optional): end-to-end concept generation for one chapter

### Definition Of Done

- [ ] All Level B concepts generated and validated
- [ ] Dependency graph clean (no cycles, no missing references)
- [ ] All tests pass

### Out Of Scope

- Activity generation (Story 13.5)
- PDF extraction (already completed)
- Final YAML writing (Story 13.7)

---

## Story 13.5 — Activity Generation Module

### Goal

Build a module that takes a validated concept spec and generates the complete 5-step activity sequence (observe → guided_practice → independent_practice → mastery_check → positive_completion) with appropriate activity types and ALX-compliant content.

### Background

Every concept requires exactly 5 activities in the ALX-7 routine. The LLM must select the right activity type for each step based on the concept's subject matter (e.g., `fraction_visual` for fraction concepts, `place_value_chart` for place value, `drag_drop` for sorting), write graduated hints, and ensure all content follows ALX constraints.

### User Story

As the pipeline, I want to generate the full 5-step activity sequence for each concept so that the output YAML is complete and ready for validation.

### Functional Requirements

- Input: `GeneratedConcept` (from Story 13.4), LLM provider
- For each concept, generate 5 activities in order:
  1. **`observe`** (step 1) — Tutor demonstration. Type: visual/demonstration. Content: show the concept with example, annotated.
  2. **`guided_practice`** (step 2) — Practice with hints. Type: interactive. Content: question, 4 graduated hints, correct answer.
  3. **`independent_practice`** (step 3) — Solo practice. Type: interactive. Content: question, no hints, correct answer.
  4. **`mastery_check`** (step 4) — Assessment. Type: `multiple_choice` or interactive. Content: 2-3 questions with options and correct indices.
  5. **`positive_completion`** (step 5) — Celebration. Type: `visual_counting`. Content: encouragement message.
- Activity type selection logic (LLM chooses from):
  - Existing: `visual_counting`, `matching`, `drag_drop`, `sequencing`, `multiple_choice`, `story_question`, `real_world`
  - New (EPIC-14): `fraction_visual`, `place_value_chart`, `grid_area`, `chart_reader`, `clock_time`, `measurement_scale`, `fill_blank`
- For `guided_practice` activities, generate exactly 4 graduated hints following ALX-5 (Safe Mistakes):
  - Hint 1: Explicit answer demonstration ("The correct answer is X. Let me show you...")
  - Hint 2: Visual/attention cue ("Look at the [specific part] carefully.")
  - Hint 3: Encouraging nudge ("You're close! Check your [step].")
  - Hint 4: Process hint ("Try [specific strategy].")
  - Empty string (signals no more hints — expected by the existing UI)
- Content must follow ALX constraints:
  - Maximum 12 words per sentence
  - Literal, concrete language (no metaphors)
  - Visual-first: pair text with emoji or visual descriptions
  - No negative language ("Try again" not "Wrong")
  - Touch targets described at ≥56px (for UI reference)
- Output type conforming to `ActivitySpec[]`:
  ```typescript
  interface GeneratedActivity {
    step: 'observe' | 'guided_practice' | 'independent_practice' | 'mastery_check' | 'positive_completion';
    type: string;       // One of the valid activity types
    order: number;      // 1-5
    content: Record<string, unknown>;  // Type-specific content
  }
  ```
- Validate output: check for required fields per activity type (e.g., `multiple_choice` needs `questions[]`, `visual_counting` needs `items[]` + `count`)
- If validation fails, retry once with error feedback

### Technical Requirements

- New file: `packages/pipeline/src/generate-activities/index.ts`
- Activity type definitions and their required content shapes (from `knowledge/curriculum/content-creation-guide.md`)
- LLM prompt template: `packages/pipeline/src/generate-activities/prompts/ generate-activities.txt`
- Prompt must include:
  - Full concept spec (conceptId, learningObjective, coreIdea, examples)
  - List of available activity types with descriptions
  - ALX content guidelines
  - The existing hint structure from Level A YAMLs as examples
- Structured output schema:
  ```typescript
  const activitiesSchema = z.object({
    activities: z.array(z.object({
      step: z.enum(['observe', 'guided_practice', 'independent_practice', 'mastery_check', 'positive_completion']),
      type: z.string(),
      order: z.number().min(1).max(5),
      content: z.record(z.unknown()),
    })).length(5),
  });
  ```
- Activity type validation:
  ```typescript
  const VALID_TYPES_PER_STEP = {
    observe: ['visual_counting', 'story_question', 'fraction_visual', 'place_value_chart', 'grid_area', 'clock_time', 'measurement_scale', 'chart_reader'],
    guided_practice: ['visual_counting', 'matching', 'drag_drop', 'sequencing', 'story_question', 'fraction_visual', 'place_value_chart', 'fill_blank'],
    independent_practice: ['visual_counting', 'matching', 'drag_drop', 'sequencing', 'fraction_visual', 'place_value_chart', 'fill_blank'],
    mastery_check: ['multiple_choice', 'fill_blank'],
    positive_completion: ['visual_counting'],
  };
  ```
- Batch efficiently: generate activities for 3-5 concepts per LLM call

### Deliverables

- `packages/pipeline/src/generate-activities/index.ts`
- `packages/pipeline/src/generate-activities/prompts/generate-activities.txt`
- `packages/pipeline/src/generate-activities/__tests__/generate-activities.test.ts`

### Acceptance Criteria

- [ ] Each concept gets exactly 5 activities in correct order
- [ ] `guided_practice` has exactly 4 hints + empty 5th string
- [ ] Hints follow ALX-5: encouraging, never negative
- [ ] Content text ≤12 words per sentence
- [ ] `mastery_check` has 2-3 questions with correct answer indices
- [ ] Activity types are appropriate for the concept (e.g., fractions use `fraction_visual`, not `visual_counting`)
- [ ] All activities pass schema validation
- [ ] Failed validation triggers retry with error feedback
- [ ] All tests pass

### Files Expected To Change

- `packages/pipeline/src/generate-activities/` (new directory)

### Testing Requirements

- Unit test: verify 5 activities produced, correct step order
- Unit test: verify hint structure (4 hints + empty string)
- Unit test: verify ALX word count compliance
- Unit test: verify activity type selection matches allowed types per step
- Integration test (optional): generate activities for a real concept

### Definition Of Done

- [ ] Activities generated for all Level B concepts
- [ ] All ALX compliance checks pass
- [ ] All tests pass

### Out Of Scope

- UI rendering of new activity types (EPIC-14)
- Audio/visual asset generation
- Human review of generated content

---

## Story 13.6 — Validation & Retry Loop

### Goal

Build a validation module that checks generated concepts and activities against the existing curriculum pipeline, and implements a retry loop that feeds validation errors back to the LLM for correction.

### Background

The existing `runCurriculumPipeline()` in `packages/db/src/curriculum-pipeline.ts` already validates YAML structure, concept specs, activity types, step coverage, and dependencies. This module wraps that validation and adds a retry mechanism: when validation fails, the errors are sent back to the LLM with instructions to fix them.

### User Story

As the pipeline, I want to automatically validate generated content and retry failed items so that the final output passes all checks without manual intervention.

### Functional Requirements

- Input: Generated concepts + activities (from Stories 13.4 and 13.5)
- Validation against `runCurriculumPipeline()`:
  1. Write generated content to temporary YAML files
  2. Run `runCurriculumPipeline(tmpDir)` to validate
  3. Collect all errors and warnings per concept
- Retry logic:
  - If validation errors exist for a concept, retry generation (concept + activities) up to 3 times
  - Each retry sends the previous errors to the LLM as context: "The following validation errors were found: [errors]. Please fix them."
  - If concept still fails after 3 retries, mark as `failed` in output but continue pipeline
- Output:
  ```typescript
  interface ValidatedOutput {
    passed: ConceptCurriculumEntry[];
    failed: { concept: GeneratedConcept; errors: PipelineError[]; retries: number }[];
    warnings: { conceptId: string; warnings: string[] }[];
  }
  ```
- Log detailed retry information: "Concept fractions_intro: retry 2/3 — 1 error fixed, 0 remaining"
- Skip validation for concepts that had no changes since last retry (avoid infinite loops)

### Technical Requirements

- New file: `packages/pipeline/src/validate/index.ts`
- Import `runCurriculumPipeline` from `@learn-easy/db`
- Write temp YAML files using `os.tmpdir()` with cleanup after validation
- Retry counter tracked per concept in pipeline state
- Integration with LangGraph state (Story 13.8): validation node has conditional edges to retry or proceed
- Warning accumulation: non-blocking issues (ALX word count warnings, missing optional fields) are collected but don't trigger retry

### Deliverables

- `packages/pipeline/src/validate/index.ts`
- `packages/pipeline/src/validate/__tests__/validate.test.ts`

### Acceptance Criteria

- [ ] Validates all generated concepts against `runCurriculumPipeline()`
- [ ] Failed concepts trigger retry with error feedback to LLM
- [ ] Max 3 retries per concept before marking as failed
- [ ] Passing concepts proceed to output stage
- [ ] Warnings collected but don't block output
- [ ] Temp files cleaned up after validation
- [ ] All tests pass

### Files Expected To Change

- `packages/pipeline/src/validate/` (new directory)

### Testing Requirements

- Unit test: validation passes for valid content
- Unit test: retry logic triggers on validation failure
- Unit test: max retries exceeded → concept marked failed
- Integration test: generate → write temp → validate → retry cycle

### Definition Of Done

- [ ] Validation integrated with pipeline
- [ ] Retry loop working
- [ ] All tests pass

### Out Of Scope

- Auto-fix without LLM (future enhancement)
- Parallel validation across multiple levels

---

## Story 13.7 — YAML Output Writer

### Goal

Build a module that takes validated concepts and activities and writes them as properly formatted YAML files into the `curriculum/level-<code>/<subject>/` directory, following the exact format expected by the validation CLI.

### Background

The existing curriculum pipeline expects YAML files at `curriculum/level-a/math/*.yaml` with a specific format. The output writer must produce byte-for-byte compatible YAML that passes `pnpm curriculum:validate`.

### User Story

As the pipeline, I want to write generated concepts and activities as YAML files in the correct directory structure so that they can be validated, seeded, and used by the platform.

### Functional Requirements

- Input: `ValidatedOutput` (from Story 13.6)
- For each passing concept, write a YAML file at:
  `curriculum/level-<code>/<subject>/<filename>.yaml`
  - Level code and subject from pipeline input
  - Filename from conceptId (e.g., `fractions_intro.yaml`)
- YAML format must match exactly:
  ```yaml
  conceptId: fractions_intro
  chapter:
    code: CH3
    name: Fractions
  learningObjective: "Identify fractions as parts of a whole"
  coreIdea: "A fraction represents a part of a whole"
  examples:
    - "A pizza cut into 4 equal parts, one part is 1/4 🍕"
  misconceptions:
    - "Thinking bigger denominator means bigger fraction"
  supports:
    visual: true
  masteryCriteria: 0.8
  difficulty: beginner
  estimatedDuration: 15
  dependencies:
    - addition_1_10

  activities:
    - step: observe
      type: fraction_visual
      order: 1
      content:
        description: "See a whole pizza cut into 4 parts"
        whole: 1
        parts: 4
        shaded: 1
        text: "One part out of four is called one-fourth."
  ```
- File naming: `<conceptId>.yaml`, all lowercase with underscores
- Directory creation: auto-create `curriculum/level-b/math/` if it doesn't exist
- Atomic writes: write to temp file first, then rename (prevent partial files on crash)
- Skip failed concepts (log a warning)
- Report: "Wrote 31 files to curriculum/level-b/math/ (2 concepts failed, see log)"
- Do NOT overwrite existing files unless `--force` flag is set
- Handle filesystem errors (permission denied, disk full) gracefully

### Technical Requirements

- New file: `packages/pipeline/src/output/index.ts`
- Use `js-yaml` for YAML serialization (consistent with `packages/db`)
- YAML dump options: `{ indent: 2, lineWidth: 120, noRefs: true, sortKeys: false }`
- Export test helper: `yamlForConcept(concept, activities): string` — returns the exact YAML string
- File path construction:
  ```typescript
  function outputPath(baseDir: string, levelCode: string, subject: string, conceptId: string): string
  // → "curriculum/level-b/math/fractions_intro.yaml"
  ```

### Deliverables

- `packages/pipeline/src/output/index.ts`
- `packages/pipeline/src/output/__tests__/output.test.ts`

### Acceptance Criteria

- [ ] Writes valid YAML files that pass `pnpm curriculum:validate`
- [ ] File naming follows `conceptId.yaml` convention
- [ ] Directory auto-created if missing
- [ ] Existing files NOT overwritten without `--force`
- [ ] Failed concepts logged but not written
- [ ] Final summary reports write count, path, and any failures
- [ ] All tests pass

### Files Expected To Change

- `packages/pipeline/src/output/` (new directory)

### Testing Requirements

- Unit test: YAML string matches expected format
- Unit test: file written to correct path
- Unit test: existing file not overwritten
- Integration test: write → validate cycle

### Definition Of Done

- [ ] YAML writer produces valid curriculum files
- [ ] All tests pass

### Out Of Scope

- Git commit of generated files
- Pretty-printing customization
- JSON output format

---

## Story 13.8 — LangGraph Pipeline Orchestrator

### Goal

Build the LangGraph.js state graph that orchestrates all pipeline stages (extract → chunk → generate concepts → generate activities → validate → write) with conditional branching for retries, error recovery, and reporting.

### Background

Each pipeline stage is built as an independent module (Stories 13.2–13.7). LangGraph.js provides a state-graph framework where each node is a function that reads/writes shared state, with conditional edges (e.g., validation failure → retry node, not output node). This is the wiring that ties everything together.

### User Story

As a pipeline operator, I want to run a single graph execution that orchestrates all stages so that the PDF-to-YAML process is automatic, observable, and recoverable from errors.

### Functional Requirements

- State graph with the following nodes:
  1. `extract` — calls PDF extraction (Story 13.2)
  2. `chunk` — calls content chunking (Story 13.3)
  3. `generate_concepts` — calls concept generation (Story 13.4)
  4. `generate_activities` — calls activity generation (Story 13.5)
  5. `validate` — calls validation (Story 13.6)
     - If errors exist → conditional edge to `fix_errors` (retry)
     - If no errors → conditional edge to `write_output`
  6. `fix_errors` — re-generates failing concepts (calls 13.4 + 13.5 for failed items)
     - Tracks retry count per concept
     - If max retries exceeded → mark concept as failed, proceed
     - Loops back to `validate`
  7. `write_output` — calls YAML writer (Story 13.7)
  8. `report` — generates final summary
- Pipeline state type:
  ```typescript
  interface PipelineState {
    pdfPath: string;
    levelCode: string;
    subject: string;
    force: boolean;
    llmConfig: LlmConfig;
    
    // Populated by stages
    rawText: string | null;
    chapters: ChapterChunk[];
    concepts: GeneratedConcept[];
    activities: Map<string, GeneratedActivity[]>;  // conceptId → activities
    validated: ValidatedOutput | null;
    outputPaths: string[];
    
    // Control flow
    retryCounts: Map<string, number>;  // conceptId → retry count
    maxRetries: number;
    errors: string[];
    status: 'running' | 'complete' | 'partial' | 'failed';
    startedAt: Date;
    completedAt: Date | null;
  }
  ```
- LangGraph graph definition:
  ```typescript
  import { StateGraph } from '@langchain/langgraph';
  
  const workflow = new StateGraph<PipelineState>({ channels: ... })
    .addNode('extract', extractNode)
    .addNode('chunk', chunkNode)
    .addNode('generate_concepts', generateConceptsNode)
    .addNode('generate_activities', generateActivitiesNode)
    .addNode('validate', validateNode)
    .addNode('fix_errors', fixErrorsNode)
    .addNode('write_output', writeOutputNode)
    .addNode('report', reportNode)
    .addEdge('extract', 'chunk')
    .addEdge('chunk', 'generate_concepts')
    .addEdge('generate_concepts', 'generate_activities')
    .addEdge('generate_activities', 'validate')
    .addConditionalEdges('validate', shouldRetryOrProceed, {
      retry: 'fix_errors',
      proceed: 'write_output',
      fail: 'report',  // All concepts failed, nothing to write
    })
    .addConditionalEdges('fix_errors', hasMoreRetries, {
      retry: 'validate',
      proceed: 'write_output',
    })
    .addEdge('write_output', 'report')
    .addEdge('report', END);
  ```
- Human-in-the-loop checkpoints (optional):
  - `interruptBefore: ['generate_activities']` — pause before activity generation for review
  - `interruptAfter: ['validate']` — pause for approval of validation results
- All node functions are async, with proper error handling (individual node failure doesn't crash the graph)
- Progress logging at each node: "[Pipeline] Chapter 3/8 — Generating concepts..."
- Support resuming from checkpoint (LangGraph checkpointing)

### Technical Requirements

- New file: `packages/pipeline/src/graph/index.ts`
- Dependencies: `@langchain/langgraph` (add to `packages/pipeline/package.json`)
- Each node is a standalone function: `(state: PipelineState) => Promise<Partial<PipelineState>>`
- Error boundary: each node wraps its stage in try/catch, appends errors to `state.errors`, and continues
- Checkpoint configuration:
  ```typescript
  import { MemorySaver } from '@langchain/langgraph';
  const checkpointer = new MemorySaver();
  const app = workflow.compile({ checkpointer });
  ```
- Resume support: `app.invoke(null, { configurable: { thread_id: threadId } })`
- TypeScript strict mode throughout

### Deliverables

- `packages/pipeline/src/graph/index.ts`
- `packages/pipeline/src/graph/nodes/extract.ts`
- `packages/pipeline/src/graph/nodes/chunk.ts`
- `packages/pipeline/src/graph/nodes/generate-concepts.ts`
- `packages/pipeline/src/graph/nodes/generate-activities.ts`
- `packages/pipeline/src/graph/nodes/validate.ts`
- `packages/pipeline/src/graph/nodes/fix-errors.ts`
- `packages/pipeline/src/graph/nodes/write-output.ts`
- `packages/pipeline/src/graph/nodes/report.ts`
- `packages/pipeline/src/graph/__tests__/graph.test.ts`

### Acceptance Criteria

- [ ] Full graph executes end-to-end with a test PDF
- [ ] Conditional retry edge fires when validation fails
- [ ] Nodes that error don't crash the entire graph
- [ ] Checkpoint/resume works for interrupted runs
- [ ] Progress logging visible at each stage
- [ ] Final report shows: chapters processed, concepts generated, activities generated, files written, errors
- [ ] All tests pass

### Files Expected To Change

- `packages/pipeline/src/graph/` (new directory)
- `packages/pipeline/package.json` (add langgraph dependency)

### Testing Requirements

- Unit test: each node function independently
- Unit test: conditional edge routing (all pass, some retries, all fail)
- Integration test: full graph with mock/near-mock stages
- Error injection test: node failure doesn't crash graph

### Definition Of Done

- [ ] Full graph orchestration working
- [ ] Retry loops functional
- [ ] Checkpoint/resume tested
- [ ] All tests pass

### Out Of Scope

- Distributed execution (single-machine only)
- Persistent checkpoint store (in-memory only for MVP)
- Parallel node execution (sequential stages)

---

## Story 13.9 — CLI Entry Point & Integration

### Goal

Create the CLI command `pnpm curriculum:generate` that accepts PDF path, level, and subject as arguments and runs the LangGraph pipeline end-to-end, producing validated YAML files.

### Background

All existing curriculum tooling uses pnpm scripts (e.g., `pnpm curriculum:validate`). The pipeline needs a similar CLI entry point that integrates with the monorepo's script conventions.

### User Story

As a curriculum developer, I want to run `pnpm curriculum:generate --pdf <path> --level B --subject math` to produce validated Level B Math curriculum from the NIOS PDF.

### Functional Requirements

- CLI command: `pnpm curriculum:generate [options]`
- Options:
  - `--pdf <path>` (required) — Path to the PDF file
  - `--level <code>` (required) — Level code (e.g., `B`, `C`)
  - `--subject <name>` (required) — Subject name (e.g., `math`, `language`, `evs`)
  - `--force` (optional) — Overwrite existing YAML files
  - `--llm-provider <name>` (optional) — LLM provider override (default: from env)
  - `--llm-model <name>` (optional) — LLM model override (default: from env)
  - `--interactive` (optional) — Enable human-in-the-loop checkpoints
  - `--dry-run` (optional) — Generate and validate but don't write files
  - `--verbose` (optional) — Detailed logging per stage
  - `--output-dir <path>` (optional) — Custom output directory (default: `curriculum/`)
- CLI output:
  ```
  LearnEasy Curriculum Generator v1.0
  ====================================
  PDF:      Math_Level_B_english_medium.pdf
  Level:    B
  Subject:  Math
  Provider: openai (gpt-4o-mini)

  [1/8] Extracting PDF... ✓ (203 pages, 8 chapters)
  [2/8] Chunking content... ✓ (8 chapters → 31 concepts)
  [3/8] Generating concepts... ✓ (31 concepts, 0 validation errors)
  [4/8] Generating activities... ✓ (155 activities, 0 errors)
  [5/8] Validating... ✓ (31/31 passed, 0 retries needed)
  [6/8] Writing files... ✓ (31 files to curriculum/level-b/math/)
  [7/8] Summary
  ┌──────────────────────────────┬───────┬────────┐
  │ Metric                      │ Count │ Status │
  ├──────────────────────────────┼───────┼────────┤
  │ Chapters Processed           │ 8/8   │ ✅     │
  │ Concepts Generated           │ 31    │ ✅     │
  │ Activities Generated         │ 155   │ ✅     │
  │ YAML Files Written           │ 31    │ ✅     │
  │ Validation Errors            │ 0     │ ✅     │
  │ Retries Needed               │ 3     │ ℹ️     │
  │ Failed Concepts              │ 0     │ ✅     │
  └──────────────────────────────┴───────┴────────┘
  Done in 2m 34s
  ```
- Exit code 0 for success, 1 for any unrecoverable error
- Register as pnpm script in root `package.json`: `"curriculum:generate": "node packages/pipeline/dist/cli/index.js"`

### Technical Requirements

- New file: `packages/pipeline/src/cli/index.ts`
- Use `commander` or `yargs` for argument parsing (check existing project for preference; `commander` is commonly available)
- Or use Node.js `process.argv` with a simple parser to minimize dependencies
- Env var loading: use `dotenv` to load `.env` if present (consistent with existing pattern)
- All logging uses a logger utility at `packages/pipeline/src/cli/logger.ts` with:
  - Info: stdout (white text)
  - Success: stdout (green ✓)
  - Warning: stdout (yellow ⚠)
  - Error: stderr (red ✗)
  - Verbose: stdout (dim, only with `--verbose`)
- Dry-run mode: skip YAML writer, run validation only
- Error handling: graceful error messages for missing PDF, missing env vars, pipeline failures

### Deliverables

- `packages/pipeline/src/cli/index.ts`
- `packages/pipeline/src/cli/logger.ts`
- `packages/pipeline/src/cli/__tests__/cli.test.ts`
- Root `package.json` script entry
- `.env.example` update with LLM config vars

### Acceptance Criteria

- [ ] `pnpm curriculum:generate --pdf <path> --level B --subject math` runs and produces output
- [ ] Missing `--pdf` shows clear usage error
- [ ] `--dry-run` validates but doesn't write files
- [ ] `--force` overwrites existing files
- [ ] `--verbose` shows detailed stage logs
- [ ] Exit code 0 on success, 1 on error
- [ ] Table summary displayed at end
- [ ] All tests pass

### Files Expected To Change

- `packages/pipeline/src/cli/` (new directory)
- `packages/pipeline/package.json` (add bin/scripts)
- `package.json` (root, add script)
- `.env.example` (add LLM_* vars)

### Testing Requirements

- Unit test: argument parsing
- Unit test: logger output formats
- Integration test: CLI invocation with test PDF
- Error path tests: missing args, invalid PDF path

### Definition Of Done

- [ ] CLI command registered and working
- [ ] End-to-end pipeline runs from CLI
- [ ] All tests pass
- [ ] Documentation in `knowledge/curriculum/pipeline-cli.md`

### Out Of Scope

- Watch mode
- Concurrent PDF processing
- Web UI for pipeline
