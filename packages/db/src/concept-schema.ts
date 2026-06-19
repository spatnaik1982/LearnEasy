import { z, ZodIssue } from 'zod';

// ─── Concept ID pattern ────────────────────────────────────────────────
// Lowercase with underscores: e.g. "addition_basics", "fractions_101"
const conceptIdPattern = /^[a-z]+[a-z0-9_]*$/;

// ─── Difficulty enum ───────────────────────────────────────────────────
const difficultyEnum = z.enum(['beginner', 'intermediate', 'advanced']);

// ─── Supports object (optional booleans) ───────────────────────────────
const supportsSchema = z.object({
  visual: z.boolean().optional(),
  audio: z.boolean().optional(),
  prompting: z.boolean().optional(),
});

// ─── Full concept specification schema ─────────────────────────────────
export const conceptSpecSchema = z.object({
  conceptId: z
    .string()
    .regex(conceptIdPattern, {
      message:
        'conceptId must be lowercase with underscores, e.g. "addition_basics"',
    }),

  learningObjective: z
    .string()
    .min(10, 'learningObjective must be at least 10 characters'),

  coreIdea: z
    .string()
    .min(1, 'coreIdea is required'),

  examples: z
    .array(z.string())
    .min(1, 'At least one example is required'),

  misconceptions: z
    .array(z.string()),

  supports: supportsSchema.optional(),

  masteryCriteria: z
    .number()
    .min(0, 'masteryCriteria must be between 0 and 1')
    .max(1, 'masteryCriteria must be between 0 and 1'),

  dependencies: z
    .array(z.string())
    .optional()
    .default([]),

  difficulty: difficultyEnum.optional().default('beginner'),

  estimatedDuration: z
    .number()
    .positive('estimatedDuration must be a positive number')
    .optional(),
});

// ─── Inferred TypeScript type ──────────────────────────────────────────
export type ConceptSpec = z.infer<typeof conceptSpecSchema>;

// ─── Validation function ───────────────────────────────────────────────
export function validateConceptSpec(
  data: unknown,
): { success: true; data: ConceptSpec } | { success: false; errors: string[] } {
  const result = conceptSpecSchema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  const errors = result.error.issues.map(
    (issue: ZodIssue) => `${issue.path.join('.')}: ${issue.message}`,
  );

  return { success: false, errors };
}
