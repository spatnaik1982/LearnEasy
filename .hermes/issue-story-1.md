## Goal

Centralize all action strings in `packages/ui/src/copy.ts` and replace every hard-coded action label in student/parent pages with `COPY.*` references. This makes later copy changes safe and enforces the "Explicit Literalism" rule from design-guidelines.md §13.

## Background

Issue #60 F7 found that the codebase uses "Start Learning" / "Resume Lesson" / "Continue Lesson" / "Submit Answer" / "Take a Break" / "Return to Lesson" inconsistently across pages. Some pages use "Start Learning" while others use "Begin"; some say "Back" with an arrow, others say "← Back to chapters", others just `router.back()` with no visual. Centralizing strings is the foundation for future copy A/B tests and i18n.

## User Story

As a content author or future i18n contributor, I want every user-facing action label to come from a single `copy.ts` module so that copy changes are safe and consistent.

## Functional Requirements

- New `packages/ui/src/copy.ts` exports a `COPY` object containing at least these keys (exact strings):
  - `startLesson: "Start Lesson"`
  - `resumeLesson: "Continue Lesson"`
  - `submitAnswer: "Submit Answer"`
  - `continueConcept: "Continue Lesson"`
  - `finishConcept: "Finish Concept"`
  - `takeBreak: "Take a Break"`
  - `returnToLesson: "Return to Lesson"`
  - `tryAgain: "Try Again"`
  - `goHome: "Go to Home"`
  - `startTodaysLesson: "Start Today's Lesson"`
  - `backToSubjects: "Back to subjects"`
  - `backToChapters: "Back to chapters"`
  - `chooseSubject: "Choose a Subject"`
  - `selectSubject: "Select a subject to start learning"`
  - `chooseConcept: "Choose a Concept"`
  - `selectConcept: "Select a concept to start learning"`
  - `loadingSubjects: "Finding lessons…"`
  - `loadingConcepts: "Finding concepts…"`
  - `loadingChapters: "Finding chapters…"`
  - `loadingLesson: "Loading lesson…"`
  - `conceptNotFound: "We can't find that lesson"`
  - `noSubjectsYet: "No subjects yet"`
  - `noChapters: "No chapters yet"`
  - `noConcepts: "No concepts yet"`
  - `errorTitle: "Something went wrong"`
  - `errorBody: "We can't load this right now. Please try again."`
  - `resumableSession: "You have a lesson in progress"`
  - `lastStep: "Last step: {step}"`
- `COPY` typed as `Record<string, string>` using `as const`.
- `packages/ui/src/index.ts` adds `export { COPY } from "./copy";`
- Every hard-coded action string in the student/parent pages below is replaced with `COPY.*` references.

## Files to modify

- `apps/student/pages/index.tsx` — `"Resume Lesson"` → `COPY.resumeLesson`; `"Start Learning"` → `COPY.startTodaysLesson`; `"Checking for saved progress..."` → `"Checking for saved progress..."` (keep — not in COPY; or add `COPY.checkingProgress` if you prefer; either is fine)
- `apps/student/pages/subjects.tsx` — `"Loading subjects..."` → `COPY.loadingSubjects`; `"Choose a Subject"` → `COPY.chooseSubject`; `"Select a subject to start learning"` → `COPY.selectSubject`
- `apps/student/pages/subjects/[id]/chapters.tsx` — `"← Back to subjects"` → `COPY.backToSubjects`; `"Loading chapters..."` → `COPY.loadingChapters`; `"Subject not found"` → `COPY.conceptNotFound`
- `apps/student/pages/chapters/[id]/concepts.tsx` — `"← Back to chapters"` → `COPY.backToChapters`; `"Loading concepts..."` → `COPY.loadingConcepts`; `"Choose a Concept"` → `COPY.chooseConcept`; `"Select a concept to start learning"` → `COPY.selectConcept`; `"No concepts available in this chapter."` → `COPY.noConcepts`
- `apps/student/pages/calm-zone.tsx` — `"Take a Break"` → `COPY.takeBreak`; `"Return to Lesson"` → `COPY.returnToLesson`; `"Use these calming tools whenever you need a moment to relax"` → keep (descriptive, not an action) or add `COPY.calmZoneIntro` if you prefer
- `apps/student/pages/learn/[conceptId].tsx` — `"Loading lesson..."` → `COPY.loadingLesson`; `"Concept not found"` → `COPY.conceptNotFound`; `"Continue Lesson"` (appears 3 times) → `COPY.continueConcept`; `"Submit Answer"` → `COPY.submitAnswer`; `"Take a Break"` → `COPY.takeBreak`; `"← Back"` → keep as-is or add `COPY.back`
- `apps/parent/pages/dashboard.tsx` — replace loading string with `COPY.errorTitle` placeholder (will be removed in Story 9); for the streak card, mark `// REMOVED in Story 9`
- `apps/parent/pages/dashboard/progress.tsx` — `"Loading progress..."` → `COPY.loadingSubjects` (re-use) or add a new key
- `apps/parent/pages/dashboard/reports.tsx` — `"Loading reports..."` → add `COPY.loadingReports` if not present
- `apps/parent/pages/dashboard/insights.tsx` — any loading strings → `COPY.*`

## Technical Requirements

- Use `opencode run -m opencode-go/deepseek-v4-flash` for ALL file changes.
- Run from project root: `cd /Users/sarthakpatnaik/Code/learn-easy`
- Use `--dangerously-skip-permissions` flag.
- For the bulk page sweep, attach the current page file with `-f` and instruct OpenCode to perform exact-string find-and-replace.

## Deliverables

- `packages/ui/src/copy.ts` (new)
- `packages/ui/src/index.ts` (modified — add export)
- All 11 pages listed above (modified)

## Acceptance Criteria

- [ ] `packages/ui/src/copy.ts` exists with all required keys
- [ ] `pnpm --filter @learn-easy/ui build` succeeds
- [ ] `pnpm --filter @learn-easy/student exec tsc --noEmit` succeeds
- [ ] `pnpm --filter @learn-easy/parent exec tsc --noEmit` succeeds
- [ ] `grep -rE '"(Start Learning|Resume Lesson|Continue Lesson|Submit Answer|Return to Lesson|Take a Break|Try Again|Go to Home|Start Today.s Lesson)"' apps/ --include="*.tsx" | grep -v "copy.ts"` returns no matches

## Testing Requirements

- `tsc --noEmit` on all three packages

## Definition Of Done

- [ ] `copy.ts` exported from `@learn-easy/ui`
- [ ] All 11 pages updated to use `COPY.*`
- [ ] No new lint warnings

## Out Of Scope

- Custom ESLint rule enforcing COPY usage (tracked as follow-up in #60 §4)
- i18n setup (not MVP)
- Changing the actual copy text (this story only centralizes the existing strings)

---

Parent Epic: #60
