# LearnEasy — Architecture Guide

## System Architecture Overview

```
                    ┌──────────────┐     ┌──────────────┐
                    │  Student App  │     │ Parent Dash  │
                    │ (Next.js 13)  │     │ (Next.js 13) │
                    │  :3001        │     │  :3002        │
                    └──────┬───────┘     └──────┬───────┘
                           │                    │
                           └────────┬───────────┘
                                    │ HTTP (REST)
                                    ▼
                          ┌─────────────────┐
                          │   NestJS API     │
                          │   :3000/api/*    │
                          │                  │
                          │  Auth Module     │
                          │  Curriculum API  │
                          │  AI Tutor        │
                          └────────┬─────────┘
                                   │
                                   ▼
                          ┌─────────────────┐
                          │   PostgreSQL     │
                          │   + pgvector     │
                          │   :5432          │
                          └─────────────────┘
```

---

## Directory Structure — Detailed

```
learn-easy/
├── apps/
│   ├── student/                          # Next.js student learning app
│   │   ├── pages/
│   │   │   ├── subjects.tsx              # Subject selection
│   │   │   ├── subjects/[id]/chapters.tsx
│   │   │   ├── chapters/[id]/concepts.tsx
│   │   │   ├── learn/[conceptId].tsx     # 5-step learning flow
│   │   │   └── _app.tsx                  # Root wrapper (AuthProvider)
│   │   ├── lib/
│   │   │   ├── api.ts                    # API abstraction layer
│   │   │   ├── auth.tsx                  # Auth context (JWT, localStorage)
│   │   │   └── mockData.ts               # Development mock data
│   │   ├── styles/
│   │   │   └── globals.css               # Tailwind directives
│   │   ├── next-env.d.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── parent/                           # Next.js parent dashboard
│       ├── pages/
│       │   ├── dashboard.tsx             # Overview (child selector, stats)
│       │   ├── dashboard/
│       │   │   ├── progress.tsx          # Concept mastery bars
│       │   │   ├── reports.tsx           # Weekly bar charts
│       │   │   └── insights.tsx          # AI insights
│       │   └── _app.tsx
│       ├── lib/
│       │   ├── api.ts
│       │   ├── auth.tsx
│       │   ├── dashboard-layout.tsx
│       │   └── mockData.ts
│       ├── styles/
│       │   └── globals.css
│       └── package.json
│
├── packages/
│   ├── api/                              # NestJS backend
│   │   ├── src/
│   │   │   ├── main.ts                   # Entry point (ValidationPipe, CORS)
│   │   │   ├── app.module.ts
│   │   │   │
│   │   │   ├── prisma/
│   │   │   │   ├── prisma.module.ts
│   │   │   │   └── prisma.service.ts
│   │   │   │
│   │   │   ├── auth/
│   │   │   │   ├── auth.module.ts
│   │   │   │   ├── auth.controller.ts    # /api/auth/signup, /api/auth/login
│   │   │   │   ├── auth.service.ts
│   │   │   │   ├── jwt.strategy.ts
│   │   │   │   ├── jwt-auth.guard.ts
│   │   │   │   └── dto/
│   │   │   │       ├── signup-student.dto.ts
│   │   │   │       ├── signup-parent.dto.ts
│   │   │   │       └── login.dto.ts
│   │   │   │
│   │   │   ├── curriculum/
│   │   │   │   ├── curriculum.module.ts
│   │   │   │   ├── curriculum.controller.ts  # /api/levels, /api/subjects, etc.
│   │   │   │   └── curriculum.service.ts
│   │   │   │
│   │   │   └── ai/
│   │   │       ├── ai.module.ts
│   │   │       ├── ai.controller.ts       # /api/ai/tutor, /api/ai/insights
│   │   │       ├── ai.service.ts
│   │   │       └── dto/
│   │   │           ├── tutor-request.dto.ts
│   │   │           └── insight-request.dto.ts
│   │   │
│   │   ├── nest-cli.json
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── db/                              # Database layer
│   │   ├── prisma/
│   │   │   ├── schema.prisma             # Full schema (10 models)
│   │   │   └── seed.ts                   # MVP curriculum data
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── ui/                              # Shared UI components
│   │   ├── src/
│   │   │   ├── index.ts                 # Barrel exports
│   │   │   ├── utils.ts                 # cn() helper
│   │   │   ├── VisualCounter.tsx        # Emoji grid counter
│   │   │   ├── Matching.tsx             # Click-to-match pairs
│   │   │   ├── DragDrop.tsx             # Click-item-then-target
│   │   │   ├── Sequencing.tsx           # Arrange in order
│   │   │   ├── MultipleChoice.tsx       # Select correct answer
│   │   │   ├── PositiveCompletion.tsx   # Encouragement screen
│   │   │   └── ProgressBar.tsx          # Step indicator
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── ai/                              # AI service wrapper
│   │   ├── src/
│   │   │   └── index.ts                # AiTutorService (OpenAI + Zod)
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── config/                          # Shared configs
│       ├── src/
│       │   └── index.ts
│       ├── package.json
│       └── tsconfig.json
│
├── knowledge/                           # Project documentation
│   ├── project-vision.md
│   └── architecture.md
├── AGENTS.md
├── .env.example
├── .eslintrc.js
├── .gitignore
├── .prettierrc
├── package.json                         # Root workspace config
├── pnpm-lock.yaml
├── pnpm-workspace.yaml
└── README.md
```

