import { describe, it, expect } from 'vitest';
import { validateActivity } from '../activity-schema';
import * as fs from 'fs';
import * as path from 'path';

interface ActivityExample {
  type: string;
  step: string;
  description: string;
  content: Record<string, unknown>;
}

function loadExamples(): ActivityExample[] {
  const filePath = path.join(__dirname, '../../../../apps/student/lib/activity-examples.json');
  const rawJson = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(rawJson) as ActivityExample[];
}

function buildCandidate(
  type: string,
  step: string,
  content: Record<string, unknown>,
): unknown {
  return {
    step,
    type,
    order: 1,
    content: {
      type,
      content,
    },
  };
}

describe('playground examples', () => {
  const examples = loadExamples();

  it('loads at least 42 examples (3 per activity type)', () => {
    expect(examples.length).toBeGreaterThanOrEqual(42);
  });

  it('all examples have required fields', () => {
    for (const ex of examples) {
      expect(ex.type).toBeTruthy();
      expect(ex.step).toBeTruthy();
      expect(ex.description).toBeTruthy();
      expect(ex.content).toBeTruthy();
    }
  });

  it('all examples validate against canonical schema', () => {
    const failures: { index: number; type: string; step: string; errors: string[] }[] = [];

    examples.forEach((ex, i) => {
      const candidate = buildCandidate(ex.type, ex.step, ex.content);
      const result = validateActivity(candidate);
      if (!result.success) {
        failures.push({ index: i, type: ex.type, step: ex.step, errors: result.errors });
      }
    });

    if (failures.length > 0) {
      const msg = failures
        .map((f) => `  [${f.index}] ${f.type} (${f.step}):\n    ${f.errors.join('\n    ')}`)
        .join('\n');
      expect(failures.length).toBe(0);
    }
  });

  it('covers all 14 activity types with at least 3 examples each', () => {
    const typeCounts = new Map<string, number>();
    for (const ex of examples) {
      typeCounts.set(ex.type, (typeCounts.get(ex.type) ?? 0) + 1);
    }

    const missing: string[] = [];
    for (const [type, count] of typeCounts.entries()) {
      if (count < 3) {
        missing.push(`${type} (${count} examples)`);
      }
    }

    expect(missing.length).toBe(0);
  });

  it('covers all lesson steps across examples', () => {
    const steps = new Set(examples.map((ex) => ex.step));
    expect(steps.has('observe')).toBe(true);
    expect(steps.has('guided_practice')).toBe(true);
    expect(steps.has('independent_practice')).toBe(true);
    expect(steps.has('mastery_check')).toBe(true);
  });
});

describe('playground examples — error cases', () => {
  it('rejects content with invalid step', () => {
    const candidate = buildCandidate('visual_counting', 'invalid_step', { count: 3 });
    const result = validateActivity(candidate);
    expect(result.success).toBe(false);
  });

  it('rejects content with invalid type for step', () => {
    const candidate = buildCandidate('chart_reader', 'mastery_check', {
      type: 'bar',
      data: [{ label: 'A', value: 1 }],
      interactive: false,
    });
    const result = validateActivity(candidate);
    expect(result.success).toBe(false);
  });

  it('rejects content with missing required fields', () => {
    const candidate = buildCandidate('multiple_choice', 'mastery_check', {});
    const result = validateActivity(candidate);
    expect(result.success).toBe(false);
  });
});
