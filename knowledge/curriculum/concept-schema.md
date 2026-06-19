# Concept Specification Schema

## Purpose

The Concept Specification Schema defines the shape and validation rules for
curriculum concept specifications in the LearnEasy system. Every concept
in the curriculum — from "Addition Basics" to "Quantum Mechanics" — is
represented as a `ConceptSpec` object conforming to this schema.

This schema is built with **Zod** for runtime validation and TypeScript
type inference. It is the foundational data type that all Phase 1 stories
(concept authoring, dependency resolution, curriculum graph traversal)
depend on.

---

## Field Descriptions & Validation Rules

| Field              | Type                          | Required | Default    | Description                                                                 |
|--------------------|-------------------------------|----------|------------|-----------------------------------------------------------------------------|
| `conceptId`        | `string`                      | ✅       | —          | Unique identifier. Pattern: `/^[a-z]+[a-z0-9_]*$/` (lowercase, underscores) |
| `learningObjective`| `string`                      | ✅       | —          | What the learner achieves. Minimum 10 characters.                           |
| `coreIdea`         | `string`                      | ✅       | —          | The key understanding the concept conveys.                                  |
| `examples`         | `string[]`                    | ✅       | —          | At least one concrete example.                                              |
| `misconceptions`   | `string[]`                    | ✅       | `[]`       | Common misunderstandings (may be empty).                                    |
| `supports`         | `{ visual?, audio?, prompting? }` | ❌    | —          | Optional boolean flags for learning supports.                               |
| `masteryCriteria`  | `number` (0–1)                | ✅       | —          | Decimal percentage required for mastery.                                    |
| `dependencies`     | `string[]`                    | ❌       | `[]`       | Prerequisite concept IDs.                                                   |
| `difficulty`       | `"beginner"` \| `"intermediate"` \| `"advanced"` | ❌ | `"beginner"` | Difficulty tier.                                             |
| `estimatedDuration`| `number` (minutes)            | ❌       | —          | Estimated time to complete (positive integer).                              |

---

## Usage Example

```typescript
import { conceptSpecSchema, validateConceptSpec } from '@learn-easy/db';
import type { ConceptSpec } from '@learn-easy/db';

// Using the raw schema for parsing
const raw = {
  conceptId: 'fractions_intro',
  learningObjective: 'Learner identifies and creates simple fractions',
  coreIdea: 'A fraction represents a part of a whole',
  examples: ['1/2 of a pizza', '3/4 of a cake'],
  misconceptions: ['Thinking a bigger denominator means a bigger fraction'],
  supports: { visual: true },
  masteryCriteria: 0.85,
  dependencies: ['division_basics'],
  difficulty: 'beginner',
  estimatedDuration: 20,
};

const parsed = conceptSpecSchema.parse(raw);
// parsed is typed as ConceptSpec

// Using the validator for safe parsing
const result = validateConceptSpec(raw);
if (result.success) {
  const spec: ConceptSpec = result.data;
  console.log(`Valid concept: ${spec.conceptId}`);
} else {
  console.error('Validation errors:', result.errors);
}
```

---

## Related Stories

- **Story 0.2** — Concept Authoring CLI (uses this schema for input validation)
- **Story 0.3** — Curriculum Graph / Dependency Resolution (uses `dependencies`)
- **Story 0.4** — Concept Persistence to Database (stores `ConceptSpec` in Prisma)
