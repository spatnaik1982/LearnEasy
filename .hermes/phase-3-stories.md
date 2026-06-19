# Phase 3 Implementation Plan — UX Coherence & Predictability Pass

> **Source contract:** Issue #60 (UX Plan — Arin Learn Cross-App Coherence & Predictability Pass)
> **Branch:** `feat/phase-3-ux-coherence`
> **Model:** `opencode-go/deepseek-v4-flash` for every story
> **AGENTS.md enforcement:** Hard-coded into every delegate context

---

## 0. Recon findings that update the UX contract

Before carving stories, the orchestrator re-read the codebase and discovered three findings from #60 that are **partially implemented** in main. The stories below are adjusted accordingly.

| Original finding | Real state in main | Story adjustment |
| --- | --- | --- |
| **F4** — Learn page does not use `VisualSchedule` | `learn/[conceptId].tsx` already imports and renders `<VisualSchedule />` (line 179) | Split into **F4a** (move `VisualSchedule` to sticky position + pass real `completedSteps`) — small. **F4b** (enforce reuse elsewhere) — defer |
| **F5** — Calm Zone unreachable | `learn/[conceptId].tsx` already has a "Take a Break" text button (line 423) routing to `/calm-zone?return=...` | Reduce to **F5a** (Calm Zone return contract — pause/resume session) and **F5b** (extend Take-a-Break reach beyond the learn page) |
| **F8** — Reduced-motion CSS missing | `apps/student/styles/globals.css` line 17 already implements `@media (prefers-reduced-motion: reduce)` overrides | Reduce to **F8a** (Settings page + toggles) and **F8b** (fix the broken `.high-contrast` CSS class — it references `var(--color-*)` but Tailwind colors are raw hex) |

This produces **10 implementation stories** (down from 11). F11 is a comment-only delta to #49 and #52, handled in Story 10.

---

## 1. Story list and execution order

| # | Story | Title | Labels | Depends on | Mode |
| --- | --- | --- | --- | --- | --- |
| 1 | Phase 3 — Story 1 | `copy.ts` constants + button-sweep | type:story, tech:frontend, quality:autism, priority:medium | — | **Parallel (first wave)** |
| 2 | Phase 3 — Story 2 | `<AppShell>` + integrate on every student/parent page | type:story, tech:frontend, quality:autism, priority:high | 1 | **Sequential (gates all others)** |
| 3 | Phase 3 — Story 3 | `<DataState>` + `useApi` hook + adopt on all pages | type:story, tech:frontend, quality:autism, priority:high | 1, 2 | **Parallel (with 4)** |
| 4 | Phase 3 — Story 4 | Three-state Home redesign | type:story, tech:frontend, quality:autism, priority:high | 1, 2 | **Parallel (with 3)** |
| 5 | Phase 3 — Story 5 | `<Breadcrumb>` + `<MasteryChip>` + integrate on subjects/chapters/concepts | type:story, tech:frontend, quality:autism, priority:medium | 1, 2 | **Parallel (with 6)** |
| 6 | Phase 3 — Story 6 | Calm Zone return contract + persistent footer link | type:story, tech:frontend, quality:autism, priority:high | 1, 2 | **Parallel (with 5)** |
| 7 | Phase 3 — Story 7 | Settings page + `SensoryProfileContext` + fix broken `.high-contrast` | type:story, tech:frontend, quality:autism, quality:accessibility, priority:high | 1, 2 | **Parallel (with 8)** |
| 8 | Phase 3 — Story 8 | 3-screen onboarding flow + `student.onboardedAt` field | type:story, tech:frontend, quality:autism, priority:medium | 1, 2, 4 | **Parallel (with 7)** |
| 9 | Phase 3 — Story 9 | Parent Overview narrative redesign + remove hardcoded streak | type:story, tech:frontend, quality:autism, priority:medium | 1, 2 | **Parallel (with 10)** |
| 10 | Phase 3 — Story 10 | VisualSchedule sticky positioning + F11 comment deltas on #49 and #52 | type:story, tech:frontend, quality:autism, priority:medium | 1, 2 | **Parallel (with 9)** |

After all stories: orchestrator runs `pnpm test`, `pnpm build`, fixes breakage, updates AGENTS.md/README, pushes branch, opens PR.

**Total delegated work: 10 stories → 10 subagents → 1 PR.**

---

## 2. Shared delegate context template (used for every story)

Every delegate receives the same skeleton; only the "Story" block changes.

