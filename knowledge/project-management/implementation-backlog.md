# LearnEasy Implementation Backlog

## Version 1.0 — AI-Agent Optimized

This backlog is designed for AI-agent driven development following ALX 2.0, TEACCH, and ABA principles. Every story is independently executable by a coding agent with clear acceptance criteria.

---

# Phase 1 — Curriculum Infrastructure

## EPIC-0: Curriculum Content Infrastructure

### Objective
Create a scalable curriculum system where educators author concepts instead of manually creating activities.

### Background
The foundational curriculum model (Level → Subject → Chapter → Concept → Activity) is already implemented in Prisma. The seed data for Level A Mathematics is populated. This Epic extends the infrastructure with formal validation, a curriculum pipeline for importing new content, and a validation engine to ensure curriculum quality.

### User Value
Educators can define, validate, and import curriculum content without engineering support. Curriculum quality is enforced programmatically.

### Scope
- Concept specification schema with formal validation
- Curriculum YAML/JSON pipeline (validate → transform → seed)
- Curriculum validation CLI
- Level A Mathematics concept library expansion (Story-based Questions, Real-World Tasks)

### Dependencies
None — builds on existing Prisma schema and seed infrastructure.

### Stories
**Story 0.1 — Concept Specification Schema** (below)
**Story 0.2 — Curriculum Pipeline** (below)
**Story 0.3 — Curriculum Validation CLI** (below)
**Story 0.4 — Level A Math Concept Library Expansion** (below)

### Success Criteria
- `pnpm curriculum:validate` runs and validates all curriculum content
- A new concept can be added via YAML file and seeded into the database
- Concept specification has formal JSON Schema validation
- All acceptance criteria for each child story are met

### Out Of Scope
- Curriculum authoring UI (EPIC-12)
- AI-generated activities (EPIC-9)
- Levels B and C curriculum (future phase)

---

### Story 0.1 — Concept Specification Schema

#### Goal
Create a formal, validated concept specification schema that defines the canonical representation of a curriculum concept including learning objectives, core ideas, examples, misconceptions, supports, mastery criteria, and dependencies.

#### Background
Currently, concepts are defined ad-hoc in seed.ts with only `code`, `name`, `objective`, `order`, and `difficulty`. There is no formal schema that captures the full pedagogical specification (examples, misconceptions, prerequisite dependencies, mastery thresholds, support types). This schema is needed for the curriculum pipeline and validation engine.

#### User Story
*As a curriculum author,* I want to define a concept with structured fields (objective, core idea, examples, misconceptions, supports, mastery criteria) so that every concept is pedagogically complete and validated before being loaded into the database.

#### Functional Requirements
- Define a Zod schema in `packages/db/` for concept specification
- Fields: conceptId, learningObjective, coreIdea, examples (array), misconceptions (array), supports (visual/audio/prompting), masteryCriteria (percentage), dependencies (array of prerequisite conceptIds), difficulty, estimatedDuration
- Schema validates all required fields with descriptive error messages
- Schema rejects incomplete or invalid concept specs
- Export a `validateConceptSpec()` function that returns typed validation result

#### Technical Requirements
- Use Zod for schema validation (consistent with existing project patterns)
- Schema must be usable from both CLI and TypeScript imports
- Concept ID format: lowercase with underscores (e.g., `counting_1_10`)
- Examples and misconceptions as typed arrays
- Dependencies reference other concept IDs (validated at pipeline time)

#### Deliverables
- `packages/db/src/concept-schema.ts` — Zod schema and validator
- `packages/db/src/index.ts` — barrel export
- Unit tests for the schema validator (valid specs pass, invalid specs fail)

#### Acceptance Criteria
- [ ] Zod schema validates all required fields
- [ ] `validateConceptSpec()` returns `{ success: true, data }` or `{ success: false, errors }`
- [ ] Schema catches missing objective, empty examples, invalid mastery percentage
- [ ] All unit tests pass
- [ ] Documentation in `knowledge/curriculum/concept-schema.md`

#### Files Expected To Change
- `packages/db/src/` (new files)
- `packages/db/package.json` (if adding Zod dependency)
- `packages/db/tsconfig.json`

#### Testing Requirements
- Unit tests for schema validation (valid specs, missing fields, invalid types, edge cases)
- TypeScript compile checks

#### Definition Of Done
- [ ] Schema implemented and exported
- [ ] Unit tests passing
- [ ] Documentation written

#### Out Of Scope
- YAML/JSON file parsing (Story 0.2)
- CLI tooling (Story 0.3)
- Curriculum authoring UI (EPIC-12)

---

### Story 0.2 — Curriculum Pipeline

#### Goal
Build a pipeline that transforms curriculum source files (YAML/JSON) into validated, seedable database content.

#### Background
Curriculum content is currently hardcoded in `seed.ts`. To scale, concepts should be authored as standalone YAML/JSON files, validated against the concept schema (Story 0.1), transformed into Prisma create payloads, and seeded into the database. This pipeline enables adding new curriculum content without modifying code.

#### User Story
*As a curriculum developer,* I want to place a concept YAML file into the curriculum directory, run a build command, and have the concept validated and available in the database via seed.

#### Functional Requirements
- Parse YAML concept specification files from `curriculum/` directory
- Validate each file against the ConceptSpec schema (Story 0.1)
- Resolve concept dependency references (ensure prerequisites exist)
- Transform validated specs into Prisma Activity create payloads
- Output a seed-compatible JSON manifest or direct upsert commands
- Report clear errors for missing dependencies, duplicate conceptIds, or validation failures

#### Technical Requirements
- Use `js-yaml` for YAML parsing (already in project dependency tree)
- Pipeline runs as part of seed process: `pnpm --filter @learn-easy/db prisma:seed`
- Pipeline output includes success count, error list, and dependency graph
- Pipeline validates cross-concept dependency references don't form cycles

#### Deliverables
- `packages/db/src/curriculum-pipeline.ts` — pipeline orchestrator
- `curriculum/` directory at repo root with example concept YAML file
- Integration with existing seed.ts (pipeline runs before or as part of seed)
- Unit tests for pipeline: valid curriculum, missing deps, cycles, duplicate IDs

#### Acceptance Criteria
- [ ] Single concept YAML file is parsed, validated, and converted to seed data
- [ ] Multiple concept files with dependencies are processed in dependency order
- [ ] Pipeline reports error for circular dependencies
- [ ] Pipeline reports error for missing prerequisite concept
- [ ] Pipeline reports error for invalid YAML or schema violation
- [ ] Successful run produces a summary: "3 concepts validated, 3 seeded, 0 errors"

