#!/usr/bin/env node
/**
 * Story 0.3 — Curriculum Validation CLI
 *
 * Validates all curriculum YAML files for structural integrity,
 * pedagogical completeness, and ALX compliance.
 *
 * Usage:
 *   pnpm curriculum:validate              # default: ./curriculum
 *   pnpm curriculum:validate --dir /path  # custom directory
 *   pnpm curriculum:validate --verbose    # detailed per-file output
 */

import { runCurriculumPipeline } from '../curriculum-pipeline';
import { ConceptDependencyGraph } from '../dependency-graph';
import type {
  ConceptCurriculumEntry,
  PipelineResult,
  PipelineError,
} from '../curriculum-pipeline';
import type { ConceptSpec } from '../concept-schema';
import { join, dirname } from 'path';
import { statSync } from 'fs';

// ─── ANSI color codes ──────────────────────────────────────────────
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';

const CHECK = '\u2713'; // ✓
const CROSS = '\u2717'; // ✗
const WARN_SYM = '\u26A0'; // ⚠

// ─── Constants ─────────────────────────────────────────────────────
const REQUIRED_STEPS = [
  'observe',
  'guided_practice',
  'independent_practice',
  'mastery_check',
  'positive_completion',
] as const;

const VISUAL_TYPES = ['visual_counting', 'matching', 'drag_drop'] as const;

// ─── Helpers ───────────────────────────────────────────────────────

/** Count words in a string (> 0-length chars after whitespace split). */
function countWords(s: string): number {
  return s.trim().split(/\s+/).filter((w) => w.length > 0).length;
}

/** Format a PipelineError into a one-line string. */
function formatError(err: PipelineError): string {
  const parts: string[] = [];
  if (err.file) parts.push(err.file);
  if (err.conceptId) parts.push(`[${err.conceptId}]`);
  parts.push(err.message);
  return parts.join(' ');
}

/**
 * Walk up from process.cwd() looking for a curriculum/ directory.
 * This handles tools that change cwd (e.g. pnpm --filter).
 */
function findAncestorCurriculumDir(): string | null {
  let dir = process.cwd();
  while (dir !== '/') {
    const candidate = join(dir, 'curriculum');
    try {
      if (statSync(candidate).isDirectory()) return candidate;
    } catch {
      // Directory doesn't exist, continue walking up
    }
    const parent = dirname(dir);
    if (parent === dir) break; // Reached root
    dir = parent;
  }
  return null;
}

// ─── ALX compliance checks ─────────────────────────────────────────

interface AlxResult {
  errors: string[];
  warnings: string[];
}

/**
 * Run ALX-specific compliance checks on successfully-parsed
 * curriculum entries. These are checks layered on top of the
 * pipeline's structural validation.
 *
 * Returns:
 *   errors   — missing required steps, unsupported activity types
 *   warnings — sentence-length violations, missing visual activities
 */
