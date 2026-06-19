---
name: "🐛 Bug Report"
about: Report a bug, API error, or visual regression.
title: "[Bug] "
labels: ["type:bug"]
assignees: ""
---

# Bug Report: [Title]

## Objective
A clear description of the bug and what the correct behavior should be.

---

## Steps to Reproduce
1. Navigate to / interact with '...'
2. Trigger / Call '...'
3. See error:

---

## Expected Behavior
What should have happened (reference ALX design principles if applicable).

---

## Actual Behavior
What actually happened (include logs, stack traces, API response bodies, or screenshots).

---

## Environment
- **Browser / Device**: (e.g., Chrome 120 / iPad Safari / Headless)
- **App**: `apps/student` or `apps/parent` or `packages/api`
- **Build version / branch**:

---

## Scope & Diagnostic Notes
- **Target Component**: e.g., `packages/ui/src/VisualCounter.tsx`, `packages/api/src/ai/`
- **Error IDs / Console output**:

---

## Acceptance Criteria & Validation
- [ ] Bug is fixed in all target environments
- [ ] A regression test is added to prevent recurrence
- [ ] `pnpm lint` and relevant test suites pass

---

## Severity
- [ ] Critical (blocks learning or data loss)
- [ ] High (major feature broken, no workaround)
- [ ] Medium (feature impaired, workaround exists)
- [ ] Low (cosmetic or edge-case)

---

## References
- Related Story/PR: #
- Logs / Artifacts:
