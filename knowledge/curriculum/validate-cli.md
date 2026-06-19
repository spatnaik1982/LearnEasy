# Curriculum Validation CLI

## Purpose

The **Curriculum Validation CLI** validates all curriculum source YAML files
for structural integrity, pedagogical completeness, and ALX compliance. It is
the gatekeeper that ensures every concept in the curriculum meets the required
standards before it can be committed or deployed.

## Usage

```bash
# From the repo root:
pnpm curriculum:validate

# With verbose per-file output:
pnpm curriculum:validate -- --verbose

# Against a custom curriculum directory:
pnpm curriculum:validate -- --dir /path/to/curriculum

# From the packages/db directory directly:
cd packages/db && pnpm curriculum:validate
```

## Options

| Flag          | Description                                                      |
|---------------|------------------------------------------------------------------|
| `--verbose`   | Show detailed per-file output with pass/fail/warning per file    |
| `--dir <path>`| Path to the curriculum directory (default: `./curriculum` from repo root) |

## Example Output

### All passing (exit code 0)

```
✓ All checks passed!

Summary: 1 concepts, 0 errors, 0 warnings
```

### With errors (exit code 1)

```
✗ Errors:
  /path/to/concept.yaml [bad_concept] Activity at index 1: type must be one of: visual_counting, matching, drag_drop, sequencing, multiple_choice, story_question, real_world
  [bad_concept] /path/to/concept.yaml: Missing required activity step "guided_practice"

⚠ Warnings:
  [bad_concept] /path/to/concept.yaml: learningObjective has 20 words (recommended ≤ 12)

Summary: 1 concepts, 2 errors, 1 warnings
```

### Verbose output

```
/path/to/curriculum/level-a/math/counting-1-10.yaml
  ✓ All checks passed

Summary: 1 concepts, 0 errors, 0 warnings
```

## Validation Rules

The CLI runs two layers of validation:

### Layer 1: Structural Validation (Pipeline)

These come from the core pipeline (`runCurriculumPipeline`) and produce errors:

| Rule                          | Description                                                |
|-------------------------------|------------------------------------------------------------|
| YAML parsing                  | File must be valid YAML                                   |
| ConceptSpec schema            | All required fields present, types correct, values valid   |
| Activity structure            | Each activity must have valid `step`, `type`, `order`     |
| Dependency resolution         | All referenced concept IDs must exist in the curriculum    |
| Circular dependency detection | No circular dependency chains                              |
| Duplicate conceptId detection | No two files may declare the same `conceptId`             |

### Layer 2: ALX Compliance Checks

These are additional checks that verify pedagogical completeness:

| Check                          | Type     | Description                                                   |
|--------------------------------|----------|---------------------------------------------------------------|
| Missing required steps         | **Error**  | Each concept must have activities for: `observe`, `guided_practice`, `independent_practice`, `mastery_check`, `positive_completion` |
| Unsupported activity type      | **Error**  | Only allowed: `visual_counting`, `matching`, `drag_drop`, `sequencing`, `multiple_choice`, `story_question`, `real_world` |
| Sentence length                | **Warning**| Text fields (`learningObjective`, `coreIdea`, activity descriptions) should be ≤ 12 words |
| Visual-first activity          | **Warning**| At least one activity per concept should use a visual-based type (`visual_counting`, `matching`, `drag_drop`) |

## Exit Codes

| Code | Meaning                       |
|------|-------------------------------|
| 0    | All checks passed (warnings OK) |
| 1    | One or more errors found      |

## Related Stories

- **Story 0.1** — ConceptSpec Schema (validated by the pipeline)
- **Story 0.2** — Curriculum Pipeline (provides the core validation)
- **Story 0.3** — Curriculum Validation CLI (this tool)