---

## Database Schema

10 models synced to PostgreSQL:

```
Parent (1) ──< Student (*)
Level (1) ──< Subject (*) ──< Chapter (*) ──< Concept (*) ──< Activity (*)
Student (*) ──< ActivityAttempt (>1)
Student (*) ──< Progress (>1) >── Concept (*)
Student (*) ──< Session (*)
```

### Model Details

| Model | Key Fields | Purpose |
|-------|-----------|---------|
| **Student** | email, age, level, autismSupportLevel, readingLevel, visualSupport, audioSupport, attentionSpan | Learner profiles with ASD support needs |
| **Parent** | email, name, hashed password | Guardian accounts linked to students |
| **Level** | code (A/B/C), name | NIOS education levels |
| **Subject** | code (MATH/LANG/EVS), name | Subjects per level |
| **Chapter** | code (CH1-CH4), name, order | Chapters per subject |
| **Concept** | code, name, objective, difficulty | Single learning objective per chapter |
| **Activity** | type, step, order, content (JSON) | Typed activities with step context |
| **ActivityAttempt** | correct, hintsUsed, retryCount, timeSpent | Student attempt tracking |
| **Progress** | mastery (0.0-1.0), completed | Per-student concept mastery tracking |
| **Session** | startTime, endTime, duration | Learning session tracking |

---

## API Endpoints

### Auth (Public)

| Method | Endpoint | Body | Response |
|--------|----------|------|----------|
| POST | `/api/auth/signup/student` | `{ email, name, password, age, level, ... }` | `{ access_token, student }` |
| POST | `/api/auth/signup/parent` | `{ email, name, password }` | `{ access_token, parent }` |
| POST | `/api/auth/login` | `{ email, password, role }` | `{ access_token, user }` |

### Curriculum (JWT Required)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/levels` | List all levels with subject count |
| GET | `/api/levels/:code/subjects` | Subjects by level code |
| GET | `/api/subjects/:id/chapters` | Chapters by subject ID |
| GET | `/api/chapters/:id/concepts` | Concepts by chapter ID |
| GET | `/api/concepts/:id/activities` | Activities by concept ID |

### AI Tutor (JWT Required)

| Method | Endpoint | Body | Description |
|--------|----------|------|-------------|
| POST | `/api/ai/tutor` | `{ conceptId, query?, type }` | Explanation, hint, or encouragement |
| POST | `/api/ai/insights` | `{ studentId }` | AI-generated learning insight |

---

## Data Flow — Student Learning

```
1. Student opens apps/student
2. Fetches subjects → GET /api/levels/A/subjects
3. Selects subject → fetches chapters → GET /api/subjects/:id/chapters
4. Selects chapter → fetches concepts → GET /api/chapters/:id/concepts
5. Selects concept → fetches activities → GET /api/concepts/:id/activities
6. Renders 5-step flow using UI components from @learn-easy/ui
7. On activity complete → POST /api/activities/:id/attempt
8. On concept complete → Progress updated in DB
9. Optionally: POST /api/ai/tutor for help
```

---

## Authentication Flow

```
Login/Signup → POST /api/auth/login or /auth/signup/student
  ↓ Returns JWT access_token
  ↓ Frontend stores token in localStorage
  ↓ Subsequent requests include Authorization: Bearer <token>
  ↓ JwtAuthGuard validates and attaches user to request
```

---

## AI Tutor Flow

```
Student requests help → POST /api/ai/tutor
  ↓ AI service fetches concept details from DB (RAG context)
  ↓ Constructs prompt with product constraints
  ↓ Calls OpenAI gpt-4o-mini with Zod structured output
  ↓ Returns typed response { explanation?, hint?, encouragement? }
  ↓ Frontend displays in appropriate UI component
```

---

## Curriculum Generation Pipeline (EPIC-13)

The PDF-to-Curriculum pipeline is an automated LangGraph.js state graph that generates validated curriculum YAML files from NIOS OBE PDF textbooks:

