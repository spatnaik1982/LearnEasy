## Goal

Replace `apps/student/pages/index.tsx` with the three-state home (no progress / resume available / session complete) per F2 from issue #60.

## Background

Issue #60 F2 found the home page is the most-looked-at screen in the app and the weakest: headline is `"LearnEasy - Student App"` (product name, not a greeting), two equally weighted CTAs compete, no illustration, no schedule preview, loading state says `"Checking for saved progress..."` with no treatment. F2 also notes the parent dashboard has a hardcoded streak of "3 days" — that will be removed in Story 9, not this story.

## User Story

As a learner, I want the home page to greet me by name, show me exactly what to do next, and never present two competing actions at the same time.

## Functional Requirements

- Use `useApi` from Story 3 to call `fetchResumeState(user.id)`.
- Three render branches based on `resumeInfo`:
  - **No progress (new learner)**: Greeting "Hi {firstName}" + 96×96 illustration emoji 🎓 + 1 primary CTA `"Start Today's Lesson"` (`COPY.startTodaysLesson`) → `/subjects`. Use `COPY.startTodaysLesson`.
  - **Resume available**: Greeting + 1 primary CTA `Continue: {conceptTitle}` → `/learn/{conceptId}` with a 4-step dot indicator underneath; secondary text-link "Choose a different lesson" → `/subjects`.
  - **Session complete today (no resumable session AND a `lastCompletedAt` within last 12h)**: Greeting + disabled primary CTA "Today's Lesson: Done" with helper text "Great work. See you tomorrow."; a small "Practice again" text-link → `/subjects`.
- First-name greeting: use `user?.name?.split(" ")[0]`; fall back to "there" if absent.
- On the no-progress branch, the home must show exactly **one** primary action and the AppShell footer (from Story 2).
- Loading state: `<DataState status="loading" />` from Story 3.

## Files to modify

- `apps/student/pages/index.tsx` (full rewrite)

## Files to read for context (NOT modify)

- `apps/student/lib/api.ts` — confirm the shape of `fetchResumeState` return
- `apps/student/lib/auth.tsx` — confirm `user` shape
- `packages/ui/src/copy.ts` — confirm `COPY.startTodaysLesson` exists (Story 1)

## Technical Requirements

- Use `opencode run -m opencode-go/deepseek-v4-flash` for the file change.
- The page must wrap content in `<AppShell variant="student">` from Story 2.
- Use `useApi` from Story 3 for the resume fetch.
- Use `COPY.*` from Story 1 for all labels.

## Deliverables

- Rewritten `apps/student/pages/index.tsx`

## Acceptance Criteria

- [ ] `pnpm --filter @learn-easy/student exec tsc --noEmit` succeeds
- [ ] `pnpm --filter @learn-easy/student build` succeeds
- [ ] The string `"LearnEasy - Student App"` does NOT appear anywhere in the file (verify with grep)
- [ ] At most one primary CTA is rendered at any state

## Testing Requirements

- `tsc --noEmit` + `next build`
- Manual browser smoke test: visit `/` with a fresh user (no resume) and verify the no-progress state renders.

## Definition Of Done

- [ ] Three branches implemented and tested manually
- [ ] No hardcoded copy strings (all from `COPY.*`)

## Out Of Scope

- Onboarding redirect for first-time users (Story 8)
- Personalization of the greeting based on time of day (e.g. "Good morning") (deferred)
- The parent dashboard's hardcoded streak (Story 9)

---

Parent Epic: #60
