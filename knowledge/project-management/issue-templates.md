# LearnEasy Issue Templates

## GitHub Epic & Story Templates

### Version 1.0

---

# Purpose

These templates ensure that:

* Every issue is AI-agent executable
* Every issue contains sufficient implementation detail
* Epics remain outcome-focused
* Stories remain implementation-focused
* Progress is measurable
* Scope creep is minimized

---

# General Rules

## Rule 1

One Story = One Deliverable

Bad:

```text
Implement Activity System
```

Good:

```text
Implement Visual Counting Activity
```

---

## Rule 2

Stories Must Be Independently Implementable

A coding agent should be able to complete the story without requiring knowledge of future stories.

---

## Rule 3

Acceptance Criteria Must Be Testable

Bad:

```text
Looks good
```

Good:

```text
All unit tests pass.
Activity renders correctly on mobile and desktop.
```

---

## Rule 4

Define Out Of Scope

Prevent accidental feature expansion.

---

## Rule 5

Every Story Must Produce Value

Avoid technical tasks that do not directly contribute to a usable capability.

---

# Epic Template

---

## Title Format

```text
[EPIC-X] Epic Name
```

Example:

```text
[EPIC-5] Activity Engine
```

---

## Description Template

```md
# Objective

Describe the business outcome this epic delivers.

# Background

Why this epic exists.

# User Value

How learners, parents, educators, or administrators benefit.

# Scope

List all major capabilities included.

# Stories

List planned stories.

# Dependencies

Required epics or stories.

# Success Criteria

How we know the epic is complete.

# Out Of Scope

Capabilities explicitly excluded.
```

---

## Example

```md
# Objective

Create a reusable activity system for all curriculum content.

# User Value

Learners can complete interactive activities.

# Scope

- Activity runtime
- Visual counting
- Matching
- Sequencing

# Success Criteria

All Level A Mathematics activities can be delivered using the activity framework.
```

---

# Story Template

---

## Title Format

```text
[Story-X.Y] Story Name
```

Example:

```text
[Story-5.2] Visual Counting Activity
```

---

## Description Template

```md
# Goal

Describe the capability being delivered.

# Background

Explain why this work is needed.

# User Story

As a <user>

I want <capability>

So that <benefit>

# Functional Requirements

List user-facing requirements.

# Technical Requirements

List implementation requirements.

# Deliverables

List expected outputs.

# Acceptance Criteria

List measurable completion requirements.

# Files Expected To Change

List expected code areas.

# Testing Requirements

Required tests.

# Definition Of Done

Final completion checklist.

# Out Of Scope

Explicit exclusions.
```

---

# Story Example

```md
# Goal

Implement visual counting activity rendering.

# Background

Visual counting is the first activity type required for Level A Mathematics.

# User Story

As a learner

I want to count visual objects

So that I can learn number quantity relationships.

# Functional Requirements

- Display objects visually
- Ask quantity question
- Provide answer choices
- Evaluate responses

# Technical Requirements

- Activity renderer
- Activity validator
- Activity evaluator

# Deliverables

- VisualCountingRenderer
- VisualCountingValidator
- VisualCountingEvaluator

# Acceptance Criteria

- Activity renders correctly
- Correct answers evaluated successfully
- Accessibility labels present
- Mobile responsive

# Files Expected To Change

packages/activity-engine/

# Testing Requirements

- Unit tests
- Integration tests

# Definition Of Done

- Tests passing
- Documentation updated
- Storybook example added

# Out Of Scope

- AI tutor integration
- Analytics
```

---

# Architecture Decision Record (ADR) Template

Use when introducing significant technical decisions.

---

## Title Format

```text
[ADR-XXX] Decision Name
```

Example:

```text
[ADR-001] Curriculum Stored In Git
```

---

## Template

```md
# Status

Proposed | Accepted | Deprecated

# Context

What problem are we solving?

# Decision

What was chosen?

# Alternatives Considered

List alternatives.

# Consequences

Positive and negative impacts.

# References

Related issues and documents.
```

---

# Bug Template

---

## Title Format

```text
[BUG] Short Description
```

---

## Template

```md
# Summary

Describe the issue.

# Environment

Browser
Device
Build Version

# Steps To Reproduce

1.
2.
3.

# Expected Behavior

Describe expected result.

# Actual Behavior

Describe actual result.

# Severity

Critical
High
Medium
Low

# Screenshots

Attach if applicable.

# Additional Notes
```

---

# Research Spike Template

Use for investigations.

---

## Title Format

```text
[SPIKE] Research Topic
```

---

## Template

```md
# Objective

What question are we trying to answer?

# Background

Why this research is required.

# Deliverables

Expected output.

# Success Criteria

Questions answered.

# Timebox

Maximum effort allowed.

# Output Document

Where findings will be stored.
```

---

# Curriculum Story Template

Use for curriculum-specific work.

---

## Title Format

```text
[CURRICULUM] Concept Name
```

Example:

```text
[CURRICULUM] Counting 1-10
```

---

## Template

```md
# Goal

Define a curriculum concept.

# Concept ID

Unique identifier.

# Learning Objective

What the learner should achieve.

# Core Idea

Key understanding.

# Examples

Concrete examples.

# Misconceptions

Common mistakes.

# Supports Required

Visual
Audio
Prompting

# Mastery Criteria

Required mastery threshold.

# Dependencies

Prerequisite concepts.

# Deliverables

Concept definition file.

# Acceptance Criteria

Concept validates successfully.

# Out Of Scope

Activities and implementation.
```

---

# AI-Agent Instructions

Every implementation issue should include:

## Context

Why the work exists.

---

## Constraints

Important limitations.

---

## Acceptance Criteria

Objective measures.

---

## Definition Of Done

Completion checklist.

---

## Out Of Scope

Explicit exclusions.

---

# Recommended Labels

## Type

* epic
* story
* bug
* spike
* adr

## Domain

* curriculum
* activity-engine
* teacch
* aba
* ai-tutor
* parent-dashboard
* analytics

## Technical

* frontend
* backend
* database
* infrastructure

## Quality

* autism
* accessibility
* testing

## Priority

* high-priority
* medium-priority
* low-priority

---

# LearnEasy Rule

If an issue cannot be implemented by a competent AI coding agent using only the issue description and project documentation, the issue is not sufficiently defined and should be refined before development begins.

