## Goal

Wire the existing `?return=` query parameter on `/calm-zone` to a real pause/resume session, and confirm the StudentFooter (from Story 2) provides a persistent link. Implements F5 from issue #60.

## Background

Issue #60 F5 found that the Calm Zone page already has a `?return=` parameter plumbed, but no caller sets it; the existing "Take a Break" button on `learn/[conceptId].tsx` is good but only present on that one page. The "Return to Lesson" button on `/calm-zone` does not yet know the learner's current step or activity, so on return they may lose their place.

## User Story

As a learner, I want the Calm Zone to remember exactly where I was in my lesson, so I can take a break and pick up without losing my place.

## Functional Requirements

- Add `pauseSession` and `resumeSession` functions to `apps/student/lib/session.ts`.
- If the API does not yet support pause/resume, write these as stubs that round-trip through localStorage and add a `// TODO(api):` comment.
- `calm-zone.tsx` reads `?return=`, `?step=`, `?activity=` from the query string. On mount, calls `pauseSession(...)` with the parsed values. The "Return to Lesson" button label includes the step indicator: `Return to Step 2: Guided Practice`. On click, calls `resumeSession(...)` then `router.push(returnPath)`. If `returnPath` is missing, default to `/subjects`.
- `learn/[conceptId].tsx` updates `handleTakeBreak` to encode the current step + activity id in the URL.
- The persistent StudentFooter link (from Story 2) provides the default Calm Zone entry; clicking it without a `return=` still works (defaults to `/subjects`).

## Files to modify

- `apps/student/lib/session.ts` — add `pauseSession` and `resumeSession`
- `apps/student/pages/calm-zone.tsx` — parse query, call pause/resume
- `apps/student/pages/learn/[conceptId].tsx` — update `handleTakeBreak` to encode step + activity

## Function signatures

```ts
// In apps/student/lib/session.ts
export function pauseSession(
  sessionId: string,
  currentStep: number,
  activityId?: string
): Promise<ApiResponse<{ pausedAt: string }>>;

export function resumeSession(
  sessionId: string
): Promise<ApiResponse<{ step: number; activityId?: string }>>;
```

## URL contract

`/calm-zone?return=/learn/{conceptId}&step={currentStep}&activity={activityId}`

## Button label

`Return to Step {step + 1}: {STEPS[step]}` where `STEPS` matches the array in `learn/[conceptId].tsx`. The label should be computed dynamically.

## Acceptance Criteria

- [ ] `pnpm --filter @learn-easy/student exec tsc --noEmit` succeeds
- [ ] `pnpm --filter @learn-easy/student build` succeeds
- [ ] A click on "Take a Break" while in step 2 of a concept → URL is `/calm-zone?return=/learn/c1&step=2` (verify via dev tools)
- [ ] The Calm Zone "Return to Lesson" button label is `Return to Step 3: Independent Practice` (or equivalent) when entered with `step=2`

## Testing Requirements

- `tsc --noEmit` + `next build`
- Manual browser smoke test: enter a concept, click Take a Break, observe the URL, observe the button label

## Definition Of Done

- [ ] `pauseSession` / `resumeSession` exported from `lib/session.ts`
- [ ] URL contract honored
- [ ] Button label includes the step indicator

## Out Of Scope

- Backend pause/resume API endpoints (the stubs are acceptable; tracked as follow-up)
- Multiple break sessions in one lesson (deferred)
- Auto-resume on app load (deferred)

---

Parent Epic: #60
