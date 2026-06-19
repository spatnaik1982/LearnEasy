## Goal

Make the subject → chapter → concept hierarchy navigable via a real interactive breadcrumb and show concept mastery state via a `<MasteryChip>`. Implements F3 from issue #60.

## Background

Issue #60 F3 found: `chapters.tsx` shows a decorative `Subjects > Mathematics` line that is not interactive, `concepts.tsx` has no breadcrumb at all, concepts display a static numeric index that does not indicate mastery state. The UI implies linear ordering but the backend supports a dependency graph.

## User Story

As a learner, I want to see where I am in the curriculum and what state each concept is in (not started / in progress / mastered).

## Functional Requirements

- `<Breadcrumb>` component renders `<nav aria-label="Breadcrumb"><ol>` with chevron separators. Last item is non-link and uses `aria-current="page"`.
- `<MasteryChip>` is a 24×24 chip with three states: not-started (Soft Blue), in-progress (Soft Amber), mastered (Muted Green).
- `chapters.tsx` replaces the decorative `Subjects > {subject.title}` with the new breadcrumb.
- `concepts.tsx` adds a breadcrumb at the top AND replaces the static `{index + 1}` circle with `<MasteryChip state={...} />`.

## Files to create

- `packages/ui/src/Breadcrumb.tsx`
- `packages/ui/src/MasteryChip.tsx`

## Files to modify

- `packages/ui/src/index.ts` — export the two new components
- `apps/student/pages/subjects.tsx` — add breadcrumb
- `apps/student/pages/subjects/[id]/chapters.tsx` — replace decorative breadcrumb
- `apps/student/pages/chapters/[id]/concepts.tsx` — add breadcrumb + replace static index with MasteryChip

## Component signatures

```ts
// Breadcrumb
interface BreadcrumbItem { label: string; href?: string; }
interface BreadcrumbProps { items: BreadcrumbItem[]; }
function Breadcrumb(props: BreadcrumbProps): JSX.Element;

// MasteryChip
type MasteryState = "not-started" | "in-progress" | "mastered";
interface MasteryChipProps { state: MasteryState; size?: "sm" | "md"; }
function MasteryChip(props: MasteryChipProps): JSX.Element;
```

## MasteryChip color states

- not-started: Soft Blue (`#5D87B1`)
- in-progress: Soft Amber (`#EBC06D`)
- mastered: Muted Green (`#8FB996`)

## MasteryChip iconography

- not-started: empty circle
- in-progress: half circle or progress dot
- mastered: filled check

## MasteryChip ARIA

- `aria-label`: "Not started" / "In progress" / "Mastered"

## ALX-1 / ALX-4 enforcement

- Breadcrumb separator: use `lucide-react` `ChevronRight`, `aria-hidden`
- MasteryChip in `concepts.tsx` derives state from a new `conceptProgress: Record<conceptId, MasteryState>` map. Add a new lightweight `getConceptMastery` function in `apps/student/lib/api.ts` (follow the existing `ApiResponse<T>` pattern) if not already present; if the API isn't available, use a localStorage-backed stub with a `// TODO(api):` comment.

## Acceptance Criteria

- [ ] `pnpm --filter @learn-easy/ui build` succeeds
- [ ] `pnpm --filter @learn-easy/student exec tsc --noEmit` succeeds
- [ ] All three pages render the breadcrumb above the existing page title
- [ ] `MasteryChip` is used in `concepts.tsx` instead of the static number; verify the static number `index + 1` no longer appears in the concept list rendering (grep)
- [ ] `aria-label` is set correctly on each MasteryChip

## Testing Requirements

- `tsc --noEmit`
- Manual browser smoke test: visit `/subjects`, then a subject, then a chapter, verify breadcrumb updates on each page

## Definition Of Done

- [ ] `Breadcrumb` and `MasteryChip` exported from `@learn-easy/ui`
- [ ] All three pages integrated
- [ ] No new lint warnings

## Out Of Scope

- Mastery state persistence to backend (deferred)
- Real-time mastery updates from `fetchResumeState` (deferred)
- Sticky "Next up" prompt (deferred — was F3's third bullet, can be a follow-up)

---

Parent Epic: #60
