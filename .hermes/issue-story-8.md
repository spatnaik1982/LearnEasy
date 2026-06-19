## Goal

First-time learner experience. 3-screen onboarding flow. Implements F9 from issue #60.

## Background

Issue #60 F9 found that a new student lands on `/` with no concept of what this app is. The headline says `"LearnEasy - Student App"` and the first lesson jumps directly into the curriculum. For a child with ASD who is new to the product, this is the worst possible entry point. The story is **3 screens, not 5** — ALX-3 forbids over-explaining.

## User Story

As a first-time learner, I want a 3-screen introduction that shows me what a lesson looks like and where to find Calm Zone, before I'm asked to start.

## Functional Requirements

- 3 onboarding screens, each in `/onboarding/`:
  1. `welcome.tsx` — Greeting + 🎓 emoji (96×96) + "LearnEasy helps you learn at your own pace." + primary "Show me how" → `/onboarding/tour`; secondary text-link "I know how" (sets the onboarded flag + routes to `/subjects`).
  2. `tour.tsx` — Title "Every lesson has 4 short parts" + render `<VisualSchedule steps={["Observe", "Practice", "Try on your own", "Show what you know"]} currentStep={0} completedSteps={[]} />` (sample schedule) + primary "Show me Calm Zone" → `/onboarding/calm`.
  3. `calm.tsx` — Title "If you need a break anytime, tap the leaf 🍃" + a static preview (📚 emoji in a calming gradient box) of the Calm Zone + primary "Start my first lesson" (sets the onboarded flag + routes to `/subjects`).
- Each page wraps in `<AppShell variant="student" footer={null} />` (the AppShell from Story 2 supports `footer` override).
- Home page (`apps/student/pages/index.tsx`, rewritten in Story 4) adds a check: if `localStorage.getItem("learn-easy.onboardedAt")` is null AND `!resumeInfo?.hasResumableSession`, route to `/onboarding/welcome`. The check runs inside the resume-state useEffect's `.then()` block, not a separate effect.
- Persist the flag in localStorage as `localStorage["learn-easy.onboardedAt"] = new Date().toISOString()`. Add a `// TODO(db): replace with student.onboardedAt` comment — full Prisma migration is out of scope for Phase 3.

## Files to create

- `apps/student/pages/onboarding/welcome.tsx`
- `apps/student/pages/onboarding/tour.tsx`
- `apps/student/pages/onboarding/calm.tsx`

## Files to modify

- `apps/student/pages/index.tsx` — add the onboarded-redirect check (after the resume fetch resolves)

## Acceptance Criteria

- [ ] `pnpm --filter @learn-easy/student exec tsc --noEmit` succeeds
- [ ] `pnpm --filter @learn-easy/student build` succeeds
- [ ] A user with no localStorage flag and no resume state lands on `/onboarding/welcome` instead of the home redesign
- [ ] Completing the flow sets the localStorage flag and routes to `/subjects`
- [ ] The "I know how" text-link on screen 1 also sets the flag and skips to `/subjects`
- [ ] Each onboarding page renders the AppShell but with no footer

## Testing Requirements

- `tsc --noEmit` + `next build`
- Manual browser smoke test: clear localStorage, visit `/`, verify redirect to `/onboarding/welcome`, click through, verify redirect to `/subjects` and the flag is set

## Definition Of Done

- [ ] All 3 pages created
- [ ] Home page redirect wired correctly (inside the resume-fetch `.then()`)
- [ ] No new lint warnings

## Out Of Scope

- Persisting `onboardedAt` to the `Student` Prisma model (deferred — Prisma migration is out of scope for Phase 3)
- Re-running the onboarding on demand (no "Replay tour" UI yet)
- Personalizing the welcome greeting with the learner's name (deferred)
- Analytics on onboarding completion (deferred)

---

Parent Epic: #60
