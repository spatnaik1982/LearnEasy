---
name: "🏛️ Epic"
about: Large capability, architectural initiative, or multi-story milestone.
title: "[Epic] "
labels: ["type:epic"]
assignees: ""
---

# Epic: [Title]

## Objective
A high-level description of what should exist and the core technical milestone this Epic represents.

---

## Context
The product or architectural rationale behind this Epic. Why are we building this now? How does this align with the LearnEasy (Arin Learn) vision of autism-first NIOS OBE learning?

---

## Scope & Architectural Alignment
- **Target Components**: Identify impacted apps (`apps/student`, `apps/parent`) and packages (`packages/api`, `packages/db`, `packages/ui`, `packages/ai`, `packages/config`).
- **Dependency Rules**: Strictly confirm how this Epic respects monorepo isolation and dependency direction.
- **State Contracts**: Outline new database models, API endpoints, or persistence requirements.

---

## Technical Notes & Constraints
- List any architectural boundaries, performance requirements (PGVector query latency, API response times), or ALX design constraints.
- Reference existing ADRs or design decisions in `knowledge/`.
- Ensure alignment with ALX Design Guidelines (predictability, visual-first, one-concept-at-a-time, safe mistakes).

---

## Target Deliverables & Stories
List the child stories expected from this Epic:
- [ ] Story 1: Description
- [ ] Story 2: Description

---

## Validation Strategy
High-level description of how success will be verified across the Epic (e.g., end-to-end learner journeys, educator review sessions, cross-browser regression checks).

---

## References
- Parent initiative:
- Related issues:
- Reference docs: `knowledge/architecture.md`, `knowledge/design/design-guidelines.md`
