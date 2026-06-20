# LearnEasy — AGENTS.md

## Project Overview

LearnEasy (Arin Learn) is an autism-first learning platform that helps children with Autism Spectrum Disorder (ASD) learn and prepare for NIOS Open Basic Education (OBE) examinations. The platform combines structured curriculum delivery, AI-assisted tutoring, parent involvement, and educator collaboration into a single learning ecosystem.

- **Product:** Arin Learn
- **Version:** 1.0 (MVP)
- **Target Users:** Children with ASD (ages 6-14), Parents, Special Educators
- **Curriculum:** NIOS OBE Levels A, B, C (MVP focuses on Level A Mathematics)

## Monorepo Structure

```
learn-easy/
├── apps/
│   ├── student/        # Next.js 13 (pages router) — Student learning app
│   │   ├── pages/      # Page routes + API routes
│   │   └── lib/        # Auth context, API client, mock data
│   └── parent/         # Next.js 13 (pages router) — Parent dashboard
│       ├── pages/
│       └── lib/
├── packages/
│   ├── api/            # NestJS backend — REST API
│   │   └── src/        # Auth, Curriculum, AI modules
│   ├── db/             # Prisma schema, migrations, seed, curriculum tools
│   │   ├── src/        # Concept schema, pipeline, dependency graph, validation CLI
│   │   └── prisma/     # schema.prisma, seed.ts
│   ├── ui/             # Shared React components (low-sensory)
│   │   ├── src/        # VisualCounter, Matching, DragDrop, MCQ, AppShell, FractionVisualizer, PlaceValueChart, GridCounter, ChartReader, ClockWidget, ScaleReader, FillBlank, etc.
│   │   └── dist/       # Built output
│   ├── ai/             # OpenAI wrapper (gpt-4o-mini, Zod structured outputs)
│   ├── llm-config/     # Configurable LLM provider abstraction (OpenAI, Anthropic)
│   │   └── src/        # LlmProvider interface, OpenAIProvider, AnthropicProvider
│   ├── pipeline/       # PDF-to-Curriculum generation pipeline (LangGraph)
│   │   └── src/        # extract/, chunk/, generate-concept/, generate-activities/, validate/, output/, graph/, cli/
│   └── config/         # Centralized TypeScript configs
├── curriculum/         # Curriculum-as-code: validated YAML concept definitions
│   ├── level-a/        # Level A: math/, language/, evs/
│   └── level-b/        # Level B: math/ (pipeline-generated)
├── knowledge/          # Project documentation
│   ├── curriculum/     # Concept schema, validation CLI, dependency graph docs
│   ├── design/         # ALX design guidelines
│   ├── project-management/  # Backlog, issue templates
│   ├── project-vision.md
│   └── architecture.md
├── AGENTS.md           # This file — agent instructions
├── .env.example        # Environment variable template
└── pnpm-workspace.yaml
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 13 (pages router), React 18, TypeScript |
| Backend | NestJS 9, Node.js |
| Database | PostgreSQL 16 + pgvector |
| ORM | Prisma 5 |
| UI | Tailwind CSS, shadcn/ui, Lucide React |
| AI | OpenAI (gpt-4o-mini), Zod structured outputs |
| Auth | JWT (Passport.js, bcrypt) |
| Package Manager | pnpm 10 |
| Language | TypeScript (strict mode) |

## Development Conventions

### Code Style
- TypeScript strict mode everywhere
- ESLint + Prettier for formatting
- NestJS modules use `*.module.ts`, `*.controller.ts`, `*.service.ts`, `dto/*.dto.ts`
- Next.js pages use `pages/` directory (not app router)
- Barrel exports in `packages/ui/src/index.ts`

### Naming
- **Files**: kebab-case (`auth.controller.ts`, `mock-data.ts`)
- **Classes**: PascalCase (`JwtAuthGuard`, `AiTutorService`)
- **Functions/Variables**: camelCase
- **Types/Interfaces**: PascalCase
- **DTOs**: PascalCase (`SignupStudentDto`)

### Database
- All models use `cuid()` for primary keys
- Timestamps: `createdAt @default(now())`, `updatedAt @updatedAt`
- Relations explicitly defined on both sides
- Unique constraints where appropriate (`@@unique([studentId, conceptId])`)

### API Design
- RESTful endpoints under `/api/`
- All endpoints except auth require JWT Bearer token
- Request validation via `class-validator` DTOs
- Responses follow `{ data: ... }` or `{ message: "...", statusCode: 400 }`
- Auth header: `Authorization: Bearer <token>`

## Available Scripts

| Command | Scope | Description |
|---------|-------|-------------|
| `pnpm install` | root | Install all workspace dependencies |
| `pnpm build` | all | Build all workspace packages |
| `pnpm dev` | all | Run dev servers for all apps |
| `pnpm lint` | all | Lint all workspaces |
| `pnpm test` | all | Run tests across workspaces |
| `pnpm curriculum:validate` | root | Validate all curriculum YAML files |
| `pnpm curriculum:generate` | root | Generate curriculum from PDF (LangGraph pipeline) |
| `pnpm --filter @learn-easy/pipeline test` | pipeline | Run pipeline tests |
| `pnpm --filter @learn-easy/llm-config test` | llm-config | Run LLM config tests |
| `pnpm --filter @learn-easy/api start:dev` | api | Start NestJS in watch mode |
| `pnpm --filter @learn-easy/student dev` | student | Start student Next.js app |
| `pnpm --filter @learn-easy/parent dev` | parent | Start parent Next.js app |
| `pnpm --filter @learn-easy/db prisma:studio` | db | Open Prisma Studio |

## AI Tutor Constraints

When working with the AI Tutor (packages/ai), adhere to these product constraints:

- No long explanations (max 3 short sentences)
- No abstract reasoning
- No complex metaphors
- No open-ended philosophical responses
- Responses should be concrete, visual, and action-oriented
- Use gpt-4o-mini for cost-effective tutoring
- Use Zod structured outputs for type-safe responses
- Handle API failures with graceful fallback messages

## Design Guidelines

Always refer to the **Autism Learning Experience (ALX) Design Guidelines** before making UI changes.

The formal design system is documented in:
- `knowledge/design/design-guidelines.md` — Full ALX framework (703 lines) covering Core Design Philosophy (ALX-1 through ALX-8), Visual Design, Typography, Layout, Interaction Design, Motion, Audio, Language/Microcopy, Error Prevention, Learning-Specific UX, Personalization, AI Tutor Guidelines, and a Design Review Checklist
- `knowledge/design/DESIGN.md` — Token spec with exact color hex values (Serene Structure palette), typography definitions (Inter font stack, sizes, weights, line heights), spacing units (8px base, 48px component separation), rounded corner values, elevation/shadow specs, and component-level guidance for the lesson flow

### Key ALX Principles (Quick Reference)

| Principle | Summary |
|-----------|---------|
| **ALX-1 Predictability** | Every screen feels familiar; navigation, actions, and lesson structure never change |
| **ALX-2 Visual First** | Show before explaining; pair text with imagery |
| **ALX-3 One Concept at a Time** | One concept, one task, one decision per screen |
| **ALX-4 Visible Progress** | Step indicators, question counts, completion status always shown |
| **ALX-5 Safe Mistakes** | Unlimited retries, no penalties, no failure states |
| **ALX-6 Controlled Sensory Environment** | No autoplay audio/video, no flashing, user controls for sound/motion/contrast |
| **ALX-7 Routine-Based Learning** | Fixed lesson sequence: Observe → Practice → Quiz → Complete |
| **ALX-8 Mastery-Based Progression** | Emphasize skills learned, not points/leaderboards |

### Critical Visual Specs

- **Colors**: Soft Blue (#5D87B1), Muted Teal (#76A5AF), Muted Green (#8FB996), Soft Amber (#EBC06D), Soft Coral (#E5989B), Warm Off-White (#F9F7F2), Slate Text (#374151)
- **Typography**: Inter font family, 16px body minimum, 20px+ questions, 24px+ headings, left-aligned, line height 1.5–1.75
- **Touch Targets**: Minimum 56x56px (preferred), 16px minimum spacing between interactive elements
- **Motion**: Only fade transitions and small scale changes, 150–300ms duration, no bounce/parallax/infinite loops
- **Button Labels**: Explicit literalism — "Submit Answer", "Continue Lesson", never vague "Go" or "Next" without context
- **Screen Structure**: Header → Progress Indicator → Main Learning Area → Primary Action → Secondary Actions

### Before implementing any UI feature, run the Design Review Checklist (section 15 of design-guidelines.md)

## Branch Strategy

- Feature branches: `feat/<feature-name>`
- Bug fixes: `fix/<bug-description>`
- Merge to `main` via PR (squash merge preferred)
- Commit messages: conventional commits (`feat:`, `fix:`, `chore:`, `docs:`)
- Reference issues in commit body: `Closes #N`
