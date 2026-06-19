## Goal

Implement the Phase 1 sensory controls from F8 in issue #60. Three toggles, persisted to localStorage. Fix the broken `.high-contrast` CSS selector in `apps/student/styles/globals.css` that uses `var(--color-*)` but the Tailwind config has raw hex.

## Background

Issue #60 F8 found that the codebase has zero implementation of the sensory profile documented in design-guidelines.md §12. There is no settings page, no profile API, no reduced-motion respect (partially — the global CSS has a `prefers-reduced-motion` block, but no Settings UI to extend it). The `.high-contrast` CSS class references `var(--color-soft-blue)` and `var(--color-slate-text)` but the Tailwind config defines those colors as raw hex, not CSS vars, so the class has no effect.

## User Story

As a learner (or my parent), I want to be able to turn off animations and switch to a high-contrast theme so the app matches my sensory preferences.

## Functional Requirements

- New `apps/student/pages/settings.tsx` page wrapped in `<AppShell variant="student">` (from Story 2).
- Three toggle rows, each is a `<button role="switch" aria-checked={...}>` at min-height 56px:
  - **Reduce motion** (default OFF)
  - **Lower contrast** (default OFF)
  - **Sound on/off** (default ON, forward-looking — no audio exists yet)
- `SensoryProfileContext` provides `useSensoryProfile()` hook returning `{ reduceMotion, lowContrast, soundEnabled, setReduceMotion, setLowContrast, setSoundEnabled }`.
- Wrap the student app at `apps/student/pages/_app.tsx` so any page can read the profile.
- Persist toggles to `localStorage["learn-easy.sensory"]`.
- Fix the broken `.high-contrast` CSS by adding `:root` CSS vars and updating the Tailwind config to use them for `soft-blue` and `slate-text` only.

## Files to create

- `apps/student/pages/settings.tsx`
- `apps/student/lib/SensoryProfileContext.tsx`

## Files to modify

- `apps/student/pages/_app.tsx` — wrap with `<SensoryProfileProvider>`
- `apps/student/styles/globals.css` — add `:root` CSS vars + fix `.high-contrast`
- `apps/student/tailwind.config.js` — change `soft-blue` and `slate-text` to use `var(--color-*)` (other colors stay raw hex)

## CSS fix

```css
:root {
  --color-soft-blue: #5D87B1;
  --color-slate-text: #374151;
}
.high-contrast {
  --color-soft-blue: #1a3a5c;
  --color-slate-text: #000000;
}
```

## Acceptance Criteria

- [ ] `pnpm --filter @learn-easy/student exec tsc --noEmit` succeeds
- [ ] `pnpm --filter @learn-easy/student build` succeeds
- [ ] Settings page renders at `/settings` with the AppShell footer
- [ ] Toggling Reduce Motion on, reloading the page, the toggle state persists
- [ ] Toggling Lower Contrast on adds the `high-contrast` class to `<html>` (verify via `document.documentElement.classList.contains("high-contrast")` in browser console)

## Testing Requirements

- `tsc --noEmit` + `next build`
- Manual browser smoke test: visit `/settings`, toggle each switch, reload, verify persistence, verify `high-contrast` class on `<html>`

## Definition Of Done

- [ ] All 5 files modified
- [ ] No new lint warnings
- [ ] Visual: default theme colors are identical before and after the change (Tailwind build did not break the palette)

## Out Of Scope

- Persisting `SensoryProfile` to backend (deferred — `// TODO(api):` comment is acceptable)
- Audio support (the toggle is forward-looking)
- Other palette colors (only `soft-blue` and `slate-text` get the CSS-var treatment)
- Visual changes to components based on profile (the toggles only set the class; no component currently reads the context yet)

---

Parent Epic: #60