function runAlxComplianceChecks(entries: ConceptCurriculumEntry[]): AlxResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  for (const entry of entries) {
    const { concept, activities, filePath } = entry;
    const tag = `[${concept.conceptId}]`;

    // ── 1. Sentence-length check (WARNING) ──────────────────────
    // Any text field > 12 words triggers a warning.
    const loWords = countWords(concept.learningObjective);
    if (loWords > 12) {
      warnings.push(
        `${tag} ${filePath}: learningObjective has ${loWords} words (recommended ≤ 12)`,
      );
    }

    const ciWords = countWords(concept.coreIdea);
    if (ciWords > 12) {
      warnings.push(
        `${tag} ${filePath}: coreIdea has ${ciWords} words (recommended ≤ 12)`,
      );
    }

    for (const act of activities) {
      const desc = (act.content as Record<string, unknown>)?.description;
      if (typeof desc === 'string' && desc.length > 0) {
        const descWords = countWords(desc);
        if (descWords > 12) {
          warnings.push(
            `${tag} ${filePath}: activity "${act.type}" (step "${act.step}") description has ${descWords} words (recommended ≤ 12)`,
          );
        }
      }
    }

    // ── 2. Activity step check (ERROR) ──────────────────────────
    // Each concept must have activities covering every required step.
    const presentSteps = new Set(activities.map((a) => a.step));
    for (const step of REQUIRED_STEPS) {
      if (!presentSteps.has(step)) {
        errors.push(
          `${tag} ${filePath}: Missing required activity step "${step}"`,
        );
      }
    }

    // ── 3. Visual-first check (WARNING) ─────────────────────────
    // At least one activity should use a visual-based type.
    const hasVisual = activities.some((a) =>
      (VISUAL_TYPES as readonly string[]).includes(a.type),
    );
    if (!hasVisual) {
      warnings.push(
        `${tag} ${filePath}: No visual-based activity found (recommend at least one of: ${VISUAL_TYPES.join(', ')})`,
      );
    }

    // ── 4. Perimeter misconception check (WARNING) ──────────────
    // When using grid_area with perimeter mode, recommend a misconception.
    for (const act of activities) {
      if (act.type === 'grid_area') {
        const mode = (act.content as Record<string, unknown>).mode;
        if (mode === 'perimeter') {
          const hasPerimMisconception = concept.misconceptions.some((m) =>
            m.toLowerCase().includes('perimeter') || m.toLowerCase().includes('area')
          );
          if (!hasPerimMisconception) {
            warnings.push(
              `${tag} ${filePath}: grid_area perimeter activity has no perimeter-related misconception (recommend adding one to help struggling learners)`,
            );
          }
        }
      }
    }
  }

  return { errors, warnings };
}

// ─── Argument parsing ──────────────────────────────────────────────

interface CliArgs {
  verbose: boolean;
  dir: string | undefined;
}

function parseArgs(args: string[] = process.argv.slice(2)): CliArgs {
  let verbose = false;
  let dir: string | undefined;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--verbose') {
      verbose = true;
    } else if (args[i] === '--dir' && i + 1 < args.length) {
      dir = args[i + 1];
      i++;
    }
  }

  return { verbose, dir };
}

// ─── Output formatting ─────────────────────────────────────────────

/**
 * Print verbose per-file output.
 */
function printVerbose(
  result: PipelineResult,
  allWarnings: string[],
): void {
  const fileMap = new Map<
    string,
    { errors: string[]; warnings: string[] }
  >();

  // Group pipeline errors by file
  for (const err of result.errors) {
    const file = err.file || 'unknown';
    if (!fileMap.has(file)) fileMap.set(file, { errors: [], warnings: [] });
    fileMap.get(file)!.errors.push(err.message);
  }

  // Group ALX warnings by file (parsed from the warning tag)
  for (const w of allWarnings) {
    // Format: [conceptId] /path: message
    const match = w.match(/^\[.*?\]\s+(\S+?):\s/);
    const file = match ? match[1] : 'unknown';
    if (!fileMap.has(file)) fileMap.set(file, { errors: [], warnings: [] });
    fileMap.get(file)!.warnings.push(w);
  }

  // Add any clean files
  for (const entry of result.data) {
    if (!fileMap.has(entry.filePath)) {
      fileMap.set(entry.filePath, { errors: [], warnings: [] });
    }
  }

  // Sort files for deterministic output
  for (const [file, info] of [...fileMap.entries()].sort()) {
    console.log(`\n${BOLD}${file}${RESET}`);
    for (const e of info.errors) {
      console.log(`  ${RED}${CROSS} ${e}${RESET}`);
    }
    for (const w of info.warnings) {
      console.log(`  ${YELLOW}${WARN_SYM} ${w}${RESET}`);
    }
    if (info.errors.length === 0 && info.warnings.length === 0) {
      console.log(`  ${GREEN}${CHECK} All checks passed${RESET}`);
    }
  }
}

/**
 * Print compact (non-verbose) output.
 */
