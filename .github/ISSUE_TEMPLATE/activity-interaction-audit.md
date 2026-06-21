---
name: "🏛️ Epic: Activity Interaction Audit & Drag-and-Drop Refactor"
about: "Refactor 4 click-based activity components to true drag-and-drop for ASD-friendly usability."
title: "[Epic] Activity Interaction Audit & Drag-and-Drop Refactor"
labels: ["type:epic", "ux", "alx"]
assignees: ""
---

# Epic: Activity Interaction Audit & Drag-and-Drop Refactor

## Objective
Replace click-select-then-click-place interaction patterns in Matching, DragDrop, PlaceValueChart, and Sequencing with true drag-and-drop (using `@dnd-kit`), improving directness, reducing working memory load, and aligning with ALX-2 (Visual First) and ALX-3 (One Concept at a Time).

---

## Context
A usability audit (see `knowledge/project-management/plans/2026-06-21-activity-interaction-audit.md`) revealed that 4 of 14 activity components use misleading or unintuitive interaction patterns:

- **Matching**: Two-step click (left item → right item) with no visual connection between matched pairs. The child must remember which item they clicked.
- **DragDrop**: Named "drag and drop" but entirely click-based (select → place). Misleading name creates incorrect expectations.
- **PlaceValueChart**: Click digit → activate column → click column to place. An unnecessary middle step that adds confusion.
- **Sequencing**: ▲/▼ buttons for reorder instead of drag. Icons are abstract and touch targets are small.

These patterns increase working memory load — a known difficulty for children with ASD — and violate ALX-3 (one concept, one action per interaction).

---

## Scope & Architectural Alignment
- **Target Components**:
  - `packages/ui/src/DragDrop.tsx` — Full rewrite with @dnd-kit
  - `packages/ui/src/Matching.tsx` — Full rewrite with @dnd-kit
  - `packages/ui/src/PlaceValueChart.tsx` — Full rewrite with @dnd-kit
  - `packages/ui/src/Sequencing.tsx` — Full rewrite with @dnd-kit/sortable
  - `packages/ui/src/ActivityRenderer.tsx` — Minor handler simplification for PVC
  - `packages/ui/src/index.ts` — Exports (unchanged)
  - `packages/ui/src/__tests__/` — New interaction tests
  - `packages/ui/package.json` — Add @dnd-kit dependencies
- **Strict Exclusions**: No changes to `apps/student/`, `apps/parent/`, `packages/api/`, `packages/db/`, `packages/ai/`. No changes to `evaluateActivity` or `normalizeContent`. Props/API of all components remain identical so `ActivityRenderer` dispatch code needs zero structural changes.
- **State Contracts**: All state management stays in `ActivityRenderer` (parent component). Individual components remain purely presentational.

---

## Technical Notes & Constraints
- **Library**: `@dnd-kit/core` + `@dnd-kit/sortable` + `@dnd-kit/utilities` — best React DnD library with native touch/pointer support.
- **Pointer Activation**: Use `PointerSensor` with `activationConstraint: { distance: 8 }` to distinguish taps from drags.
- **Touch Support**: `@dnd-kit` handles touch natively via Pointer Events. All draggable items must have `touch-none` class to prevent scroll interference.
- **ALX Constraints**:
  - Touch targets minimum 56x56px (verify all `<button>` and `useDraggable` elements).
  - Drag overlay must be semi-transparent with shadow (not disorienting).
  - Drop animations must be 150–300ms fade transitions, no bounce or parallax.
  - Items placed incorrectly must show "Safe Mistakes" (ALX-5) — unlimited retries, no failure states, clear ✕ remove buttons.
- **Reference Implementation**: `GridCounter.tsx` and `ClockWidget.tsx` already use pointer-drag patterns. These serve as architectural references.

---

## Target Deliverables & Stories

- [ ] **Task 1: Add @dnd-kit dependency** (`packages/ui/package.json`)
- [ ] **Task 2: Refactor DragDrop** — True drag-from-pool-into-target-zone
- [ ] **Task 3: Refactor Matching** — Drag-left-item-onto-right-item to connect
- [ ] **Task 4: Refactor PlaceValueChart** — Drag-digit-from-bank-onto-column
- [ ] **Task 5: Refactor Sequencing** — Drag-to-reorder within sequence list (remove ▲/▼)
- [ ] **Task 6: Add drop animations** — 200ms fade-in scale on all placed items
- [ ] **Task 7: Touch target audit** — Verify 56x56px minimum across all activities
- [ ] **Task 8: Interaction tests** — Render + basic interaction tests for all 4 components
- [ ] **Task 9: Integration smoke test** — Full `pnpm build`, `pnpm lint`, `pnpm test`

---

## Validation Strategy
1. Each component builds independently: `pnpm --filter @learn-easy/ui build`
2. Existing tests pass: `pnpm --filter @learn-easy/ui test`
3. Full monorepo health: `pnpm build && pnpm lint && pnpm test`
4. Manual verification in playground: open `apps/student/pages/playground.tsx` and test each activity type on desktop (mouse) and tablet (touch).
5. ALX Design Review Checklist (section 15 of `knowledge/design/design-guidelines.md`) must pass for each refactored component.

---

## References
- **Implementation Plan**: `knowledge/project-management/plans/2026-06-21-activity-interaction-audit.md`
- **Usability Report**: See issue body (full audit of all 14 activity types)
- **ALX Design Guidelines**: `knowledge/design/design-guidelines.md`
- **ALX Token Spec**: `knowledge/design/DESIGN.md`
- **AGENTS.md**: `AGENTS.md`
