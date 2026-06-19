# UX Plan — Arin Learn (LearnEasy) Cross-App Coherence & Predictability Pass

## Summary

A senior-UX review of the current Student (`apps/student`) and Parent (`apps/parent`) apps against the ALX 2.0 framework (`knowledge/design/design-guidelines.md`) and the existing backlog. The product works in isolated flows but has systemic cross-screen gaps that violate the foundational ALX principles (Predictability, Visual First, One Concept at a Time, Visible Progress, Safe Mistakes, Controlled Sensory Environment, Routine-Based Learning). This issue captures a single, prioritised UX plan with concrete, file-level recommendations, not a generic style guide. Each item maps to a measurable ALX principle so the implementation can be verified against the published checklist (section 15 of the design guidelines).

This issue is **deliberately scoped as a design contract, not a code change.** Stories will be carved out of it by an implementation planner.

---

## 1. Audit Method

1. Read every student + parent page and the shared `packages/ui` components.
2. Cross-referenced each screen against ALX-1 through ALX-18 and the Design Review Checklist (design-guidelines.md §15).
3. Walked the full learner journey end-to-end (Home → Subject → Chapter → Concept → Learn → Activity → Quiz → Complete) and the parent journey (Overview → Progress → Reports → Insights).
4. Compared current patterns with the active backlog (#49 AI Tutor Chat, #52 Insights, #53 Concept Editor, #54 Activity Editor) to identify collision zones where pending work would need to be redone.

**Audited files:**

- `apps/student/pages/index.tsx`, `apps/student/pages/_app.tsx`, `apps/student/pages/calm-zone.tsx`
- `apps/student/pages/subjects.tsx`, `apps/student/pages/subjects/[id]/chapters.tsx`
- `apps/student/pages/chapters/[id]/concepts.tsx`
- `apps/student/pages/learn/[conceptId].tsx`
- `apps/student/components/CalmTimer.tsx`, `apps/student/components/CalmBreathing.tsx`
- `apps/parent/pages/dashboard.tsx`, `apps/parent/pages/dashboard/progress.tsx`, `apps/parent/pages/dashboard/reports.tsx`, `apps/parent/pages/dashboard/insights.tsx`
- `apps/parent/lib/dashboard-layout.tsx`
- All 14 components in `packages/ui/src/`

---

## 2. Findings (mapped to ALX principles)

### F1 — No persistent app shell or global navigation — violates **ALX-1 Predictability**

**Evidence**
- Student app has zero top-level navigation. The only way to reach `/calm-zone` is to type the URL. There is no header, no menu, no way back to Home from a concept page except `router.back()`.
- Parent app has a tab bar in `dashboard-layout.tsx`, but it is duplicated visual chrome that the student app lacks — the two apps feel like different products.
- Every student page re-implements its own background, container, and back button inline. `subjects/[id]/chapters.tsx` and `chapters/[id]/concepts.tsx` use a hand-rolled "← Back to …" link, and `subjects.tsx` has none at all.

**Impact**
- A child in the middle of an activity has no discoverable path to Calm Zone (the regulation tool ALX-18 says must be "globally accessible"). This is a safety regression.
- Parents and children experience two unrelated shells, which fragments the brand.

**Recommended direction**
- Introduce a single `<AppShell>` in `packages/ui/src/AppShell.tsx` used by both apps. Slots: `header`, `main`, `persistentFooter` (for student) / `primaryNav` (for parent).
- Student footer: three persistent touch targets, each ≥ 56×56 px — **Home** (`/subjects`), **Calm Zone** (`/calm-zone`), **My Progress** (`/progress`). ALX-1: same place, same order, every screen.
- Parent primary nav: keep the existing tab bar but move it into the shared shell so it lives in the same component tree as the student footer (different presentation, same source of truth).

---

### F2 — Home page is the most important screen and is the weakest — violates **ALX-2 Visual First** and **ALX-3 One Concept at a Time**

**Evidence (`apps/student/pages/index.tsx`)**
- Headline: `"LearnEasy - Student App"` — product name, not a greeting. No use of first name anywhere.
- Two equally weighted CTAs: "Start Learning" and "Resume Lesson" both shown side-by-side. The Resume card disappears when nothing is resumable, leaving an awkward single button.
- No illustration, no mascot, no concept preview, no schedule preview. The most-looked-at screen in the app is 90% negative space.
- Loading state literally says `"Checking for saved progress..."` with no visual treatment.
- Streak is faked in parent dashboard as `"3 days"` regardless of state.

**Recommended direction — Home redesign (single spec, three states)**

| State | Layout |
| --- | --- |
| **No progress** (new learner) | Greeting ("Hi Aarav") + large illustration + 1 primary CTA "Start Today's Lesson" + footer nav |
| **Resume available** | Greeting + 1 primary CTA "Continue: Counting 1–5" (concept title from API) showing step indicator + secondary "Choose a different lesson" |
| **Session complete today** | Greeting + 1 primary CTA "Today's Lesson: Done" disabled with "Great work. See you tomorrow." + small "Practice again" link |

Rules: exactly **one** primary action at a time, greeting uses learner name, every state ends on the same footer nav. This implements ALX-3 (one concept, one decision) and ALX-4 (visible progress: it's literally today's status).

---

### F3 — Subject → Chapter → Concept hierarchy has no breadcrumb and no progress visibility — violates **ALX-4 Visible Progress** and **ALX-1 Predictability**

**Evidence**
- `chapters.tsx` shows a breadcrumb-like line ("Subjects > Mathematics") but it is not interactive and is rendered in the same color as body text. It is decorative, not navigational.
- `concepts.tsx` has no breadcrumb at all.
- Concepts display a numeric index (`{index + 1}` in a gray circle) that signals order, but does **not** indicate mastery state (not started / in progress / mastered). The UI implies linear ordering but the backend supports a dependency graph (`packages/db/src/dependency-graph.ts`).
- No concept screen shows "what's next" — a learner who finishes concept 3 has to scroll the whole list to find concept 4.

**Recommended direction**
- Replace the decorative `>` separator with an actual interactive breadcrumb component (`packages/ui/src/Breadcrumb.tsx`) used on every subject/chapter/concept page. Each segment is a link except the current one.
- On `concepts.tsx`, replace the static number with a `<MasteryChip state="not-started" | "in-progress" | "mastered" />` in `packages/ui/src/MasteryChip.tsx`. Color states: Soft Blue for not-started, Soft Amber for in-progress, Muted Green for mastered (all ALX-12 palette colors).
- Add a sticky "Next up: <Concept Title> →" prompt above the list when the first un-mastered concept is not item 1, so the learner's path is always one glance away.

---

### F4 — Learn flow (`[conceptId].tsx`) shows progress text but does not use the existing `VisualSchedule` — violates **ALX-7 Routine-Based Learning** and reuses incomplete ALX-4 patterns

**Evidence**
- `learn/[conceptId].tsx` renders step names as a plain text list (`Observe / Guided Practice / Independent Practice / Mastery Check`) instead of using the existing `VisualSchedule` component (`packages/ui/src/VisualSchedule.tsx`).
- The `VisualSchedule` is a designed, accessible component (role="group", aria-label, Check icon) that is not being used by the one screen it was built for. This is dead code in a high-stakes flow.
- The activity-runtime from Phase 5 (issues #41–45) injects a `TransitionScreen` between activities, but the schedule is never shown above the activity frame, so the learner cannot anticipate how many steps remain.

**Recommended direction**
- Replace the inline step list in `[conceptId].tsx` with `<VisualSchedule steps={...} currentStep={...} completedSteps={...} />`.
- Pin the schedule to a sticky position below the page header on screens ≥ md, so it is always visible during an activity (visible-progress + routine reinforcement).
- Pass real `completedSteps` from the API rather than only the current step index, so the check-mark states actually populate.

---

### F5 — Calm Zone is unreachable, but described as globally accessible — violates **ALX-18 Self-Regulation Support** (critical safety issue)

**Evidence**
- `/calm-zone` exists and works (`apps/student/pages/calm-zone.tsx`), but no link to it exists from any other student page. The `?return=` query parameter is plumbed but never set by any caller.
- The page itself says "Use these calming tools whenever you need a moment to relax" but provides no entry point from the moments that matter (mid-activity, mid-quiz, after a wrong answer).
- The page has no header — it is a blank gradient. There is no visual or textual sign that the user has actually reached a regulated space; it feels like a missing page.

**Recommended direction — three additions**

1. **Persistent footer link** (covers F1). One tap from any student screen to Calm Zone.
2. **In-activity escape hatch**: a small, low-affordance "Take a break" button on every learn screen and every activity screen, placed at the top right and styled as a text link (not a bright button) to avoid rewarding escape. Tap → routes to `/calm-zone?return=<currentPath>`.
3. **Return-to-lesson contract**: when Calm Zone is entered with `?return=`, the "Return to Lesson" button must restore the learner to the exact step and activity they left, not just the page. This requires a `pauseSession` call on entry and a `resumeSession` call on return, plus a small "Step 2: Guided Practice" indicator on the return button.

---

### F6 — No empty, loading, or error states designed anywhere — violates the Design Review Checklist (design-guidelines.md §15, items 3 and 9)

**Evidence (representative — same pattern in every page)**
- `subjects.tsx`: `loading` shows plain text "Loading subjects…". If the request fails, no `catch` is present — the page just sits on the loader forever.
- `chapters.tsx` has a "Subject not found" empty state, but it is bare text with no recovery action.
- `concepts.tsx` shows "No concepts available in this chapter." with no CTA to go back or request help.
- The `Resume Lesson` card hides the entire section when `!resumeInfo?.hasResumableSession` — so the user gets no signal that resume was *checked*; they just see "Start Learning".
- `fetchResumeState` is fired in a `useEffect` with no `catch` and no abort controller.

**Recommended direction — standardize four states in a shared `<DataState>` component**

Build `packages/ui/src/DataState.tsx` with four states and **use it on every list/detail page**:

- `loading` — soft pulse + descriptive text ("Finding lessons for Aarav…")
- `empty` — short headline + body + 1 recovery CTA ("No chapters yet — ask your parent to add a subject")
- `error` — calm message ("We can't load your lessons right now. Try again.") with **Try Again** primary and **Go Home** secondary
- `ready` — children render normally

Adopt a project-wide `useApi` hook in `apps/student/lib/useApi.ts` (and parent equivalent) that wraps `fetch` with abort + error handling, so every page gets this for free.

---

### F7 — Button, link, and heading vocabulary is inconsistent — violates **ALX-1 Predictability** and the "Explicit Literalism" rule in design-guidelines.md §13

**Evidence**
- "Start Learning" vs "Begin" vs "Resume Lesson" vs "Continue Lesson" — four different verbs for the same conceptual action.
- "Back to chapters" (with arrow) vs `<` chevron icon vs `router.back()` with no visual — three different back patterns.
- "Submit Answer" rule from design-guidelines.md is followed in `MultipleChoice.tsx` but not enforced as a shared string constant. The `PositiveCompletion.tsx` says "Next" in places that should be "Continue Lesson" or "Go to Next Concept".
- Parent app uses "Overview" for `/dashboard` and "Insights" for AI insights — neither is a verb; neither tells the user what they will see.

**Recommended direction**
- Centralize action strings in `packages/ui/src/copy.ts` as exported constants:
  ```ts
  export const COPY = {
    startLesson: "Start Lesson",
    resumeLesson: "Continue Lesson",
    submitAnswer: "Submit Answer",
    continueConcept: "Continue to Next Activity",
    finishConcept: "Finish Concept",
    takeBreak: "Take a Break",
    returnToLesson: "Return to Lesson",
    tryAgain: "Try Again",
    goHome: "Go to Home",
  } as const;
  ```
- A lint rule (custom ESLint check) forbids hard-coded action strings in JSX outside `copy.ts`. Implementation: a simple `no-restricted-syntax` rule that flags string literals assigned to `children` of `<Button>`.
- Replace all existing actions in student + parent pages with `COPY.*` references in this single pass.

---

### F8 — Sensory environment controls are missing — violates **ALX-6 Controlled Sensory Environment**

**Evidence**
- `design-guidelines.md` §9 (Audio) and §7 (Motion) require a per-learner sensory profile with user controls for sound, motion, and contrast.
- The Personalization Framework (§12) defines a `SensoryProfile` type with `audioSupport`, `animationTolerance`, `readingDensity`, `promptLevel`, `attentionSpan`.
- The codebase has **zero** implementation of any of these. No settings page, no profile API, no reduced-motion respect. The Calm Zone page uses `transition-colors duration-200` with no respect for `prefers-reduced-motion`.
- Tailwind config and the `globals.css` have no `motion-safe` / `motion-reduce` patterns in use.

**Recommended direction**
- **Phase 1 (this issue)**: minimal but real. Add a learner **Settings** screen at `/settings` (student app) reachable from the footer. Three toggles: **Reduce motion** (wraps transitions in `motion-safe:` / disables Calm Breathing animation), **Lower contrast** (adds a `.theme-low-contrast` class on `<html>` swapping to higher-contrast palette), **Sound on/off** (currently no autoplay audio exists, so this is forward-looking).
- **Phase 2 (separate issue)**: persist `SensoryProfile` to backend via the same API pattern as the existing resume state; have all components read from a `SensoryProfileContext`.
- Add `@media (prefers-reduced-motion: reduce)` overrides in `globals.css` to disable every `transition-*` and `animate-*` utility by default. This is one of the cheapest accessibility wins in the project and the Web Interface Guidelines (`web-design-guidelines` skill) flag it as a required baseline.

---

### F9 — Onboarding for new learners is missing — violates **ALX-3 One Concept at a Time** for the first-time experience

**Evidence**
- A new student lands on `/` (index.tsx) with no concept of what this app is, who the mascot is, or what "a lesson" means. The headline says "LearnEasy - Student App".
- There is no "What is LearnEasy?" walkthrough, no concept preview, no "Here's what a lesson looks like" step.
- The first lesson jumps directly into the curriculum (which is Level A Math by default). For a child with ASD who is new to the product, this is the worst possible entry point.

**Recommended direction — a 3-screen onboarding, optional and skippable**

1. **Welcome**: Greeting + illustration + "LearnEasy helps you learn at your own pace." + "Show me how" primary, "I know how" secondary.
2. **Tour**: Visual schedule preview — "Every lesson has 4 short parts" with the `VisualSchedule` rendered against a sample concept, current step animated to step 1.
3. **Calm Zone intro**: "If you need a break anytime, tap the leaf" + preview of Calm Zone, then "Start my first lesson".

Persistence: a `learner.onboardedAt: DateTime | null` field on the existing `Student` model. Route `/` reads it; if null, show the flow; if set, show the redesigned Home from F2. Both states are reachable from the same `AppShell`.

This is intentionally **3 screens, not 5** — ALX-3 forbids over-explaining.

---

### F10 — Parent dashboard narrative arc is fragmented — violates the parent-side equivalent of **ALX-4 Visible Progress**

**Evidence**
- Parent dashboard tabs (Overview, Progress, Reports, Insights) are four separate pages with no shared narrative. The Overview shows 3 stat cards and a recent-activity list, but the **most useful question for a parent — "what should I do this week?"** — is buried on the Insights tab.
- "Concepts Mastered", "Average Mastery", "Current Streak" are presented as a flat grid with no hierarchy. There is no indication of whether the numbers are good, bad, or new.
- Stat card "Current Streak: 3 days — keep it going!" is **hardcoded** (`apps/parent/pages/dashboard.tsx` line 47). This is a fake metric shipped to real parents, and it is a credibility bug as much as a UX bug.
- "Quick Links" are tertiary buttons styled as primary cards. They compete visually with the stat cards.

**Recommended direction — reframe Overview around one decision**

| Section | Content | Rationale |
| --- | --- | --- |
| **Headline (always one)** | "This week Aarav completed 3 concepts and is on track for Level A." OR "Aarav needs help with Counting 1–5 — try a 5-minute practice together." | One sentence, one decision |
| **3 stat cards** (keep) | Concepts mastered, Avg mastery, **Streak — REAL number from API or hidden** | Remove the hardcoded "3 days" |
| **"This week" panel** | Real-time list of last 5 sessions, with concept + duration + outcome (✅/↻/➕) | Replaces "Recent Activity" with outcome-coded rows |
| **"Next step for you"** | A single card with the top insight (from API in #52) OR a fallback prompt to set up the learner profile | Pulls the parent's most important action above the fold |

Quick Links move to a small text-link row in the page footer, freeing the main canvas for the narrative.

---

### F11 — Discoverability of the AI Tutor (issue #49) and AI Insights (issue #52) is unspecified — collision zone

**Evidence**
- #49 places the AI Tutor entry as "Ask AI Tutor" button on the activity screen. This is good, but no spec exists for its visual prominence, no-result fallback, or post-session teardown.
- #52 is on the Insights tab but its top recommendation ("Start Practice" link) routes back to the student app at `/learn/<id>`. There is no transition state, no "you are switching apps" cue, and no carry-over of the learner's session.

**Recommended direction — extend the spec on issues #49 and #52 in their implementation phase**

- AI Tutor button: tertiary visual weight (text-link style, not filled), top-right of activity header, label `"Ask Tutor"` (not "Ask AI Tutor" — shorter, less robotic, matches ALX microcopy).
- No-result fallback for Insights: render a single empty-state card with copy "We're still learning your child's patterns. Check back in a few days." rather than a blank panel.
- Cross-app "Start Practice" link: a confirmation sheet "You're switching to Aarav's app. Continue?" with **Cancel** and **Open lesson** — prevents accidental tab jumps for a child using a shared device.

These are **spec deltas, not code**, and they should land in the implementation comments of #49 and #52 before those stories are picked up.

---

## 3. Prioritisation

Mapped to ALX principles and the existing backlog. Priority uses the repo's existing `priority:high|medium|low` labels.

| # | Finding | ALX Principles | Stories Needed | Priority | Effort |
| --- | --- | --- | --- | --- | --- |
| F5 | Calm Zone unreachable | ALX-1, ALX-18 | 2 (footer link, in-activity break + return contract) | high | M |
| F1 | No app shell / nav | ALX-1 | 1 (shared AppShell) | high | M |
| F2 | Home redesign | ALX-2, ALX-3, ALX-4 | 1 (three-state home) | high | M |
| F6 | Empty/loading/error states | §15 checklist | 2 (DataState component, useApi hook) | high | M |
| F8 | Sensory controls (Phase 1) | ALX-6 | 2 (Settings screen, reduced-motion CSS) | high | S |
| F7 | Copy + button consistency | ALX-1, §13 | 1 (copy.ts + lint rule + sweep) | medium | S |
| F3 | Breadcrumb + MasteryChip | ALX-1, ALX-4 | 2 (Breadcrumb, MasteryChip) | medium | S |
| F4 | VisualSchedule on learn screen | ALX-4, ALX-7 | 1 (replace inline list, sticky positioning) | medium | S |
| F9 | Onboarding (3 screens) | ALX-3 | 1 (onboarding flow + persisted flag) | medium | M |
| F10 | Parent narrative arc | ALX-4 (parent) | 1 (Overview redesign + remove hardcoded streak) | medium | S |
| F11 | AI Tutor / Insights collision | ALX-1 | spec deltas on #49 and #52 (no code) | low | S |

**Dependency graph:** F1 must land first (everything else assumes the shell). F5 and F6 should ship in the same PR as F1 because they touch every page. F2 follows. F7 is independent and unblocks future copy changes. F3, F4, F9, F10 can be done in any order. F11 lands as comment-only edits to the existing issues.

---

## 4. Visual & Interaction Signatures

To avoid producing a generic-template look (per the `frontend-design` skill, "AI-generated design right now clusters around three looks"), the implementations should commit to two deliberate signatures that fit the autism-first brief.

**Signature 1 — "Visible routine band"**
A persistent, full-width band directly below the AppShell header on every student screen showing the current `VisualSchedule`. It is not a breadcrumb (those imply place) and not a progress bar (those imply quantity). It is a *routine*: the four-step path the learner is on, always visible, always in the same place. This is the on-screen embodiment of ALX-7 Routine-Based Learning, and it is the one element a learner with ASD can rely on across every screen in the app.

**Signature 2 — "One decision per screen"**
Every screen presents exactly one primary decision. Stat cards, quick links, secondary actions, and recommendations are demoted to text links or footer rows. The hero action is always a 56×56 px filled button in the Soft Blue primary color, labeled with an explicit verb (from `copy.ts`). This signature is enforced by the F7 lint rule: a page may have at most one `<Button variant="primary">`.

Color and typography remain bound to the Serene Structure palette and Inter font already specified in `knowledge/design/DESIGN.md` and `design-guidelines.md` §13 — no new tokens are introduced.

---

## 5. Acceptance Criteria for this Issue

This is a design contract. The issue is **closed as "completed design"** when:

- [ ] All 11 findings have a linked story (or an explicit decision to defer, with rationale).
- [ ] The shared `<AppShell>` spec is documented in `knowledge/design/app-shell.md` with ASCII wireframes for both student and parent variants.
- [ ] The three-state Home spec is documented with ASCII wireframes and copy.
- [ ] The F11 spec deltas are posted as comments on issues #49 and #52.
- [ ] The `copy.ts` string table is reviewed and signed off by Sarthak.
- [ ] A Figma-style or ASCII wireframe exists for the Calm Zone return contract (so a coder can implement it without guessing).

The issue is **NOT closed** when implementation lands. Implementation issues are tracked separately.

---

## 6. Out of Scope

- New curriculum content (covered by #53, #54).
- Backend changes beyond the `SensoryProfile` Phase 1 storage (which is itself scoped to a separate issue).
- Localization / multi-language (not an MVP requirement).
- Educator portal (not in MVP).
- Figma-level visual design (the team is operating from the ALX markdown spec and the existing Serene Structure tokens; this issue aligns with that, does not replace it).

---

## 7. References

- `knowledge/design/design-guidelines.md` (ALX 2.0, full framework, Design Review Checklist §15)
- `knowledge/design/DESIGN.md` (Serene Structure tokens, color hex values, spacing, typography)
- `knowledge/project-management/issue-templates.md` (Story template this design contract feeds into)
- `knowledge/project-management/github-backlog.md` (Phases 0–12 roadmap)
- Issues #49 (AI Tutor Chat), #52 (AI Insights), #53 (Concept Editor), #54 (Activity Editor) — for collision-zone awareness
- Web Interface Guidelines (Vercel) via the `web-design-guidelines` skill — applied to all `apps/*` code reviews

---

**Author note:** This plan was written by reviewing the actual code, not the documentation intent. Where a finding contradicts a design principle, the code wins for the audit and the principle is restated as a target. Where a design principle is documented but unimplemented (F8, F9), the principle is restated as a gap and a recommendation is given.

— UX, LearnEasy
