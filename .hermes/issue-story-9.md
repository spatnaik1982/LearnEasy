## Goal

Implement F10 from issue #60. Replace the flat 3-stat grid + "Quick Links" with a narrative arc on the Parent Overview page. Remove the hardcoded `"3 days"` streak.

## Background

Issue #60 F10 found that the parent dashboard tabs are four separate pages with no shared narrative. The Overview shows 3 stat cards and a recent-activity list, but the most useful question for a parent — "what should I do this week?" — is buried on the Insights tab. "Current Streak: 3 days" is hardcoded — a fake metric shipped to real parents. "Quick Links" are tertiary buttons styled as primary cards, competing visually with the stat cards.

## User Story

As a parent, I want the Overview page to tell me one clear thing I should pay attention to this week, not just show me a flat list of numbers.

## Functional Requirements

- Full rewrite of `apps/parent/pages/dashboard.tsx`. New layout:
  1. **Headline** (always one): "This week {childName} completed {n} concepts and is on track for Level A." OR "{childName} needs help with {lowestMasteryConcept} — try a 5-minute practice together." Compute from `progress` data.
  2. **3 stat cards** (keep, but remove hardcoded streak). Replace the hardcoded `"3 days"` with `{streakDays}` from data; if `streakDays` is 0, hide the streak card entirely.
  3. **This week panel** — replace "Recent Activity" with a list of last 5 sessions. Each row: concept name + duration + outcome icon (✅ for completed, ↻ for in-progress, ➕ for started).
  4. **Next step for you** — a single card. If the API for insights returns data (issue #52), show the top insight. Otherwise, fallback to a CTA: "Set up a daily lesson time" → `/dashboard/reports`.
  5. **Quick Links** move to a text-link row at the bottom of the page, no longer styled as primary cards.

## Files to modify

- `apps/parent/pages/dashboard.tsx` (full rewrite)

## Files to read for context (NOT modify)

- `apps/parent/lib/dashboard-layout.tsx` — confirm shape of `DashboardLayout`
- `apps/parent/lib/api.ts` — confirm `getStudentProgress` return shape
- `apps/parent/lib/mockData.ts` — `ConceptProgress` interface
- `packages/ui/src/copy.ts` — confirm `COPY.*` keys (Story 1)

## Hardcoded strings to REMOVE

- `"Current Streak: 3 days"`
- `"keep it going!"`

## Outcome icon mapping

- `concept.completed === true` → ✅
- `concept.mastery > 0 && concept.mastery < 1` → ↻
- `concept.mastery === 0` → ➕

## Acceptance Criteria

- [ ] `pnpm --filter @learn-easy/parent exec tsc --noEmit` succeeds
- [ ] `pnpm --filter @learn-easy/parent build` succeeds
- [ ] The string `"3 days"` does NOT appear anywhere in `apps/parent/pages/dashboard.tsx` (verify with grep)
- [ ] The string `"keep it going!"` does NOT appear in `apps/parent/pages/dashboard.tsx` (verify with grep)
- [ ] "Quick Links" are now text-links, not filled cards

## Testing Requirements

- `tsc --noEmit` + `next build`
- Manual browser smoke test: visit `/dashboard?child=child-1` and verify the new layout

## Definition Of Done

- [ ] Layout restructured
- [ ] Hardcoded streak removed
- [ ] No new lint warnings

## Out Of Scope

- Real-time streak calculation from `learning_sessions` table (deferred — uses the existing data, no new endpoints)
- "Next step" insight integration with issue #52 (use the fallback CTA for now)
- Changes to the other parent pages (Progress, Reports, Insights) — they keep their existing structure

---

Parent Epic: #60
