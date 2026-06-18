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
│   ├── db/             # Prisma schema, migrations, seed
│   │   └── prisma/     # schema.prisma, seed.ts
│   ├── ui/             # Shared React components (low-sensory)
│   │   └── src/        # VisualCounter, Matching, DragDrop, MCQ, etc.
│   ├── ai/             # OpenAI wrapper (gpt-4o-mini, Zod structured outputs)
│   └── config/         # Centralized TypeScript configs
├── knowledge/          # Project documentation
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

## UI Design Principles

- **Low sensory load**: No flashing, loud sounds, complex animations, or excessive colors
- **Muted palette**: Slate/blue/green tones, no bright reds/yellows
- **Large touch targets**: Minimum 44px on all interactive elements
- **Keyboard navigation**: All components operable via keyboard
- **ARIA attributes**: Proper labels, roles, and states for screen readers
- **High contrast mode**: CSS class toggle available
- **Dyslexia-friendly font**: Option available

## Branch Strategy

- Feature branches: `feat/<feature-name>`
- Bug fixes: `fix/<bug-description>`
- Merge to `main` via PR (squash merge preferred)
- Commit messages: conventional commits (`feat:`, `fix:`, `chore:`, `docs:`)
- Reference issues in commit body: `Closes #N`
