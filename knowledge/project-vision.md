# LearnEasy — Project Vision

## Product Identity

**Product Name:** Arin Learn  
**Monorepo Name:** LearnEasy  
**Version:** 1.0 (MVP)  
**Status:** Development  

---

## Mission

Enable every autistic learner to confidently master foundational academic skills and successfully complete NIOS education through personalized and accessible learning experiences.

## Vision Statement

To become India's leading autism-friendly educational platform aligned with the NIOS curriculum.

---

## Problem Statement

### What existing products assume:
- Strong verbal comprehension
- Long attention spans
- Independent learning ability
- Text-heavy learning
- Standardized assessment approaches

### What autistic learners actually need:
- **Visual-first instruction** — Show before explaining
- **Predictable learning structures** — Same layout every screen
- **Smaller learning steps** — One concept at a time
- **Repetition without frustration** — Gentle, no punishment for mistakes
- **Personalized pacing** — Each student learns at their own speed
- **Reduced sensory stimulation** — No flashing effects, loud sounds, complex animations, or excessive colors

Existing NIOS resources are not optimized for these needs. LearnEasy fills this gap.

---

## Product Goals

| Goal | Description | Success Metric |
|------|-------------|----------------|
| **G1 — Curriculum Mastery** | Help students achieve mastery of NIOS concepts | >70% concept mastery, >75% NIOS pass rate |
| **G2 — Autism-Friendly Learning** | Reduce barriers from communication, sensory, and executive functioning challenges | >80% lesson completion, <10% abandonment rate |
| **G3 — Parent Empowerment** | Enable parents to actively support learning | >60% weekly active parents, >50% weekly report views |
| **G4 — Educator Collaboration** | Allow educators to monitor and guide learning | Monthly educator engagement >70% |

---

## User Personas

### Student — "Rohan"
- Age 10, Autism Level 1
- Strong visual learner, short attention span
- Enjoys routines and predictable interfaces
- Needs visual instruction, consistent layouts, small learning chunks

### Parent — "Priya"
- Limited NIOS knowledge
- Unsure how to teach concepts effectively
- Needs clear progress tracking, actionable recommendations, simple reports

### Special Educator
- Monitors multiple students
- Assigns goals and tracks progress
- Needs individualized learning plans and exportable reports

---

## Product Principles

| Principle | Description |
|-----------|-------------|
| **Predictability** | Every screen follows familiar layouts. No surprises. |
| **One Concept at a Time** | Each lesson focuses on a single learning objective. |
| **Visual First** | Show before explaining. |
| **Low Sensory Load** | No flashing, loud sounds, complex animations, or excessive colors. |
| **Mastery Over Gamification** | Focus on learning progress rather than addictive reward loops. |

---

## Curriculum Scope — Level A (NIOS OBE equivalent to Grades 1-3)

### Mathematics

| Chapter | Concepts | Activities |
|---------|----------|------------|
| Numbers | Counting 1-10, Number Recognition 1-10, Comparing Quantities | Visual Counting, Matching, Multiple Choice |
| Shapes | Basic Shapes, Position Words | Visual Counting, Matching, Multiple Choice |
| Addition | Addition within 10 | Visual Counting, Multiple Choice |
| Subtraction | Subtraction within 10 | Visual Counting, Multiple Choice |

### Language

| Chapter | Concepts | Activities |
|---------|----------|------------|
| Letter Recognition | Letters A-E, Letters F-J | Visual Counting, Matching, Multiple Choice |
| Phonics | Initial Sounds, Rhyming Words | Visual Counting, Matching, Multiple Choice |
| Sight Words | Basic Words, Common Words | Visual Counting, Matching, Multiple Choice |
| Reading Readiness | Print Awareness | Visual Counting, Matching, Multiple Choice |
| Writing Readiness | Pre-Writing Shapes, Letter Formation | Visual Counting, Matching, Multiple Choice |
| Basic Comprehension | Picture Story Order, Simple Instructions | Visual Counting, Matching, Multiple Choice |

### Environmental Science

| Chapter | Concepts | Activities |
|---------|----------|------------|
| Living Things | Living vs Non-Living, Plants & Animals | Visual Counting, Matching, Multiple Choice |
| My Family | Family Members, My Home | Visual Counting, Matching, Multiple Choice |
| Seasons & Weather | Weather Types, Seasons, Dressing for Weather | Visual Counting, Matching, Multiple Choice |
| Water & Air | Water Sources, Uses of Water | Visual Counting, Matching, Multiple Choice |
| My Surroundings | Neighborhood Places, Transport Basics | Visual Counting, Matching, Multiple Choice |

Total: **29 concepts** across 3 subjects (all defined as validated YAML curriculum files)

---

## Learning Architecture

```
Level
└── Subject
    └── Chapter
        └── Concept
            └── Activity (type × step)
```

### Learning Experience Flow

Every concept follows the same 5-step structure:

1. **Observe** — Visual introduction to the concept
2. **Guided Practice** — Interactive learning with hints
3. **Independent Practice** — Student solves without assistance
4. **Mastery Check** — 3–5 assessment questions
5. **Positive Completion** — Simple encouragement

### Activity Types
- Visual Counting
- Matching (click-to-match pairs)
- Drag and Drop
- Sequencing
- Multiple Choice
- Story-Based Questions
- Real-World Tasks

---

## Product Roadmap

| Phase | Scope | Status |
|-------|-------|--------|
| **Phase 1** | Level A Complete Curriculum (Math, Language, EVS) + Curriculum Infrastructure | ✅ Complete |
| **Phase 2** | Learning Experience (TEACCH framework, Activity Engine, Accessibility) | ⬜ Next |
| **Phase 3** | Adaptive Learning (ABA engine, Learning Profiles) | ⬜ Future |
| **Phase 4** | AI Layer (AI Tutor UI, Curriculum Generation) | ⬜ Future |
| **Phase 5** | Parent Experience & Authoring Tools | ⬜ Future |

---

## Long-Term Vision

Arin Learn becomes the autism-first educational operating system for NIOS learners in India. The platform supports students, parents, educators, therapists, and curriculum providers through a unified learning ecosystem that enables personalized learning and successful NIOS certification.
