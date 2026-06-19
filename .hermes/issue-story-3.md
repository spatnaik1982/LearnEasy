## Goal

Standardize loading / empty / error / ready states across every list/detail page and wrap all fetch calls in a `useApi` hook that handles abort-on-unmount. Implements F6 from issue #60.

## Background

Issue #60 F6 found that every page has a plain-text "Loading..." indicator and no `catch` on its `useEffect` fetches. If the API call fails, the page sits on the loader forever. There are no error states, no retry actions, no abort-on-unmount cleanup. This story introduces a single `<DataState>` component and a `useApi` hook, and adopts them on every page.

## User Story

As a learner or parent, I want to see a calm loading indicator and a clear error message with a retry button when something fails to load.

As a developer, I want a `useApi` hook so I never have to write `useEffect` + abort + state management boilerplate again.

## Functional Requirements

- `<DataState>` supports four states: `loading`, `empty`, `error`, `ready`.
- `useApi<T>(fn, deps)` hook returns `{ data, loading, error, refetch, setData }`.
- The hook handles abort-on-unmount via `AbortController`.
- All 9 pages below adopt both the component and the hook.

## Files to create

- `packages/ui/src/DataState.tsx`
- `apps/student/lib/useApi.ts`
- `apps/parent/lib/useApi.ts`

## Files to modify

- `apps/student/pages/subjects.tsx`
- `apps/student/pages/subjects/[id]/chapters.tsx`
- `apps/student/pages/chapters/[id]/concepts.tsx`
- `apps/student/pages/learn/[conceptId].tsx`
- `apps/student/pages/index.tsx`
- `apps/parent/pages/dashboard.tsx`
- `apps/parent/pages/dashboard/progress.tsx`
- `apps/parent/pages/dashboard/reports.tsx`
- `apps/parent/pages/dashboard/insights.tsx`
- `packages/ui/src/index.ts` — export `DataState`

## Component / hook signatures

```ts
// DataState
type DataStateProps =
  | { status: "loading"; label?: string }
  | { status: "empty"; title: string; body?: string; action?: { label: string; onClick: () => void } }
  | { status: "error"; title?: string; body?: string; onRetry?: () => void }
  | { status: "ready"; children: ReactNode };
function DataState(props: DataStateProps): JSX.Element;

// useApi
function useApi<T>(
  fn: () => Promise<{ data: T | null; error: string | null }>,
  deps: unknown[]
): {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
  setData: (T | null) => void;
};
```

## Loading state visual

- Centered soft pulse (CSS keyframe `animate-pulse` on a 64×64 rounded card) + label in `text-on-surface-variant`.

## Empty state visual

- Rounded-xl white card with `title` (h2) + optional `body` + optional action button.

## Error state visual

- `bg-soft-coral/10` rounded card with title from `COPY.errorTitle` + body from `COPY.errorBody` + a "Try Again" button (using `COPY.tryAgain`) that calls `onRetry`.

## Acceptance Criteria

- [ ] All 9 pages render the new `DataState` component instead of plain text
- [ ] `pnpm --filter @learn-easy/ui build` succeeds
- [ ] `pnpm --filter @learn-easy/student exec tsc --noEmit` succeeds
- [ ] `pnpm --filter @learn-easy/parent exec tsc --noEmit` succeeds
- [ ] `useApi` is exported from each app's `lib/`
- [ ] No fetch in the modified pages is unguarded (grep for `.then(` without preceding `try` or `.catch` shows zero hits in those files)

## Testing Requirements

- `tsc --noEmit` on all three packages
- If a test runner exists for the apps, add a smoke test for `useApi` (loading + data + error paths). If not, document usage in `apps/student/lib/useApi.README.md` (one paragraph).

## Definition Of Done

- [ ] `DataState` exported from `@learn-easy/ui`
- [ ] All 9 pages migrated
- [ ] No new lint warnings

## Out Of Scope

- Optimistic updates (deferred)
- React Query / SWR integration (deferred)
- Toast notifications for errors (deferred — silent empty/error states only for now)

---

Parent Epic: #60