```markdown
# Project Structure
LearnEasy monorepo at /Users/sarthakpatnaik/Code/learn-easy.
- pnpm workspace, Next.js 13 (pages router) student + parent apps, NestJS api, packages/ui (React + Tailwind), packages/db (Prisma).
- Tailwind config in each app defines the Serene Structure palette as raw hex (NOT CSS vars). `globals.css` in apps/student has a broken `.high-contrast` selector that will be fixed in Story 7.
- AGENTS.md is the source of truth for project conventions — see the dedicated enforcement block below.

# Current State
- Branch: feat/phase-3-ux-coherence (off main)
- Stories done so far in this phase: {list}
- Issue #60 is the design contract. Reference https://github.com/spatnaik1982/LearnEasy/issues/60

# AGENTS.md Enforcement (NON-NEGOTIABLE)
- File naming: kebab-case (e.g. app-shell.tsx, copy.ts, use-api.ts)
- Classes: PascalCase (e.g. AppShell, DataState, MasteryChip)
- Functions/variables: camelCase
- Strict TypeScript — no `any`, no `@ts-ignore` without a comment justifying it
- No barrel export changes to packages/ui/src/index.ts without exporting the new component
- ESLint: prettier + @typescript-eslint/recommended; do not introduce new lint warnings
- Touch only the files listed in the "Files to create/modify" block of the story. Do NOT touch other files unless directly required.
- Never modify: AGENTS.md, .env, packages/db/prisma/schema.prisma, .git, pnpm-lock.yaml
- Never run ALTER USER / PASSWORD / kill commands / dev server restarts

# Task: {Story title}
{full body — see sections 3.1–3.10 below}

# Files to create/modify
{story-specific}

# How to execute
1. cd /Users/sarthakpatnaik/Code/learn-easy
2. git status — should be clean on feat/phase-3-ux-coherence
3. Run: /opt/homebrew/bin/opencode run -m opencode-go/deepseek-v4-flash -f <files> --dangerously-skip-permissions -- "<instruction>"
4. Use multiple -f flags to attach multiple files for context
5. After files land, run:
   - pnpm --filter @learn-easy/ui build (for UI stories)
   - pnpm --filter @learn-easy/student exec tsc --noEmit
   - pnpm --filter @learn-easy/parent exec tsc --noEmit
   - pnpm --filter @learn-easy/ui test (if package.json has test script; otherwise skip)
6. If tsc reports errors caused by your changes, fix them with another opencode run on the failing file
7. Return a summary with: files created, files modified, command outputs (tsc / build), any deviations

# Out of scope for this story
{story-specific}
```

---

## 3. Story bodies

### 3.1 Story 1 — `copy.ts` + button-sweep

**Goal:** Centralize all action strings in `packages/ui/src/copy.ts` and replace every hard-coded action label in student/parent pages with `COPY.*` references. This makes later copy changes safe and enforces the "Explicit Literalism" rule from design-guidelines.md §13.

**Files to create:**
- `packages/ui/src/copy.ts` — `export const COPY = { ... } as const;` containing at minimum: `startLesson: "Start Lesson"`, `resumeLesson: "Continue Lesson"`, `submitAnswer: "Submit Answer"`, `continueConcept: "Continue Lesson"`, `finishConcept: "Finish Concept"`, `takeBreak: "Take a Break"`, `returnToLesson: "Return to Lesson"`, `tryAgain: "Try Again"`, `goHome: "Go to Home"`, `startTodaysLesson: "Start Today's Lesson"`, `backToSubjects: "Back to subjects"`, `backToChapters: "Back to chapters"`, `chooseSubject: "Choose a Subject"`, `selectSubject: "Select a subject to start learning"`, `chooseConcept: "Choose a Concept"`, `selectConcept: "Select a concept to start learning"`, `loadingSubjects: "Finding lessons…"`, `loadingConcepts: "Finding concepts…"`, `loadingChapters: "Finding chapters…"`, `loadingLesson: "Loading lesson…"`, `conceptNotFound: "We can't find that lesson"`, `noSubjectsYet: "No subjects yet"`, `noChapters: "No chapters yet"`, `noConcepts: "No concepts yet"`, `errorTitle: "Something went wrong"`, `errorBody: "We can't load this right now. Please try again."`.
- Update `packages/ui/src/index.ts` to add `export { COPY } from "./copy";`