#### Files Expected To Change
- `packages/db/src/` (new files)
- `packages/db/package.json` (js-yaml dependency)
- `packages/db/prisma/seed.ts` (integrate pipeline)
- `curriculum/` (new directory with example files)
- Root `pnpm-workspace.yaml` (no change needed, already has packages/*)

#### Testing Requirements
- Unit tests for each pipeline stage: parse → validate → resolve → transform → seed
- Fixture YAML files for valid and invalid test cases
- Integration test that runs the full pipeline against test fixtures

#### Definition Of Done
- [ ] Pipeline implemented and integrated with seed
- [ ] Example curriculum YAML files created
- [ ] Tests pass
- [ ] Documentation in `knowledge/curriculum/`

#### Out Of Scope
- Curriculum repository structure with Level/Subject/Chapter hierarchy (data model already exists)
- CLI tool for pipeline (handled by Prisma seed)
- Code generation for TypeScript types from YAML

---

### Story 0.3 — Curriculum Validation CLI

#### Goal
Create a standalone CLI command `pnpm curriculum:validate` that validates all curriculum source files for structural integrity, pedagogical completeness, and referential consistency.

#### Background
As the curriculum grows (Level A Math → Language → EVS → Levels B/C), manual validation becomes impractical. A validation CLI catches errors before seed time: missing fields, broken dependencies, unsupported activity types, and ALX compliance issues.

#### User Story
*As a curriculum maintainer,* I want to run a validation command that checks all curriculum files for errors before they reach the database, so that curriculum content is always consistent and production-ready.

#### Functional Requirements
- CLI command: `pnpm curriculum:validate`
- Validates all `.yaml`/`.yml` files in `curriculum/` directory tree
- Concepts validated against ConceptSpec schema (Story 0.1)
- Cross-reference checks: concept dependencies point to valid concepts
- Activity type checks: only supported types used (visual_counting, matching, drag_drop, sequencing, multiple_choice, story_question, real_world)
- Step checks: each concept has activities for required steps (observe, guided_practice, independent_practice, mastery_check, positive_completion)
- ALX compliance checks: sentence length ≤12 words, visual-first (at least one visual activity per concept)
- Output: summary with pass/fail per file, total error count, warning count
- Exit code 0 if all pass, 1 if any validation errors

#### Technical Requirements
- Implemented as a Node.js script in `packages/db/src/cli/validate.ts`
- Registered in `packages/db/package.json` scripts section
- Reuses ConceptSpec schema and pipeline validation from Stories 0.1 and 0.2
- Colorized terminal output (green ✓ / red ✗)

#### Deliverables
- `packages/db/src/cli/validate.ts` — CLI entry point
- `packages/db/package.json` script entry
- Validation unit tests with fixture curriculum files

#### Acceptance Criteria
- [ ] `pnpm curriculum:validate` runs and exits 0 for valid curriculum
- [ ] Reports individual errors per file with line numbers
- [ ] Detects unsupported activity types
- [ ] Detects missing required activity steps for a concept
- [ ] Detects sentence length violations (>12 words in text fields)
- [ ] Warnings but no errors for missing optional fields
- [ ] Exit code 1 when validation errors exist
- [ ] Colorized terminal output

#### Files Expected To Change
- `packages/db/package.json` (add script)
- `packages/db/src/cli/validate.ts` (new file)
- `packages/db/src/cli/` (new directory)
- Root `package.json` scripts (orchestration)

#### Testing Requirements
- Unit tests for each validation rule
- Fixture curriculum directory with known-good and known-bad content
- Test that exit code reflects validation result

#### Definition Of Done
- [ ] CLI command works end-to-end
- [ ] All validation rules implemented
- [ ] Tests pass
- [ ] Documentation in `knowledge/curriculum/validate-cli.md`

#### Out Of Scope
- Autofix for validation errors
- ALX compliance scanning beyond basic rules (EPIC-11)
- Web-based validation dashboard

---

### Story 0.4 — Level A Math Concept Library Expansion

#### Goal
Expand the Level A Mathematics curriculum with Story-Based Questions and Real-World Task activity types for existing concepts, and add more concepts within the existing 4 chapters.

#### Background
The current MVP has 5 concepts with visual counting, matching, multiple choice, and sequencing activities. Story-Based Questions and Real-World Task activity types exist in the Prisma schema but have no content or UI components. Expanding the concept library provides richer learning experiences.

#### User Story
*As a learner,* I want to see story-based math questions and real-world math tasks so that I can apply what I've learned in engaging, meaningful contexts.

#### Functional Requirements
- Add one Story-Based Question activity per existing concept (Counting, Number Recognition, Shapes, Addition, Subtraction)
- Add one Real-World Task activity per existing concept
- Define 2 new concepts within existing chapters (e.g., "Comparing Quantities" in Numbers, "Position Words" in Shapes)
- Each new concept follows the 5-step activity structure (Observe → Guided Practice → Independent Practice → Mastery Check → Positive Completion)
- New content defined in YAML curriculum files (not hardcoded in seed.ts)

#### Technical Requirements
- Use the curriculum pipeline (Story 0.2) to load new content
- Story-Based Question content: short scenario text (3-4 sentences max), question, answer options, correct answer
- Real-World Task content: real-world scenario, task description, expected answer format, visual support reference
- Content follows ALX language guidelines (literal, 5-12 word sentences)
- All new content validated by curriculum validation CLI (Story 0.3)

#### Deliverables
- YAML concept files for 2 new concepts in `curriculum/level-a/math/`
- Expanded YAML activity files for existing 5 concepts
- Validation passing for all new content
- Seed data includes new concepts and activities

#### Acceptance Criteria
- [ ] 2 new concepts defined and seeded
- [ ] 10 new activities (5 story-question + 5 real-world) added to existing concepts
- [ ] All curriculum validation checks pass
- [ ] New content follows ALX language and visual-first guidelines
- [ ] Seed runs without errors

#### Files Expected To Change
- `curriculum/level-a/math/` (new YAML files)
- `packages/db/prisma/seed.ts` (if pipeline not fully integrated)
- `packages/db/` test fixtures

#### Testing Requirements
- Validate new YAML files through curriculum validation CLI
- Verify seed succeeds with expanded content

#### Definition Of Done
- [ ] All new concepts and activities written in YAML
- [ ] Validation passes
- [ ] Seed creates content in database
- [ ] Documentation updated in `knowledge/project-vision.md` to reflect expanded scope

#### Out Of Scope
- Level A Language or EVS curriculum (EPIC-1)
- UI for Story-Based Questions or Real-World Tasks (EPIC-5)
- AI generation of activity content (EPIC-9)

---

## EPIC-1: NIOS Curriculum Extraction

### Objective
Extract and structure the complete NIOS OBE Level A curriculum (Mathematics, Language, Environmental Science) into the LearnEasy curriculum format.

### Background
Level A Mathematics is fully seeded. Level A Language and Environmental Science need to be extracted from NIOS OBE syllabus documents and structured into concepts with learning objectives, activities, and mastery criteria. A curriculum dependency graph must be created to define prerequisite relationships between concepts.

### User Value
Learners can access complete Level A curriculum across all three subjects. The dependency graph ensures learners master prerequisite concepts before advancing.

### Scope
- Level A Language curriculum extraction and concept definition
- Level A Environmental Science curriculum extraction and concept definition
- Curriculum dependency graph creation
- Cross-subject prerequisite mapping

### Dependencies
EPIC-0 (curriculum pipeline and concept schema)

### Stories
**Story 1.1 — Level A Language Curriculum** (below)
**Story 1.2 — Level A Environmental Science Curriculum** (below)
**Story 1.3 — Curriculum Dependency Graph** (below)

### Success Criteria
- All Level A subjects fully defined: Mathematics (existing + Story 0.4 expansion), Language (new), Environmental Science (new)
- Dependency graph created and validated
- `pnpm curriculum:validate` passes for all Level A content
- Seed creates all Level A curriculum content

### Out Of Scope
- Levels B and C (future phase)
- Activity content for Language and EVS (activity generation is EPIC-5, EPIC-9)
- UI for curriculum browsing

---

### Story 1.1 — Level A Language Curriculum

#### Goal
Define the complete NIOS OBE Level A Language curriculum as validated concept YAML files.

#### Background
Level A Language covers pre-literacy and early language skills aligned to NIOS OBE standards. This includes letter recognition, phonics, sight words, basic reading comprehension, and writing readiness. Currently only Mathematics is seeded.

#### User Story
*As a curriculum developer,* I want Level A Language concepts defined and validated so that learners can access language learning through the platform.

#### Functional Requirements
- Research NIOS OBE Level A Language syllabus scope
- Define 4-6 chapters (e.g., Letter Recognition, Phonics, Sight Words, Reading Readiness, Writing Readiness, Basic Comprehension)
- Define 2-3 concepts per chapter with learning objectives
- Each concept specifies: objective, core idea, examples, misconceptions, supports (visual/audio), mastery criteria
- Concepts follow the curriculum YAML format from Story 0.2
- All concepts pass curriculum validation

#### Technical Requirements
- Use curriculum pipeline (Story 0.2) for all definitions
- Activity templates identified per concept (matching for letter-picture pairs, visual for phonics, etc.)
- Cross-reference with Mathematics concepts for potential interdisciplinary links
- Follow ALX guidelines: visual-first, literal language, one-concept-at-a-time

#### Deliverables
- `curriculum/level-a/language/` directory with chapter and concept YAML files
- All files passing `pnpm curriculum:validate`

#### Acceptance Criteria
- [ ] 4-6 chapters defined for Level A Language
- [ ] 8-12 concepts defined with full specification (objective, core idea, examples, misconceptions, supports)
- [ ] All YAML files pass validation
- [ ] Concept IDs are unique across the curriculum
- [ ] No duplicate chapters or concepts

#### Files Expected To Change
- `curriculum/level-a/language/` (new directory with YAML files)
- No code changes unless new activity types are needed

#### Testing Requirements
- Run `pnpm curriculum:validate` against all new files — must pass
- Verify no duplicate concept IDs

#### Definition Of Done
- [ ] Language chapter and concept files written
- [ ] All files pass validation
- [ ] Documentation in `knowledge/curriculum/level-a-language.md`

#### Out Of Scope
- Activity content creation (images, specific question text)
- UI components for language activities (EPIC-5)
- Phonics audio generation
- Handwriting/drawing support

---

### Story 1.2 — Level A Environmental Science Curriculum

#### Goal
Define the complete NIOS OBE Level A Environmental Science curriculum as validated concept YAML files.

#### Background
Level A Environmental Science covers basic awareness of the natural and social environment — plants, animals, seasons, water, air, family, community. This is the third and final Level A subject needed for a complete MVP curriculum.

#### User Story
*As a curriculum developer,* I want Level A Environmental Science concepts defined so that learners can explore the world around them through structured, visual-first learning.

#### Functional Requirements
- Research NIOS OBE Level A Environmental Science syllabus scope
- Define 4-5 chapters (e.g., Living Things, My Family, Seasons & Weather, Water & Air, My Surroundings)
- Define 2-3 concepts per chapter
- Each concept follows the same specification format as Story 0.1
- Visual supports are especially important for EVS concepts (plants, animals, weather)
- All concepts pass curriculum validation

#### Technical Requirements
- Same pipeline as Story 1.1
- Activity templates identified per concept (visual for nature observations, matching for plant-animal identification, etc.)
- Follow ALX guidelines

#### Deliverables
- `curriculum/level-a/evs/` directory with chapter and concept YAML files
- All files passing `pnpm curriculum:validate`

#### Acceptance Criteria
- [ ] 4-5 chapters defined for Level A Environmental Science
- [ ] 8-12 concepts defined with full specification
- [ ] All YAML files pass validation
- [ ] Unique concept IDs across full curriculum

#### Files Expected To Change
- `curriculum/level-a/evs/` (new directory with YAML files)

#### Testing Requirements
- Run `pnpm curriculum:validate` against all new files — must pass

#### Definition Of Done
- [ ] EVS chapter and concept files written
- [ ] All files pass validation
- [ ] Documentation in `knowledge/curriculum/level-a-evs.md`

#### Out Of Scope
- Activity content creation
- UI for EVS activities
- Real-world photo/image sourcing

---

### Story 1.3 — Curriculum Dependency Graph

#### Goal
Create a formal dependency graph that defines prerequisite relationships between all Level A concepts, enabling mastery-based progression and learning path generation.

#### Background
Currently, concepts are ordered linearly within chapters but there is no formal dependency graph. A graph structure enables the platform to enforce prerequisite mastery, generate optimal learning paths, and prevent learners from encountering concepts they aren't ready for.

#### User Story
*As a learning algorithm,* I want to know which concepts must be mastered before a learner can attempt the next concept, so that I can enforce mastery-based progression.

#### Functional Requirements
- Define dependencies in concept YAML files as `dependencies: ["concept_id_a", "concept_id_b"]`
- Build a concept dependency graph from all Level A concepts
- Validate the graph for: reachability (all concepts reachable from entry points), acyclicity (no circular dependencies), completeness (all referenced dependencies exist)
- Generate a topological ordering of concepts for learning path generation
- Visualize the dependency graph as ASCII/mermaid for documentation

#### Technical Requirements
- Graph stored in-memory (not a separate DB table — dependencies are inferred from concept spec)
- Graph operations: `getDependencies(id)`, `getDependents(id)`, `getLearningPath(startConceptIds)`, `detectCycles()`, `topologicalSort()`
- Graph validation integrated into curriculum validation CLI (Story 0.3)
- Documentation in `knowledge/curriculum/dependency-graph.md`

#### Deliverables
- `packages/db/src/dependency-graph.ts` — graph construction and operations
- `packages/db/src/__tests__/dependency-graph.test.ts` — unit tests
- Integration with curriculum validation CLI
- Mermaid diagram in documentation

#### Acceptance Criteria
- [ ] Graph builds successfully from all Level A concept specs
- [ ] `detectCycles()` correctly identifies and reports circular dependencies
- [ ] `getLearningPath(["counting_1_10"])` returns valid ordered list of reachable concepts
- [ ] Curriculum validation CLI reports dependency graph errors
- [ ] Graph validation passes for all Level A curriculum content
- [ ] No circular dependencies exist in the defined curriculum

#### Files Expected To Change
- `packages/db/src/dependency-graph.ts` (new file)
- `packages/db/src/__tests__/dependency-graph.test.ts` (new file)
- `packages/db/src/cli/validate.ts` (add graph validation)
- `curriculum/` concept YAML files (add dependencies field)
- `knowledge/curriculum/dependency-graph.md` (new file)

#### Testing Requirements
- Unit tests: graph construction, cycle detection, learning path generation
- Integration test: full curriculum validation including graph checks
- Edge cases: concept with no dependencies, concept with multiple dependencies, circular dependency detection

#### Definition Of Done
- [ ] Graph module implemented and tested
- [ ] All Level A concepts have dependencies specified
- [ ] Validation passes with no cycles
- [ ] Documentation with visualization

#### Out Of Scope
- DB persistence of the graph (derived from concept files)
- Real-time graph updates from UI
- Individualized learning path computation (EPIC-6)

---

# Phase 2 — Curriculum Delivery & Learning Experience

## EPIC-3: Curriculum Delivery Platform

### Objective
Build the REST API services that power curriculum navigation, activity execution, progress tracking, and session management for the student and parent apps.

### Background
The NestJS API currently has GET endpoints for curriculum browsing (levels, subjects, chapters, concepts, activities). The ActivityAttempt, Progress, and Session Prisma models exist but have no API endpoints. The student app currently uses mock data instead of the real API. This Epic wires the API to real data and adds the missing tracking endpoints.

### User Value
Learners get real progress tracking, activity attempt recording, and session persistence. The platform can measure learning outcomes and adapt accordingly.

### Scope
- Activity Attempt API (POST + recording)
- Concept Progress API (read + update)
- Session management API
- Student app migration from mock data to real API
- Parent dashboard API integration

### Dependencies
EPIC-0 (curriculum pipeline) — curriculum content must be seeded

### Success Criteria
- Student app loads real curriculum data from API (not mock data)
- Activity attempts are recorded in the database
- Concept progress is updated after completing activities
- Learning sessions are tracked with start/end time and duration
- Parent dashboard displays real progress data

### Out Of Scope
- Learning path generation (EPIC-6)
- Mastery calculation algorithms (EPIC-6)
- Realtime updates

---

### Story 3.1 — Activity Attempt Recording API

#### Goal
Create the API endpoint for recording and querying student activity attempts.

#### Background
The `ActivityAttempt` Prisma model exists with fields for `studentId`, `activityId`, `correct`, `response` (JSON), `hintsUsed`, `retryCount`, `timeSpent`, and `completed`. There is no API to create or query attempts. The learn flow currently has no-op callbacks for activity evaluation.

#### User Story
*As a student completing an activity,* I want my answer, time spent, and hint usage recorded so that my progress is tracked and the platform can adapt to my learning needs.

#### Functional Requirements
- `POST /api/activities/:id/attempt` — Records an activity attempt
  - Request body: `{ studentId, response, hintsUsed, timeSpent }`
  - Response: `{ attemptId, correct, feedback }`
  - Auto-calculates `correct` by comparing response against activity content
  - On first correct attempt: creates/updates Progress record with increased mastery
  - Returns supportive feedback based on result (following ALX-5 Safe Mistakes)
- `GET /api/students/:id/activities/:activityId/attempts` — Returns attempt history for an activity
- `GET /api/students/:id/activities/:activityId/latest-attempt` — Returns most recent attempt
- All endpoints JWT-protected (student role only)
- Use `class-validator` DTOs for request validation

#### Technical Requirements
- Create `ActivityAttemptController` and `ActivityAttemptService` in `packages/api/src/`
- Activity evaluation logic: compare student response against `activity.content` based on activity type
  - `multiple_choice`: compare selectedIndex to correctIndex
  - `visual_counting`: compare count to expectedValue
  - `matching`: compare pairs accuracy threshold
  - `sequencing`: compare order accuracy
- Mastery update: first correct attempt within an activity increases Progress.mastery by 0.25 (capped at 1.0)
- Follow NestJS module pattern with DTOs in `dto/` subdirectory

#### Deliverables
- `packages/api/src/activities/activities.module.ts`
- `packages/api/src/activities/activities.controller.ts`
- `packages/api/src/activities/activities.service.ts`
- `packages/api/src/activities/dto/record-attempt.dto.ts`
- `packages/api/src/activities/dto/attempt-response.dto.ts`
- Unit tests for attempt recording, correctness evaluation, mastery updates

#### Acceptance Criteria
- [ ] `POST /api/activities/:id/attempt` returns `{ attemptId, correct: true/false, feedback }`
- [ ] Correct evaluation works for `multiple_choice` and `visual_counting` types
- [ ] Hint usage and time spent are persisted correctly
- [ ] First correct attempt updates Progress.mastery for the student+concept
- [ ] JWT auth required — returns 401 without valid token
- [ ] Invalid activity IDs return 404
- [ ] Invalid request body returns 400 with validation errors

#### Files Expected To Change
- `packages/api/src/app.module.ts` (register ActivitiesModule)
- `packages/api/src/activities/` (new module directory)
- `packages/api/src/prisma/prisma.service.ts` (no change — already handles all models)

#### Testing Requirements
- Unit tests for attempt evaluation logic per activity type
- Integration tests for API endpoints (POST success/failure, JWT auth, 404, 400)
- Test mastery update calculation

#### Definition Of Done
- [ ] API endpoints implemented and tested
- [ ] Activity evaluation logic working for at least 2 activity types
- [ ] Progress updates firing correctly
- [ ] API documentation in `knowledge/api/activities.md`

#### Out Of Scope
- UI integration in learn flow (Story 3.4)
- Advanced evaluation for drag-drop and story-question types (future)
- Real-time feedback display (frontend)

---

### Story 3.2 — Concept Progress API

#### Goal
Create API endpoints for reading and updating student progress on concepts.

#### Background
The `Progress` Prisma model exists with `studentId`, `conceptId`, `mastery` (0.0-1.0), `completed`, and `updatedAt`. Story 3.1 writes progress on activity attempts. This story adds read endpoints for progress display.

#### User Story
*As a student and parent,* I want to see my progress on each concept so that I know what I've mastered and what I still need to practice.

#### Functional Requirements
- `GET /api/students/:id/progress` — Returns progress for all concepts
  - Response: `[{ conceptId, conceptName, mastery, completed, updatedAt }]`
- `GET /api/students/:id/progress/:conceptId` — Returns progress for a specific concept
- `GET /api/students/:id/progress/by-chapter/:chapterId` — Aggregated progress for a chapter
  - Response: `{ chapterId, chapterName, conceptsCompleted, totalConcepts, chapterMastery }`
- `GET /api/students/:id/progress/by-subject/:subjectId` — Aggregated progress for a subject
- All endpoints JWT-protected (student and parent roles)
- Parent can query any child student's progress (`parentId` linked via Parent model)

#### Technical Requirements
- Create `ProgressController` and `ProgressService` in `packages/api/src/progress/`
- Aggregation queries: chapterMastery = average of concept masteries within chapter
- SubjectMastery = average of chapter masteries within subject
- Parent access: verify requesting parent is linked to the student (Parent.children relation)
- Use Prisma aggregation queries for efficient computation

#### Deliverables
- `packages/api/src/progress/progress.module.ts`
- `packages/api/src/progress/progress.controller.ts`
- `packages/api/src/progress/progress.service.ts`
- Unit tests for progress queries and parent authorization

#### Acceptance Criteria
- [ ] Per-concept progress returns correct mastery and completion status
- [ ] Chapter aggregation returns correct completion counts and average mastery
- [ ] Subject aggregation returns correct mastery
- [ ] Parent can query child's progress
- [ ] Unauthorized access to other students' data returns 403
- [ ] Progress for concept with no attempts returns mastery=0, completed=false

#### Files Expected To Change
- `packages/api/src/app.module.ts` (register ProgressModule)
- `packages/api/src/progress/` (new module directory)

#### Testing Requirements
- Unit tests for progress aggregation logic
- Integration tests for GET endpoints
- Auth permission tests (student vs parent role)

#### Definition Of Done
- [ ] All progress endpoints implemented and tested
- [ ] Parent authorization working
- [ ] API documentation in `knowledge/api/progress.md`

#### Out Of Scope
- Progress chart rendering in UI (frontend stories)
- Mastery calculation algorithm (handled by EPIC-6)
- Historical progress trends

---

### Story 3.3 — Learning Session API

#### Goal
Create API endpoints for managing learning sessions (start, end, query).

#### Background
The `Session` Prisma model exists with `id`, `studentId`, `startTime`, `endTime`, and `duration`. There is no API to create or query sessions. Session tracking is needed for analytics, attention span analysis, and resume-learning functionality.

#### User Story
*As a student,* I want my learning sessions tracked so that I can resume where I left off and see how long I've been learning.

#### Functional Requirements
- `POST /api/sessions` — Start a new session
  - Request: `{ studentId }` — Response: `{ sessionId, startTime }`
- `PATCH /api/sessions/:id/end` — End a session
  - Response: `{ sessionId, startTime, endTime, duration }`
  - Auto-calculates duration from startTime to current time
- `GET /api/students/:id/sessions` — List recent sessions (last 30 days)
- `GET /api/students/:id/sessions/latest` — Get the most recent incomplete session (for resume)
- All endpoints JWT-protected

#### Technical Requirements
- Create `SessionController` and `SessionService` in `packages/api/src/sessions/`
- End session: PATCH not DELETE (sessions are preserved, not deleted)
- Duration calculated server-side in seconds
- Only one active session per student at a time (end previous if starting new)
- Integrate with learn flow: session starts when entering learn/[conceptId], ends when completing or leaving

#### Deliverables
- `packages/api/src/sessions/sessions.module.ts`
- `packages/api/src/sessions/sessions.controller.ts`
- `packages/api/src/sessions/sessions.service.ts`
- `packages/api/src/sessions/dto/start-session.dto.ts`
- Unit tests

#### Acceptance Criteria
- [ ] POST creates a new session and returns sessionId
- [ ] PATCH ends the session and returns correct duration
- [ ] GET sessions/latest returns the most recent session
- [ ] Starting a new session while another is active ends the previous one
- [ ] Sessions are scoped to the authenticated student

#### Files Expected To Change
- `packages/api/src/app.module.ts` (register SessionsModule)
- `packages/api/src/sessions/` (new module directory)

#### Testing Requirements
- Unit and integration tests for session lifecycle
- Test auto-end of previous session

#### Definition Of Done
- [ ] All session endpoints implemented and tested
- [ ] API documentation in `knowledge/api/sessions.md`

#### Out Of Scope
- Session analytics dashboard (frontend)
- Resume learning integration (EPIC-4)
- Daily/weekly session summaries (EPIC-10)

---

### Story 3.4 — Student App API Integration

#### Goal
Replace mock data in the student app with real API calls, enabling live curriculum data, progress display, attempt recording, and session tracking.

#### Background
The student app (`apps/student/lib/api.ts`) currently uses mock data with simulated delays. The learn flow has no-op callbacks for activity evaluation. The real NestJS API at `localhost:3000/api` has the curriculum endpoints but no UI integration yet.

#### User Story
*As a student using the learn flow,* I want to see live curriculum data, have my attempts recorded, see my progress, and have sessions tracked, so that nothing is lost when I close the browser.

#### Functional Requirements
- `apps/student/lib/api.ts` — Replace mock data functions with `fetch()` calls to `NEXT_PUBLIC_API_URL`
  - `fetchSubjects()` → `GET /api/levels/A/subjects`
  - `fetchChapters(subjectId)` → `GET /api/subjects/:id/chapters`
  - `fetchConcepts(subjectId, chapterId)` → `GET /api/chapters/:id/concepts`
  - `fetchConcept(subjectId, chapterId, conceptId)` → `GET /api/concepts/:id/activities`
- `apps/student/lib/api.ts` — Add new API functions:
  - `recordAttempt(activityId, response, hintsUsed, timeSpent)` → `POST /api/activities/:id/attempt`
  - `fetchProgress(studentId)` → `GET /api/students/:id/progress`
  - `startSession(studentId)` → `POST /api/sessions`
  - `endSession(sessionId)` → `PATCH /api/sessions/:id/end`
- `apps/student/pages/learn/[conceptId].tsx` — Replace no-op handlers:
  - VisualCounter onComplete → recordAttempt
  - Matching onMatch → recordAttempt with partial correctness
  - Sequencing onComplete → recordAttempt with order accuracy
  - MultipleChoice onSelect → recordAttempt with answer correctness
  - Handle session lifecycle (start on mount, end on unmount or completion)
- Auth token from `localStorage` sent in `Authorization: Bearer` header
- Fall back gracefully to mock data if API is unreachable (for development)

#### Technical Requirements
- Student ID: use the authenticated student's ID from JWT payload (available via auth context)
- Handle loading and error states for all API calls
- Add `useSessionTracking()` hook or integrate directly in learn flow
- Activity response format: `{ selectedIndex, pairsMatched, order, count }` depending on activity type
- API error responses render as user-friendly messages (not raw error JSON)
- Backward compatibility: mock data mode via `NEXT_PUBLIC_USE_MOCK=true` env var

#### Deliverables
- Updated `apps/student/lib/api.ts` with real API calls and error handling
- Updated `apps/student/pages/learn/[conceptId].tsx` with attempt recording and session tracking
- `apps/student/lib/session.ts` — session hook
- Environment variable documentation in `.env.example`
- Unit tests for API layer (mocked)

#### Acceptance Criteria
- [ ] Student app loads subjects from real API when server is running
- [ ] Activity completion records an attempt via POST
- [ ] Correct/incorrect feedback displays on activity interaction
- [ ] Session starts when entering learn flow
- [ ] Session ends when completing lesson or navigating away
- [ ] Mock mode fallback works with `NEXT_PUBLIC_USE_MOCK=true`
- [ ] Error states show user-friendly messages

#### Files Expected To Change
- `apps/student/lib/api.ts` (major rewrite)
- `apps/student/lib/session.ts` (new file)
- `apps/student/pages/learn/[conceptId].tsx` (handler integration)
- `apps/student/pages/subjects.tsx` (use real API)
- `apps/student/pages/subjects/[id]/chapters.tsx` (use real API)
- `apps/student/pages/chapters/[id]/concepts.tsx` (use real API)
- `.env.example` (document NEXT_PUBLIC_API_URL, NEXT_PUBLIC_USE_MOCK)

#### Testing Requirements
- Unit tests for API functions with mocked fetch
- Component render tests with mock data fallback
- Integration test with actual API (optional, environment-dependent)

#### Definition Of Done
- [ ] All data flows through real API
- [ ] Attempts and sessions recorded
- [ ] Graceful fallback and error handling
- [ ] Tests pass

#### Out Of Scope
- Parent dashboard API migration (EPIC-10)
- Offline support
- Real-time updates (WebSockets)

---

## EPIC-4: TEACCH Learning Framework

### Objective
Implement the TEACCH structured teaching framework across the learning experience, ensuring every screen answers the four work system questions: What am I doing? How much work? How do I know I'm done? What happens next?

### Background
The learn flow implements the 5-step structure (Observe → Guided Practice → Independent Practice → Mastery Check → Completion) with basic transition screens. However, it does not fully satisfy TEACCH's structured work system requirements. There is no visual schedule component, no calm zone, no resume learning capability, and transition screens are minimal.

### User Value
Learners experience predictable, structured learning that reduces anxiety and builds independence. Every screen provides clear answers to the four work system questions.

### Scope
- Structured Work System component (answers all 4 TEACCH questions)
- Visual Schedule component (Learn → Practice → Quiz → Complete)
- Enhanced Transition Screen Framework
- Calm Zone (self-regulation break space)
- Resume Learning Engine
- Executive Function Support Layer

### Dependencies
EPIC-3 (API integration for session/progress data needed by resume engine)

### Success Criteria
- Every learn screen displays: current task, progress, completion status, next step
- Visual schedule is visible on every lesson screen
- Transition screens show completed activity, next activity, and start button
- Calm Zone accessible from any learn screen
- Leaving and returning to a lesson resumes at the exact activity

### Out Of Scope
- ABA prompt hierarchy (EPIC-6)
- Profile-driven personalization (EPIC-7)
- Audio feedback implementation

---

### Story 4.1 — Visual Schedule Component

#### Goal
Create a reusable Visual Schedule component that displays the standard lesson sequence (Observe → Guided Practice → Independent Practice → Mastery Check → Completion) with current stage, completed stages, and next stage highlighted.

#### Background
The learn flow uses `ProgressBar` from `@learn-easy/ui` which shows step names and current step. This is a minimal implementation. The TEACCH Visual Schedule must clearly answer: "What am I doing?", "How much work?", and "What's next?" with visual indicators that are immediately understandable.

#### User Story
*As a learner,* I want to see my lesson steps laid out clearly so that I know what stage I'm on, what I've finished, and what comes next.

#### Functional Requirements
- Display lesson steps horizontally: Observe → Guided Practice → Independent Practice → Mastery Check → Completion
- Current step: highlighted/filled
- Completed steps: checkmark or filled with completed color (Muted Green)
- Future steps: dimmed/outlined
- Next step: subtle pulse or arrow indicator
- Step labels: use literal language ("Observe", "Guided Practice", "Independent Practice", "Mastery Check", "Completion")
- Touch target for each step ≥56x56px if clickable (Step indicator only — not navigation)
- Progress text: "Step 2 of 5" or equivalent
- Accessible: aria-live region announces current step on change
- Responsive: horizontal on desktop, scrollable on mobile

#### Technical Requirements
- Build as a new component in `packages/ui/src/VisualSchedule.tsx`
- Accept props: `steps: string[]`, `currentStep: number`, `completedSteps: number[]`, `className?: string`
- Export from `packages/ui/src/index.ts`
- Use Tailwind classes consistent with ALX color palette (Soft Blue for current, Muted Green for completed, Slate Text for labels)
- Animate step transitions with fade only (150-300ms, ALX-6 compliant)
- No audio autoplay, no flashing, no bounce animations

#### Deliverables
- `packages/ui/src/VisualSchedule.tsx`
- Updated `packages/ui/src/index.ts` barrel export
- Storybook example or inline documentation
- Unit tests for component rendering and accessibility

#### Acceptance Criteria
- [ ] Component renders all steps with current/completed/future visual states
- [ ] Current step is visually distinct from completed and future steps
- [ ] Completed steps show checkmark or equivalent indicator
- [ ] Progress text displays "Step X of Y"
- [ ] Screen reader announces current step on mount and step change
- [ ] Component accepts custom step arrays and styling via className
- [ ] No motion violations (fade only, 150-300ms)
- [ ] All Tailwind classes use ALX-approved colors

#### Files Expected To Change
- `packages/ui/src/VisualSchedule.tsx` (new file)
- `packages/ui/src/index.ts` (add export)

#### Testing Requirements
- Render test for all step states (all completed, middle step, first step)
- Accessibility test (aria-live region, role)
- Styling test: verify current/completed styles applied

#### Definition Of Done
- [ ] Component built and exported
- [ ] Tests pass
- [ ] Visual matches ALX design guidelines

#### Out Of Scope
- Integration into learn flow (Story 4.4)
- Clickable step navigation (future — only indicator for now)
- Custom step icons per stage

---

### Story 4.2 — Structured Work System Screen

#### Goal
Create a wrapper component that ensures every learning screen visibly answers the four TEACCH work system questions: "What am I doing?", "How much work?", "How do I know I'm finished?", and "What happens next?"

#### Background
TEACCH structured teaching requires that every work area answers these four questions. The current learn flow shows the concept title and ProgressBar but doesn't explicitly and consistently communicate all four answers on every screen.

#### User Story
*As a learner,* I want to always know what task I'm doing, how much is left, when I'll be done, and what comes next — without having to guess or remember.

#### Functional Requirements
- Screen header area always shows:
  - "What am I doing?" → Current step name and concept title
  - "How much work?" → Step X of Y indicator
  - "How do I know I'm done?" → Progress bar or completion condition text
  - "What happens next?" → Next step name shown below current content area
- Visual Schedule (Story 4.1) integrated in the header
- Consistent layout on every lesson screen
- Presentation follows ALX layout: Header → Progress → Learning Area → Primary Action → Next indicator
- Works for all 5 lesson steps
- Accessible with aria-live regions for work system answers

#### Technical Requirements
- Build as `WorkSystemLayout` wrapper component in `packages/ui/src/`
- Props: `stepName`, `conceptTitle`, `currentStep`, `totalSteps`, `nextStep`, `children`
- Styling consistent with ALX design: left-aligned text, 56px touch targets, literal labels
- Use Slate Text (#374151) for labels, Muted Teal (#76A5AF) for secondary info

#### Deliverables
- `packages/ui/src/WorkSystemLayout.tsx`
- Updated `packages/ui/src/index.ts`
- Component documentation

#### Acceptance Criteria
- [ ] All 4 TEACCH questions answered on screen
- [ ] Layout consistent across all 5 lesson steps
- [ ] Concept title and step name visible at all times
- [ ] Progress indicator shows current/total
- [ ] Next step always visible
- [ ] Accessible labels for screen readers

#### Files Expected To Change
- `packages/ui/src/WorkSystemLayout.tsx` (new file)
- `packages/ui/src/index.ts` (add export)

#### Testing Requirements
- Render test for each step
- Accessibility audit (aria labels, roles)
- Visual regression check

#### Definition Of Done
- [ ] Component built and exported
- [ ] Tests pass
- [ ] TEACCH questions visibly answered

#### Out Of Scope
- Learn flow integration (Story 4.4)
- Custom styling per activity type

---

### Story 4.3 — Enhanced Transition Screen Framework

#### Goal
Build enhanced transition screens between learning stages that show completed activity, next activity, and a clear start button — preparing the learner for what's ahead.

#### Background
The learn flow has basic transition screens with a title and start button. TEACCH requires transition preparation: the learner must know what activity was just completed, what the next activity is, and have control over when to start.

#### User Story
*As a learner,* I want to see a clear transition screen between lesson stages so that I can pause, understand what's next, and choose when to begin.

#### Functional Requirements
- Transition screen displays:
  - "Great work completing [current stage name]" — ALX-5 positive reinforcement
  - "Next: [next stage name]" with description of what that stage involves
  - Visual indicator of progress (e.g., "You've completed 2 of 5 steps")
  - Start button with explicit label: "Start [Next Stage Name]"
- Never auto-advance to the next stage (ALX-11 — no automatic transitions)
- Transition screens follow the same consistent layout
- Support for optional "Take a break" link to Calm Zone (Story 4.5)
- Accessible: focus moves to start button on transition screen mount

#### Technical Requirements
- New component: `TransitionScreen` in `packages/ui/src/`
- Props: `fromStep: string`, `toStep: string`, `currentStep: number`, `totalSteps: number`, `onStart: () => void`, `onBreak?: () => void`
- Visual progress indicator (ProgressBar or steps-done count)
- Animation: fade in only, 200ms duration
- Background: Warm Off-White (#F9F7F2)

#### Deliverables
- `packages/ui/src/TransitionScreen.tsx`
- Updated `packages/ui/src/index.ts`
- Documentation

#### Acceptance Criteria
- [ ] Shows completed stage name with positive reinforcement
- [ ] Shows next stage name and description
- [ ] Shows progress (X of Y steps completed)
- [ ] "Start [Next Stage]" button is primary action
- [ ] Optional break link visible when onBreak prop provided
- [ ] No auto-advance
- [ ] Focus moves to start button on mount
- [ ] Fade animation only, 200ms

#### Files Expected To Change
- `packages/ui/src/TransitionScreen.tsx` (new file)
- `packages/ui/src/index.ts` (add export)

#### Testing Requirements
- Render test for each stage transition
- Keyboard navigation test (Tab to button, Enter to start)
- Accessibility test (focus management)

#### Definition Of Done
- [ ] Component built
- [ ] Tests pass
- [ ] ALX-11 transition rules satisfied

#### Out Of Scope
- Calm Zone navigation (Story 4.5)
- Animation customization per sensory profile (EPIC-7)

---

### Story 4.4 — Learn Flow TEACCH Integration

#### Goal
Integrate the Visual Schedule, Work System Layout, and Transition Screen components into the learn flow, replacing the current basic implementation.

#### Background
The current `learn/[conceptId].tsx` uses a custom inline layout with basic ProgressBar and simple transition screens. This story replaces those with the proper TEACCH components.

#### User Story
*As a learner,* I want the entire lesson experience to be predictable, structured, and clear — with visible progress, consistent layouts, and thoughtful transitions between every stage.

#### Functional Requirements
- Replace ProgressBar with VisualSchedule (Story 4.1)
- Wrap all step content in WorkSystemLayout (Story 4.2)
- Replace inline transition screens with TransitionScreen (Story 4.3)
- Ensure all 5 steps render correctly inside the new layout
- Maintain backward compatibility: all existing activity types still render
- Session tracking integration from Story 3.3
- Attempt recording from Story 3.1

#### Technical Requirements
- Update `apps/student/pages/learn/[conceptId].tsx`
- Import and use: `WorkSystemLayout`, `VisualSchedule`, `TransitionScreen`
- Pass `concept.name` as conceptTitle to WorkSystemLayout
- Each step's `handleNext` triggers TransitionScreen before advancing
- Session starts on mount, ends on PositiveCompletion or unmount
- All existing activity types (VisualCounter, Matching, Sequencing, MultipleChoice) still work

#### Deliverables
- Updated `apps/student/pages/learn/[conceptId].tsx`
- Integration tests

#### Acceptance Criteria
- [ ] VisualSchedule replaces ProgressBar and shows correct step
- [ ] WorkSystemLayout wraps every step with TEACCH answers
- [ ] Transition screens show between each stage
- [ ] Session starts on page mount
- [ ] Session ends on completion or unmount
- [ ] All 5 steps render correctly with existing activity components
- [ ] Activity callbacks record attempts via API

#### Files Expected To Change
- `apps/student/pages/learn/[conceptId].tsx` (major update)

#### Testing Requirements
- Component render tests for each step
- Integration test: full flow (Observe → Guided → Independent → Mastery → Completion)
- Session lifecycle: verify start/end behavior

#### Definition Of Done
- [ ] TEACCH components integrated and working
- [ ] Session tracking active
- [ ] Attempt recording working
- [ ] Tests pass

#### Out Of Scope
- Calm Zone integration (Story 4.5)
- Resume learning (Story 4.6)
- ABA prompt support (EPIC-6)

---

### Story 4.5 — Calm Zone

#### Goal
Build a Calm Zone — a globally accessible break space where learners can self-regulate using a visual timer, deep breathing exercise, and calming imagery.

#### Background
ALX-18 requires that every learner has access to a safe break space. The Calm Zone is not failure — it's a self-regulation tool. Currently there is no such feature.

#### User Story
*As a learner feeling overwhelmed,* I want a quiet calming space with a timer and breathing exercise so that I can take a break and return to learning when I'm ready.

#### Functional Requirements
- Calm Zone accessible from any lesson screen via a "Take a Break" link/button
- Calm Zone contains:
  - **Visual Timer**: count-up timer showing break duration, with pause/reset
  - **Deep Breathing Exercise**: animated circle that expands (breathe in) and contracts (breathe out), 4 seconds each cycle
  - **Calming Visuals**: soothing colors (Soft Blue gradients, nature imagery via SVG patterns)
  - **"Return to Lesson" button**: resumes learning at the same activity
- Timer and breathing exercise are user-initiated (no autoplay — ALX-6)
- Quiet, minimal design — no text-heavy instructions
- Calm Zone does NOT count as leaving the session (session continues)
- Accessible globally via a fixed "🧘 Calm Zone" button in the header

#### Technical Requirements
- New route: `apps/student/pages/calm-zone.tsx`
- Return URL passed via query parameter (`?return=/learn/conceptId`)
- Breathing exercise: CSS animation (scale + opacity cycle, 8s period — 4s in, 4s out)
- Visual Timer: simple count-up display with start/pause/reset buttons
- Color palette: Soft Blue (#5D87B1) gradients on Warm Off-White (#F9F7F2)
- No audio unless user explicitly enables (ALX-6)
- No flashing, no infinite loops except breathing circle (which is slow and predictable)
- Touch targets ≥56x56px

#### Deliverables
- `apps/student/pages/calm-zone.tsx`
- `apps/student/components/CalmBreathing.tsx` — breathing exercise component
- `apps/student/components/CalmTimer.tsx` — visual timer component
- Integration in learn flow header: "Take a Break" link

#### Acceptance Criteria
- [ ] Calm Zone accessible from learn flow via header button
- [ ] Visual timer starts on user click, shows elapsed time
- [ ] Breathing animation cycles 4s in / 4s out
- [ ] "Return to Lesson" navigates back to the exact concept
- [ ] Session is NOT ended when entering Calm Zone
- [ ] No autoplay audio or video
- [ ] No flashing animations
- [ ] Touch targets ≥56x56px

#### Files Expected To Change
- `apps/student/pages/calm-zone.tsx` (new)
- `apps/student/components/CalmBreathing.tsx` (new)
- `apps/student/components/CalmTimer.tsx` (new)
- `apps/student/pages/learn/[conceptId].tsx` (add calm zone button)

#### Testing Requirements
- Render tests for calm zone components
- Navigation test: go to calm zone, return to lesson
- Timer functionality: start, pause, reset
- Session continuity: verify session not ended

#### Definition Of Done
- [ ] Calm Zone functional and accessible
- [ ] Visual timer works
- [ ] Breathing exercise renders correctly
- [ ] Return to lesson preserves progress

#### Out Of Scope
- Favorite images upload (future)
- Calming audio tracks (future)
- Calm Zone analytics

---

### Story 4.6 — Resume Learning Engine

#### Goal
Implement resume-learning functionality so that when a learner returns to the platform, they can continue from exactly where they left off.

#### Background
ALX-10 requires that if a learner leaves, they return to the exact activity with preserved progress. The current implementation always starts at the beginning of a concept when revisiting.

#### User Story
*As a learner,* I want to return to exactly where I was in my lesson when I open the app again, so that I don't have to redo work I've already completed.

#### Functional Requirements
- On student app home page, show "Resume" option if there's an active or last incomplete session
- Resume navigates to: `learn/[conceptId]` at the exact step the learner was on
- Determine current step from: most recent incomplete ActivityAttempt for the concept
- If no incomplete session exists, show normal subject/concept navigation
- Session data from Story 3.3 used to determine "last active" concept
- Progress data from Story 3.2 used to determine completed vs incomplete
- If concept is fully completed, show "Start New Lesson" instead

#### Technical Requirements
- New API endpoint: `GET /api/students/:id/resume-state`
  - Returns `{ hasResumableSession, conceptId, chapterId, subjectId, step, activityId }`
  - Or null if nothing to resume
- Integrate into `apps/student/pages/index.tsx` (student landing page)
- Show resume card with concept name, step progress, and "Resume Lesson" button
- Resume button navigates to `learn/[conceptId]` — the learn flow reads the resume step from URL param or API

#### Deliverables
- `packages/api/src/resume/resume.module.ts`, controller, service (new module)
- Updated `apps/student/pages/index.tsx` with resume UI
- Session and progress queries for resume state

#### Acceptance Criteria
- [ ] Resume state API returns correct concept and step for incomplete session
- [ ] Student landing page shows "Resume Lesson" when session exists
- [ ] Clicking resume navigates to learn flow at correct step
- [ ] Completed concepts show "Start New Lesson" instead
- [ ] No resume state for new students with no sessions

#### Files Expected To Change
- `packages/api/src/resume/` (new module)
- `packages/api/src/app.module.ts` (register module)
- `apps/student/pages/index.tsx` (add resume UI)

#### Testing Requirements
- API integration test for resume-state endpoint
- UI render test for resume vs no-resume states
- Navigation test: resume → correct learn step

#### Definition Of Done
- [ ] Resume engine implemented
- [ ] Home page shows resume option
- [ ] Clicking resume continues from correct step

#### Out Of Scope
- Cross-device resume sync
- Resume after long absence (>7 days)
- "Recommended for you" section

---

# Phase 3 — Activity System

## EPIC-5: Activity Engine

### Objective
Build the runtime activity engine that renders, evaluates, and tracks all activity types, and add the missing activity components (DragDrop integration, Story-Based Questions, Real-World Tasks).

### Background
The UI package has 7 components (VisualCounter, Matching, DragDrop, Sequencing, MultipleChoice, PositiveCompletion, ProgressBar). The learn flow uses 4 of these (VisualCounter, Matching, Sequencing, MultipleChoice). DragDrop is not yet wired. Story-Based Questions and Real-World Tasks have no components at all. There is no centralized activity runtime for consistent evaluation, hint rendering, and accessibility support.

### User Value
Learners can complete all 7 activity types. Activities are evaluated consistently. Hints and accessibility support are baked into every activity.

### Scope
- Activity runtime engine (consistent evaluation, hint pipeline, scoring)
- DragDrop integration in learn flow
- Story-Based Question component
- Real-World Task component
- Accessibility support framework (keyboard nav, screen reader, touch targets)
- Activity attempt tracking integration with API (Story 3.1)

### Dependencies
EPIC-3 (Activity Attempt API — Story 3.1)
EPIC-4 (TEACCH layout — Story 4.4)

### Success Criteria
- All 7 activity types render correctly in the learn flow
- Activities evaluate responses and record attempts via API
- Drag and drop works with proper keyboard and touch support
- Story-Based Questions and Real-World Tasks have dedicated components
- Accessibility framework covers: keyboard navigation, screen reader announcements, touch targets ≥56x56px

### Out Of Scope
- ABA prompt hierarchy (EPIC-6)
- AI-generated activity content (EPIC-9)
- Activity authoring UI (EPIC-12)

---

### Story 5.1 — Activity Runtime Engine

#### Goal
Create a centralized activity runtime that handles rendering dispatch, response evaluation, hint retrieval, and scoring for all activity types.

#### Background
Currently, each activity type is rendered independently in the learn flow with inline JSX conditionals. Evaluation is a no-op. There is no unified system for determining correctness, providing hints, or calculating scores. This engine standardizes activity processing.

#### User Story
*As a developer,* I want a single `ActivityRenderer` component that takes an activity config and handles rendering, evaluation, and hints consistently across all activity types.

#### Functional Requirements
- `ActivityRenderer` component accepts: `{ activity, step, onComplete, onHint }`
- Dispatches to the correct UI component based on `activity.type`
- Handles evaluation: student response → correctness determination
- Handles hints: returns appropriate hint level text from activity content
- Supports all 7 types: visual_counting, matching, drag_drop, sequencing, multiple_choice, story_question, real_world
- Consistent response format across types: `{ type, response, correct, hintsUsed, timeSpent }`
- Error handling: unknown activity type shows graceful fallback message
- Loading state while activity content loads

#### Technical Requirements
- Build in `packages/ui/src/ActivityRenderer.tsx`
- Evaluation logic per type:
  - `visual_counting`: compare count value
  - `matching`: calculate pairs-matching accuracy
  - `drag_drop`: check dropped target positions
  - `sequencing`: compare order against correctOrder
  - `multiple_choice`: compare selectedIndex to correctIndex
  - `story_question`: compare selected answer to correct answer
  - `real_world`: open-ended — marked as completed on submission (hand-corrected later)
- Hint system: `activity.content.hints` array returned incrementally on each hint request
- Timer: auto-track time spent within the runtime
- Activity attempts fire `onComplete(response)` callback for API recording

#### Deliverables
- `packages/ui/src/ActivityRenderer.tsx`
- `packages/ui/src/activity-utils.ts` — shared evaluation, hint, scoring utilities
- Updated `packages/ui/src/index.ts`
- Unit tests for evaluation logic per type

#### Acceptance Criteria
- [ ] ActivityRenderer renders correct component for each type
- [ ] `visual_counting` evaluation: correct count matches expected
- [ ] `matching` evaluation: partial matching accuracy calculated
- [ ] `multiple_choice` evaluation: correct index matched
- [ ] `sequencing` evaluation: order compared accurately
- [ ] Unknown type shows "Activity not available" fallback
- [ ] Hint system returns progressive hints from activity content
- [ ] Time tracking starts on mount, stops on complete
- [ ] Response callback fired with correct format

#### Files Expected To Change
- `packages/ui/src/ActivityRenderer.tsx` (new)
- `packages/ui/src/activity-utils.ts` (new)
- `packages/ui/src/index.ts` (add exports)

#### Testing Requirements
- Unit tests for each activity type's evaluation logic
- Component render test for each type
- Edge cases: empty response, partial matching, no hints available

#### Definition Of Done
- [ ] Runtime engine built and tested
- [ ] All 7 types handled
- [ ] Evaluation and hint system working

#### Out Of Scope
- ABA prompt level integration (EPIC-6)
- AI-generated hints (EPIC-8)
- Adaptive scoring (EPIC-6)

---

### Story 5.2 — Story-Based Question Component

#### Goal
Create a Story-Based Question activity component that presents a short scenario with comprehension questions.

#### Background
Story-Based Questions are defined in the Prisma schema as an activity type but have no UI component. They present a short story or scenario followed by comprehension questions, helping learners practice reading comprehension and applying concepts in context.

#### User Story
*As a learner,* I want to read a short story and answer questions about it so that I can practice understanding what I read.

#### Functional Requirements
- Short story/scenario displayed at top (3-4 sentences max, ALX-2 visual-first with supporting image)
- 1-3 comprehension questions displayed below the story
- Each question: multiple choice with 3-4 options
- Visual support: emoji or simple illustration alongside the story
- Literal language: questions directly reference the story content
- One question at a time (ALX-3)
- Progress indicator: "Question 1 of 3"
- Submit Answer button per question
- Safe Mistakes: "Let's try again" on incorrect, advance on correct

#### Technical Requirements
- New component: `StoryQuestion` in `packages/ui/src/`
- Props: `scenario: string, questions: Array<{ question, options, correctIndex }>, visual?: string, onComplete: (response) => void`
- Activity content format in curriculum YAML:
  ```yaml
  scenario: "Riya has 3 apples. She gets 2 more apples."
  visual: "🍎"
  questions:
    - question: "How many apples does Riya have now?"
      options: ["3", "4", "5", "6"]
      correctIndex: 2
    - question: "How many apples did Riya start with?"
      options: ["2", "3", "4", "5"]
      correctIndex: 1
  ```
- Styling: large text (20px+ for questions), visible progress, left-aligned
- Follow ALX-2: visual carries primary meaning, text supports

#### Deliverables
- `packages/ui/src/StoryQuestion.tsx`
- Updated `packages/ui/src/index.ts`
- Unit tests

#### Acceptance Criteria
- [ ] Scenario text displays at top
- [ ] Questions display one at a time with progress indicator
- [ ] Emoji/visual support shown alongside story
- [ ] Correct answer advances to next question
- [ ] Incorrect answer shows "Let's try again" and does NOT advance
- [ ] After all questions answered, onComplete fires with response data
- [ ] All text is literal and direct
- [ ] Touch targets ≥56x56px

#### Files Expected To Change
- `packages/ui/src/StoryQuestion.tsx` (new)
- `packages/ui/src/index.ts` (add export)

#### Testing Requirements
- Render test: scenario, questions, progress
- Interaction test: correct answer advances, incorrect waits
- Completion test: all questions answered fires callback

#### Definition Of Done
- [ ] Component built and exported
- [ ] Tests pass
- [ ] ALX language and accessibility guidelines followed

#### Out Of Scope
- Audio narration of stories
- Open-ended answer questions
- Story generation (EPIC-9)

---

### Story 5.3 — Real-World Task Component

#### Goal
Create a Real-World Task activity component that presents practical tasks connecting concepts to everyday life.

#### Background
Real-World Tasks are defined in the Prisma schema but have no component. These are open-ended tasks where learners apply concepts to real-world scenarios, bridging classroom learning to daily life.

#### User Story
*As a learner,* I want to do practical tasks that show how math concepts work in real life so that I understand why I'm learning these skills.

#### Functional Requirements
- Display a real-world scenario with visual support
- Ask an open-ended or semi-structured task question
- Support task types:
  - Counting real objects: "Count the windows in your room"
  - Shape identification: "Find 3 circle-shaped objects at home"
  - Practical math: "Count the spoons on the table"
- Provide visual example of what the task looks like
- "I did it!" button to mark task as completed
- Optional hint: "Need help? Try counting one by one"
- No right/wrong evaluation (real-world tasks are open-ended)
- Completion marked as attempted, not graded

#### Technical Requirements
- New component: `RealWorldTask` in `packages/ui/src/`
- Props: `scenario: string, taskDescription: string, visualExample?: string, hint?: string, onComplete: (response) => void`
- Activity content format:
  ```yaml
  scenario: "Look around your room."
  taskDescription: "Count all the windows you can see."
  visualExample: "🪟"
  hint: "Point to each window as you count."
  ```
- Styling: large text, visual-first, literal instructions
- "I did it!" button as primary action, 56px+ touch target
- Encouraging completion screen after submission

#### Deliverables
- `packages/ui/src/RealWorldTask.tsx`
- Updated `packages/ui/src/index.ts`
- Unit tests

#### Acceptance Criteria
- [ ] Scenario and task description display clearly
- [ ] Visual example shown alongside description
- [ ] "I did it!" button is primary action
- [ ] Optional hint is available
- [ ] Completion fires onComplete with task marked as attempted
- [ ] No evaluation of correctness (open-ended)
- [ ] Literal language throughout

#### Files Expected To Change
- `packages/ui/src/RealWorldTask.tsx` (new)
- `packages/ui/src/index.ts` (add export)

#### Testing Requirements
- Render test with and without hint
- Interaction test: "I did it!" button fires callback
- Accessibility test: ARIA labels on all interactive elements

#### Definition Of Done
- [ ] Component built
- [ ] Tests pass
- [ ] ALX guidelines followed

#### Out Of Scope
- Photo/audio upload of task completion
- Parent verification of task completion
- AI evaluation of task responses

---

### Story 5.4 — Learn Flow Activity Integration

#### Goal
Integrate the ActivityRenderer and all missing activity types (DragDrop, StoryQuestion, RealWorldTask) into the learn flow.

#### Background
The learn flow currently renders activities inline with manual JSX. This story replaces inline rendering with ActivityRenderer and wires DragDrop, StoryQuestion, and RealWorldTask into the learn flow.

#### User Story
*As a learner,* I want to see all activity types in my lessons — including drag-and-drop, stories, and real-world tasks — so that I can learn in different ways.

#### Functional Requirements
- Replace inline activity rendering with `ActivityRenderer` component
- Wire DragDrop into the Independent Practice step (fallback if no Sequencing)
- Wire StoryQuestion into Observe or Guided Practice step
- Wire RealWorldTask into the final practice step
- All activity types fire `recordAttempt` callback on completion
- Activity evaluation results stored appropriately in attempt data
- Graceful handling if concept has no activities of a required type

#### Technical Requirements
- Update `apps/student/pages/learn/[conceptId].tsx`
- Activity step mapping:
  - `step: "observe"` → VisualCounter or StoryQuestion
  - `step: "guided_practice"` → Matching or StoryQuestion
  - `step: "independent_practice"` → Sequencing, DragDrop, or Matching (fallback chain)
  - `step: "mastery_check"` → MultipleChoice (quiz mode)
  - `step: "positive_completion"` → PositiveCompletion
- Each activity renders through ActivityRenderer for consistent evaluation
- Add `seed.ts` activities for DragDrop, StoryQuestion, RealWorldTask types to existing concepts

#### Deliverables
- Updated `apps/student/pages/learn/[conceptId].tsx`
- Updated seed data in `packages/db/prisma/seed.ts` (new activity types)

#### Acceptance Criteria
- [ ] ActivityRenderer replaces all inline activity rendering
- [ ] DragDrop component renders and evaluates correctly
- [ ] StoryQuestion renders and evaluates correctly
- [ ] RealWorldTask renders (open-ended)
- [ ] All activity types record attempts via API
- [ ] Concepts without certain activity types fall back gracefully
- [ ] PositiveCompletion shows after all steps completed

#### Files Expected To Change
- `apps/student/pages/learn/[conceptId].tsx` (major refactor)
- `packages/db/prisma/seed.ts` (add new activity type data)
- `curriculum/` YAML files (if seed reads from pipeline)

#### Testing Requirements
- Integration test: full learn flow with all activity types
- Activity dispatch test: correct component for each type
- Error handling: concept with no activities

#### Definition Of Done
- [ ] All activity types integrated and working
- [ ] Attempt recording working for all types
- [ ] Seed data includes new activity types

#### Out Of Scope
- DragDrop accessibility for motor disabilities (Story 5.5)
- Activity variation/randomization (EPIC-9)

---

### Story 5.5 — Accessibility Support Framework

#### Goal
Implement an accessibility framework across all activity components ensuring keyboard navigation, screen reader support, and touch target compliance.

#### Background
ALX guidelines require 56x56px touch targets, screen reader support, keyboard navigation, and WCAG AA compliance. The current components have basic accessibility but no consistent framework. DragDrop is particularly inaccessible without keyboard equivalents.

#### User Story
*As a learner who uses keyboard navigation or a screen reader,* I want to complete all activities without barriers so that I can learn independently.

#### Functional Requirements
- Keyboard navigation for all activity types:
  - Tab through interactive elements
  - Enter/Space to select
  - Arrow keys for sequencing order
  - DragDrop: Tab to select item, arrow keys to position, Enter to drop
- Screen reader announcements:
  - Activity instructions read on render
  - Current question/step announced
  - Selection state changes announced
  - Correct/incorrect feedback announced
  - `aria-live="polite"` regions for dynamic content
- Touch targets: all interactive elements ≥56x56px (preferred) or ≥48x48px (minimum)
- Focus management: focus moves to primary action on step transitions
- High contrast mode support (CSS `prefers-contrast: high`)
- Reduced motion support (CSS `prefers-reduced-motion: reduce`)
- Skip-to-content link at top of lesson page

#### Technical Requirements
- Create `packages/ui/src/AccessibilityWrapper.tsx` — HOC/component that adds:
  - Keyboard event handlers for custom interactions
  - ARIA attributes (role, aria-label, aria-describedby, aria-live)
  - Focus trap for modal-like interactions
  - Announcement region for dynamic content
- Create `packages/ui/src/useAccessibility.ts` — React hook with:
  - `announce(message)` for screen reader announcements
  - `useFocusTrap()` for focus management
  - `useKeyboardNavigation()` for keyboard event helpers
- Update each activity component to use accessibility utilities
- DragDrop: add keyboard drag-reorder pattern (Select → Move → Drop)
- Test with screen reader (VoiceOver/NVDA simulation)

#### Deliverables
- `packages/ui/src/AccessibilityWrapper.tsx`
- `packages/ui/src/useAccessibility.ts`
- `packages/ui/src/accessibility-utils.ts` — shared helpers
- Updated activity components with accessibility support
- Unit tests for keyboard interactions
- Integration test for screen reader announcements

#### Acceptance Criteria
- [ ] All interactive elements reachable via keyboard Tab
- [ ] All interactive elements have visible focus indicators
- [ ] DragDrop works with keyboard: Tab to item, Arrow keys, Enter to drop
- [ ] Screen reader announces: activity title, current question, selection, feedback
- [ ] Touch targets minimum 48x48px, preferred 56x56px
- [ ] Focus moves to primary action after step transition
- [ ] High contrast mode: all interactions work with system contrast setting
- [ ] Reduced motion: all animations disabled with system motion setting
- [ ] Skip-to-content link present at top of lesson page

#### Files Expected To Change
- `packages/ui/src/AccessibilityWrapper.tsx` (new)
- `packages/ui/src/useAccessibility.ts` (new)
- `packages/ui/src/accessibility-utils.ts` (new)
- `packages/ui/src/DragDrop.tsx` (keyboard support)
- `packages/ui/src/Sequencing.tsx` (keyboard support)
- `packages/ui/src/MultipleChoice.tsx` (ARIA updates)
- `packages/ui/src/index.ts` (export new utilities)
- `apps/student/pages/learn/[conceptId].tsx` (skip link)

#### Testing Requirements
- Keyboard interaction tests for each activity type
- ARIA attribute verification tests
- Focus management tests

#### Definition Of Done
- [ ] All activities keyboard-accessible
- [ ] Screen reader announcements working
- [ ] Touch targets compliant
- [ ] WCAG AA successfully validated with automated tools

#### Out Of Scope
- Voice control support
- Switch device support
- Custom color theme editor (EPIC-7)

---

# Phase 4 — Adaptive Learning

## EPIC-6: ABA Learning Engine

### Objective
Implement a modern ABA-informed learning engine that provides prompt hierarchy, prompt fading, mastery calculation, independence tracking, adaptive difficulty, and learning recommendations.

### Background
ABA principles guide skill acquisition through structured prompting, prompt fading, and mastery-based progression. The current platform has no prompt system, no independence tracking, and no adaptive difficulty. This Epic builds the core ABA engine.

### User Value
Learners receive the right level of support at the right time. Support fades as mastery improves. Difficulty adapts to the learner's demonstrated skill level.

### Scope
- Prompt Hierarchy Framework (5 levels: Demonstration → Visual Hint → Partial Hint → Verbal Cue → Independent)
- Prompt Fading Engine (gradual support reduction based on performance)
- Mastery Calculation Engine (accuracy × consistency × independence)
- Independence Tracking Engine (prompt usage metrics)
- Adaptive Difficulty Engine (concept difficulty adjustment)
- Learning Recommendation Engine (next concept suggestion)

### Dependencies
EPIC-3 (Activity Attempt API for attempt data)
EPIC-5 (Activity Runtime for prompt display)

### Success Criteria
- Prompts available for all activity types at 5 levels
- Prompt level fades automatically based on recent performance
- Mastery score calculated from accuracy, consistency, and independence
- Independence score trends available in dashboard
- Difficulty adjusts per-concept based on learner performance
- Recommended next concept generated based on mastery data

### Out Of Scope
- AI-generated prompt content (EPIC-8)
- Profile-based personalization (EPIC-7)
- Parent-facing prompt reports (EPIC-10)

---

### Story 6.1 — Prompt Hierarchy Framework

#### Goal
Create a prompt hierarchy system with 5 standardized levels that can be applied across all activity types.

#### Background
ALX-12 defines 5 prompt levels: Full Demonstration (1), Visual Hint (2), Partial Hint (3), Verbal Cue (4), Independent (5). Currently, activities have no structured prompt system. Hints are ad-hoc per activity content. This story creates the framework.

#### User Story
*As a learner who needs support,* I want hints that start very helpful and become less helpful over time so that I can learn to do tasks on my own.

#### Functional Requirements
- 5 prompt levels implemented for each activity type:
  - **Level 1 — Demonstration**: Show the correct answer (highlight, animation, or reveal)
  - **Level 2 — Visual Hint**: Show a visual clue (arrow, color highlight, partial image)
  - **Level 3 — Partial Hint**: Text hint narrowing down options
  - **Level 4 — Verbal Cue**: Short verbal-style encouragement/cue ("Try counting from the left")
  - **Level 5 — Independent**: No hint, full independence
- Prompt level stored per student-concept combination in Progress model
- Prompt available via "Need help?" button on each activity
- Prompt level displayed discreetly (not as a "score" or "level" label)
- Activity content supports all 5 prompt levels via `activity.content.hints` array

#### Technical Requirements
- Extend Progress model or create PromptState model: `{ studentId, conceptId, promptLevel (1-5) }`
- New API: `GET /api/activities/:id/prompts?level=N` — returns prompt content for a level
- Default prompt level: 1 (highest support) for new concepts
- Prompt level advances (fades) based on Story 6.2
- Prompt content pre-defined in activity YAML: `hints: [demo, visual, partial, verbal]`
- If no prompt content for a level, show the next available level

#### Deliverables
- `packages/api/src/prompts/prompts.module.ts`, controller, service
- `packages/db/prisma/schema.prisma` — add PromptState model or extend Progress
- Updated curriculum YAML with prompt content for existing activities
- Prompt display integration in ActivityRenderer (Story 5.1)

#### Acceptance Criteria
- [ ] 5 prompt levels defined and stored
- [ ] GET prompts endpoint returns correct level content
- [ ] Default prompt level is 1 for new concepts
- [ ] Visual hint level shows visual highlighting or partial reveal
- [ ] "Need help?" button accessible on each activity
- [ ] Prompt level NOT shown to learner as a label
- [ ] Missing prompt levels fall back gracefully

#### Files Expected To Change
- `packages/api/src/prompts/` (new module)
- `packages/db/prisma/schema.prisma` (extend Progress or add PromptState)
- `packages/api/src/app.module.ts` (register module)
- `packages/ui/src/ActivityRenderer.tsx` (add prompt button)
- `packages/ui/src/activity-utils.ts` (prompt helpers)
- `curriculum/` YAML files (add hints arrays)

#### Testing Requirements
- API test: prompt content returned at each level
- Component test: prompt button renders and cycles through levels
- Fallback test: missing levels gracefully degraded

#### Definition Of Done
- [ ] Prompt hierarchy system built
- [ ] API endpoint returning prompt content
- [ ] ActivityRenderer shows prompts
- [ ] Tests pass

#### Out Of Scope
- AI-generated prompt content (EPIC-8)
- Prompt timing/schedule automation
- Audio prompts

---

### Story 6.2 — Prompt Fading Engine

#### Goal
Build an engine that automatically adjusts prompt levels based on learner performance — increasing support after errors, decreasing after successes.

#### Background
ALX-13 (Errorless Learning) and ALX-14 (Shaping) require that support fades gradually. The prompt fading engine implements this: if a learner answers correctly with independence 2 times in a row, fade to the next level. If they make errors at the new level, increase support temporarily.

#### User Story
*As a learner,* I want the hints to gradually go away as I get better so that I can become more independent.

#### Functional Requirements
- After each activity attempt (Story 3.1), update prompt level:
  - Correct + current prompt level: 2 consecutive → fade to next level (support decreases)
  - Incorrect + current prompt level: 1 → revert to previous level (support increases)
  - 3 consecutive correct at Level 5 → concept marked as "independently mastered"
- Prompt level per concept (not per activity) — stored in Progress model
- Fading only occurs at natural break points (between steps, not mid-activity)
- Never fade during Mastery Check (always Level 5 — independent)
- Prompt level reset to 1 if concept not attempted for 7+ days
- Prompt level never goes below 1 or above 5

#### Technical Requirements
- `PromptFadingService` in `packages/api/src/prompts/`
- `evaluatePromptFade(attempt: ActivityAttempt, currentLevel: number, consecutiveCorrect: number): number`
- Called automatically after activity attempt recording
- Accept `autoFade` parameter (default: true) — allows disabling for demo/override
- Integrate with ActivityAttemptService (Story 3.1)

#### Deliverables
- `packages/api/src/prompts/prompt-fading.service.ts`
- Integration with ActivityAttempt recording
- Unit tests for fading logic

#### Acceptance Criteria
- [ ] 2 consecutive correct → fade to next level
- [ ] 1 incorrect → revert to previous level
- [ ] 3 consecutive correct at Level 5 → "independently mastered"
- [ ] Mastery Check always uses Level 5
- [ ] Prompt level stays within 1-5 range
- [ ] Prompt level resets after 7 days of inactivity

#### Files Expected To Change
- `packages/api/src/prompts/prompt-fading.service.ts` (new)
- `packages/api/src/activities/activities.service.ts` (integrate fading)
- `packages/api/src/prompts/prompts.service.ts` (extend for fading state)

#### Testing Requirements
- Unit tests for fade logic: correct streak, error revert, mastery
- Edge cases: boundary at level 1 (don't go lower), level 5 (check for mastery)
- Integration test: attempt recording triggers fade evaluation

#### Definition Of Done
- [ ] Fading engine built and tested
- [ ] Integrated with attempt recording
- [ ] Prompt level updates correctly

#### Out Of Scope
- Manual prompt level override (educator tool)
- Parent notification of prompt level changes (EPIC-10)

---

### Story 6.3 — Mastery Calculation Engine

#### Goal
Build a mastery calculation engine that computes concept mastery from accuracy, consistency, and independence metrics.

#### Background
The Progress model stores `mastery` (0.0-1.0) but it's currently only updated on first correct attempt. True mastery should consider: accuracy (recent performance), consistency (sustained correct performance), and independence (prompt level at time of correct response).

#### User Story
*As a parent and educator,* I want mastery scores to reflect real learning — not just getting answers right, but getting them right independently and consistently.

#### Functional Requirements
- Mastery formula: `mastery = accuracy × 0.4 + consistency × 0.3 + independence × 0.3`
  - **accuracy**: percentage correct in last 5 attempts (0.0-1.0)
  - **consistency**: percentage of recent sessions with >70% accuracy (0.0-1.0)
  - **independence**: (5 - averagePromptLevel) / 4 — higher is better (0.0-1.0)
- Mastery threshold for "completed": ≥0.8
- Mastery threshold for "mastered": ≥0.9
- Mastery recalculated after each activity attempt
- Mastery never decreases — call it "best mastery achieved"
- For concepts with no attempts: mastery = 0

#### Technical Requirements
- `MasteryService` in `packages/api/src/progress/` or new `packages/api/src/mastery/`
- `calculateMastery(studentId, conceptId): Promise<number>`
- Uses ActivityAttempt records for accuracy and independence
- Uses Session records for consistency
- Recalculates on activity attempt recording
- Stores result in Progress.mastery and Progress.completed flags

#### Deliverables
- `packages/api/src/mastery/mastery.service.ts`
- `packages/api/src/mastery/mastery.module.ts`
- Integration with ActivityAttemptService
- Unit tests

#### Acceptance Criteria
- [ ] Mastery correctly calculated from accuracy, consistency, independence
- [ ] Perfect accuracy + full independence → mastery ≥ 0.9
- [ ] High accuracy but low independence → mastery < high-accuracy-high-independence case
- [ ] Mastery ≥ 0.8 sets `completed = true`
- [ ] Mastery ≥ 0.9 sets additional "mastered" indicator
- [ ] Mastery never decreases on new calculations
- [ ] Zero attempts → mastery = 0

#### Files Expected To Change
- `packages/api/src/mastery/` (new module)
- `packages/api/src/app.module.ts` (register)
- `packages/api/src/activities/activities.service.ts` (integrate)
- `packages/api/src/progress/progress.service.ts` (use MasteryService)

#### Testing Requirements
- Unit tests: formula calculations, each component weighted correctly
- Integration test: attempts → mastery update
- Edge cases: no attempts, single attempt, only prompted attempts

#### Definition Of Done
- [ ] Mastery engine built
- [ ] Formula verified with test cases
- [ ] Integration with attempt flow

#### Out Of Scope
- Mastery decay over time (future)
- Multi-concept composite mastery (future)
- Educator-adjusted mastery thresholds (EPIC-12)

---

# Phase 5 — AI Tutor

## EPIC-8: AI Tutor

### Objective
Build a comprehensive AI tutor that provides contextual hints, explanations, encouragement, and guardrailed responses through a dedicated chat interface — following ALX-19 communication rules.

### Background
The packages/ai service exists with gpt-4o-mini + Zod structured outputs. The API has POST /api/ai/tutor and POST /api/ai/insights endpoints. There is no chat UI, no context building, no hint generation pipeline, and no structured guardrails beyond Zod schema validation.

### User Value
Learners get immediate, safe, structured AI support that follows ALX communication rules. Parents get AI-generated learning insights.

### Scope
- Tutor Context Builder (concept + progress + prompt level)
- Hint Generation Service (structured, multi-level hints)
- Explanation Generation Service (short, visual-first explanations)
- Encouragement Generation Service (ALX-compliant positive reinforcement)
- Tutor Guardrails (enforce ALX communication rules)
- Tutor Chat Interface (student-facing)
- AI Insights Panel (parent-facing)

### Dependencies
EPIC-3 (progress data for context)
EPIC-6 (prompt level data for context)

### Success Criteria
- AI tutor generates hints at 5 levels following ALX rules
- Tutor responses: max 3 short sentences, literal language, no metaphors
- Chat interface accessible from any activity
- Parent dashboard shows AI-generated weekly insights
- Guardrails prevent: sarcasm, complex language, open-ended philosophy, abstract reasoning

### Out Of Scope
- Speech-to-text for AI tutor input
- Multi-language AI tutor
- AI-generated activity content (EPIC-9)
- Fine-tuned tutor models

---

### Story 8.1 — AI Tutor Chat Interface

#### Goal
Build a student-facing chat interface for the AI tutor, accessible from any activity screen.

#### Background
The AI tutor API exists but there is no UI. Students have no way to request AI help during activities. The chat interface must follow ALX design: minimal, literal, visual-first, non-distracting.

#### User Story
*As a learner who needs help,* I want to open a simple chat with the AI tutor so that I can get help with my current activity in a safe, guided way.

#### Functional Requirements
- Chat interface accessible from activity screen via "Ask AI Tutor" button
- Interface: minimal, non-distracting — small panel or overlay (not full-screen)
- Pre-populated quick-action buttons: "Show me how", "Give me a hint", "I need encouragement"
- AI responses displayed as short text (max 3 sentences per ALX)
- Visual supports: allow emoji and simple illustrations in responses
- Chat history cleared on activity completion
- Close button returns to activity
- Do NOT auto-open on errors (ALX-6 — no unexpected UI changes)
- Accessible: keyboard navigable, focus managed, screen reader announcements

#### Technical Requirements
- Build in `packages/ui/src/AiTutorChat.tsx`
- Props: `conceptId, activityId, studentId, onClose`
- Quick-action buttons send typed requests to `POST /api/ai/tutor`
  - `"show_me"` → `{ type: "explanation", conceptId, activityId }`
  - `"hint"` → `{ type: "hint", conceptId, activityId, level: 2 }`
  - `"encourage"` → `{ type: "encouragement", conceptId }`
- Free-text input also available for custom questions
- Responses rendered in chat bubbles: AI left-aligned, user right-aligned
- Max 10 messages per session (cost control)
- Loading state: subtle pulse animation while waiting for response
- Error state: "I couldn't understand. Can you ask differently?" — never raw error
- Follow ALX-6: no autoplay, no flash, no unexpected animations

#### Deliverables
- `packages/ui/src/AiTutorChat.tsx`
- `packages/ui/src/AiTutorChat.css` or Tailwind classes
- Updated `packages/ui/src/index.ts`
- Integration in learn flow (button + panel)

#### Acceptance Criteria
- [ ] "Ask AI Tutor" button visible on activity screen
- [ ] Panel opens with 3 quick-action buttons
- [ ] Quick-action buttons trigger appropriate API calls
- [ ] Free-text input accepts questions
- [ ] AI responses rendered as short text in chat bubbles
- [ ] Max 10 messages per session enforced
- [ ] Close button returns to activity
- [ ] Chat history cleared on activity completion
- [ ] No autoplay, no flashing
- [ ] Keyboard navigable and screen reader compatible

#### Files Expected To Change
- `packages/ui/src/AiTutorChat.tsx` (new)
- `packages/ui/src/index.ts` (add export)
- `apps/student/pages/learn/[conceptId].tsx` (add tutor button)

#### Testing Requirements
- Component render test: button, panel, quick actions
- Interaction test: quick action fires API call
- Constraint test: 10 message limit enforced
- Accessibility test: keyboard navigation, aria labels

#### Definition Of Done
- [ ] Chat interface built
- [ ] Quick-action buttons working
- [ ] API integration functional
- [ ] Tests pass

#### Out Of Scope
- Speech input
- Streaming responses
- Chat history persistence
- Educator review of chat logs

---

### Story 8.2 — AI Tutor API Enhancement

#### Goal
Enhance the existing AI tutor service with structured context building, guardrailed prompt construction, and improved response generation.

#### Background
The current `packages/ai/src/index.ts` sends basic prompts to gpt-4o-mini with Zod structured output. It lacks: curriculum context (concept details, learning objectives), student state (progress, prompt level), multi-level hint generation, and structured guardrail enforcement.

#### User Story
*As a developer,* I want the AI tutor to be context-aware — knowing what concept the student is working on, how far they've progressed, and what level of support they need — so that responses are genuinely helpful and safe.

#### Functional Requirements
- Context Builder: fetches concept details, learning objective, current progress, prompt level
- Hint Generation: 5 levels of structured hints (mirroring ABA prompt hierarchy)
  - Level 1: Demonstration — "The answer is X because..."
  - Level 2: Visual hint — "Look at the first item carefully"
  - Level 3: Partial hint — "You're on the right track, check the second option"
  - Level 4: Verbal cue — "Try counting from the left"
  - Level 5: Independent — "You can do this! Take your time."
- Explanation Generation: max 3 sentences, visual-first, concrete, literal
- Encouragement Generation: ALX-15 compliant positive feedback
- Guardrails enforced via system prompt and Zod schema:
  - No abstract reasoning
  - No complex metaphors
  - No open-ended philosophy
  - No exaggerated praise ("You're a genius")
  - Max 3 sentences
  - Must include visual or concrete example where possible
- Fallback response if AI is unavailable or times out

#### Technical Requirements
- Update `packages/ai/src/index.ts` — refactor into modular services
- Create `packages/ai/src/context-builder.ts`: builds { concept, objective, progress, promptLevel, lastError }
- Create `packages/ai/src/prompt-templates.ts`: system prompts per type (hint, explain, encourage)
- Create `packages/ai/src/guardrails.ts`: response validation after Zod parse
- Create `packages/ai/src/fallback.ts`: fallback responses per type
- Each response type has its own Zod schema:
  - HintResponse: `{ hint: string, level: number, visualSuggestion?: string }`
  - ExplanationResponse: `{ explanation: string, example?: string }`
  - EncouragementResponse: `{ message: string, nextAction?: string }`

#### Deliverables
- `packages/ai/src/context-builder.ts`
- `packages/ai/src/prompt-templates.ts`
- `packages/ai/src/guardrails.ts`
- `packages/ai/src/fallback.ts`
- `packages/ai/src/index.ts` (refactored)
- Updated `packages/api/src/ai/ai.controller.ts` and `ai.service.ts`
- Unit tests for each service

#### Acceptance Criteria
- [ ] Context builder fetches concept, progress, and prompt level
- [ ] Hint generation produces 5 distinct levels of hints
- [ ] Explanation responses ≤3 sentences, include example
- [ ] Encouragement responses are ALX-15 compliant
- [ ] Guardrails block: metaphors, abstract reasoning, exaggerated praise, >3 sentences
- [ ] Fallback responses returned when AI is unavailable
- [ ] Zod schemas validate all response types
- [ ] API timeout handled gracefully (5s timeout)

#### Files Expected To Change
- `packages/ai/src/` (multiple files)
- `packages/api/src/ai/` (controller, service, DTOs)

#### Testing Requirements
- Unit tests for context builder
- Unit tests for prompt template construction
- Unit tests for guardrail validation (pass/fail cases)
- Unit tests for fallback responses
- Integration test: API call with mock AI

#### Definition Of Done
- [ ] AI tutor modular and testable
- [ ] Hint/explain/encourage working correctly
- [ ] Guardrails enforced
- [ ] Fallbacks in place
- [ ] Tests pass

#### Out Of Scope
- Multi-turn conversation state management
- Fine-tuned models
- AI for curriculum generation (EPIC-9)

---

# Phase 6 — Parent Experience

## EPIC-10: Parent Dashboard

### Objective
Build the parent dashboard with real data integration, meaningful visualizations, AI-generated insights, and actionable practice recommendations.

### Background
The parent app has dashboard pages (progress, reports, insights) that use mock data. The API now has real progress and attempt data. This Epic replaces mock data with real API calls, adds meaningful visualizations, and enhances the insights panel.

### User Value
Parents get clear answers: What was learned? What improved? What was difficult? What should be practiced next?

### Scope
- Progress Dashboard (real API data, mastery bars per concept)
- Independence Dashboard (prompt level trends)
- Weekly Learning Summary (session aggregates)
- AI Insights Panel (AI-generated learning observations)
- Practice Recommendations (next-concept suggestions)

### Dependencies
EPIC-3 (Progress API, Activity Attempt API)
EPIC-6 (Mastery Calculation, Independence Tracking)
EPIC-8 (AI Insights API)

### Success Criteria
- Dashboard shows real progress data from API
- Parents can see which concepts their child has mastered
- Weekly summary shows time spent, concepts covered, trends
- AI insights provide actionable observations
- Practice recommendations suggest specific concepts to work on

### Out Of Scope
- Educator/analytics views
- Custom dashboard layouts
- Notification system

---

### Story 10.1 — Progress Dashboard API Integration

#### Goal
Replace mock data in the parent dashboard with real API calls to progress, attempt, and session endpoints.

#### Background
The parent app's `dashboard.tsx`, `dashboard/progress.tsx`, `dashboard/reports.tsx`, and `dashboard/insights.tsx` all use mock data. The API now has real progress data (Story 3.2) and session data (Story 3.3).

#### User Story
*As a parent,* I want to see my child's real progress — which concepts are mastered, which need practice, and how much time they've spent learning.

#### Functional Requirements
- `apps/parent/lib/api.ts` — Replace mock data with real API calls:
  - `fetchChildrenProgress()` → `GET /api/students/:id/progress` (for linked children)
  - `fetchChildSessions(dates)` → `GET /api/students/:id/sessions?since=date`
  - `fetchChildDetails()` → `GET /api/parent/children` (linked students)
  - `fetchWeeklySummary(studentId)` → `GET /api/students/:id/sessions/weekly`
- Authenticated via parent JWT (can query linked children only)
- Progress bars show real mastery percentages per concept
- Chapter/subject aggregation from Story 3.2
- Session duration and count shown in reports
- Graceful loading and error states
- Mock data fallback via env var (for development)

#### Technical Requirements
- Auth context already exists in `apps/parent/lib/auth.tsx`
- Add parent-scoped endpoints to NestJS API:
  - `GET /api/parent/children` — returns linked Student records
  - `GET /api/parent/children/:id/progress` — scoped progress (with parent authorization check)
  - `GET /api/parent/children/:id/sessions` — scoped sessions
- Parent authorization: verify JWT parentId matches Student.parentId
- Progress visualization: mastery bars colored by level (Muted Green ≥0.8, Soft Amber 0.5-0.8, Soft Coral <0.5)

#### Deliverables
- `packages/api/src/parent/parent.module.ts`, controller, service
- Updated `apps/parent/lib/api.ts`
- Updated `apps/parent/pages/dashboard.tsx`
- Updated `apps/parent/pages/dashboard/progress.tsx`
- Updated `apps/parent/pages/dashboard/reports.tsx`
- Updated `apps/parent/pages/dashboard/insights.tsx`
- Unit tests for parent API endpoints

#### Acceptance Criteria
- [ ] Parent API endpoints return data for linked children only
- [ ] Unauthorized access to non-linked children returns 403
- [ ] Progress dashboard shows real mastery data with color coding
- [ ] Reports show real session data (time spent, dates)
- [ ] Loading states shown during API fetch
- [ ] Error states shown with retry option
- [ ] Mock data fallback works for development

#### Files Expected To Change
- `packages/api/src/parent/` (new module)
- `packages/api/src/app.module.ts` (register)
- `apps/parent/lib/api.ts` (rewrite)
- `apps/parent/pages/dashboard.tsx` (real API)
- `apps/parent/pages/dashboard/progress.tsx` (real API)
- `apps/parent/pages/dashboard/reports.tsx` (real API)

#### Testing Requirements
- API integration tests for parent endpoints
- Component render tests with real data
- Auth permission tests

#### Definition Of Done
- [ ] All dashboard pages use real API data
- [ ] Parent auth scoping works
- [ ] Tests pass

#### Out Of Scope
- Downloadable reports (PDF/CSV)
- Email notifications
- Dashboard customization

---

### Story 10.2 — AI Insights & Practice Recommendations

#### Goal
Build the AI-generated insights and practice recommendation features for the parent dashboard.

#### Background
The insights API endpoint exists in `packages/api/src/ai/ai.controller.ts` but returns basic data. The insights page shows mock data. This story enhances the AI insights generation and adds a practice recommendation system based on mastery data.

#### User Story
*As a parent,* I want to see AI-generated insights about my child's learning patterns and clear recommendations for what to practice next, so that I can support their learning at home.

#### Functional Requirements
- AI Insights Panel:
  - Shows AI-generated observations about learning patterns
  - Covers: concepts mastered, concepts needing practice, attention trends, prompt dependency trends
  - Generated via AI Tutor API: `POST /api/ai/insights` with student progress data as context
  - Each insight: one short sentence (ALX language), with optional action suggestion
  - Refreshed weekly (cached until new data available)
  - Fallback: template-based insights if AI unavailable
- Practice Recommendations:
  - Based on mastery data: recommend concepts with mastery < 0.8
  - Order by: low mastery → high mastery (prioritize most-needed)
  - Show: concept name, current mastery, reason for recommendation
  - "Start Practice" link → navigates to learn flow for that concept
  - Limit to 3 recommendations

#### Technical Requirements
- New API: `GET /api/parent/children/:id/insights` — returns insights + recommendations
- Insight generation context: last 30 days of data (attempts, sessions, progress)
- Recommendation algorithm: concepts ordered by `mastery ASC` where `mastery < 0.8`
- Frontend: `apps/parent/pages/dashboard/insights.tsx` — real data from API
- Loading: skeleton loading state
- Empty state: "No insights yet — start learning to see patterns!"

#### Deliverables
- Enhanced `packages/api/src/ai/ai.service.ts` (insight generation)
- `packages/api/src/recommendations/` (new module — recommendation logic)
- Updated `apps/parent/pages/dashboard/insights.tsx`
- `apps/parent/components/InsightCard.tsx`
- `apps/parent/components/PracticeRecommendation.tsx`
- Unit tests

#### Acceptance Criteria
- [ ] Insights panel shows AI-generated observations
- [ ] Each insight is 1 short sentence with action suggestion
- [ ] Fallback insights shown when AI unavailable
- [ ] 3 practice recommendations shown based on lowest mastery
- [ ] Each recommendation shows concept name, mastery %, reason
- [ ] "Start Practice" link navigates to learn flow
- [ ] Loading skeleton shown during fetch
- [ ] Empty state displayed for students with no data

#### Files Expected To Change
- `packages/api/src/ai/ai.service.ts` (enhance insight gen)
- `packages/api/src/recommendations/` (new module)
- `packages/api/src/app.module.ts` (register)
- `apps/parent/pages/dashboard/insights.tsx` (rewrite)
- `apps/parent/components/InsightCard.tsx` (new)
- `apps/parent/components/PracticeRecommendation.tsx` (new)

#### Testing Requirements
- Unit tests for insight generation (template-based)
- Unit tests for recommendation algorithm
- Component render tests for insight card and recommendation card

#### Definition Of Done
- [ ] Insights panel working with real data
- [ ] Recommendations accurate and actionable
- [ ] Fallbacks in place
- [ ] Tests pass

#### Out Of Scope
- Custom insight categories
- Email delivery of weekly insights
- Parent feedback on insight quality

---

# Phase 7 — Authoring Tools

## EPIC-12: Curriculum Authoring Platform

### Objective
Build a web-based curriculum authoring platform that enables educators to define concepts, configure activity templates, review, approve, and publish curriculum content without engineering support.

### Background
Curriculum content is currently defined in YAML files and seeded into the database. Educators need a web interface to author, review, and publish concepts. This Epic builds the minimal authoring platform with concept editing, activity template configuration, review workflow, and publishing.

### User Value
A special educator can define a new concept, configure its activities, review, approve, and publish it to the platform — without writing any code or YAML.

### Scope
- Concept Editor (web form for concept definition)
- Activity Template Editor (configure activity types, parameters, hints)
- Curriculum Review Workflow (draft → review → approved → published)
- Publishing Workflow (validate → seed → deploy)
- Content Versioning (change history)
- Curriculum Analytics Dashboard

### Dependencies
EPIC-0 (Concept Specification Schema, Curriculum Pipeline)
EPIC-5 (Activity Templates)

### Success Criteria
- Educator can create, edit, and save a concept through the web UI
- Educator can configure activity templates (type, parameters, hints, step)
- Curriculum content goes through review workflow before publishing
- Published content is validated and seeded into the database
- Change history shows what changed and who changed it

### Out Of Scope
- AI-assisted curriculum generation (EPIC-9)
- Drag-and-drop visual activity builder
- Bulk curriculum import from spreadsheets
- API for external content providers

---

### Story 12.1 — Concept Editor UI

#### Goal
Build a web-based concept editor that allows educators to define new concepts and edit existing ones through a form interface.

#### Background
Concepts are currently defined in YAML files. Educators need a web interface that guides them through concept definition with proper validation, preview, and save functionality.

#### User Story
*As a special educator,* I want to create new curriculum concepts through a web form so that I can add content to the platform without writing code.

#### Functional Requirements
- Web form with fields matching ConceptSpec schema (Story 0.1):
  - Concept ID (auto-generated from name), Name, Learning Objective, Core Idea
  - Examples (add/remove/reorder), Misconceptions (add/remove)
  - Supports (checkboxes: visual, audio, prompting)
  - Mastery Criteria (percentage slider)
  - Dependencies (multi-select from existing concepts)
  - Difficulty (beginner/intermediate/advanced dropdown)
  - Estimated Duration (minutes)
- Form validation: required fields, correct formats, dependency references
- Preview pane: renders concept as it would appear to learner (title, objective, examples)
- Save as Draft: stores in DB without publishing
- Auto-save: drafts persisted every 30 seconds
- Edit existing concept: loads from API, pre-fills form

#### Technical Requirements
- New Next.js app or route: `apps/author/pages/concepts/new.tsx` and `apps/author/pages/concepts/[id]/edit.tsx`
- Or extend as a route in `apps/parent/pages/author/` (educator-facing)
- API endpoints:
  - `POST /api/curriculum/concepts` — create concept
  - `GET /api/curriculum/concepts/:id` — get concept
  - `PATCH /api/curriculum/concepts/:id` — update concept
  - `GET /api/curriculum/concepts` — list all concepts
- Validate against ConceptSpec Zod schema before saving
- Drafts stored in a new `ConceptDraft` model (separate from published)
- UI components to be built new or reused from `packages/ui/`

#### Deliverables
- `apps/author/pages/concepts/new.tsx`
- `apps/author/pages/concepts/[id]/edit.tsx`
- `packages/api/src/curriculum/concepts.controller.ts` (concept CRUD)
- `packages/db/prisma/schema.prisma` (add ConceptDraft model)
- Editor components in `apps/author/components/`

#### Acceptance Criteria
- [ ] Form renders all ConceptSpec fields
- [ ] Required fields validated on save
- [ ] Dependency multi-select shows existing concepts
- [ ] Preview pane shows concept as learner would see it
- [ ] Save as Draft persists without publishing
- [ ] Auto-save fires every 30 seconds
- [ ] Editing existing concept loads data correctly
- [ ] Concept CRUD API endpoints work with validation

#### Files Expected To Change
- `apps/author/` (new app directory)
- `packages/api/src/curriculum/concepts.controller.ts` (or new controller)
- `packages/db/prisma/schema.prisma` (ConceptDraft model)

#### Testing Requirements
- Unit tests for form validation
- API integration tests for concept CRUD
- Component render tests

#### Definition Of Done
- [ ] Concept editor form functional
- [ ] Save/load/edit working
- [ ] Preview showing correct content
- [ ] Tests passing

#### Out Of Scope
- Rich text editing for concept descriptions
- Image upload for concepts
- Bulk concept import

---

### Story 12.2 — Activity Template Editor

#### Goal
Build an activity template editor that lets educators configure which activity types apply to a concept, set parameters, and define hint content.

#### Background
Each concept needs activities across 5 steps with specific types and parameters. Currently this is defined in YAML. The activity template editor provides a UI for configuring these templates.

#### User Story
*As a special educator,* I want to configure which activity types my concept uses, set the parameters (counts, questions, options), and define hints at each level — all through a guided interface.

#### Functional Requirements
- For each concept (from Story 12.1), configure activities per step:
  - Step: Observe, Guided Practice, Independent Practice, Mastery Check, Positive Completion
  - Activity type selector per step (filtered by compatible types)
  - Parameter editor per type:
    - visual_counting: count, emoji, description
    - matching: pairs (add/remove items A and B)
    - multiple_choice: question, options (add/remove), correct answer
    - sequencing: items (add/remove), correct order
    - story_question: scenario, questions, options
    - real_world: scenario, description, hint
  - Hint editor: 5 levels of hints per activity
  - Activity preview: renders activity as it would appear
- Validate: each step must have at least one activity
- Save as Draft or Published (same workflow as concept)

#### Technical Requirements
- Activity type registry: `packages/api/src/activities/activity-registry.ts`
  - Maps type → available parameters, compatible steps, validation schema
  - Zod schemas per activity type for parameter validation
- API: `PATCH /api/curriculum/concepts/:id/activities` — batch update activities
- Preview component reuses ActivityRenderer (Story 5.1) with draft data
- `apps/author/pages/concepts/[id]/activities.tsx`

#### Deliverables
- `apps/author/pages/concepts/[id]/activities.tsx`
- `apps/author/components/ActivityTypeSelector.tsx`
- `apps/author/components/ParameterEditor.tsx` (per-type parameter forms)
- `packages/api/src/activities/activity-registry.ts`
- Parameters Zod schemas per type

#### Acceptance Criteria
- [ ] Activity type selector shows only compatible types per step
- [ ] Parameter editor adjusts form fields based on selected type
- [ ] Multi-option types support add/remove/reorder
- [ ] Hint editor supports all 5 levels
- [ ] Preview renders activity correctly
- [ ] Validation prevents saving with missing required parameters
- [ ] Save persists activities to concept

#### Files Expected To Change
- `apps/author/pages/concepts/[id]/activities.tsx` (new)
- `apps/author/components/` (new components)
- `packages/api/src/activities/activity-registry.ts` (new)
- `packages/api/src/activities/activities.service.ts` (bulk update)

#### Testing Requirements
- Unit tests for parameter validation per type
- Component render tests for each parameter editor
- Integration test: save and load activity configs

#### Definition Of Done
- [ ] Activity template editor functional
- [ ] All 7 activity types configurable
- [ ] Preview working
- [ ] Tests pass

#### Out Of Scope
- Drag-and-drop activity type arrangement
- Image upload for activity content
- A/B testing of activity configurations

---

# Implementation Notes

## Development Order

Phase 1 (Curriculum Infrastructure):
- EPIC-0 → Stories 0.1, 0.2, 0.3 in order (schema → pipeline → CLI)
- Story 0.4 (concept expansion) can run in parallel with EPIC-1 stories
- EPIC-1 → Stories 1.1, 1.2 (can run in parallel), then 1.3 (dependency graph)

Phase 2 (Delivery & Experience):
- EPIC-3 → Stories 3.1, 3.2, 3.3 (API services, can be parallel), then 3.4 (frontend integration)
- EPIC-4 → Stories 4.1, 4.2, 4.3 (UI components, can be parallel), then 4.4 (learn flow integration), then 4.5 (calm zone), 4.6 (resume)
- EPIC-5 → Story 5.1 (runtime engine), then 5.2, 5.3 (new components), then 5.4 (integration), 5.5 (accessibility)

Phase 3 (Adaptive):
- EPIC-6 → Stories 6.1 (prompt hierarchy), 6.2 (fading), 6.3 (mastery) — sequential dependency

Phase 4 (AI):
- EPIC-8 → Story 8.1 (chat UI), 8.2 (API enhancement) — can be parallel

Phase 5 (Parent):
- EPIC-10 → Story 10.1 (dashboard integration), then 10.2 (insights)

Phase 6 (Authoring):
- EPIC-12 → Story 12.1 (concept editor), then 12.2 (activity editor)

## Architecture Constraints Checklist
- ✅ No hardcoded curriculum — all content is data-driven
- ✅ No lesson content embedded in UI — activities render from DB content
- ✅ Activity template system — not manual activity creation per concept
- ✅ Concept → Activity Template → Activity Instance architecture
- ✅ All stories independently executable by AI coding agent
- ✅ Every story has testable acceptance criteria
- ✅ All stories align with TEACCH, ABA, ALX, and curriculum-first architecture
