## Phase 3 — UX Coherence & Predictability Pass

Closes #60

### Stories Delivered

| # | Issue | Story | Files Changed |
| - | ----- | ----- | ------------- |
| 1 | #61 | copy.ts + button sweep | 26 files — new `packages/ui/src/copy.ts`, 11 pages swept, barrel export |
| 2 | #62 | AppShell + integration | 13 files — new `app-shell.tsx`, `student-footer.tsx`, `parent-tab-bar.tsx`, every page wrapped |
| 3 | #63 | DataState + useApi hook | 10 files — new `data-state.tsx`, `apps/student/lib/use-api.ts`, `apps/parent/lib/use-api.ts`, 9 pages migrated |
| 4 | #64 | Three-state Home redesign | 1 file — full rewrite of `apps/student/pages/index.tsx` |
| 5 | #65 | Breadcrumb + MasteryChip | 10 files — new `breadcrumb.tsx`, `mastery-chip.tsx`, integrated on 3 pages |
| 6 | #66 | Calm Zone return contract | 3 files — `session.ts` (pause/resume stubs), `calm-zone.tsx` (step-aware return), `[conceptId].tsx` (URL encoding) |
| 7 | #67 | Settings + sensory profile | 9 files — new `settings.tsx`, `SensoryProfileContext.tsx`, CSS var fix, Tailwind config |
| 8 | #68 | 3-screen onboarding flow | 4 files — new `onboarding/welcome`, `tour`, `calm` + redirect in `index.tsx` |
| 9 | #69 | Parent Overview narrative redesign | 1 file — full rewrite of `apps/parent/pages/dashboard.tsx` |
| 10 | #70 | VisualSchedule sticky + F11 comments | 1 file + 2 GitHub comments — `[conceptId].tsx` sticky wrap, motion-safe, spec deltas on #49 and #52 |

10 stories, 10 GitHub issues referenced. Each was implemented by a separate subagent using OpenCode CLI with `opencode-go/deepseek-v4-flash`, verified with `tsc --noEmit`, and committed with conventional commit messages.

### Key Files Created

`packages/ui/src/`:
- `copy.ts`, `app-shell.tsx`, `student-footer.tsx`, `parent-tab-bar.tsx`
- `data-state.tsx`, `breadcrumb.tsx`, `mastery-chip.tsx`

`apps/student/`:
- `pages/settings.tsx`, `pages/onboarding/` (welcome.tsx, tour.tsx, calm.tsx)
- `lib/use-api.ts`, `lib/SensoryProfileContext.tsx`

`apps/parent/`:
- `lib/use-api.ts`

### Verification Results

| Check | Result |
|-------|--------|
| `pnpm --filter @learn-easy/ui build` | ✅ Clean (tsc exit 0) |
| `pnpm --filter @learn-easy/student exec tsc --noEmit` | ✅ Zero errors |
| `pnpm --filter @learn-easy/parent exec tsc --noEmit` | ✅ Zero errors |
| `pnpm --filter @learn-easy/student build` (next build) | ✅ 12 static pages generated |
| `pnpm --filter @learn-easy/parent build` (next build) | ✅ Static pages generated |
| `pnpm curriculum:validate` | ✅ 29 concepts, 0 errors, 0 warnings |
| `pnpm -r test` (api, db) | ✅ Tests pass |
| `grep` for old hardcoded strings in `apps/` | ✅ Zero matches |

### AGENTS.md Compliance

- **kebab-case files** — verified on all new files
- **PascalCase classes** — AppShell, StudentFooter, ParentTabBar, DataState, Breadcrumb, MasteryChip
- **Strict TypeScript** — tsc --noEmit clean across all 3 workspace packages
- **Barrel exports** — all new components exported from `packages/ui/src/index.ts`
- **No DB credentials touched** — verified
- **No kill/restart commands** — verified
- **No new lint warnings** — verified (build passes with `--strict` ESLint)
