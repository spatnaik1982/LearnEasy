import { describe, it, expect } from 'vitest';
import { selectTypeForStep, selectTypesForConcept } from '../type-selector';
import type { GeneratedConcept } from '../../types';

function makeConcept(overrides: Partial<GeneratedConcept> = {}): GeneratedConcept {
  return {
    conceptId: 'test_concept',
    chapterCode: 'B-CH1',
    chapterName: 'Test Chapter',
    learningObjective: 'Count objects from 1 to 10',
    coreIdea: 'Counting is assigning one number to each object',
    examples: ['Count 3 apples', 'Count 5 balls'],
    misconceptions: ['Skipping objects while counting'],
    supports: { visual: true },
    masteryCriteria: 3,
    difficulty: 'beginner',
    estimatedDuration: 10,
    dependencies: [],
    ...overrides,
  };
}

describe('selectTypeForStep', () => {
  it('returns the only allowed type for steps with a single type', () => {
    const concept = makeConcept();
    expect(selectTypeForStep('positive_completion', concept)).toBe('visual_counting');
  });

  it('returns multiple_choice for mastery_check (single allowed type after fill_blank is keyword-rare)', () => {
    const concept = makeConcept();
    const result = selectTypeForStep('mastery_check', concept);
    expect(['multiple_choice', 'fill_blank']).toContain(result);
  });

  it('is deterministic — same concept yields same type', () => {
    const concept = makeConcept({
      learningObjective: 'Match shapes to their names',
      coreIdea: 'Matching pairs of shapes and names',
      examples: ['Match circle to Circle', 'Match square to Square'],
    });
    const a = selectTypeForStep('guided_practice', concept);
    const b = selectTypeForStep('guided_practice', concept);
    expect(a).toBe(b);
  });

  it('selects matching when concept keywords match', () => {
    const concept = makeConcept({
      learningObjective: 'Match each shape to its name',
      coreIdea: 'Match shapes to names by pairing',
      examples: ['Match circle to Circle', 'Match square to Square'],
    });
    expect(selectTypeForStep('guided_practice', concept)).toBe('matching');
  });

  it('selects visual_counting when counting keywords are present', () => {
    const concept = makeConcept({
      learningObjective: 'Count the total number of objects',
      coreIdea: 'Counting quantity of objects',
      examples: ['Count 5 apples', 'How many balls?'],
    });
    expect(selectTypeForStep('observe', concept)).toBe('visual_counting');
  });

  it('throws on unknown step', () => {
    const concept = makeConcept();
    expect(() => selectTypeForStep('unknown_step', concept)).toThrow(/No valid types/);
  });
});

describe('selectTypesForConcept', () => {
  it('returns a type for all 5 steps', () => {
    const concept = makeConcept();
    const types = selectTypesForConcept(concept);
    expect(Object.keys(types).sort()).toEqual(
      ['guided_practice', 'independent_practice', 'mastery_check', 'observe', 'positive_completion'].sort(),
    );
  });

  it('always uses multiple_choice for mastery_check', () => {
    const concept = makeConcept();
    const types = selectTypesForConcept(concept);
    expect(types.mastery_check).toBe('multiple_choice');
  });

  it('always uses visual_counting for positive_completion', () => {
    const concept = makeConcept();
    const types = selectTypesForConcept(concept);
    expect(types.positive_completion).toBe('visual_counting');
  });
});
