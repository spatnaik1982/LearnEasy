# Activity Rendering Test Matrix

## Overview

Automated coverage for all 14 activity types across three testing layers: unit/round-trip, render/validation, and interactive E2E.

## Test Commands

| Layer | Command | Scope | What it covers |
|-------|---------|-------|----------------|
| Unit — UI components | `pnpm --filter @learn-easy/ui test` | `packages/ui` | Component rendering, adapter registration, adapter scoring, round-trip, activity utils |
| Unit — Schema validation | `pnpm --filter @learn-easy/db test` | `packages/db` | Activity schema, concept schema, playground examples, curriculum pipeline, dependency graph, validation CLI |
| E2E — Learn page render | `pnpm --filter @learn-easy/student e2e -- --grep "learn page renders"` | `apps/student` | Level B concept routes load without crashing |
| E2E — Playground render | `pnpm --filter @learn-easy/student e2e -- --grep "Playground"` | `apps/student` | All 14 activity types render without fallback; filter interactions work |
| E2E — Interactive success | `pnpm --filter @learn-easy/student e2e -- --grep "Interactive success flow"` | `apps/student` | One successful correct-answer flow per activity type |
| All E2E | `pnpm --filter @learn-easy/student e2e` | `apps/student` | All Playwright tests in `apps/student/e2e/` |

## Running Tests

```bash
# All unit tests across the monorepo
pnpm test

# UI package tests only (fastest feedback)
pnpm --filter @learn-easy/ui test

# DB package tests (schema validation)
pnpm --filter @learn-easy/db test

# All E2E tests (requires dev server, uses mock data)
pnpm --filter @learn-easy/student e2e

# E2E tests by category
pnpm --filter @learn-easy/student e2e -- --grep "render-roundtrip"
pnpm --filter @learn-easy/student e2e -- --grep "Playground"
pnpm --filter @learn-easy/student e2e -- --grep "Interactive success flow"
pnpm --filter @learn-easy/student e2e -- --grep "Level B Math"
```

## Test File Inventory

| File | Layer | Types covered | What it does |
|------|-------|---------------|--------------|
| `packages/ui/src/__tests__/render-roundtrip.test.ts` | Unit | All 14 | Builds correct responses and runs round-trip scoring for every type; negative tests for scored types; edge cases |
| `packages/ui/src/__tests__/activity-utils.test.tsx` | Unit | All scored | Tests `evaluateActivity()` correct/incorrect paths, observe-mode auto-complete, tolerance-based scoring |
| `packages/ui/src/__tests__/adapter-regression.test.tsx` | Unit | All 14 | Adapter registry lookup, `getInitialState`, render without throw, correct/incorrect scoring |
| `packages/ui/src/__tests__/*.test.tsx` | Unit | Per component | Individual component tests (14 component test files) |
| `packages/db/src/__tests__/activity-schema.test.ts` | Unit | All 14 | Zod schema validation for every type, step-type constraints, scoring contract superRefines |
| `packages/db/src/__tests__/playground-examples.test.ts` | Unit | All 14 | Validates all 42+ playground examples against activity schema |
| `apps/student/e2e/level-b-rendering.spec.ts` | E2E | 7 new | Route-level smoke tests for Level B concepts |
| `apps/student/e2e/playground-rendering.spec.ts` | E2E | All 14 | Playground page renders each type without crashing |
| `apps/student/e2e/activity-interaction.spec.ts` | E2E | All 14 | One successful correct-answer flow per type |

## Known Limitations

- **measurement_scale**: Playground test uses slider input to set value; UI click interaction on SVG is not covered
- **grid_area**: Playground test highlights cells but grid interactive mode without authored target auto-completes on submission
- **place_value_chart**: Playground test places digits in reverse column order; scoring depends on correct target number alignment
- **story_question**: First option is selected (index 0), which matches `correctIndex: 0` for the playground examples used
- **real_world**: Type response then submits; scoring always returns correct (self-report model)
- **drag_drop**: Items placed sequentially across targets; correct if item-to-target mapping matches expected
- **E2E tests** require `NEXT_PUBLIC_USE_MOCK=true` (set automatically by `playwright.config.ts`)
- **E2E tests** do not require a seeded database or network access

## Prerequisites

- Node.js 18+
- `pnpm` 10
- `pnpm install` at root
- `pnpm build` at root (for UI package, DB package)
