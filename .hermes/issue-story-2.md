## Goal

Introduce a single shared shell component used by both apps. The shell provides a persistent footer nav for the student app and a top tab bar for the parent app, both driven by the same source of truth. Implements F1 (no app shell).

## Background

Issue #60 F1 found that the student app has zero top-level navigation and every page re-implements its own background and back button. The parent app has a tab bar in `dashboard-layout.tsx` but the two apps feel like different products. A shared AppShell is the foundation for: the Calm Zone footer link (F5), the Settings link (F8), and consistent data-state rendering (F6).

## User Story

As a learner, I want a footer that is always in the same place so I always know how to navigate.

As a parent, I want a tab bar that is consistent across every dashboard page so I can switch views without re-orienting.

## Functional Requirements

- `AppShell` component supports two variants: `"student"` (footer nav) and `"parent"` (top tab nav via override).
- `StudentFooter` renders three 56×56 touch targets, in fixed order: Home (`/`), Calm Zone (`/calm-zone`), Settings (`/settings`). Active route gets `aria-current="page"` and a primary-color background.
- `ParentTabBar` re-implements the existing tab bar from `dashboard-layout.tsx` as a pure presentational component driven by a `tabs: { href, label }[]` prop.
- Every student page wraps its content in `<AppShell variant="student">` and **removes its own `bg-warm-off-white min-h-screen` wrapper** (the shell owns this).
- `apps/student/pages/calm-zone.tsx` passes `footer={null}` to suppress the footer (regulated space).
- `apps/parent/lib/dashboard-layout.tsx` is rewritten to use `<AppShell variant="parent" primaryNav={<ParentTabBar ... />}>...` and the duplicate header/nav is removed.

## Files to create

- `packages/ui/src/AppShell.tsx`
- `packages/ui/src/StudentFooter.tsx`
- `packages/ui/src/ParentTabBar.tsx`

## Files to modify

- `packages/ui/src/index.ts` — export the three new components
- `apps/student/pages/_app.tsx` — no global wrap (each page wraps itself)
- `apps/student/pages/index.tsx`
- `apps/student/pages/subjects.tsx`
- `apps/student/pages/subjects/[id]/chapters.tsx`
- `apps/student/pages/chapters/[id]/concepts.tsx`
- `apps/student/pages/calm-zone.tsx`
- `apps/student/pages/learn/[conceptId].tsx`
- `apps/parent/lib/dashboard-layout.tsx`
- `apps/parent/pages/dashboard.tsx` (no change beyond layout)
- `apps/parent/pages/dashboard/progress.tsx` (no change beyond layout)
- `apps/parent/pages/dashboard/reports.tsx` (no change beyond layout)
- `apps/parent/pages/dashboard/insights.tsx` (no change beyond layout)

## Component signatures

```ts
// AppShell
interface AppShellProps {
  children: ReactNode;
  variant?: "student" | "parent";
  footer?: ReactNode;        // override student footer (e.g. null for Calm Zone)
  primaryNav?: ReactNode;    // override parent tab bar
}

// StudentFooter (no props; derives active route from useRouter)
function StudentFooter(): JSX.Element;

// ParentTabBar
interface ParentTabItem { href: string; label: string; }
interface ParentTabBarProps {
  tabs: ParentTabItem[];
  activeHref: string;
}
function ParentTabBar(props: ParentTabBarProps): JSX.Element;
```

## ALX-1 Enforcement

- Footer order is fixed: Home → Calm Zone → Settings, in that order, every page.
- Footer buttons: 56×56, 16px gap, primary color for active route.
- `aria-current="page"` on the active link.

## Technical Requirements

- Use `opencode run -m opencode-go/deepseek-v4-flash` for ALL file changes.
- Use icons from `lucide-react` (already in dependencies): `Home`, `Leaf` (or `Heart` if not exported), `Settings`.
- The shell must accept `motion-safe:` overrides so future Story 7 (reduced motion) integration is trivial.

## Acceptance Criteria

- [ ] `pnpm --filter @learn-easy/ui build` succeeds
- [ ] `pnpm --filter @learn-easy/student exec tsc --noEmit` succeeds
- [ ] `pnpm --filter @learn-easy/parent exec tsc --noEmit` succeeds
- [ ] Student footer appears on every student page except `/calm-zone`
- [ ] Parent tab bar still works on all 4 parent dashboard pages
- [ ] No page still ships its own `bg-warm-off-white min-h-screen` wrapper at the root

## Testing Requirements

- `tsc --noEmit` on all three packages
- Manual browser smoke test: visit 3 student pages and 2 parent pages, verify footer/tab bar renders

## Definition Of Done

- [ ] All 3 new components exported from `@learn-easy/ui`
- [ ] All student pages wrapped, all 4 parent pages still working
- [ ] No new lint warnings

## Out Of Scope

- Wiring the actual reduced-motion / high-contrast theme classes (Story 7)
- Adding icons beyond `Home` / `Leaf` / `Settings` / `Heart`
- Animations or transitions on shell mount

---

Parent Epic: #60
