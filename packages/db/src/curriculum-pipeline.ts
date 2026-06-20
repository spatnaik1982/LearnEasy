import { readdirSync, readFileSync, statSync } from 'fs';
import { join, relative, dirname, basename, extname, isAbsolute } from 'path';
import { load } from 'js-yaml';
import { validateConceptSpec, ConceptSpec } from './concept-schema';

// ─── Exported types ─────────────────────────────────────────────

export interface PipelineError {
  file?: string;
  conceptId?: string;
  message: string;
  type: 'validation' | 'dependency' | 'circular' | 'io';
}

export interface ActivitySpec {
  step: string;
  type: string;
  order: number;
  content: Record<string, unknown>;
}

export interface ConceptCurriculumEntry {
  filePath: string;
  levelCode: string;
  levelName: string;
  subjectCode: string;
  subjectName: string;
  chapterCode: string;
  chapterName: string;
  concept: ConceptSpec;
  activities: ActivitySpec[];
}

export interface PipelineResult {
  success: boolean;
  data: ConceptCurriculumEntry[];
  conceptsProcessed: number;
  errors: PipelineError[];
}

// ─── Helpers ────────────────────────────────────────────────────

const VALID_STEPS = [
  'observe',
  'guided_practice',
  'independent_practice',
  'mastery_check',
  'positive_completion',
] as const;

const VALID_ACTIVITY_TYPES = [
  'visual_counting',
  'matching',
  'drag_drop',
  'sequencing',
  'multiple_choice',
  'story_question',
  'real_world',
  'fraction_visual',
  'place_value_chart',
  'grid_area',
  'chart_reader',
  'clock_time',
  'measurement_scale',
  'fill_blank',
] as const;

// Extract level/subject info from a relative path like: level-a/math/counting-1-10.yaml
function extractHierarchyFromPath(
  filePath: string,
  curriculumBase: string,
): { levelCode: string; levelName: string; subjectCode: string; subjectName: string } | null {
  const rel = relative(curriculumBase, filePath);
  const parts = rel.split(/[\\/]/);

  // Expected: level-<code>/<subject>/<filename>
  if (parts.length < 2) return null;

  const levelPart = parts[0]; // e.g. "level-a"
  const subjectPart = parts[1]; // e.g. "math"

  // Parse level code from "level-a" -> "A"
  const levelMatch = levelPart.match(/^level-([a-zA-Z0-9]+)$/);
  if (!levelMatch) return null;
  const levelCode = levelMatch[1].toUpperCase();
  const levelName = `Level ${levelCode}`;

  // Map subject directory name to code and name
  const subjectCode = subjectPart.toUpperCase();
  const subjectName = subjectPart.charAt(0).toUpperCase() + subjectPart.slice(1);

  return { levelCode, levelName, subjectCode, subjectName };
}

