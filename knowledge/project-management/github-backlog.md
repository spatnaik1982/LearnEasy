# LearnEasy Project Backlog

## GitHub Epics & Stories

### Version 1.0

---

# Overview

This backlog is designed specifically for:

* AI-Agent Driven Development
* Autism-First Learning Design (ALX 2.0)
* TEACCH-Informed Learning Architecture
* Modern ABA-Informed Skill Acquisition
* NIOS Curriculum Delivery

---

# Development Principles

## Principle 1

Curriculum is the Product.

The software exists to deliver curriculum effectively.

---

## Principle 2

Concepts are authored.

Activities are generated.

---

## Principle 3

TEACCH drives UX.

ABA drives learning progression.

---

## Principle 4

Every story should be independently executable by an AI coding agent.

---

# Milestone 1

# Curriculum Foundation

Goal:

Build the curriculum platform before building large amounts of UI.

---

# EPIC-0

# Curriculum Content Infrastructure

## Objective

Create a scalable curriculum system where educators author concepts instead of manually creating activities.

---

## Story 0.1

### Title

Define Curriculum Domain Model

### Goal

Create the foundational curriculum entities.

### Deliverables

* Level
* Subject
* Chapter
* Concept
* Learning Objective
* Mastery Rule

### Acceptance Criteria

* Prisma schema implemented
* Relationships documented
* Migrations pass
* Example data seeded

---

## Story 0.2

### Title

Define Concept Specification Schema

### Goal

Create canonical concept representation.

### Example

```yaml
conceptId: counting_1_10

objective:
  Count quantities from 1-10

coreIdea:
  Numbers represent quantity

examples:
  apples
  balls

misconceptions:
  skipping objects

supports:
  visual

mastery:
  80%
```

### Acceptance Criteria

* JSON Schema created
* Validation implemented
* Documentation completed

---

## Story 0.3

### Title

Design Curriculum DSL

### Goal

Create curriculum authoring language.

### Acceptance Criteria

* YAML specification documented
* Parser implemented
* Validation implemented

---

## Story 0.4

### Title

Create Curriculum Repository Structure

### Deliverables

```text
curriculum/

 level-a/
 level-b/
 level-c/

 templates/
 concepts/
 activities/
```

### Acceptance Criteria

Repository structure committed.

---

## Story 0.5

### Title

Build Curriculum Pipeline

### Goal

Transform curriculum source into runtime content.

### Pipeline

```text
YAML
 ↓
Validation
 ↓
Transformation
 ↓
Database Seed
```

### Acceptance Criteria

Build command available.

---

## Story 0.6

### Title

Curriculum Validation Engine

### Acceptance Criteria

CLI command:

```bash
pnpm curriculum:validate
```

Validates:

* objectives
* mastery criteria
* references
* dependencies

---

## Story 0.7

### Title

Create Level A Mathematics Concept Library

### Goal

Create concept definitions for:

* Number Recognition
* Counting
* Shapes
* Addition
* Subtraction

### Acceptance Criteria

100% Level A mathematics coverage.

---

# EPIC-1

# NIOS Curriculum Extraction

---

## Story 1.1

Extract Level A Mathematics Curriculum

---

## Story 1.2

Extract Level A Language Curriculum

---

## Story 1.3

Extract Level A Environmental Science Curriculum

---

## Story 1.4

Create Curriculum Dependency Graph

Example:

```text
Number Recognition
      ↓
Counting
      ↓
Addition
      ↓
Subtraction
```

Acceptance Criteria:

Learning graph generated.

---

# EPIC-2

# Platform Foundation

---

## Story 2.1

Setup Monorepo

### Deliverables

```text
apps/
packages/
```

---

## Story 2.2

Shared Type System

### Deliverables

* Concept
* Activity
* Progress
* Mastery

---

## Story 2.3

Environment Configuration

---

## Story 2.4

Docker Development Environment

---

## Story 2.5

CI Pipeline

Pipeline:

```text
Lint
Typecheck
Tests
Curriculum Validation
Build
```

---

# Milestone 2

# Learning Experience MVP

---

# EPIC-3

# Curriculum Delivery Platform

---

## Story 3.1

Curriculum Navigation API

Endpoints:

```text
GET /levels
GET /subjects
GET /chapters
GET /concepts
```

---

## Story 3.2

Concept Delivery API

Returns:

```json
{
  "concept": {},
  "activities": []
}
```

---

## Story 3.3

Learning Path Generation API

---

## Story 3.4

Curriculum Progress API

---

# EPIC-4

# TEACCH Learning Framework

---

## Story 4.1

Work System Component

Must answer:

* What am I doing?
* How much work?
* How do I know I'm done?
* What happens next?

---

## Story 4.2

Visual Schedule Component

Displays:

```text
Learn
Practice
Quiz
Complete
```

---

## Story 4.3

Transition Screen Framework

Example:

```text
Practice Complete

Next:
Quiz

[Start Quiz]
```

---

## Story 4.4

Learning Zones

* Learn Zone
* Practice Zone
* Quiz Zone
* Calm Zone

