# Learn easy

## Product Specification v1.0

**Product:** Arin Learn
**Version:** 1.0
**Status:** Draft
**Target Users:** Children with Autism Spectrum Disorder (ASD), Parents, Special Educators
**Curriculum Alignment:** NIOS Open Basic Education (OBE) Levels A, B, and C

---

# 1. Executive Summary

Arin Learn is an autism-first learning platform designed to help children with Autism Spectrum Disorder successfully learn and prepare for National Institute of Open Schooling (NIOS) Open Basic Education examinations.

Unlike traditional educational platforms, Arin Learn focuses on predictable learning experiences, visual supports, adaptive instruction, reduced sensory load, and personalized learning pathways.

The platform combines structured curriculum delivery, AI-assisted tutoring, parent involvement, and educator collaboration into a single learning ecosystem.

---

# 2. Vision

## Mission

Enable every autistic learner to confidently master foundational academic skills and successfully complete NIOS education through personalized and accessible learning experiences.

## Vision Statement

To become India's leading autism-friendly educational platform aligned with the NIOS curriculum.

---

# 3. Problem Statement

Most educational products assume:

* Strong verbal comprehension
* Long attention spans
* Independent learning ability
* Text-heavy learning
* Standardized assessment approaches

Autistic learners often require:

* Visual-first instruction
* Predictable learning structures
* Smaller learning steps
* Repetition without frustration
* Personalized pacing
* Reduced sensory stimulation

Existing NIOS resources are not optimized for these needs.

---

# 4. Product Goals

## G1 Curriculum Mastery

Help students achieve mastery of NIOS concepts.

### Success Metrics

* > 70% concept mastery
* > 75% NIOS pass rate

---

## G2 Autism-Friendly Learning

Reduce barriers caused by communication, sensory, and executive functioning challenges.

### Success Metrics

* > 80% lesson completion rate
* <10% lesson abandonment rate

---

## G3 Parent Empowerment

Enable parents to actively support learning.

### Success Metrics

* > 60% weekly active parents
* > 50% weekly report views

---

## G4 Educator Collaboration

Allow educators to monitor and guide learning.

### Success Metrics

* Monthly educator engagement >70%

---

# 5. User Personas

## Student

### Example

Rohan, Age 10

Characteristics:

* Autism Level 1
* Strong visual learner
* Short attention span
* Enjoys routines

Needs:

* Visual instruction
* Consistent interfaces
* Small learning chunks

---

## Parent

### Example

Priya

Challenges:

* Limited NIOS knowledge
* Unsure how to teach concepts

Needs:

* Clear progress tracking
* Actionable recommendations
* Simple reports

---

## Special Educator

Needs:

* Student monitoring
* Goal assignment
* Progress reporting
* Individualized learning plans

---

# 6. Product Principles

## Predictability

Every screen follows familiar layouts.

No surprises.

---

## One Concept at a Time

Each lesson focuses on a single learning objective.

---

## Visual First

Show before explaining.

---

## Low Sensory Load

Avoid:

* Flashing effects
* Loud sounds
* Complex animations
* Excessive colors

---

## Mastery Over Gamification

Focus on learning progress rather than addictive reward loops.

---

# 7. Curriculum Structure

## NIOS OBE Levels

### Level A

Equivalent to Grade 3

Subjects:

* Mathematics
* Language
* Environmental Studies

---

### Level B

Equivalent to Grade 5

Subjects:

* Mathematics
* Language
* EVS
* Basic Science

---

### Level C

Equivalent to Grade 8

Subjects:

* Mathematics
* Science
* Social Science
* Languages

---

# 8. Learning Architecture

```
Level
└── Subject
└── Chapter
└── Concept
└── Activity
```

Example:

```
Level A
└── Mathematics
└── Numbers
└── Counting 1-10
├── Learn
├── Practice
├── Quiz
└── Review
```

---

# 9. Learning Experience Flow

Every concept follows the same structure.

## Step 1: Observe

Visual introduction.

Example:

🍎 🍎 🍎

"There are three apples."

---

## Step 2: Guided Practice

Interactive learning with hints.

---

## Step 3: Independent Practice

Student solves without assistance.

---

## Step 4: Mastery Check

3–5 assessment questions.

---

## Step 5: Positive Completion

Simple encouragement.

Example:

"Great work. You counted correctly."

---

# 10. Student Profile

```typescript
interface StudentProfile {
age: number

level: "A" | "B" | "C"

autismSupportLevel: 1 | 2 | 3

readingLevel: "low" | "medium" | "high"

visualSupport: boolean

audioSupport: boolean

sensorySensitivity: boolean

attentionSpan:
| "short"
| "medium"
| "long"
}
```

---

# 11. Personalization Engine

