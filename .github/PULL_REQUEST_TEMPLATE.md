## Summary
A concise description of the objective and what this pull request achieves.

## Related Issue
Closes #[Issue number] (or links to parent Story/Epic)

## Changes
Detail the specific changes made, organized by workspace:
- **`packages/...`**:
  - Description of change 1
- **`apps/...`**:
  - Description of change 2

## Tests & Verification
Detailed verification instructions to prove this PR works.
- **Automated Tests run**: (e.g., `pnpm --filter @learn-easy/<package> test`, `pnpm lint`)
- **Manual Verification steps**:

## Risks & Mitigations
- **Compatibility**: Does this introduce breaking changes to API contracts or database schema?
- **ALX Compliance**: Does this affect the user experience for ASD learners? (safe mistakes, sensory controls, predictability)
- **Mitigation plan**:

## Review Checklist
- [ ] **Acceptance Criteria Met**: Verified against issue acceptance criteria.
- [ ] **Tests Pass**: `pnpm test` passes across all workspaces.
- [ ] **No Architecture Violations**: Confirmed dependency direction and workspace isolation.
- [ ] **Type Safety**: Strict TypeScript; no illegal `any` types added.
- [ ] **ALX Design Compliance**: UI changes follow ALX Design Guidelines (predictability, visual-first, one-concept-at-a-time, safe mistakes, controlled sensory environment).
- [ ] **Accessibility**: Touch targets ≥56x56px, proper ARIA labels, no autoplay media.
- [ ] **Documentation**: Updated `knowledge/` or README if schemas or public APIs changed.
- [ ] **Clean Code**: No dead code, debug logs, or temporary edits remain.
- [ ] **Branch Strategy**: Conventional commit message (`feat:`, `fix:`, `chore:`, `docs:`), squash merge to `main`.