---

## Story 4.5

Calm Zone

Features:

* Visual timer
* Breathing exercise
* Calm imagery

---

## Story 4.6

Resume Learning Engine

---

## Story 4.7

Executive Function Support Layer

---

# EPIC-5

# Activity Engine

---

## Story 5.1

Activity Runtime Engine

---

## Story 5.2

Visual Counting Activity

---

## Story 5.3

Object Matching Activity

---

## Story 5.4

Sequencing Activity

---

## Story 5.5

Multiple Choice Activity

---

## Story 5.6

Drag and Drop Activity

---

## Story 5.7

Activity Attempt Tracking

Track:

* attempts
* hints
* retries
* time spent

---

## Story 5.8

Accessibility Support Framework

---

# Milestone 3

# Adaptive Learning

---

# EPIC-6

# ABA Learning Engine

---

## Story 6.1

Prompt Hierarchy Framework

Levels:

* Demonstration
* Visual Hint
* Partial Hint
* Verbal Cue
* Independent

---

## Story 6.2

Prompt Fading Engine

---

## Story 6.3

Mastery Calculation Engine

Inputs:

* accuracy
* consistency
* independence

Outputs:

* learning
* mastered

---

## Story 6.4

Independence Tracking Engine

---

## Story 6.5

Adaptive Difficulty Engine

---

## Story 6.6

Learning Recommendation Engine

---

# EPIC-7

# Autism Learning Profiles

---

## Story 7.1

Sensory Profile Model

Fields:

* visual support
* audio support
* animation tolerance

---

## Story 7.2

Executive Function Profile

---

## Story 7.3

Prompt Dependency Profile

---

## Story 7.4

Attention Span Profile

---

## Story 7.5

Profile Driven Adaptation Engine

---

# Milestone 4

# AI Layer

---

# EPIC-8

# AI Tutor

---

## Story 8.1

Tutor Context Builder

Context:

* concept
* objective
* progress
* prompt level

---

## Story 8.2

Hint Generation Service

---

## Story 8.3

Explanation Generation Service

---

## Story 8.4

Encouragement Generation Service

---

## Story 8.5

Tutor Guardrails

Prevent:

* sarcasm
* metaphors
* complex language

---

## Story 8.6

Tutor Chat Interface

---

# EPIC-9

# AI Curriculum Generation

---

## Story 9.1

Concept → Activity Generator

---

## Story 9.2

Activity Variation Generator

---

## Story 9.3

Distractor Generator

---

## Story 9.4

Activity Quality Scoring

---

## Story 9.5

Educator Review Interface

States:

* Draft
* Review
* Approved
* Published

---

# Milestone 5

# Parent Experience

---

# EPIC-10

# Parent Dashboard

---

## Story 10.1

Progress Dashboard

---

## Story 10.2

Mastery Dashboard

---

## Story 10.3

Independence Dashboard

---

## Story 10.4

Weekly Learning Summary

---

## Story 10.5

AI Insights Panel

---

## Story 10.6

Practice Recommendations

---

# EPIC-11

# Content Quality Framework

---

## Story 11.1

Curriculum Linter

Validates:

* objectives
* examples
* misconceptions

---

## Story 11.2

Activity Coverage Validator

Ensures:

Observe
Practice
Quiz

exist for every concept.

---

## Story 11.3

Accessibility Validator

Checks:

* sentence length
* reading level
* visual support

---

## Story 11.4

TEACCH Compliance Validator

Verifies:

* What am I doing?
* How much work?
* How do I know I'm done?
* What happens next?

---

## Story 11.5

ALX Compliance Validator

Validates all ALX 2.0 principles.

---

# EPIC-12

# Curriculum Authoring Platform

---

## Story 12.1

Concept Editor

---

## Story 12.2

Activity Template Editor

---

## Story 12.3

Curriculum Review Workflow

---

## Story 12.4

Publishing Workflow

---

## Story 12.5

Content Versioning System

---

## Story 12.6

Curriculum Analytics Dashboard

---

# GitHub Labels

## Type

* epic
* story
* bug
* enhancement

---

## Domain

* curriculum
* activity-engine
* teacch
* aba
* ai-tutor
* parent-dashboard
* analytics

---

## Technical

* frontend
* backend
* database
* infrastructure

---

## Quality

* autism
* accessibility
* testing

---

## Priority

* high-priority
* medium-priority
* low-priority

---

# Recommended Development Order

Phase 1

EPIC-0
EPIC-1
EPIC-2

---

Phase 2

EPIC-3
EPIC-4
EPIC-5

---

Phase 3

EPIC-6
EPIC-7

---

Phase 4

EPIC-8
EPIC-9

---

Phase 5

EPIC-10
EPIC-11
EPIC-12

---

# Success Criteria

A special educator should be able to:

1. Define a concept.
2. Generate activities.
3. Review content.
4. Publish lessons.

Without requiring engineering support.

When this becomes possible, LearnEasy can scale from a Level A Mathematics MVP to the complete NIOS curriculum while maintaining TEACCH and ABA learning principles.