The system adapts learning based on the student profile.

## Visual Learners

* More images
* Picture-based exercises
* Visual hints

## Reading Learners

* More text
* Reduced visual assistance

## High Support Learners

* More scaffolding
* Additional repetition
* Reduced assessment difficulty

---

# 12. Activity Types

## Visual Counting

Count displayed objects.

## Matching

Match image to answer.

## Drag and Drop

Move items to complete tasks.

## Sequencing

Arrange objects in order.

## Multiple Choice

Select the correct answer.

## Story-Based Questions

Simple visual narratives.

## Real-World Tasks

Examples involving money, time, shopping, and daily activities.

---

# 13. AI Tutor

## Purpose

Provide immediate educational support.

Not a replacement for educators.

---

## Capabilities

### Simplified Explanations

Explain concepts using simpler language.

### Generate Examples

Create additional practice examples.

### Guided Hints

Support problem solving without giving answers immediately.

### Encouragement

Provide positive reinforcement.

---

## Constraints

Avoid:

* Long explanations
* Abstract reasoning
* Complex metaphors
* Open-ended philosophical responses

---

# 14. Adaptive Learning Engine

## Signals Tracked

* Accuracy
* Response Time
* Hint Usage
* Retry Count
* Session Duration

---

## Difficulty Levels

### Easy

* Visual cues
* Frequent hints

### Medium

* Limited hints
* Reduced visual support

### Hard

* Independent solving
* Assessment mode

---

# 15. Parent Dashboard

## Features

### Learning Progress

View completed lessons and mastery.

### Weekly Reports

Visual progress charts.

### Recommendations

Suggested activities based on performance.

### AI Insights

Example:

"Rohan struggles when addition exceeds 10."

---

# 16. Educator Dashboard

## Features

* Student management
* Goal assignment
* Progress tracking
* Intervention recommendations
* Exportable reports

---

# 17. Assessment System

## Formative Assessments

Embedded within lessons.

---

## Summative Assessments

End-of-chapter evaluations.

---

## Mock Examinations

NIOS-style exams.

---

## Exam Simulation Mode

Replicates actual examination conditions.

---

# 18. Reward System

## Learning Journey

Visual progress path.

Example:

```
Counting ✓
Shapes ✓
Addition →
```

---

## Gentle Streaks

Encourage consistency without punishment.

---

# 19. Accessibility Requirements

Minimum WCAG AA compliance.

Must support:

* Keyboard navigation
* Screen readers
* High contrast mode
* Dyslexia-friendly fonts
* Responsive layouts

---

# 20. Content Management System

Internal curriculum authoring system.

Example Content Schema:

```yaml
concept:
counting_1_10

objective:
count objects

activity:
visual_counting

difficulty:
beginner

supports:

* visual
  ```

---

# 21. AI Content Generation Workflow

```
Curriculum
↓
AI Draft
↓
Special Educator Review
↓
Published Lesson
```

AI-generated content must always be reviewed before publication.

---

# 22. Technical Architecture

## Frontend

* Next.js
* React
* TypeScript
* Tailwind CSS
* shadcn/ui

---

## Backend

* NestJS
* Node.js

---

## Database

* PostgreSQL

---

## Vector Search

* pgvector

---

## AI Services

* OpenAI API
* Structured Outputs
* RAG-based curriculum retrieval

---

## Storage

* S3-compatible object storage

---

# 23. MVP Scope (12 Weeks)

## Included

### Level A Mathematics

Topics:

* Counting
* Number Recognition
* Shapes
* Addition
* Subtraction

### Features

* Student Application
* Parent Dashboard
* AI Tutor
* Progress Tracking

---

## Excluded

* Levels B and C
* Educator Dashboard
* Speech Recognition
* Multi-language Support
* Mock Examinations

---

# 24. Roadmap

## Phase 1

Level A Mathematics MVP

---

## Phase 2

Level A Complete Curriculum

---

## Phase 3

Levels B and C

---

## Phase 4

Educator Platform

---

## Phase 5

Therapy Integration

### Occupational Therapy

Goal tracking and recommendations.

### Speech Therapy

Communication-focused learning support.

### Behavior Tracking

Behavioral observations and interventions.

---

# 25. Future AI Capabilities

## Learning Companion

Personalized AI guide.

## Parent Copilot

Learning recommendations and home activities.

## Educator Copilot

Lesson planning and intervention suggestions.

## Curriculum Generation

AI-assisted lesson creation with human review.

---

# 26. Long-Term Vision

Arin Learn becomes the autism-first educational operating system for NIOS learners in India.

The platform supports students, parents, educators, therapists, and curriculum providers through a unified learning ecosystem that enables personalized learning and successful NIOS certification.