// Scan a directory recursively for .yaml / .yml files
function scanYamlFiles(dirPath: string, errors: PipelineError[]): string[] {
  const files: string[] = [];

  try {
    const entries = readdirSync(dirPath, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = join(dirPath, entry.name);
      if (entry.isDirectory()) {
        files.push(...scanYamlFiles(fullPath, errors));
      } else if (entry.isFile()) {
        const ext = extname(entry.name).toLowerCase();
        if (ext === '.yaml' || ext === '.yml') {
          files.push(fullPath);
        }
      }
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    errors.push({
      file: dirPath,
      message: `Failed to scan directory: ${message}`,
      type: 'io',
    });
  }

  return files;
}

// Basic validation of activity structure
function validateActivity(
  act: unknown,
  index: number,
  conceptId: string,
  filePath: string,
  errors: PipelineError[],
): ActivitySpec | null {
  if (!act || typeof act !== 'object') {
    errors.push({
      file: filePath,
      conceptId,
      message: `Activity at index ${index} is not an object`,
      type: 'validation',
    });
    return null;
  }

  const record = act as Record<string, unknown>;

  const step = record.step;
  const type = record.type;
  const order = record.order;
  const content = record.content;

  const subErrors: string[] = [];

  if (!step || !VALID_STEPS.includes(step as any)) {
    subErrors.push(`step must be one of: ${VALID_STEPS.join(', ')}`);
  }
  if (!type || !VALID_ACTIVITY_TYPES.includes(type as any)) {
    subErrors.push(`type must be one of: ${VALID_ACTIVITY_TYPES.join(', ')}`);
  }
  if (typeof order !== 'number' || order < 1) {
    subErrors.push('order must be a positive number');
  }
  if (!content || typeof content !== 'object') {
    subErrors.push('content must be a non-null object');
  }

  if (subErrors.length > 0) {
    errors.push({
      file: filePath,
      conceptId,
      message: `Activity at index ${index}: ${subErrors.join('; ')}`,
      type: 'validation',
    });
    return null;
  }

  return {
    step: step as string,
    type: type as string,
    order: order as number,
    content: content as Record<string, unknown>,
  };
}

// Detect circular dependencies using DFS with a depth limit
function detectCircularDependencies(
  conceptId: string,
  dependencies: string[],
  allConcepts: Map<string, string[]>,
  visited: Set<string>,
  stack: Set<string>,
  depth: number,
  maxDepth: number,
): string | null {
  if (stack.has(conceptId)) {
    return `Circular dependency detected involving concept '${conceptId}'`;
  }
  if (visited.has(conceptId) || depth > maxDepth) {
    return null;
  }

  visited.add(conceptId);
  stack.add(conceptId);

  const deps = allConcepts.get(conceptId) || [];
  for (const dep of deps) {
    const cycle = detectCircularDependencies(
      dep,
      allConcepts.get(dep) || [],
      allConcepts,
      visited,
      stack,
      depth + 1,
      maxDepth,
    );
    if (cycle) {
      stack.delete(conceptId);
      return cycle;
    }
  }

  stack.delete(conceptId);
  return null;
}

// ─── Main pipeline function ─────────────────────────────────────

/**
 * Run the curriculum pipeline:
 * 1. Scan directory for .yaml/.yml files
 * 2. Parse each file
 * 3. Extract hierarchy from path + YAML content
 * 4. Validate concept fields using validateConceptSpec
 * 5. Validate activity structures
 * 6. Resolve dependency references
 * 7. Detect circular dependencies
 *
 * @param customDir - optional directory path override (default: ../../curriculum relative to this file)
 * @returns PipelineResult with parsed/validated data and any errors
 */
export function runCurriculumPipeline(customDir?: string): PipelineResult {
  const errors: PipelineError[] = [];
  const entries: ConceptCurriculumEntry[] = [];

  // Resolve curriculum directory
  const resolvedDir = customDir
    ? (isAbsolute(customDir) ? customDir : join(process.cwd(), customDir))
    : join(__dirname, '..', '..', '..', 'curriculum');

  // Verify directory exists
  try {
    if (!statSync(resolvedDir).isDirectory()) {
      return {
        success: false,
        data: [],
        conceptsProcessed: 0,
        errors: [
          {
            file: resolvedDir,
            message: `Curriculum directory does not exist or is not a directory: ${resolvedDir}`,
            type: 'io',
          },
        ],
      };
    }
  } catch {
    return {
      success: false,
      data: [],
      conceptsProcessed: 0,
      errors: [
        {
          file: resolvedDir,
          message: `Curriculum directory not found: ${resolvedDir}`,
          type: 'io',
        },
      ],
    };
  }

  // 1. Scan for YAML files
  const yamlFiles = scanYamlFiles(resolvedDir, errors);
  if (yamlFiles.length === 0) {
    errors.push({
      message: `No .yaml or .yml files found in ${resolvedDir}`,
      type: 'io',
    });
    return { success: false, data: [], conceptsProcessed: 0, errors };
  }

  // 2-5. Parse, extract hierarchy, validate
  for (const filePath of yamlFiles) {
    // Parse YAML
    let raw: unknown;
    try {
      const contents = readFileSync(filePath, 'utf-8');
      raw = load(contents);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      errors.push({
        file: filePath,
        message: `Failed to parse YAML: ${message}`,
        type: 'validation',
      });
      continue;
    }

    if (!raw || typeof raw !== 'object') {
      errors.push({
        file: filePath,
        message: 'YAML content is not an object',
        type: 'validation',
      });
      continue;
    }

    const data = raw as Record<string, unknown>;

    // Extract hierarchy from path
    const hierarchy = extractHierarchyFromPath(filePath, resolvedDir);
    if (!hierarchy) {
      errors.push({
        file: filePath,
        message: `Could not extract level/subject from path (expected: level-<code>/<subject>/<file>.yaml)`,
        type: 'validation',
      });
      continue;
    }

    // Extract optional chapter info from YAML, fallback to path-based inference
    let chapterCode: string;
    let chapterName: string;

    const chapterField = data.chapter;
    if (chapterField && typeof chapterField === 'object') {
      const ch = chapterField as Record<string, unknown>;
      chapterCode = (ch.code as string) || 'CH1';
      chapterName = (ch.name as string) || 'Chapter 1';
    } else {
      // Default if no chapter info
      chapterCode = 'CH1';
      chapterName = 'Chapter 1';
    }

    // Extract activities before validation (they're not part of ConceptSpec)
    const activitiesRaw = data.activities;
    delete data.activities; // Remove before concept validation

    // Also remove chapter from data before validation (not part of ConceptSpec)
    delete data.chapter;

    // Validate concept fields using existing schema
    const validated = validateConceptSpec(data);
    if (!validated.success) {
      errors.push({
        file: filePath,
        conceptId: (data.conceptId as string) || undefined,
        message: `Validation failed: ${validated.errors.join('; ')}`,
        type: 'validation',
      });
      continue;
    }

    const conceptSpec = validated.data;

    // Validate activities
    const activities: ActivitySpec[] = [];
    if (Array.isArray(activitiesRaw)) {
      for (let i = 0; i < activitiesRaw.length; i++) {
        const act = validateActivity(activitiesRaw[i], i, conceptSpec.conceptId, filePath, errors);
        if (act) {
          activities.push(act);
        }
      }
    } else if (activitiesRaw !== undefined) {
      errors.push({
        file: filePath,
        conceptId: conceptSpec.conceptId,
        message: 'activities must be an array',
        type: 'validation',
      });
    }

    entries.push({
      filePath,
      ...hierarchy,
      chapterCode,
      chapterName,
      concept: conceptSpec,
      activities,
    });
  }

  // 6. Resolve dependency references (across all parsed concepts)
  const allConceptIds = new Set(entries.map((e) => e.concept.conceptId));
  const dependencyMap = new Map<string, string[]>();

  for (const entry of entries) {
    dependencyMap.set(entry.concept.conceptId, entry.concept.dependencies || []);
    for (const dep of entry.concept.dependencies || []) {
      if (!allConceptIds.has(dep)) {
        errors.push({
          file: entry.filePath,
          conceptId: entry.concept.conceptId,
          message: `Missing dependency: concept '${dep}' is referenced but not found in any parsed curriculum file`,
          type: 'dependency',
        });
      }
    }
  }

  // 7. Detect circular dependencies
  const globalVisited = new Set<string>();
  for (const entry of entries) {
    const cycle = detectCircularDependencies(
      entry.concept.conceptId,
      entry.concept.dependencies || [],
      dependencyMap,
      globalVisited,
      new Set<string>(),
      0,
      50, // max depth
    );
    if (cycle) {
      errors.push({
        file: entry.filePath,
        conceptId: entry.concept.conceptId,
        message: cycle,
        type: 'circular',
      });
    }
  }

  // 8. Detect duplicate conceptIds
  const seenIds = new Map<string, string>();
  for (const entry of entries) {
    if (seenIds.has(entry.concept.conceptId)) {
      errors.push({
        file: entry.filePath,
        conceptId: entry.concept.conceptId,
        message: `Duplicate conceptId '${entry.concept.conceptId}' (also found in ${seenIds.get(entry.concept.conceptId)})`,
        type: 'validation',
      });
    }
    seenIds.set(entry.concept.conceptId, entry.filePath);
  }

  return {
    success: errors.length === 0,
    data: entries,
    conceptsProcessed: entries.length,
    errors,
  };
}
