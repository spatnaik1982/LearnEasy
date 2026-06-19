## Goal

Two deliverables: (a) move `VisualSchedule` to a sticky position above the activity on `learn/[conceptId].tsx` (F4 in issue #60); (b) post comment-only spec deltas to issues #49 and #52 (F11 in issue #60).

## Background

Issue #60 F4 found that the VisualSchedule was not used on the learn page — but on re-reading the code in main, the schedule IS already used. The remaining work is to pin it to a sticky position so it stays visible during scrolling, and to use `motion-safe:` classes so it cooperates with the global reduced-motion override. F11 is a spec delta only — no code, just GitHub comments.

## User Story

As a learner, I want to always see which step of the lesson I'm on, even after I scroll down to interact with the activity.

## Functional Requirements

- Wrap the existing `<VisualSchedule />` block on `learn/[conceptId].tsx` in a sticky container: `<div className="sticky top-0 z-10 bg-warm-off-white py-2">`.
- On `max-md` viewports, the schedule should not be sticky (use `md:sticky` so mobile users get the full canvas).
- Replace `transition-opacity duration-200` etc. with `motion-safe:transition-opacity motion-safe:duration-200` so the global reduced-motion override from `globals.css` cooperates.
- Post a comment on issue #49 with the F11 spec deltas.
- Post a comment on issue #52 with the F11 spec deltas.

## Files to modify

- `apps/student/pages/learn/[conceptId].tsx` — wrap VisualSchedule in sticky container + `motion-safe:` overrides

## GitHub work (NOT code)

- `gh issue comment 49 --body "..."` with the F11 spec deltas:
  - Button label: "Ask Tutor" (not "Ask AI Tutor")
  - Button visual: tertiary text-link style, top-right of activity header
  - Empty-state fallback: "We're still learning how to help with this one. Try a different activity."
- `gh issue comment 52 --body "..."` with:
  - No-result empty state copy: "We're still learning your child's patterns. Check back in a few days."
  - "Start Practice" cross-app link: confirmation sheet with "Cancel" / "Open lesson"

## Acceptance Criteria

- [ ] `pnpm --filter @learn-easy/student exec tsc --noEmit` succeeds
- [ ] The `VisualSchedule` is wrapped in a `md:sticky md:top-0` container in the rendered output (verify in dev tools)
- [ ] Both issues #49 and #52 have a new comment from the orchestrator's GitHub account containing the F11 deltas

## Testing Requirements

- `tsc --noEmit`
- Manual browser smoke test: open a learn page, scroll down, verify the VisualSchedule remains pinned

## Definition Of Done

- [ ] Sticky wrap added
- [ ] `motion-safe:` classes applied to transition utilities in the file
- [ ] Both GitHub comments posted

## Out Of Scope

- VisualSchedule redesign (the existing component is fine)
- Real-time `completedSteps` from a new endpoint (the existing state-based tracking is acceptable)
- Other pages that might benefit from a sticky schedule (deferred)

---

Parent Epic: #60