function printCompact(
  allErrors: string[],
  allWarnings: string[],
): void {
  if (allErrors.length > 0) {
    console.log(`\n${RED}${CROSS} Errors:${RESET}`);
    for (const e of allErrors) {
      console.log(`  ${RED}${e}${RESET}`);
    }
  }
  if (allWarnings.length > 0) {
    console.log(`\n${YELLOW}${WARN_SYM} Warnings:${RESET}`);
    for (const w of allWarnings) {
      console.log(`  ${YELLOW}${w}${RESET}`);
    }
  }
  if (allErrors.length === 0 && allWarnings.length === 0) {
    console.log(`\n${GREEN}${CHECK} All checks passed!${RESET}`);
  }
}

// ─── Main entry point ──────────────────────────────────────────────

/**
 * Run the full curriculum validation and print results to stdout.
 *
 * @param argv — argument array (default: process.argv.slice(2))
 * @returns exit code (0 = success, 1 = errors found)
 */
export function runValidation(argv?: string[]): number {
  const { verbose, dir } = parseArgs(argv);

  // Default curriculum directory:
  //   Try process.cwd() + '/curriculum' first (as spec requires).
  //   If it doesn't exist, walk up looking for a curriculum/ directory
  //   (enables pnpm --filter which changes cwd to packages/db).
  //   Fall back to process.cwd() + '/curriculum' (pipeline will report error).
  let curriculumDir: string;
  if (dir) {
    curriculumDir = dir;
  } else {
    const defaultDir = join(process.cwd(), 'curriculum');
    try {
      if (statSync(defaultDir).isDirectory()) {
        curriculumDir = defaultDir;
      } else {
        curriculumDir = findAncestorCurriculumDir() || defaultDir;
      }
    } catch {
      curriculumDir = findAncestorCurriculumDir() || defaultDir;
    }
  }

  // Run the core pipeline
  const result: PipelineResult = runCurriculumPipeline(curriculumDir);

  // Collect pipeline errors as formatted strings
  const pipelineErrorStrings = result.errors.map(formatError);

  // Run ALX compliance checks on successfully-parsed concepts
  const alx = runAlxComplianceChecks(result.data);

  const allErrors = [...pipelineErrorStrings, ...alx.errors];
  const allWarnings = alx.warnings;

  // ── Graph dependency validation ─────────────────────────────────
  if (result.data.length > 0) {
    const concepts: ConceptSpec[] = result.data.map((e) => e.concept);
    const graph = new ConceptDependencyGraph(concepts);

    // 1. Missing dependency references
    const allConceptIds = new Set(concepts.map((c) => c.conceptId));
    for (const entry of result.data) {
      const deps = entry.concept.dependencies || [];
      for (const dep of deps) {
        if (!allConceptIds.has(dep)) {
          allErrors.push(
            `Missing dependency: concept '${entry.concept.conceptId}' requires '${dep}' but '${dep}' not found`,
          );
        }
      }
    }

    // 2. Cycle detection
    const cycles = graph.detectCycles();
    for (const cycle of cycles) {
      const cycleStr = cycle.join(' → ');
      allErrors.push(`Cycle detected: ${cycleStr}`);
    }

    // 3. Unreachable concepts (concepts with no path from any entry point)
    const entryPoints = concepts
      .filter((c) => !c.dependencies || c.dependencies.length === 0)
      .map((c) => c.conceptId);

    if (entryPoints.length > 0) {
      const reachableSet = new Set(graph.getLearningPath(entryPoints));
      for (const concept of concepts) {
        if (!reachableSet.has(concept.conceptId)) {
          allWarnings.push(
            `Unreachable concept: '${concept.conceptId}' has no path from any entry point (concept with no dependencies)`,
          );
        }
      }
    }
  }

  // Print output
  if (verbose) {
    printVerbose(result, allWarnings);
  } else {
    printCompact(allErrors, allWarnings);
  }

  // Summary line
  const conceptCount = result.conceptsProcessed;
  console.log(
    `\n${BOLD}Summary: ${conceptCount} concepts, ${allErrors.length} errors, ${allWarnings.length} warnings${RESET}`,
  );

  return allErrors.length > 0 ? 1 : 0;
}

// ─── CLI entry ─────────────────────────────────────────────────────

if (require.main === module) {
  const exitCode = runValidation();
  process.exit(exitCode);
}
