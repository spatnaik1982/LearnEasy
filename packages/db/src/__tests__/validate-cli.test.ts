import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { mkdirSync, writeFileSync, rmSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { tmpdir } from 'os';
import { execSync } from 'child_process';
import { runValidation } from '../cli/validate';

// ── Test helpers ────────────────────────────────────────────────

const DB_PACKAGE_DIR = join(__dirname, '..', '..');

function makeTestDir(): string {
  const dir = join(
    tmpdir(),
    `validate-cli-test-${Date.now()}-${Math.random().toString(36).slice(2)}`,
  );
  mkdirSync(dir, { recursive: true });
  return dir;
}

function writeYaml(dir: string, subpath: string, content: string): string {
  const fullPath = join(dir, subpath);
  const parent = fullPath.substring(0, fullPath.lastIndexOf('/'));
  mkdirSync(parent, { recursive: true });
  writeFileSync(fullPath, content, 'utf-8');
  return fullPath;
}

/**
 * Run the CLI script via tsx and return { stdout, exitCode }.
 * Uses execSync to simulate a real CLI invocation.
 */
function runCliViaExec(dir: string): { stdout: string; exitCode: number } {
  const scriptPath = join(DB_PACKAGE_DIR, 'src', 'cli', 'validate.ts');
  const cmd = `npx tsx "${scriptPath}" --dir "${dir}"`;
  try {
    const result = execSync(cmd, {
      cwd: DB_PACKAGE_DIR,
      encoding: 'utf-8',
      timeout: 10000,
    } as any);
    return { stdout: String(result), exitCode: 0 };
  } catch (err: any) {
    const stdout = err.stdout?.toString?.() || err.message || 'unknown error';
    return { stdout, exitCode: err.status ?? 1 };
  }
}

/**
 * Run the CLI programmatically via runValidation, returning the exit code.
 */
function runCliViaApi(dir: string): { exitCode: number; output: string } {
  // Capture console output
  const logs: string[] = [];
  const origLog = console.log;
  console.log = (...args: any[]) => logs.push(args.join(' '));

  let exitCode: number;
  try {
    exitCode = runValidation(['--dir', dir]);
  } finally {
    console.log = origLog;
  }

  return { exitCode, output: logs.join('\n') };
}

// ── Fixtures ────────────────────────────────────────────────────

const VALID_CONCEPT_YAML = `conceptId: counting_1_10
chapter:
  code: CH1
  name: Numbers
learningObjective: "Count objects from 1 to 10 with correspondence"
coreIdea: "Each number represents a quantity"
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
  - step: "guided_practice"
    type: "visual_counting"
    order: 2
    content:
      description: "Count stars"
      items: ["⭐"]
      count: 5
  - step: "independent_practice"
    type: "visual_counting"
    order: 3
    content:
      description: "Count flowers"
      items: ["🌸"]
      count: 7
  - step: "mastery_check"
    type: "multiple_choice"
    order: 4
    content:
      questions:
        - question: "How many?"
          options: ["1", "2"]
          correctIndex: 0
  - step: "positive_completion"
    type: "visual_counting"
    order: 5
    content:
      message: "Great work!"
      encouragement: true
`;

const INVALID_YAML = `conceptId: 123_BAD
learningObjective: "Short"
coreIdea: ""
examples: []
misconceptions: []
masteryCriteria: 2.5
difficulty: beginner
activities: []
`;

const MISSING_STEPS_YAML = `conceptId: missing_steps
chapter:
  code: CH1
  name: Test
learningObjective: "Learn about missing steps test"
coreIdea: "Missing steps matter"
examples:
  - "Example 1"
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
  # missing: guided_practice, independent_practice, mastery_check, positive_completion
`;

const UNSUPPORTED_TYPE_YAML = `conceptId: bad_type_test
chapter:
  code: CH1
  name: Test
learningObjective: "Learn about unsupported activity types"
coreIdea: "Types must be valid"
examples:
  - "Example 1"
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
  - step: "guided_practice"
    type: "visual_counting"
    order: 2
    content:
      description: "Practice"
      items: ["2"]
      count: 2
  - step: "independent_practice"
    type: "visual_counting"
    order: 3
    content:
      description: "Independent"
      items: ["3"]
      count: 3
  - step: "mastery_check"
    type: "multiple_choice"
    order: 4
    content:
      questions:
        - question: "Q?"
          options: ["A", "B"]
          correctIndex: 0
  - step: "positive_completion"
    type: "unsupported_type_xyz"
    order: 5
    content:
      message: "Done"
`;

const LONG_SENTENCE_YAML = `conceptId: long_sentence
chapter:
  code: CH1
  name: Test
learningObjective: "This is a very long learning objective sentence that exceeds the maximum word count threshold of twelve words by quite a significant margin"
coreIdea: "Short core idea here"
examples:
  - "Example 1"
misconceptions: []
masteryCriteria: 0.8
difficulty: beginner
dependencies: []
activities:
  - step: "observe"
    type: "visual_counting"
    order: 1
    content:
      description: "Look at the numbers carefully and count them"
      items: ["1"]
      count: 1
  - step: "guided_practice"
    type: "visual_counting"
    order: 2
    content:
      description: "Practice now"
      items: ["2"]
      count: 2
  - step: "independent_practice"
    type: "visual_counting"
    order: 3
    content:
      description: "Do it alone"
      items: ["3"]
      count: 3
  - step: "mastery_check"
    type: "multiple_choice"
    order: 4
    content:
      questions:
        - question: "Q?"
          options: ["A", "B"]
          correctIndex: 0
  - step: "positive_completion"
    type: "visual_counting"
    order: 5
    content:
      message: "Well done"
`;

const NO_VISUAL_YAML = `conceptId: no_visual
chapter:
  code: CH1
  name: Test
learningObjective: "Learn without visual activities"
coreIdea: "Non-visual learning"
examples:
  - "Example 1"
misconceptions: []
masteryCriteria: 0.8
difficulty: beginner
dependencies: []
activities:
  - step: "observe"
    type: "multiple_choice"
    order: 1
    content:
      description: "Look"
      questions:
        - question: "Q?"
          options: ["A", "B"]
          correctIndex: 0
  - step: "guided_practice"
    type: "sequencing"
    order: 2
    content:
      description: "Order items"
      items: [1, 2, 3]
  - step: "independent_practice"
    type: "story_question"
    order: 3
    content:
      description: "Read story"
      story: "Once upon a time..."
  - step: "mastery_check"
    type: "multiple_choice"
    order: 4
    content:
      questions:
        - question: "Q?"
          options: ["A", "B"]
          correctIndex: 0
  - step: "positive_completion"
    type: "story_question"
    order: 5
    content:
      message: "Done"
`;

// ── Tests ───────────────────────────────────────────────────────

describe('Curriculum Validation CLI', () => {
  describe('valid curriculum exits 0', () => {
    let dir: string;

    beforeAll(() => {
      dir = makeTestDir();
      writeYaml(dir, 'level-a/math/counting-1-10.yaml', VALID_CONCEPT_YAML);
    });

    afterAll(() => {
      if (dir && existsSync(dir)) rmSync(dir, { recursive: true });
    });

    it('via API: should exit 0 with no errors or warnings', () => {
      const { exitCode, output } = runCliViaApi(dir);
      expect(exitCode).toBe(0);
      expect(output).toContain('0 errors, 0 warnings');
    });

    it('via exec: should exit 0', () => {
      const { exitCode, stdout } = runCliViaExec(dir);
      expect(exitCode).toBe(0);
      expect(stdout).toContain('0 errors, 0 warnings');
    });
  });

  describe('invalid YAML exits 1 with error messages', () => {
    let dir: string;

    beforeAll(() => {
      dir = makeTestDir();
      writeYaml(dir, 'level-a/math/invalid.yaml', INVALID_YAML);
    });

    afterAll(() => {
      if (dir && existsSync(dir)) rmSync(dir, { recursive: true });
    });

    it('via API: should exit 1 with validation errors', () => {
      const { exitCode, output } = runCliViaApi(dir);
      expect(exitCode).toBe(1);
      expect(output).toContain('errors');
      expect(output).toMatch(/Validation failed/);
    });

    it('via exec: should exit 1', () => {
      const { exitCode, stdout } = runCliViaExec(dir);
      expect(exitCode).toBe(1);
      expect(stdout).toContain('errors');
    });
  });

  describe('missing required steps exits 1', () => {
    let dir: string;

    beforeAll(() => {
      dir = makeTestDir();
      writeYaml(dir, 'level-a/math/missing-steps.yaml', MISSING_STEPS_YAML);
    });

    afterAll(() => {
      if (dir && existsSync(dir)) rmSync(dir, { recursive: true });
    });

    it('via API: should report missing step errors', () => {
      const { exitCode, output } = runCliViaApi(dir);
      expect(exitCode).toBe(1);
      // The spec says missing steps generate errors
      expect(output).toContain('Missing required activity step');
      expect(output).toContain('errors');
    });

    it('via exec: should exit 1', () => {
      const { exitCode, stdout } = runCliViaExec(dir);
      expect(exitCode).toBe(1);
      expect(stdout).toContain('Missing required activity step');
    });
  });

  describe('unsupported activity type exits 1', () => {
    let dir: string;

    beforeAll(() => {
      dir = makeTestDir();
      writeYaml(dir, 'level-a/math/bad-type.yaml', UNSUPPORTED_TYPE_YAML);
    });

    afterAll(() => {
      if (dir && existsSync(dir)) rmSync(dir, { recursive: true });
    });

    it('via API: should report unsupported type error', () => {
      const { exitCode, output } = runCliViaApi(dir);
      expect(exitCode).toBe(1);
      expect(output).toContain('type must be one of');
      expect(output).toContain('errors');
    });

    it('via exec: should exit 1 with error about type', () => {
      const { exitCode, stdout } = runCliViaExec(dir);
      expect(exitCode).toBe(1);
      expect(stdout).toContain('type must be one of');
    });
  });

  describe('sentence length violations generate warnings (not errors)', () => {
    let dir: string;

    beforeAll(() => {
      dir = makeTestDir();
      writeYaml(dir, 'level-a/math/long.yaml', LONG_SENTENCE_YAML);
    });

    afterAll(() => {
      if (dir && existsSync(dir)) rmSync(dir, { recursive: true });
    });

    it('via API: should have warnings but exit 0', () => {
      const { exitCode, output } = runCliViaApi(dir);
      // Warnings should not cause exit code 1
      expect(exitCode).toBe(0);
      expect(output).toContain('warnings');
      expect(output).toContain('learningObjective');
    });

    it('via exec: should exit 0 with warnings', () => {
      const { exitCode, stdout } = runCliViaExec(dir);
      expect(exitCode).toBe(0);
      expect(stdout).toContain('learningObjective has');
    });
  });

  describe('visual-first check generates warnings', () => {
    let dir: string;

    beforeAll(() => {
      dir = makeTestDir();
      writeYaml(dir, 'level-a/math/no-visual.yaml', NO_VISUAL_YAML);
    });

    afterAll(() => {
      if (dir && existsSync(dir)) rmSync(dir, { recursive: true });
    });

    it('via API: should warn but exit 0', () => {
      const { exitCode, output } = runCliViaApi(dir);
      expect(exitCode).toBe(0);
      expect(output).toContain('No visual-based activity found');
      expect(output).toContain('warnings');
    });

    it('via exec: should exit 0 with visual-first warning', () => {
      const { exitCode, stdout } = runCliViaExec(dir);
      expect(exitCode).toBe(0);
      expect(stdout).toContain('No visual-based activity found');
    });
  });
});
