import { describe, it, expect } from 'vitest';
import { conceptSpecSchema, validateConceptSpec } from '../concept-schema';
import type { ConceptSpec } from '../concept-schema';

// ─── Fixture helpers ───────────────────────────────────────────────────

function validCompleteSpec(): Record<string, unknown> {
  return {
    conceptId: 'addition_basics',
    learningObjective: 'Learner will be able to add two single-digit numbers',
    coreIdea: 'Addition combines two quantities into a single total',
    examples: ['2 + 3 = 5', '7 + 1 = 8'],
    misconceptions: ['Thinking addition always makes numbers larger'],
    supports: { visual: true, audio: false, prompting: true },
    masteryCriteria: 0.8,
    dependencies: ['number_recognition'],
    difficulty: 'beginner',
    estimatedDuration: 15,
  };
}

function validMinimalSpec(): Record<string, unknown> {
  return {
    conceptId: 'number_recognition',
    learningObjective: 'Learner identifies numbers 1 through 10',
    coreIdea: 'Numbers represent quantities',
    examples: ['The number 3 means three objects'],
    misconceptions: [],
    masteryCriteria: 0.9,
  };
}

// ─── Tests for the raw schema ──────────────────────────────────────────

describe('conceptSpecSchema', () => {
  it('parses a valid complete spec', () => {
    const result = conceptSpecSchema.safeParse(validCompleteSpec());
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.conceptId).toBe('addition_basics');
      expect(result.data.difficulty).toBe('beginner');
      expect(result.data.dependencies).toEqual(['number_recognition']);
      expect(result.data.supports?.visual).toBe(true);
      expect(result.data.estimatedDuration).toBe(15);
    }
  });

  it('parses a valid spec with only required fields', () => {
    const result = conceptSpecSchema.safeParse(validMinimalSpec());
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.dependencies).toEqual([]);
      expect(result.data.difficulty).toBe('beginner');
      expect(result.data.supports).toBeUndefined();
      expect(result.data.estimatedDuration).toBeUndefined();
    }
  });

  it('rejects missing learningObjective', () => {
    const data = { ...validMinimalSpec(), learningObjective: undefined };
    const result = conceptSpecSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it('rejects missing coreIdea', () => {
    const data = { ...validMinimalSpec(), coreIdea: undefined };
    const result = conceptSpecSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it('rejects missing examples', () => {
    const data = { ...validMinimalSpec(), examples: undefined };
    const result = conceptSpecSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it('rejects empty examples array', () => {
    const data = { ...validMinimalSpec(), examples: [] };
    const result = conceptSpecSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it('rejects invalid conceptId (uppercase)', () => {
    const data = { ...validMinimalSpec(), conceptId: 'AdditionBasics' };
    const result = conceptSpecSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it('rejects invalid conceptId (spaces)', () => {
    const data = { ...validMinimalSpec(), conceptId: 'addition basics' };
    const result = conceptSpecSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it('rejects invalid conceptId (special chars)', () => {
    const data = { ...validMinimalSpec(), conceptId: 'addition-basics!' };
    const result = conceptSpecSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it('rejects masteryCriteria < 0', () => {
    const data = { ...validMinimalSpec(), masteryCriteria: -0.1 };
    const result = conceptSpecSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it('rejects masteryCriteria > 1', () => {
    const data = { ...validMinimalSpec(), masteryCriteria: 1.5 };
    const result = conceptSpecSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it('accepts masteryCriteria at boundary values 0 and 1', () => {
    const zero = conceptSpecSchema.safeParse({
      ...validMinimalSpec(),
      masteryCriteria: 0,
    });
    expect(zero.success).toBe(true);

    const one = conceptSpecSchema.safeParse({
      ...validMinimalSpec(),
      masteryCriteria: 1,
    });
    expect(one.success).toBe(true);
  });

  it('accepts valid conceptId with numbers and underscores', () => {
    const data = {
      ...validMinimalSpec(),
      conceptId: 'math_101_v2',
    };
    const result = conceptSpecSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it('rejects learningObjective shorter than 10 characters', () => {
    const data = { ...validMinimalSpec(), learningObjective: 'Short' };
    const result = conceptSpecSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it('applies default values for optional fields', () => {
    const data = {
      conceptId: 'test_concept',
      learningObjective: 'Learns to test Zod schemas',
      coreIdea: 'Testing matters',
      examples: ['test case 1'],
      misconceptions: [],
      masteryCriteria: 0.7,
    };
    const result = conceptSpecSchema.safeParse(data);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.difficulty).toBe('beginner');
      expect(result.data.dependencies).toEqual([]);
    }
  });
});

// ─── Tests for validateConceptSpec ─────────────────────────────────────

describe('validateConceptSpec', () => {
  it('returns success with typed data on valid input', () => {
    const result = validateConceptSpec(validCompleteSpec());
    expect(result.success).toBe(true);
    if (result.success) {
      const spec: ConceptSpec = result.data;
      expect(spec.conceptId).toBe('addition_basics');
    }
  });

  it('returns descriptive errors on invalid input', () => {
    const result = validateConceptSpec({ conceptId: 'BAD' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors.length).toBeGreaterThan(0);
      // Every error message should be a non-empty string
      result.errors.forEach((err) => {
        expect(typeof err).toBe('string');
        expect(err.length).toBeGreaterThan(0);
      });
    }
  });

  it('reports multiple field errors at once', () => {
    const result = validateConceptSpec({});
    expect(result.success).toBe(false);
    if (!result.success) {
      // Should have errors for conceptId, learningObjective, coreIdea, examples, masteryCriteria
      expect(result.errors.length).toBeGreaterThanOrEqual(4);
    }
  });
});