```
                          ┌─────────────────────┐
                          │   NIOS OBE PDF       │
                          │   (e.g., Level B     │
                          │    Math textbook)     │
                          └────────┬────────────┘
                                   │
                                   ▼
                    ┌──────────────────────────────┐
                    │ 1. Extract (pdf-parse)        │
                    │    → pages, chapters, sections │
                    │    → headings, examples, exer. │
                    └──────────────┬───────────────┘
                                   │
                                   ▼
                    ┌──────────────────────────────┐
                    │ 2. Chunk (LLM)                │
                    │    → chapter → topics         │
                    │    → ConceptCandidates[]       │
                    └──────────────┬───────────────┘
                                   │
                                   ▼
                    ┌──────────────────────────────┐
                    │ 3. Generate Concepts (LLM)    │
                    │    → ConceptRegistry           │
                    │    → GeneratedConcept[]         │
                    │    (Zod validated)             │
                    └──────────────┬───────────────┘
                                   │
                                   ▼
                    ┌──────────────────────────────┐
                    │ 4. Generate Activities (LLM)  │
                    │    → 5-step ALX-7 sequence    │
                    │    → GeneratedActivity[]       │
                    └──────────────┬───────────────┘
                                   │
                                   ▼
                    ┌──────────────────────────────┐
                    │ 5. Validate (Curriculum       │
                    │    Pipeline)                  │
                    │    → Zod schema check         │
                    │    → Dependency resolution    │
                    │    → ALX compliance           │
                    │    ┌──────┐    ┌───────────┐ │
                    │    │ Pass │───→│ 6. Output │ │
                    │    └──────┘    │ (js-yaml)  │ │
                    │    ┌────────┐  │  YAML files│ │
                    │    │ Retry  │  │ curriculum/│ │
                    │    │ (x3)   │  │ level-b/   │ │
                    │    └────────┘  │ subject/   │ │
                    └───────────────┴────────────┘
```

### Key Packages

| Package | Role |
|---------|------|
| `@learn-easy/llm-config` | LLM provider abstraction (OpenAI, Anthropic) configurable via env vars |
| `@learn-easy/pipeline` | LangGraph.js state graph with 6 pipeline stages |
| `@learn-easy/db` | Zod schemas (`conceptSpecSchema`), validation CLI, dependency graph |

### LLM Provider Architecture

```
Environment Variables
  LLM_PROVIDER=openai|anthropic
  LLM_MODEL=gpt-4o-mini|claude-sonnet-4-20250514
  LLM_API_KEY=<key>

┌──────────────────────────────────────────┐
│           createLlmProvider()             │
│  (packages/llm-config/src/index.ts)       │
└──────┬───────────────────────┬───────────┘
       │                       │
       ▼                       ▼
┌──────────────┐     ┌──────────────────┐
│ OpenAIProvider│     │AnthropicProvider │
│ (gpt-4o-mini) │     │ (tool use)       │
│ zodResponse   │     │ Zod via tools    │
│ Format        │     │                  │
└──────────────┘     └──────────────────┘
       │                       │
       └───────┬───────────────┘
               ▼
       ┌─────────────────┐
       │ generateStructured│
       │ (prompt, schema) │
       └─────────────────┘
```

---

## Design Guidelines

### Color Palette (Low-Sensory)
- **Primary**: Slate/blue tones (#334155, #3B82F6)
- **Success**: Muted green (#22C55E, desaturated)
- **Background**: Warm white (#FAFAF9)
- **Text**: Dark slate (#1E293B)
- **Accent**: Soft teal (#14B8A6)
- **Avoid**: Bright reds, yellows, neons, high-saturation colors

### Accessibility
- WCAG AA minimum compliance
- Keyboard navigation on all interactive elements
- Screen reader announcements (aria-live regions)
- Visible focus indicators (focus:ring-2)
- 44px minimum touch targets
- High contrast mode toggle
- Dyslexia-friendly font option (OpenDyslexic)

### Sensory Load Reduction
- Zero animations or transitions
- No auto-playing content
- No flashing or blinking elements
- Minimal color changes on hover (underline or subtle border only)
- Consistent layout across all screens
- Clear visual hierarchy with ample whitespace

---

## Environment Variables

```
# Database
DATABASE_URL="postgresql://user:***@localhost:5432/learneasy"

# OpenAI (for AI Tutor)
OPENAI_API_KEY=***

# LLM Provider Configuration (for Curriculum Pipeline — EPIC-13)
LLM_PROVIDER=openai              # "openai" or "anthropic" (default: openai)
LLM_MODEL=gpt-4o-mini            # Model name (default: gpt-4o-mini)
LLM_API_KEY=***                  # Optional: falls back to OPENAI_API_KEY or ANTHROPIC_API_KEY
LLM_MAX_TOKENS=4096              # Max tokens (default: 4096)
LLM_TEMPERATURE=0.3              # Generation temperature (default: 0.3)

# API URL (frontend uses this)
NEXT_PUBLIC_API_URL=http://localhost:3000/api

# Mock Mode (skip API calls in development)
NEXT_PUBLIC_USE_MOCK=true

# JWT Secret (for auth tokens)
JWT_SECRET=***
```
