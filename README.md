# LearnEasy — Arin Learn

**Autism-first learning platform for NIOS OBE education**

LearnEasy is a monorepo for Arin Learn — a learning platform designed specifically for children with Autism Spectrum Disorder (ASD) to prepare for National Institute of Open Schooling (NIOS) Open Basic Education examinations.

[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=fff)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-000000?logo=next.js)](https://nextjs.org/)
[![NestJS](https://img.shields.io/badge/NestJS-E0234E?logo=nestjs&logoColor=fff)](https://nestjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-2D3748?logo=prisma)](https://www.prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-06B6D4?logo=tailwindcss&logoColor=fff)](https://tailwindcss.com/)
[![pnpm](https://img.shields.io/badge/pnpm-F69220?logo=pnpm&logoColor=fff)](https://pnpm.io/)

---

## Project Structure

```
learn-easy/
├── apps/
│   ├── student/           # 🧑‍🎓 Student learning app (Next.js)
│   │   ├── pages/         #   Pages: subjects, chapters, concepts, learn flow
│   │   └── lib/           #   Auth context, API client, mock data
│   └── parent/            # 👨‍👩‍👧 Parent dashboard (Next.js)
│       ├── pages/         #   Pages: dashboard, progress, reports, insights
│       └── lib/           #   Auth context, API client, mock data
├── packages/
│   ├── api/               # ⚙️ NestJS REST API
│   │   └── src/           #   Auth, Curriculum, AI modules
│   ├── db/                # 🗄️ Prisma schema, migrations, seed, curriculum tools
│   │   ├── src/           #   Concept schema, pipeline, dependency graph, CLI
│   │   └── prisma/        #   schema.prisma, seed.ts
│   ├── ui/                # 🎨 Shared React component library (low-sensory)
│   │   └── src/           #   VisualCounter, Matching, MultipleChoice, etc.
│   ├── ai/                # 🤖 OpenAI tutor wrapper (gpt-4o-mini)
│   │   └── src/           #   AiTutorService with Zod structured outputs
│   └── config/            # 📐 Centralized TypeScript config
├── curriculum/            # 📚 Curriculum-as-code: YAML concept definitions
│   └── level-a/           #   Level A: math/, language/, evs/
├── knowledge/             # 📖 Project documentation
│   ├── curriculum/        #   Concept schema, validation CLI, dependency graph
│   ├── project-vision.md  #   Vision, mission, roadmap
│   └── architecture.md    #   System architecture, data flow
├── AGENTS.md              # 🤖 Agent instructions for AI coding tools
├── .env.example           # 🔐 Environment variable template
└── pnpm-workspace.yaml    # 📦 pnpm workspace config
```

## Quick Start

### Prerequisites
- [Node.js](https://nodejs.org/) >= 18
- [pnpm](https://pnpm.io/) >= 10
- [PostgreSQL](https://www.postgresql.org/) 16+ (or Docker)
- [OpenAI API Key](https://platform.openai.com/api-keys) (for AI Tutor features)

### Setup

```bash
# 1. Clone the repository
git clone https://github.com/spatnaik1982/LearnEasy.git
cd LearnEasy

# 2. Install dependencies
pnpm install

# 3. Configure environment
cp .env.example .env
# Edit .env with your DATABASE_URL and OPENAI_API_KEY

# 4. Set up the database
pnpm --filter @learn-easy/db exec prisma db push
pnpm --filter @learn-easy/db exec prisma db seed

# 5. Build all packages
pnpm build

# 6. Start development servers
# Terminal 1: API server
pnpm --filter @learn-easy/api start:dev

# Terminal 2: Student app
pnpm --filter @learn-easy/student dev

# Terminal 3: Parent dashboard
pnpm --filter @learn-easy/parent dev
```

### Available Scripts

| Command | Description |
|---------|-------------|
| `pnpm install` | Install all workspace dependencies |
| `pnpm build` | Build all workspace packages |
| `pnpm dev` | Run all apps in development mode |
| `pnpm lint` | Lint all workspaces |
| `pnpm test` | Run tests across workspaces |
| `pnpm curriculum:validate` | Validate all curriculum YAML files |
| `pnpm --filter @learn-easy/api start:dev` | Start NestJS API (watch mode, port 3000) |
| `pnpm --filter @learn-easy/student dev` | Start student frontend (port 3001) |
| `pnpm --filter @learn-easy/parent dev` | Start parent dashboard (port 3002) |
| `pnpm --filter @learn-easy/db exec prisma studio` | Open Prisma Studio (data browser) |

---

## Curriculum Infrastructure

Curriculum content is defined as YAML files under `curriculum/level-a/` and loaded via a validation pipeline:

```
YAML → Validation (ConceptSpec Schema) → Dependency Resolution → Database Seed
```

### Validation

```bash
# Validate all curriculum content
pnpm curriculum:validate

# Verbose per-file output
pnpm curriculum:validate -- --verbose
```

Validation checks:
- **Schema validation**: All required fields present, correct types (Zod)
- **Activity steps**: Each concept has all 5 required steps (observe, guided_practice, independent_practice, mastery_check, positive_completion)
- **Dependency graph**: No circular dependencies, all references resolve
- **ALX compliance**: Sentence length ≤12 words, visual-first, literal language

### Current Curriculum (Level A)

| Subject | Chapters | Concepts |
|---------|----------|----------|
| **Mathematics** | Numbers, Shapes, Addition, Subtraction | 7 concepts (Counting, Number Recognition, Shapes, Addition, Subtraction, Comparing Quantities, Position Words) |
| **Language** | Letter Recognition, Phonics, Sight Words, Reading Readiness, Writing Readiness, Basic Comprehension | 11 concepts |
| **Environmental Science** | Living Things, My Family, Seasons & Weather, Water & Air, My Surroundings | 11 concepts |

---

## MVP Scope (Implemented)

### Level A — NIOS OBE (Grades 1-3 Equivalent)

| Subject | Chapters | Concepts | Activities |
|---------|----------|----------|------------|
| **Mathematics** | Numbers, Shapes, Addition, Subtraction | 7 concepts | Visual Counting, Matching, Multiple Choice, Sequencing |
| **Language** | Letter Recognition, Phonics, Sight Words, Reading Readiness, Writing Readiness, Basic Comprehension | 11 concepts | Visual Counting, Matching, Multiple Choice |
| **Environmental Science** | Living Things, My Family, Seasons & Weather, Water & Air, My Surroundings | 11 concepts | Visual Counting, Matching, Multiple Choice |

### Features

| Feature | Status | Description |
|---------|--------|-------------|
| Student Learning Flow | ✅ | 5-step experience: Observe → Guided Practice → Independent Practice → Mastery Check → Positive Completion |
| Curriculum-as-Code | ✅ | 29 concepts across Math + Language + EVS as validated YAML files |
| Curriculum Validation | ✅ | CLI validation (Zod schema, activity steps, dependency graph, ALX compliance) |
| Parent Dashboard | ✅ | Progress tracking, weekly reports, AI insights |
| AI Tutor | ✅ | GPT-4o-mini powered explanations, hints, encouragement |
| JWT Authentication | ✅ | Student and Parent registration/login |
| Curriculum API | ✅ | REST endpoints for levels, subjects, chapters, concepts, activities |
| Low-Sensory UI | ✅ | Muted palette, large touch targets, keyboard navigable, ARIA support |
| Database Schema | ✅ | Prisma with PostgreSQL, 10 models, seed data |

---

## API Endpoints

### Auth
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/signup/student` | No | Register a new student |
| POST | `/api/auth/signup/parent` | No | Register a new parent |
| POST | `/api/auth/login` | No | Login (returns JWT) |

### Curriculum
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/levels` | JWT | List all levels |
| GET | `/api/levels/:code/subjects` | JWT | Subjects by level |
| GET | `/api/subjects/:id/chapters` | JWT | Chapters by subject |
| GET | `/api/chapters/:id/concepts` | JWT | Concepts by chapter |
| GET | `/api/concepts/:id/activities` | JWT | Activities for a concept |

### AI Tutor
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/ai/tutor` | JWT | Get explanation/hint/encouragement |
| POST | `/api/ai/insights` | JWT | Generate learning insight for a student |

### Progress
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/activities/:id/attempt` | JWT | Submit an activity attempt |
| GET | `/api/students/:id/progress` | JWT | Get student progress |

---

## Product Design Principles

- **Predictability** — Every screen follows familiar layouts. No surprises.
- **One Concept at a Time** — Each lesson focuses on a single learning objective.
- **Visual First** — Show before explaining.
- **Low Sensory Load** — No flashing, loud sounds, complex animations, or excessive colors.
- **Mastery Over Gamification** — Focus on learning progress rather than addictive reward loops.

---

## Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | Next.js 13 (pages router), React 18, TypeScript | Student & Parent web apps |
| **Backend** | NestJS 9, Node.js | REST API |
| **Database** | PostgreSQL 16 + pgvector | Primary data + embeddings |
| **ORM** | Prisma 5 | Type-safe database access |
| **UI Framework** | Tailwind CSS, shadcn/ui | Accessible, low-sensory components |
| **AI** | OpenAI gpt-4o-mini, Zod | Structured AI tutoring |
| **Auth** | Passport.js, JWT, bcrypt | Authentication |
| **Package Manager** | pnpm 10 | Monorepo workspace management |

---

## License

Private — All Rights Reserved
