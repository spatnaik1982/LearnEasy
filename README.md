# LearnEasy Monorepo

This is a monorepo for the LearnEasy application, managed with pnpm.

## Structure

- `apps/student`: Next.js frontend for students
- `apps/parent`: Next.js frontend for parent dashboard
- `packages/api`: NestJS backend
- `packages/db`: Prisma schema and migrations
- `packages/ui`: Shared component library with Tailwind and shadcn/ui
- `packages/ai`: OpenAI API wrapper and RAG utilities
- `packages/config`: Centralized config and types

## Getting started

Install dependencies:

```bash
pnpm install
```

## Development

To run all apps in development:

```bash
pnpm dev
```

This will run the `dev` script in each workspace that has one.

## License

Private