**Files to modify:**
- `apps/student/pages/index.tsx` — replace `"Resume Lesson"`, `"Start Learning"`, `"Checking for saved progress..."` with `COPY.*`
- `apps/student/pages/subjects.tsx` — replace `"Loading subjects..."`, `"Choose a Subject"`, `"Select a subject to start learning"` with `COPY.*`
- `apps/student/pages/subjects/[id]/chapters.tsx` — replace `"← Back to subjects"`, `"Loading chapters..."`, `"Subject not found"` with `COPY.*`
- `apps/student/pages/chapters/[id]/concepts.tsx` — replace `"← Back to chapters"`, `"Loading concepts..."`, `"Choose a Concept"`, `"Select a concept to start learning"`, `"No concepts available in this chapter."` with `COPY.*`
- `apps/student/pages/calm-zone.tsx` — replace `"Take a Break"`, `"Use these calming tools whenever you need a moment to relax"`, `"Return to Lesson"` with `COPY.*`
- `apps/student/pages/learn/[conceptId].tsx` — replace `"Loading lesson..."`, `"Concept not found"`, `"Continue Lesson"`, `"Submit Answer"`, `"Take a Break"`, `"← Back"` with `COPY.*`
- `apps/parent/pages/dashboard.tsx` — replace `"Loading dashboard..."`, `"Current Streak"`, `"keep it going!"`, `"View Full Progress"`, `"Weekly Reports"`, `"AI Insights"`, `"Recent Activity"`, `"No recent activity"`, `"Concepts Mastered"`, `"Average Mastery"`, `"across all concepts"` with `COPY.*` (or, where the strings will be removed in Story 9, mark them `// REMOVED in Story 9`)
- `apps/parent/pages/dashboard/progress.tsx` — replace `"Loading progress..."` with `COPY.*`
- `apps/parent/pages/dashboard/reports.tsx` — replace `"Loading reports..."` with `COPY.*`
- `apps/parent/pages/dashboard/insights.tsx` — replace any loading strings with `COPY.*`

