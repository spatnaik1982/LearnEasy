import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { mkdirSync, writeFileSync, rmSync, existsSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { runCurriculumPipeline } from '../curriculum-pipeline';
import type { PipelineResult } from '../curriculum-pipeline';

// ── Test helpers ────────────────────────────────────────────────

let testDir: string;

function makeTestDir(): string {
  const dir = join(tmpdir(), `curriculum-test-${Date.now()}-${Math.random().toString(36).slice(2)}`);
  mkdirSync(dir, { recursive: true });
  return dir;
}

function writeYaml(dir: string, subpath: string, content: string): string {
  const fullPath = join(dir, subpath);
  const parentDir = fullPath.substring(0, fullPath.lastIndexOf('/'));
  mkdirSync(parentDir, { recursive: true });
  writeFileSync(fullPath, content, 'utf-8');
  return fullPath;
}

function runOnDir(dir: string): PipelineResult {
  return runCurriculumPipeline(dir);
}

// ── Fixtures ────────────────────────────────────────────────────

const VALID_CONCEPT_YAML = `conceptId: counting_1_10
chapter:
  code: CH1
  name: Numbers
learningObjective: "Count objects from 1 to 10 with one-to-one correspondence"
coreIdea: "Each number represents a specific quantity"
examples:
  - "Count 3 apples"
  - "Count 5 stars"
misconceptions:
  - "Skipping objects"
  - "Double counting"
supports:
  visual: true
masteryCriteria: 0.8
difficulty: beginner
estimatedDuration: 15
dependencies: []
activities:
  - step: "observe"
    type: "visual_counting"
    order: 1
    content:
      description: "Observe apples"
      items: ["🍎"]
      count: 3
  - step: "mastery_check"
    type: "multiple_choice"
    order: 2
    content:
      questions:
        - question: "How many?"
          options: ["1", "2"]
          correctIndex: 0
`;

const CONCEPT_A_YAML = `conceptId: concept_a
chapter:
  code: CH1
  name: Numbers
learningObjective: "Learn basic counting from 1 to 5"
coreIdea: "Counting is fun"
examples:
  - "Count 1"
  - "Count 2"
misconceptions: []
masteryCriteria: 0.8
difficulty: beginner
dependencies: []
activities:
  - step: "observe"
    type: "visual_counting"
    order: 1
    content:
      description: "Look"
      items: ["1"]
      count: 1
`;

const CONCEPT_B_WITH_DEP = `conceptId: concept_b
chapter:
  code: CH1
  name: Numbers
learningObjective: "Learn advanced counting from 6 to 10"
coreIdea: "Counting is progressive"
examples:
  - "Count 6"
  - "Count 7"
misconceptions: []
masteryCriteria: 0.8
difficulty: beginner
dependencies:
  - concept_a
activities:
  - step: "observe"
    type: "visual_counting"
    order: 1
    content:
      description: "Look"
      items: ["6"]
      count: 1
`;

const INVALID_CONCEPT_YAML = `conceptId: 123_invalid
learningObjective: "Too short"
coreIdea: ""
examples: []
misconceptions: []
masteryCriteria: 2.5
difficulty: beginner
activities: []
`;

const MISSING_DEP_YAML = `conceptId: dep_concept
chapter:
  code: CH1
  name: Numbers
learningObjective: "Learn counting with dependencies"
coreIdea: "Dependencies matter"
examples:
  - "Example 1"
misconceptions: []
masteryCriteria: 0.8
difficulty: beginner
dependencies:
  - nonextistent_concept
activities:
  - step: "observe"
    type: "visual_counting"
    order: 1
    content:
      description: "Look"
      items: ["1"]
      count: 1
`;

const CIRCULAR_A_YAML = `conceptId: circular_a
chapter:
  code: CH1
  name: Numbers
learningObjective: "Circular dependency test A"
coreIdea: "Circular A"
examples:
  - "Example A"
misconceptions: []
masteryCriteria: 0.8
difficulty: beginner
dependencies:
  - circular_b
activities:
  - step: "observe"
    type: "visual_counting"
    order: 1
    content:
      description: "A"
      items: ["A"]
      count: 1
`;

const CIRCULAR_B_YAML = `conceptId: circular_b
chapter:
  code: CH1
  name: Numbers
learningObjective: "Circular dependency test B"
coreIdea: "Circular B"
examples:
  - "Example B"
misconceptions: []
masteryCriteria: 0.8
difficulty: beginner
dependencies:
  - circular_a
activities:
  - step: "observe"
    type: "visual_counting"
    order: 1
    content:
      description: "B"
      items: ["B"]
      count: 1
`;

const DUPLICATE_YAML = `conceptId: counting_1_10
chapter:
  code: CH1
  name: Numbers
learningObjective: "Duplicate concept test"
coreIdea: "Duplicates not allowed"
examples:
  - "Example dup"
misconceptions: []
masteryCriteria: 0.8
difficulty: beginner
dependencies: []
activities:
  - step: "observe"
    type: "visual_counting"
    order: 1
    content:
      description: "Dup"
      items: ["X"]
      count: 1
`;

// ── Tests ───────────────────────────────────────────────────────

describe('CurriculumPipeline', () => {
  describe('valid single concept', () => {
    let result: PipelineResult;

    beforeAll(() => {
      const dir = makeTestDir();
      writeYaml(dir, 'level-a/math/counting-1-10.yaml', VALID_CONCEPT_YAML);
      result = runOnDir(dir);
      testDir = dir;
    });

    afterAll(() => {
      if (testDir && existsSync(testDir)) rmSync(testDir, { recursive: true });
    });

    it('should parse and validate successfully', () => {
      expect(result.success).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should have one concept processed', () => {
      expect(result.conceptsProcessed).toBe(1);
    });

    it('should extract correct hierarchy from path', () => {
      expect(result.data[0].levelCode).toBe('A');
      expect(result.data[0].levelName).toBe('Level A');
      expect(result.data[0].subjectCode).toBe('MATH');
      expect(result.data[0].subjectName).toBe('Math');
    });

    it('should extract chapter info from YAML', () => {
      expect(result.data[0].chapterCode).toBe('CH1');
      expect(result.data[0].chapterName).toBe('Numbers');
    });

    it('should parse concept spec correctly', () => {
      const concept = result.data[0].concept;
      expect(concept.conceptId).toBe('counting_1_10');
      expect(concept.learningObjective).toBe(
        'Count objects from 1 to 10 with one-to-one correspondence',
      );
      expect(concept.coreIdea).toBe('Each number represents a specific quantity');
      expect(concept.masteryCriteria).toBe(0.8);
      expect(concept.difficulty).toBe('beginner');
    });

    it('should parse activities correctly', () => {
      const activities = result.data[0].activities;
      expect(activities).toHaveLength(2);
      expect(activities[0].step).toBe('observe');
      expect(activities[0].type).toBe('visual_counting');
      expect(activities[0].order).toBe(1);
      expect(activities[1].step).toBe('mastery_check');
      expect(activities[1].type).toBe('multiple_choice');
    });
  });

  describe('multiple concepts with dependencies', () => {
    let result: PipelineResult;
    let dir: string;

    beforeAll(() => {
      dir = makeTestDir();
      writeYaml(dir, 'level-a/math/concept-a.yaml', CONCEPT_A_YAML);
      writeYaml(dir, 'level-a/math/concept-b.yaml', CONCEPT_B_WITH_DEP);
      result = runOnDir(dir);
    });

    afterAll(() => {
      if (dir && existsSync(dir)) rmSync(dir, { recursive: true });
    });

    it('should succeed with no errors', () => {
      expect(result.success).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should process both concepts', () => {
      expect(result.conceptsProcessed).toBe(2);
    });

    it('should resolve dependencies correctly (concept_b depends on concept_a)', () => {
      const conceptIds = result.data.map((d) => d.concept.conceptId).sort();
      expect(conceptIds).toEqual(['concept_a', 'concept_b']);
      const conceptB = result.data.find((d) => d.concept.conceptId === 'concept_b')!;
      expect(conceptB.concept.dependencies).toContain('concept_a');
    });
  });

  describe('invalid YAML reports error', () => {
    let result: PipelineResult;
    let dir: string;

    beforeAll(() => {
      dir = makeTestDir();
      writeYaml(dir, 'level-a/math/invalid.yaml', INVALID_CONCEPT_YAML);
      result = runOnDir(dir);
    });

    afterAll(() => {
      if (dir && existsSync(dir)) rmSync(dir, { recursive: true });
    });

    it('should have validation errors', () => {
      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should have validation type errors', () => {
      expect(result.errors.every((e) => e.type === 'validation')).toBe(true);
    });

    it('should not include invalid concept in data', () => {
      expect(result.data).toHaveLength(0);
      expect(result.conceptsProcessed).toBe(0);
    });
  });

  describe('missing dependency', () => {
    let result: PipelineResult;
    let dir: string;

    beforeAll(() => {
      dir = makeTestDir();
      writeYaml(dir, 'level-a/math/missing-dep.yaml', MISSING_DEP_YAML);
      result = runOnDir(dir);
    });

    afterAll(() => {
      if (dir && existsSync(dir)) rmSync(dir, { recursive: true });
    });

    it('should report dependency error', () => {
      expect(result.success).toBe(false);
      const depErrors = result.errors.filter((e) => e.type === 'dependency');
      expect(depErrors.length).toBeGreaterThan(0);
      expect(depErrors[0].message).toContain('nonextistent_concept');
    });

    it('should still include the concept in data (validation passed)', () => {
      expect(result.conceptsProcessed).toBe(1);
      expect(result.data).toHaveLength(1);
    });
  });

  describe('circular dependency detection', () => {
    let result: PipelineResult;
    let dir: string;

    beforeAll(() => {
      dir = makeTestDir();
      writeYaml(dir, 'level-a/math/circular-a.yaml', CIRCULAR_A_YAML);
      writeYaml(dir, 'level-a/math/circular-b.yaml', CIRCULAR_B_YAML);
      result = runOnDir(dir);
    });

    afterAll(() => {
      if (dir && existsSync(dir)) rmSync(dir, { recursive: true });
    });

    it('should detect circular dependency', () => {
      expect(result.success).toBe(false);
      const circularErrors = result.errors.filter((e) => e.type === 'circular');
      expect(circularErrors.length).toBeGreaterThan(0);
      expect(circularErrors[0].message).toContain('Circular');
    });
  });

  describe('duplicate conceptId detection', () => {
    let result: PipelineResult;
    let dir: string;

    beforeAll(() => {
      dir = makeTestDir();
      writeYaml(dir, 'level-a/math/counting-1.yaml', VALID_CONCEPT_YAML);
      writeYaml(dir, 'level-a/math/counting-2.yaml', DUPLICATE_YAML);
      result = runOnDir(dir);
    });

    afterAll(() => {
      if (dir && existsSync(dir)) rmSync(dir, { recursive: true });
    });

    it('should detect duplicate conceptIds', () => {
      expect(result.success).toBe(false);
      const dupErrors = result.errors.filter(
        (e) => e.type === 'validation' && e.message.includes('Duplicate'),
      );
      expect(dupErrors.length).toBeGreaterThan(0);
    });
  });

  describe('non-existent directory', () => {
    it('should return IO error for non-existent directory', () => {
      const result = runCurriculumPipeline('/tmp/nonexistent-curriculum-12345');
      expect(result.success).toBe(false);
      expect(result.errors.some((e) => e.type === 'io')).toBe(true);
    });
  });

  describe('empty directory', () => {
    let result: PipelineResult;
    let dir: string;

    beforeAll(() => {
      dir = makeTestDir();
      mkdirSync(join(dir, 'level-a', 'math'), { recursive: true });
      result = runOnDir(dir);
    });

    afterAll(() => {
      if (dir && existsSync(dir)) rmSync(dir, { recursive: true });
    });

    it('should return IO error for empty directory', () => {
      expect(result.success).toBe(false);
      expect(result.errors.some((e) => e.type === 'io')).toBe(true);
    });
  });
});
