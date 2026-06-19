---
name: "📖 Story"
about: A complete, user-visible capability with full implementation, tests, and docs.
title: "[Story] "
labels: ["type:story"]
assignees: ""
---

# Story: [Title]

## Objective
A clear, measurable statement of what user-visible capability will exist after this story is completed.

---

## Context
Why does this story exist? Provide the rationale and linking context to the parent Epic.

---

## Scope
Detail which files, packages, or UI components are within bounds for modifications.
- **Allowed directories**: (e.g., `apps/student/pages/`, `packages/ui/src/`)
- **Strict Exclusions**: List parts of the codebase that must *not* be touched or modified.

---

## Acceptance Criteria
Concrete, measurable rules that must be satisfied.
- [ ] Criterion 1 (e.g., learner can complete a visual counting activity end-to-end)
- [ ] Criterion 2 (e.g., activity follows ALX principles — safe mistakes, visible progress, one-concept-at-a-time)
- [ ] Criterion 3 (e.g., API validates input and returns correct response format)

---

## Technical Notes & Constraints
- **Design**: Must follow ALX Design Guidelines (`knowledge/design/design-guidelines.md`). Run the Design Review Checklist before committing UI changes.
- **API**: Use `class-validator` DTOs. All endpoints (except auth) require JWT Bearer token.
- **Database**: All models use `cuid()` for primary keys with explicit `createdAt`/`updatedAt` timestamps.
- **Accessibility**: Touch targets minimum 56x56px, 16px minimum spacing, no autoplay media.

---

## Deliverables
Exactly what outputs are expected:
- [ ] Implementation (TypeScript code / React components / API endpoints)
- [ ] Automated tests (Unit and/or Integration)
- [ ] Documentation updates under `knowledge/` or code comments

---

## Validation
How to verify the story works perfectly:
- **Commands**: `pnpm --filter @learn-easy/<package> test`, `pnpm lint`
- **Checklist**: Explicit steps the reviewer or agent should run.

---

## References
- Parent Epic: #
- Associated tasks:
- Relevant guidelines: [AGENTS.md](../../AGENTS.md)