**Do NOT:**
- Add a custom ESLint rule in this story (the implementation of the F7 lint rule is a separate "follow-up" tracked in #60 §4, not part of Phase 3).
- Modify any `COPY.*` consumer that is not listed above.

**Acceptance criteria:**
- `packages/ui/src/copy.ts` exists and exports `COPY` typed as `Record<string, string>` (use `as const`)
- `pnpm --filter @learn-easy/ui build` succeeds
- `pnpm --filter @learn-easy/student exec tsc --noEmit` succeeds
- `pnpm --filter @learn-easy/parent exec tsc --noEmit` succeeds
- `grep -rE '"(Start Learning|Resume Lesson|Continue Lesson|Submit Answer|Return to Lesson|Take a Break|Try Again|Go to Home)"' apps/` returns zero matches in `*.tsx` (only allowed in `copy.ts`)

---

### 3.2 Story 2 — `<AppShell>` + integrate on every student/parent page

**Goal:** Introduce a single shared shell component used by both apps. The shell provides a persistent footer nav for the student app and a top tab bar for the parent app, both driven by the same source of truth. Implements F1 (no app shell) and the foundation F5/F6 (Calm Zone link, DataState adoption) and F7/F8 (footer link to Settings) all rely on.

**Files to create:**
- `packages/ui/src/AppShell.tsx` — React component with three slots: `header?`, `main`, `persistentFooter?` (student) or `primaryNav?` (parent). Props:
  ```ts
  interface AppShellProps {
    children: ReactNode;
    variant?: "student" | "parent";
    /** When variant=student, override the default footer (e.g. for Calm Zone). */
    footer?: ReactNode;
    /** When variant=parent, override the default tab nav. */
    primaryNav?: ReactNode;
  }
  ```
- `packages/ui/src/StudentFooter.tsx` — three 56×56 touch targets: "Home" (`/`), "Calm Zone" (`/calm-zone`), "Settings" (`/settings`). Each renders as a Next.js `<Link>` with an icon (use existing `lucide-react` icons: `Home`, `Leaf`, `Settings` — `Leaf` is a stand-in for the calm-zone visual; if not available, use `Heart`).
- `packages/ui/src/ParentTabBar.tsx` — re-implementation of the existing tab bar in `apps/parent/lib/dashboard-layout.tsx`, but driven by a `tabs: { href, label }[]` prop and exported as a pure presentational component.
- Update `packages/ui/src/index.ts` to export the three new components.

**Files to modify:**
- `apps/student/pages/_app.tsx` — wrap `<Component />` in nothing; no global wrap (the AppShell wraps each page).
- Every student page: `apps/student/pages/index.tsx`, `apps/student/pages/subjects.tsx`, `apps/student/pages/subjects/[id]/chapters.tsx`, `apps/student/pages/chapters/[id]/concepts.tsx`, `apps/student/pages/calm-zone.tsx`, `apps/student/pages/learn/[conceptId].tsx` — wrap the existing top-level container in `<AppShell variant="student">` and **remove** the existing `bg-warm-off-white` / `min-h-screen` wrappers from each page (the shell owns those).
- `apps/student/pages/calm-zone.tsx` — pass `footer={null}` to suppress the footer (this is a regulated space; the existing "Return to Lesson" button stays inside the page).
- `apps/parent/lib/dashboard-layout.tsx` — replace the inline header + nav with `<AppShell variant="parent" primaryNav={<ParentTabBar ... />}>` and remove the duplicate chrome. Pass `selectedChild` and `children` as before.
- All four parent pages: `apps/parent/pages/dashboard.tsx`, `apps/parent/pages/dashboard/progress.tsx`, `apps/parent/pages/dashboard/reports.tsx`, `apps/parent/pages/dashboard/insights.tsx` — they already use `DashboardLayout`. No per-page change needed beyond the layout refactor; verify each still renders.

**ALX-1 rules baked in:**
- Footer order is fixed: Home → Calm Zone → Settings, in that order, every page.
- Footer buttons are 56×56 with 16px gap, primary color for the active route, `aria-current="page"` on the active link.
- Active route detection: derive from `useRouter().pathname` inside `StudentFooter`.

**Acceptance criteria:**
- `pnpm --filter @learn-easy/ui build` succeeds
- `pnpm --filter @learn-easy/student exec tsc --noEmit` succeeds
- `pnpm --filter @learn-easy/parent exec tsc --noEmit` succeeds
- Student footer appears on every student page except `/calm-zone`
- Parent tab bar still works on all 4 parent dashboard pages
- No page still ships its own `bg-warm-off-white min-h-screen` wrapper at the root (the shell owns this)

---

### 3.3 Story 3 — `<DataState>` + `useApi` hook + adopt on all pages

**Goal:** Standardize loading / empty / error / ready states across every list/detail page. Implements F6.

**Files to create:**
- `packages/ui/src/DataState.tsx` — component with signature:
  ```ts
  type DataStateProps =
    | { status: "loading"; label?: string }
    | { status: "empty"; title: string; body?: string; action?: { label: string; onClick: () => void } }
    | { status: "error"; title?: string; body?: string; onRetry?: () => void }
    | { status: "ready"; children: ReactNode };
  export function DataState(props: DataStateProps): JSX.Element;
  ```
  - `loading`: centered soft pulse (CSS keyframe `animate-pulse` on a 64×64 rounded card) + label in `text-on-surface-variant`
  - `empty`: rounded-xl white card with `title` (h2) + optional `body` + optional action button
  - `error`: `bg-soft-coral/10` rounded card with title "Something went wrong" + body + a "Try Again" button (using `COPY.tryAgain`) that calls `onRetry`
  - `ready`: passthrough
- `apps/student/lib/useApi.ts` — generic hook:
  ```ts
  function useApi<T>(fn: () => Promise<{ data: T | null; error: string | null }>, deps: unknown[]):
    { data: T | null; loading: boolean; error: string | null; refetch: () => void; setData: (T | null) => void };
  ```
  Wraps the existing `ApiResponse` pattern in `apps/student/lib/api.ts`. Handles abort-on-unmount via `AbortController`. Auto-fires on mount and on `deps` change. Returns a manual `refetch()` and a `setData` (for optimistics later).
- `apps/parent/lib/useApi.ts` — same shape, imports nothing from student.

**Files to modify:**
- `apps/student/pages/subjects.tsx` — replace the plain loading text with `<DataState status="loading" />`; on fetch success, render `<DataState status="ready">{grid}</DataState>`; on empty, render `<DataState status="empty" title={COPY.noSubjectsYet} action={{label: COPY.tryAgain, onClick: refetch}} />`.
- `apps/student/pages/subjects/[id]/chapters.tsx` — same pattern; on `!subject`, use `<DataState status="error" onRetry={refetch} />` with the title from `COPY.errorTitle`.
- `apps/student/pages/chapters/[id]/concepts.tsx` — same pattern; on empty list, `<DataState status="empty" title={COPY.noConcepts} />`.
- `apps/student/pages/learn/[conceptId].tsx` — replace the two plain loading/error blocks with `<DataState>`.
- `apps/student/pages/index.tsx` — wrap the resume card and the "Start Learning" button in `<DataState status="ready">`, and the "Checking for saved progress..." text with `<DataState status="loading" />`.
- `apps/parent/pages/dashboard.tsx` — replace `loading ? <p>Loading…</p>` with `<DataState status="loading" />`.
- `apps/parent/pages/dashboard/progress.tsx` — same.
- `apps/parent/pages/dashboard/reports.tsx` — same.
- `apps/parent/pages/dashboard/insights.tsx` — same.

**Acceptance criteria:**
- All 9 pages above render the new `DataState` component instead of plain text
- `pnpm --filter @learn-easy/ui build` succeeds
- `pnpm --filter @learn-easy/student exec tsc --noEmit` succeeds
- `pnpm --filter @learn-easy/parent exec tsc --noEmit` succeeds
- `useApi` is exported from each app's `lib/` and has a unit-style smoke test (or at minimum a documented usage example) — if no test runner is configured for the apps, document usage in `apps/student/lib/useApi.README.md` (one paragraph).

---

### 3.4 Story 4 — Three-state Home redesign

**Goal:** Replace `apps/student/pages/index.tsx` with the three-state home (no progress / resume available / session complete) per F2.

**Files to modify:**
- `apps/student/pages/index.tsx` — full rewrite. Logic:
  - Use `useApi` from Story 3 to call `fetchResumeState(user.id)`.
  - Three render branches based on `resumeInfo`:
    - **No progress (new learner)**: Greeting "Hi {firstName}" + 96×96 illustration emoji 🎓 + 1 primary CTA "Start Today's Lesson" (`COPY.startTodaysLesson`) → `/subjects`
    - **Resume available**: Greeting + 1 primary CTA `Continue: {conceptTitle}` → `/learn/{conceptId}` with a 4-step dot indicator underneath; secondary "Choose a different lesson" → `/subjects`
    - **Session complete today (no resumable session AND a `lastCompletedAt` within last 12h)**: Greeting + disabled primary CTA "Today's Lesson: Done" with helper text "Great work. See you tomorrow."; a small "Practice again" text-link → `/subjects`
  - For the first-name greeting, use `user?.name?.split(" ")[0]`; fall back to "there" if absent.
  - On the no-progress branch, the home must show exactly **one** primary action and the AppShell footer.
  - Loading state: `<DataState status="loading" />` from Story 3.

**Acceptance criteria:**
- `pnpm --filter @learn-easy/student exec tsc --noEmit` succeeds
- `pnpm --filter @learn-easy/student build` succeeds
- A manual `grep` for the literal string `"LearnEasy - Student App"` in the file returns no match (the old headline is gone).

---

### 3.5 Story 5 — `<Breadcrumb>` + `<MasteryChip>` + integrate

**Goal:** Make the subject → chapter → concept hierarchy navigable and show concept mastery state. Implements F3.

**Files to create:**
- `packages/ui/src/Breadcrumb.tsx` — pure presentational. Props:
  ```ts
  interface BreadcrumbItem { label: string; href?: string; }
  interface BreadcrumbProps { items: BreadcrumbItem[]; }
  ```
  Renders `<nav aria-label="Breadcrumb"><ol>` with chevron separators. Last item is non-link and uses `aria-current="page"`. Min height of each item 32px, touch target 56px is not required (this is a secondary nav).
- `packages/ui/src/MasteryChip.tsx` — small (24×24) chip. Props:
  ```ts
  type MasteryState = "not-started" | "in-progress" | "mastered";
  interface MasteryChipProps { state: MasteryState; size?: "sm" | "md"; }
  ```
  Color states: Soft Blue (not-started), Soft Amber (in-progress), Muted Green (mastered). Iconography: empty circle / half circle / filled check.
- Update `packages/ui/src/index.ts` exports.

**Files to modify:**
- `apps/student/pages/subjects/[id]/chapters.tsx` — replace the decorative `<div>Subjects &gt; {subject.title}</div>` with `<Breadcrumb items={[{label: "Subjects", href: "/subjects"}, {label: subject.title}]} />`.
- `apps/student/pages/chapters/[id]/concepts.tsx` — add `<Breadcrumb items={[{label: "Subjects", href: "/subjects"}, {label: subjectTitle, href: `/subjects/${subjectId}/chapters`}, {label: chapterTitle}]} />` at the top. To get `subjectTitle` and `subjectId`, call `fetchSubject(chapter.subjectId)` in a second `useApi`. Replace the static `{index + 1}` circle with `<MasteryChip state={...} />` where the state is derived from a new `conceptProgress: Record<conceptId, MasteryState>` map (use the existing `fetchResumeState` or add a new lightweight `getConceptMastery` to `lib/api.ts` — if adding, follow the existing `ApiResponse<T>` pattern in `lib/api.ts`).
- `apps/student/pages/subjects.tsx` — add `<Breadcrumb items={[{label: "Subjects"}]} />` at the top.

**ALX-1 / ALX-4 enforcement:**
- Breadcrumb separator: use the `lucide-react` `ChevronRight` icon, `aria-hidden`.
- MasteryChip with `aria-label`: "Not started" / "In progress" / "Mastered".

**Acceptance criteria:**
- `pnpm --filter @learn-easy/ui build` succeeds
- `pnpm --filter @learn-easy/student exec tsc --noEmit` succeeds
- All three pages render the breadcrumb above the existing page title
- `MasteryChip` is used in `concepts.tsx` instead of the static number; the static number `index + 1` no longer appears in the concept list rendering

---

### 3.6 Story 6 — Calm Zone return contract + persistent footer link

**Goal:** Wire the existing `?return=` query parameter on `/calm-zone` to a real pause/resume session, and confirm the StudentFooter (from Story 2) provides a persistent link. Implements F5.

**Files to modify:**
- `apps/student/lib/session.ts` — add two functions:
  ```ts
  export function pauseSession(sessionId: string, currentStep: number, activityId?: string): Promise<ApiResponse<{ pausedAt: string }>>;
  export function resumeSession(sessionId: string): Promise<ApiResponse<{ step: number; activityId?: string }>>;
  ```
  If the API does not yet support pause/resume, write these as stubs that return `ApiResponse<...>` with the data shape expected by the client, but the body is a localStorage roundtrip. Document this in a `// TODO(api):` comment. (The localStorage fallback is acceptable for Phase 3 — the actual API can land in a follow-up story.)
- `apps/student/pages/calm-zone.tsx` — on mount, call `pauseSession(sessionId, currentStep, activityId)` where `currentStep` and `activityId` come from parsing `?return=` (e.g. `?return=/learn/c1` parses to `conceptId: "c1"`, `step: 0` default; if the URL contains `?step=2&activity=a3`, parse those too). The "Return to Lesson" button label includes the step indicator: `Return to Step 2: Guided Practice`. On click, call `resumeSession(...)` then `router.push(returnPath)`. If `returnPath` is missing, default to `/subjects`.
- `apps/student/pages/learn/[conceptId].tsx` — replace the existing local `handleTakeBreak` (line 95) with one that encodes the current step + activity id in the `?return=` URL: `?return=/learn/{conceptId}&step={currentStep}&activity={activityId}`. Read these params back on return.
- Story 2 already provides the persistent StudentFooter link to `/calm-zone`; no further work in this story for the link.

**Acceptance criteria:**
- `pnpm --filter @learn-easy/student exec tsc --noEmit` succeeds
- `pnpm --filter @learn-easy/student build` succeeds
- A click on "Take a Break" while in step 2 of a concept → URL is `/calm-zone?return=/learn/c1&step=2`
- The Calm Zone "Return to Lesson" button label is `Return to Step 3: Independent Practice` (or equivalent) when entered with `step=2`

---

### 3.7 Story 7 — Settings page + `SensoryProfileContext` + fix `.high-contrast` CSS

**Goal:** Implement the Phase 1 sensory controls from F8. Three toggles, persisted to localStorage for now. Fix the broken `.high-contrast` CSS selector (uses `var(--color-*)` but Tailwind config has raw hex).

**Files to create:**
- `apps/student/pages/settings.tsx` — a single page wrapped in `<AppShell variant="student">` (from Story 2). Title: "Settings". Three toggle rows, each is a `<button role="switch" aria-checked={...}>` at min-height 56px:
  - **Reduce motion** (default OFF) — on toggle, sets `document.documentElement.classList.toggle("motion-reduce", value)` and persists to `localStorage["learn-easy.sensory"]`.
  - **Lower contrast** (default OFF) — on toggle, sets `document.documentElement.classList.toggle("high-contrast", value)`. (See the CSS fix below.)
  - **Sound on/off** (default ON) — sets a boolean in localStorage; no audio exists yet, so this is forward-looking.
- `apps/student/lib/SensoryProfileContext.tsx` — React context that reads from localStorage on mount, provides `useSensoryProfile()` hook returning `{reduceMotion, lowContrast, soundEnabled, setReduceMotion, setLowContrast, setSoundEnabled}`. Wrap the student app at `apps/student/pages/_app.tsx` so any page can read the profile.
- `apps/student/lib/__tests__/SensoryProfileContext.test.tsx` (or `.test.ts` if no tsx test runner is configured) — minimal test that toggling `setReduceMotion(true)` writes to localStorage and the hook returns the new value. If no test runner is configured, skip the test and add a `// Note: no test runner` comment in the file.
- `apps/student/styles/globals.css` — fix the `.high-contrast` class. The current selector uses `var(--color-soft-blue)` and `var(--color-slate-text)` but Tailwind has no `--color-*` CSS vars. Replace the block with **inline-style attribute** overrides applied via inline `style` from the Settings page, OR add the proper CSS vars to the Tailwind base layer. Recommended: add a `theme` block in `globals.css` that defines the high-contrast palette as CSS vars and have `.high-contrast` reference them. Example:
  ```css
  :root {
    --color-soft-blue: #5D87B1;
    --color-slate-text: #374151;
  }
  .high-contrast {
    --color-soft-blue: #1a3a5c;
    --color-slate-text: #000000;
  }
  ```
  And in `apps/student/tailwind.config.js`, change the relevant colors to `var(--color-soft-blue)` etc. ONLY for the colors affected by `.high-contrast` (soft-blue and slate-text). Leave the other palette colors as raw hex.
- `apps/student/tailwind.config.js` — update the two color entries to use CSS vars.

**Acceptance criteria:**
- `pnpm --filter @learn-easy/student exec tsc --noEmit` succeeds
- `pnpm --filter @learn-easy/student build` succeeds
- Settings page renders at `/settings` with the AppShell footer
- Toggling Reduce Motion off then on, reloading the page, the toggle state persists
- Toggling Lower Contrast on adds the `high-contrast` class to `<html>` (verify via `document.documentElement.classList.contains("high-contrast")`)

---

### 3.8 Story 8 — 3-screen onboarding flow + `student.onboardedAt` field

**Goal:** First-time learner experience. Implements F9. Note: full persistence to the `Student` model requires a Prisma migration, which is out of scope for Phase 3 (orchestrator will guard). Persist the flag in localStorage instead, with a clear `// TODO(db): replace with student.onboardedAt` comment.

**Files to create:**
- `apps/student/pages/onboarding/welcome.tsx` — screen 1. Greeting + 🎓 emoji (96×96) + "LearnEasy helps you learn at your own pace." + primary "Show me how" + secondary text-link "I know how" (sets `localStorage["learn-easy.onboardedAt"] = new Date().toISOString()` and routes to `/subjects`).
- `apps/student/pages/onboarding/tour.tsx` — screen 2. Title "Every lesson has 4 short parts" + render `<VisualSchedule steps={["Observe", "Practice", "Try on your own", "Show what you know"]} currentStep={0} completedSteps={[]} />` (sample schedule) + primary "Show me Calm Zone" → `/onboarding/calm`.
- `apps/student/pages/onboarding/calm.tsx` — screen 3. Title "If you need a break anytime, tap the leaf 🍃" + a static preview image (use the 📚 emoji or a `<div>` with a calming gradient) of the Calm Zone + primary "Start my first lesson" (sets onboardedAt + routes to `/subjects`).
- Each page wraps in `<AppShell variant="student" footer={null} />` (the AppShell already supports `footer` override per Story 2).

**Files to modify:**
- `apps/student/pages/index.tsx` — add a check at the top: if `localStorage.getItem("learn-easy.onboardedAt")` is null AND `!resumeInfo?.hasResumableSession`, route to `/onboarding/welcome`. The check must run after the resume state fetch.

**Acceptance criteria:**
- `pnpm --filter @learn-easy/student exec tsc --noEmit` succeeds
- `pnpm --filter @learn-easy/student build` succeeds
- A user with no localStorage flag and no resume state lands on `/onboarding/welcome` instead of the home redesign
- Completing the flow sets the localStorage flag and routes to `/subjects`

---

### 3.9 Story 9 — Parent Overview narrative redesign + remove hardcoded streak

**Goal:** Implement F10. Replace the flat 3-stat grid + "Quick Links" with a narrative arc.

**Files to modify:**
- `apps/parent/pages/dashboard.tsx` — full rewrite. New layout:
  1. **Headline** (always one): "This week {childName} completed {n} concepts and is on track for Level A." OR "Aarav needs help with {lowestMasteryConcept} — try a 5-minute practice together." Compute from `progress` data.
  2. **3 stat cards** (keep, but remove hardcoded streak). Replace the hardcoded `"3 days"` with `{streakDays}` from data; if `streakDays` is 0, hide the streak card entirely.
  3. **This week panel** — replace "Recent Activity" with a list of last 5 sessions. Each row: concept name + duration + outcome icon (✅ for completed, ↻ for in-progress, ➕ for started).
  4. **Next step for you** — a single card. If the API for insights returns data (issue #52), show the top insight. Otherwise, fallback to a CTA: "Set up a daily lesson time" → `/dashboard/reports` (or just a no-op button until #52 lands).
  5. **Quick Links** move to a text-link row at the bottom of the page, no longer styled as primary cards.
- `apps/parent/lib/dashboard-layout.tsx` — no structural change, just verify the layout still works with the rewritten page.

**Acceptance criteria:**
- `pnpm --filter @learn-easy/parent exec tsc --noEmit` succeeds
- `pnpm --filter @learn-easy/parent build` succeeds
- The string `"3 days"` does NOT appear anywhere in `apps/parent/pages/dashboard.tsx` (verify with grep)
- The string `"keep it going!"` does NOT appear in `apps/parent/pages/dashboard.tsx`
- "Quick Links" are now text-links, not filled cards

---

### 3.10 Story 10 — VisualSchedule sticky + F11 spec deltas on #49 and #52

**Goal:** Move `VisualSchedule` to a sticky position above the activity on `learn/[conceptId].tsx` (F4) and post comment-only spec deltas to issues #49 and #52 (F11).

**Files to modify:**
- `apps/student/pages/learn/[conceptId].tsx` — wrap the existing `<VisualSchedule />` block in a `<div className="sticky top-0 z-10 bg-warm-off-white py-2">` so it pins to the top on scroll. Also pass real `completedSteps` from state (already does this — verify and leave alone if correct). The `transition-opacity` and `duration-200` classes elsewhere should become `motion-safe:transition-opacity motion-safe:duration-200` so the global reduced-motion override from F8 also catches them.

**GitHub work (NOT code):**
- Post a comment on issue #49 (`Story 8.1 - AI Tutor Chat Interface`) with the F11 spec deltas:
  - Button label: "Ask Tutor" (not "Ask AI Tutor")
  - Button visual: tertiary text-link style, top-right of activity header
  - Empty-state fallback: "We're still learning how to help with this one. Try a different activity."
- Post a comment on issue #52 (`Story 10.2 - AI Insights & Practice Recommendations`) with:
  - No-result empty state copy: "We're still learning your child's patterns. Check back in a few days."
  - "Start Practice" cross-app link: confirmation sheet with "Cancel" / "Open lesson"

**Acceptance criteria:**
- `pnpm --filter @learn-easy/student exec tsc --noEmit` succeeds
- The `VisualSchedule` is wrapped in a `sticky top-0` container in the rendered output
- Both issues #49 and #52 have a new comment from the orchestrator's GitHub account containing the F11 deltas

---

## 4. Orchestrator post-implementation checklist

After all 10 delegates return and the orchestrator has committed each story:

1. **Run full validation from repo root:**
   ```bash
   pnpm install
   pnpm --filter @learn-easy/ui build
   pnpm --filter @learn-easy/student exec tsc --noEmit
   pnpm --filter @learn-easy/parent exec tsc --noEmit
   pnpm --filter @learn-easy/student build
   pnpm --filter @learn-easy/parent build
   pnpm -r test 2>&1 | tail -50
   pnpm curriculum:validate
   ```
   Fix any breakage with additional OpenCode delegates (Flash model).
2. **Update documentation:**
   - `AGENTS.md` — add Phase 3 to the curriculum/structure tree if relevant; update the "Available Scripts" table if any new scripts were added.
   - `README.md` — add a Phase 3 section if it has one.
   - `knowledge/project-management/github-backlog.md` — add Phase 3 entry, mark Phase 2 as complete (it was in flight in #41–#45).
   - `knowledge/project-vision.md` — note Phase 3 deliverables.
3. **Update the parent epic #60** — close it as `completed` once all 10 stories are merged.
4. **Push branch and create PR:**
   ```bash
   git push -u origin feat/phase-3-ux-coherence
   gh pr create --title "Phase 3: UX Coherence & Predictability Pass (#60)" \
     --body "<standard PR body — see below>" \
     --head feat/phase-3-ux-coherence --base main
   ```
5. **PR body template:**
   ```
   ## Phase 3 — UX Coherence & Predictability Pass

   Closes #60

   ### Stories delivered
   | # | Story | Files | Notes |
   | - | ----- | ----- | ----- |
   | 1 | copy.ts + button sweep | ... | ... |
   ...

   ### Verification
   - pnpm -r test: <output>
   - pnpm --filter @learn-easy/student build: <output>
   - pnpm --filter @learn-easy/parent build: <output>
   - pnpm curriculum:validate: <output>

   ### AGENTS.md compliance
   - File naming: kebab-case (verified)
   - TypeScript strict: tsc --noEmit clean (verified)
   - No DB credentials touched
   - No new lint warnings
   ```

6. **Do NOT merge** — user wants to review the PR first.

---

## 5. Pitfalls specific to this phase

1. **Tailwind CSS var swap in Story 7 is risky.** The change to `apps/student/tailwind.config.js` (replacing raw hex with `var(--color-soft-blue)` etc.) affects every component that uses those classes. If anything goes wrong, the whole student app may render with default colors. Mitigation: make the change minimal (only `soft-blue` and `slate-text`), define the vars in `:root` BEFORE `.high-contrast`, and visually verify the dev server renders identical colors in the default theme. If the Tailwind build breaks, revert the config change and use inline `style={{}}` on the affected elements instead.

2. **No tests in `packages/ui`.** Story 1 (copy.ts) and Story 7 (SensoryProfileContext) cannot rely on existing test coverage. Delegate must run `tsc --noEmit` instead. Document the verification in the delegate return.

3. **AppShell wrap may break page transitions.** The `<AppShell variant="student">` wraps every page. Pages that use `router.push` or `useEffect`-based redirects (e.g. the onboarding redirect in Story 8) must still work because the wrap is at the page level, not the layout level. Verify in the browser after Story 2 lands.

4. **Onboarding localStorage race.** Story 8 reads localStorage on mount inside a `useEffect`. The home page (Story 4) also reads it. The order is: home mount → check resume state → if no resume, check localStorage → route to `/onboarding/welcome`. This must be inside the resume-state useEffect's `.then()` block, not in a separate effect. The delegate must verify the redirect order in a browser smoke test.

5. **VisualSchedule sticky positioning on mobile.** On narrow viewports, a sticky `<VisualSchedule />` may eat 30%+ of the screen. Delegate should add a `hidden md:block` wrapper OR a `max-md:static` class to keep mobile clean.

6. **Story 2 AppShell is the gating dependency.** Stories 3–10 all depend on Story 2 landing first. If Story 2 fails, the orchestrator fixes it before dispatching the rest. Do not parallelize before Story 2 is verified.
