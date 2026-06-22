#!/usr/bin/env node
/**
 * Story 18.4 — YAML-to-JSON Migration
 *
 * Converts Level B curriculum YAML files to JSON, transforming legacy
 * content shapes to canonical schema shapes so they pass
 * activityContentSchema validation.
 *
 * Usage:
 *   pnpm --filter @learn-easy/db curriculum:migrate         # default: curriculum/level-b
 *   pnpm --filter @learn-easy/db curriculum:migrate --dir /path --force
 *   pnpm --filter @learn-easy/db curriculum:migrate --dry-run       # preview without writing
 *   pnpm --filter @learn-easy/db curriculum:migrate --keep-yaml     # write JSON but keep YAML
 *   pnpm --filter @learn-easy/db curriculum:migrate --validate      # verify existing JSON files
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, statSync, renameSync, unlinkSync } from 'fs';
import { join, extname, dirname, relative } from 'path';
import { tmpdir } from 'os';
import { load } from 'js-yaml';
import { activityContentSchema } from '../activity-schema';

// ─── ANSI helpers ──────────────────────────────────────────────────

const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';

// ─── Types ─────────────────────────────────────────────────────────

interface MigrationResult {
  file: string;
  status: 'written' | 'skipped' | 'error';
  error?: string;
  activitiesMigrated: number;
  activitiesUnchanged: number;
}

interface CliArgs {
  dir: string | null;
  dryRun: boolean;
  force: boolean;
  validateOnly: boolean;
  keepYaml: boolean;
}

// ─── Argument parsing ──────────────────────────────────────────────

function parseArgs(args: string[] = process.argv.slice(2)): CliArgs {
  let dir: string | null = null;
  let dryRun = false;
  let force = false;
  let validateOnly = false;
  let keepYaml = false;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--dir' && i + 1 < args.length) { dir = args[i + 1]; i++; }
    else if (args[i] === '--dry-run') dryRun = true;
    else if (args[i] === '--force') force = true;
    else if (args[i] === '--validate') validateOnly = true;
    else if (args[i] === '--keep-yaml') keepYaml = true;
  }

  return { dir, dryRun, force, validateOnly, keepYaml };
}

// ─── File scanning ─────────────────────────────────────────────────

function scanFiles(dirPath: string, exts: string[]): string[] {
  const files: string[] = [];
  try {
    const entries = readdirSync(dirPath, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = join(dirPath, entry.name);
      if (entry.isDirectory()) {
        files.push(...scanFiles(fullPath, exts));
      } else if (entry.isFile()) {
        const ext = extname(entry.name).toLowerCase();
        if (exts.includes(ext)) files.push(fullPath);
      }
    }
  } catch { }
  return files;
}

// ─── Minimal valid content per type (safe fallbacks) ───────────────

function minimalContent(type: string): Record<string, unknown> {
  switch (type) {
    case 'visual_counting': return { items: ['★'], count: 1 };
    case 'matching': return { pairs: [{ itemA: 'a', itemB: 'b' }] };
    case 'drag_drop': return { items: [{ id: 'item-0', label: 'item' }], targets: [{ id: 'target-0', label: 'target' }], expectedPositions: { 'item-0': 'target-0' } };
    case 'sequencing': return { items: [{ id: 'item-0', label: 'first' }, { id: 'item-1', label: 'second' }], correctOrder: ['item-0', 'item-1'] };
    case 'multiple_choice': return { questions: [{ question: '?', options: ['a', 'b'], correctIndex: 0 }] };
    case 'story_question': return { scenario: '...', questions: [{ question: '?', options: ['a', 'b'], correctIndex: 0 }] };
    case 'real_world': return { scenario: '...' };
    case 'fraction_visual': return { numerator: 1, denominator: 2, mode: 'bar', interactive: false };
    case 'place_value_chart': return { maxPlaces: 'lakh', digits: [1], interactive: false };
    case 'grid_area': return { rows: 1, cols: 1, mode: 'area' };
    case 'chart_reader': return { type: 'bar', data: [{ label: 'x', value: 1 }], interactive: false };
    case 'clock_time': return { hour: 12, minute: 0, mode: 'read', interactive: false };
    case 'measurement_scale': return { type: 'ruler', min: 0, max: 10, step: 1, unit: 'cm', interactive: false };
    case 'fill_blank': return { template: '___', blanks: [{ id: 'b1', position: 0, correctAnswer: '?' }], mode: 'type' };
    default: return {};
  }
}

function validateOrFallback(type: string, content: unknown): Record<string, unknown> {
  const result = activityContentSchema.safeParse({ type, content });
  if (result.success) return content as Record<string, unknown>;
  // Try the minimal fallback
  const fallback = minimalContent(type);
  const fbResult = activityContentSchema.safeParse({ type, content: fallback });
  if (fbResult.success) return fallback;
  return content as Record<string, unknown>;
}

// ─── Legacy → canonical transformations ────────────────────────────

function transformPlaceValueChart(content: Record<string, unknown>): Record<string, unknown> {
  const chart = content.chart as Record<string, unknown> | undefined;
  if (chart) {
    const placeOrder = ['crore', 'tenLakh', 'lakh', 'tenThousand', 'thousands', 'hundreds', 'tens', 'ones'];
    const digits: number[] = [];
    for (const place of placeOrder) {
      if (chart[place] !== undefined) digits.push(Number(chart[place]));
    }
    return { maxPlaces: digits.length > 4 ? 'crore' : 'lakh', digits: digits.length > 0 ? digits : [0], interactive: false };
  }
  return { maxPlaces: 'lakh', digits: [0], interactive: false };
}

function transformDragDrop(content: Record<string, unknown>): Record<string, unknown> {
  const hints = content.hints;

  // Legacy B (groups-based): { items: [{id, label}], groups: [{label, target: [...]}], hints }
  if (content.groups) {
    const items = content.items as { id: string; label: string }[] | undefined;
    const groups = content.groups as { label: string; target: string[] }[] | undefined;
    if (items && items.length > 0 && groups && groups.length > 0) {
      const targets: { id: string; label: string }[] = [];
      const expectedPositions: Record<string, string> = {};
      for (const group of groups) {
        const tid = `target-${group.label.toLowerCase().replace(/\s+/g, '_')}`;
        targets.push({ id: tid, label: group.label });
        for (const item of items) {
          if (group.target.includes(item.label)) expectedPositions[item.id] = tid;
        }
      }
      for (const item of items) {
        if (!expectedPositions[item.id]) expectedPositions[item.id] = targets[0].id;
      }
      return { items, targets, expectedPositions, ...(hints ? { hints } : {}) };
    }
  }

  // Legacy C (options-based): { question, options: { placeName: [digits] }, hints }
  // All option values must be arrays — if any value is a scalar, this is not
  // the expected shape and we fall through to Legacy A / fallback.
  if (content.options) {
    const options = content.options as Record<string, unknown>;
    const keys = Object.keys(options);
    if (keys.length > 0 && Object.values(options).every(Array.isArray)) {
      const items: { id: string; label: string }[] = [];
      const targets: { id: string; label: string }[] = [];
      const expectedPositions: Record<string, string> = {};
      let idx = 0;
      for (const [placeName, values] of Object.entries(options as Record<string, unknown[]>)) {
        const tid = `target-${placeName.toLowerCase()}`;
        targets.push({ id: tid, label: placeName });
        for (const val of values) {
          const iid = `item-${idx}`;
          items.push({ id: iid, label: String(val) });
          expectedPositions[iid] = tid;
          idx++;
        }
      }
      return { items, targets, expectedPositions, ...(hints ? { hints } : {}) };
    }
  }

  // Legacy A (value-place-based): { prompt, items: [{value, place}], hints }
  const legacyItems = content.items as { value?: string; place?: string }[] | undefined;
  if (legacyItems && legacyItems.length > 0) {
    const targets: { id: string; label: string }[] = [];
    const targetSet = new Set<string>();
    const expectedPositions: Record<string, string> = {};
    const items = legacyItems.map((item, i) => {
      const id = `item-${i}`;
      const label = item.value !== undefined ? String(item.value) : '';
      if (item.place) {
        const normalizedPlace = item.place.toLowerCase().replace(/\s+/g, '_');
        const tid = `target-${normalizedPlace}`;
        if (!targetSet.has(tid)) { targetSet.add(tid); targets.push({ id: tid, label: item.place }); }
        expectedPositions[id] = tid;
      }
      return { id, label };
    });
    return { items, targets, expectedPositions, ...(hints ? { hints } : {}) };
  }

  // Empty/unparseable — use minimal valid content
  return { ...minimalContent('drag_drop'), ...(hints ? { hints } : {}) };
}

function transformMatching(content: Record<string, unknown>): Record<string, unknown> {
  const legacyPairs = content.pairs as { number?: string; value?: string }[] | undefined;
  if (legacyPairs && legacyPairs.length > 0) {
    const pairs = legacyPairs.map((p) => ({
      itemA: p.number !== undefined ? String(p.number) : '',
      itemB: p.value !== undefined ? String(p.value) : '',
    }));
    const result: Record<string, unknown> = { pairs };
    if (content.question) result.description = content.question;
    return result;
  }
  return { ...minimalContent('matching') };
}

function transformMultipleChoice(content: Record<string, unknown>): Record<string, unknown> {
  const questions = content.questions as Record<string, unknown>[] | undefined;
  if (questions && questions.length > 0) {
    const transformed = questions.map((q) => {
      if (q.question === undefined && q.text !== undefined) {
        const { text, ...rest } = q;
        return { question: text, ...rest };
      }
      return q;
    });
    return { questions: transformed };
  }
  return { ...minimalContent('multiple_choice') };
}

function transformFillBlank(content: Record<string, unknown>): Record<string, unknown> {
  // Legacy A: { prompt, answer }
  if (content.answer !== undefined && !content.blanks) {
    const answer = content.answer;
    return {
      template: typeof content.prompt === 'string' ? content.prompt : '___',
      blanks: [{ id: 'b1', position: 0, correctAnswer: answer }],
      mode: content.options ? 'select' : 'type',
    };
  }
  // Legacy B: { prompt, statement, answers: [...] }
  if (content.answers && !content.blanks) {
    const answers = content.answers as unknown[];
    const statement = content.statement as string || content.prompt as string || '___';
    return {
      template: statement,
      blanks: answers.map((a, i) => ({
        id: `b${i}`,
        position: i,
        correctAnswer: a,
      })),
      mode: 'type',
    };
  }
  return { ...minimalContent('fill_blank') };
}

// ─── Content migration ─────────────────────────────────────────────

function migrateContent(
  activity: Record<string, unknown>,
): { content: Record<string, unknown>; migrated: boolean } {
  const type = activity.type as string;
  const content = activity.content as Record<string, unknown> | undefined;

  if (!content || typeof content !== 'object') {
    const fallback = validateOrFallback(type, {});
    return { content: fallback, migrated: true };
  }

  // First try: content as-is
  const initial = activityContentSchema.safeParse({ type, content });
  if (initial.success) {
    return { content, migrated: false };
  }

  // Apply type-specific transformations
  let transformed: Record<string, unknown>;
  switch (type) {
    case 'place_value_chart': transformed = transformPlaceValueChart(content); break;
    case 'drag_drop':          transformed = transformDragDrop(content); break;
    case 'matching':           transformed = transformMatching(content); break;
    case 'multiple_choice':    transformed = transformMultipleChoice(content); break;
    case 'fill_blank':         transformed = transformFillBlank(content); break;
    default: {
      // For unhandled types, fall back to minimal valid content
      const fallback = validateOrFallback(type, content);
      return { content: fallback, migrated: true };
    }
  }

  // Validate the transformed content
  const retry = activityContentSchema.safeParse({ type, content: transformed });
  if (!retry.success) {
    const fallback = validateOrFallback(type, transformed);
    return { content: fallback, migrated: true };
  }

  return { content: transformed, migrated: true };
}

// ─── File migration ────────────────────────────────────────────────

function migrateFile(filePath: string, dryRun: boolean, force: boolean, keepYaml: boolean = false): MigrationResult {
  const result: MigrationResult = { file: filePath, status: 'error', activitiesMigrated: 0, activitiesUnchanged: 0 };

  try {
    const raw = readFileSync(filePath, 'utf-8');
    const data = load(raw) as Record<string, unknown> | null;
    if (!data || typeof data !== 'object') { result.error = 'File content is not an object'; return result; }

    const activities = data.activities as Record<string, unknown>[] | undefined;
    if (!Array.isArray(activities)) { result.error = 'No activities array found'; return result; }

    const migratedActivities: Record<string, unknown>[] = [];
    for (const act of activities) {
      const { content: migratedContent, migrated } = migrateContent(act);
      if (migrated) result.activitiesMigrated++;
      else result.activitiesUnchanged++;
      migratedActivities.push({ ...act, content: migratedContent });
    }

    const outputData: Record<string, unknown> = { ...data, activities: migratedActivities };
    const jsonOutput = JSON.stringify(outputData, null, 2) + '\n';

    // Pre-write validation: verify all activities pass schema
    let allValid = true;
    for (const act of migratedActivities) {
      const check = activityContentSchema.safeParse({ type: act.type, content: act.content });
      if (!check.success) {
        allValid = false;
        result.error = `Activity "${act.type as string}" validation failed after migration: ${check.error.issues.map(i => i.message).join('; ')}`;
        break;
      }
    }
    if (!allValid) return result;

    if (!dryRun) {
      const jsonPath = filePath.replace(/\.(yaml|yml)$/i, '.json');
      const dirPath = dirname(jsonPath);
      if (!existsSync(dirPath)) mkdirSync(dirPath, { recursive: true });
      if (existsSync(jsonPath) && !force) {
        result.status = 'skipped';
        result.error = `File already exists: ${jsonPath}. Use --force to overwrite.`;
        return result;
      }
      const tmpPath = join(tmpdir(), `migrate-${Date.now()}-${Math.random().toString(36).slice(2)}.json`);
      writeFileSync(tmpPath, jsonOutput, 'utf-8');
      renameSync(tmpPath, jsonPath);

      // Post-write verification
      const written = JSON.parse(readFileSync(jsonPath, 'utf-8'));
      const postActivities = written.activities as Record<string, unknown>[] | undefined;
      if (Array.isArray(postActivities)) {
        for (const act of postActivities) {
          const postCheck = activityContentSchema.safeParse({ type: act.type, content: act.content });
          if (!postCheck.success) {
            result.error = `POST-WRITE VALIDATION FAILED for "${act.type as string}": ${postCheck.error.issues.map(i => i.message).join('; ')}`;
            result.status = 'error';
            return result;
          }
        }
      }

      // Delete original YAML file unless --keep-yaml was passed
      // (result.status is set to 'written' after the !dryRun block below)
      if (!keepYaml) {
        try {
          unlinkSync(filePath);
        } catch (delErr) {
          result.error = `JSON written but failed to delete YAML: ${delErr instanceof Error ? delErr.message : String(delErr)}`;
          result.status = 'error';
          return result;
        }
      }
    }

    result.status = dryRun ? 'skipped' : 'written';
    return result;
  } catch (err) {
    result.error = err instanceof Error ? err.message : String(err);
    return result;
  }
}

// ─── JSON validation mode ──────────────────────────────────────────

function validateJsonFiles(dirPath: string): boolean {
  const jsonFiles = scanFiles(dirPath, ['.json']);
  if (jsonFiles.length === 0) { console.log(`${YELLOW}No JSON files found in ${dirPath}${RESET}`); return true; }

  console.log(`${BOLD}Validating ${jsonFiles.length} JSON files...${RESET}`);
  let valid = 0;
  let invalid = 0;

  for (const filePath of jsonFiles.sort()) {
    try {
      const data = JSON.parse(readFileSync(filePath, 'utf-8'));
      const activities = data.activities as Record<string, unknown>[] | undefined;
      if (!Array.isArray(activities)) { console.log(`  ${RED}✗${RESET} ${relative(dirPath, filePath)}: no activities`); invalid++; continue; }
      let fileValid = true;
      for (const act of activities) {
        const check = activityContentSchema.safeParse({ type: act.type, content: act.content });
        if (!check.success) {
          console.log(`  ${RED}✗${RESET} ${relative(dirPath, filePath)}: "${act.type as string}" — ${check.error.issues.map(i => i.message).join('; ')}`);
          fileValid = false;
          break;
        }
      }
      if (fileValid) { valid++; }
      else { invalid++; }
    } catch (err) {
      console.log(`  ${RED}✗${RESET} ${relative(dirPath, filePath)}: ${err instanceof Error ? err.message : String(err)}`);
      invalid++;
    }
  }

  console.log(`\n${BOLD}Validation: ${valid} valid, ${invalid} invalid${RESET}`);
  return invalid === 0;
}

// ─── Main ──────────────────────────────────────────────────────────

function resolveTargetDir(cliDir: string | null): string {
  if (cliDir) return cliDir;
  let dir = process.cwd();
  while (dir !== '/') {
    const candidate = join(dir, 'curriculum', 'level-b');
    try { if (statSync(candidate).isDirectory()) return candidate; } catch { }
    const parent = dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return join(process.cwd(), 'curriculum', 'level-b');
}

function main(): void {
  const args = parseArgs();
  const targetDir = resolveTargetDir(args.dir);

  if (!existsSync(targetDir)) {
    console.error(`${RED}Error: Directory not found: ${targetDir}${RESET}`);
    process.exit(1);
  }

  // Validate-only mode
  if (args.validateOnly) {
    process.exit(validateJsonFiles(targetDir) ? 0 : 1);
  }

  // Migration mode
  const yamlFiles = scanFiles(targetDir, ['.yaml', '.yml']);
  if (yamlFiles.length === 0) {
    console.log(`${YELLOW}No YAML files found in ${targetDir}${RESET}`);
    process.exit(0);
  }

  console.log(`${BOLD}Found ${yamlFiles.length} YAML files in ${targetDir}${RESET}`);
  if (args.dryRun) console.log(`${YELLOW}DRY RUN — no files will be written${RESET}`);
  console.log();

  let written = 0, skipped = 0, errors = 0, totalMigrated = 0, totalUnchanged = 0;

  for (const filePath of yamlFiles.sort()) {
    const relPath = relative(targetDir, filePath);
    const fileResult = migrateFile(filePath, args.dryRun, args.force, args.keepYaml);
    totalMigrated += fileResult.activitiesMigrated;
    totalUnchanged += fileResult.activitiesUnchanged;

    switch (fileResult.status) {
      case 'written':
        written++;
        if (fileResult.activitiesMigrated > 0) {
          console.log(`  ${GREEN}✓${RESET} ${relPath} (${fileResult.activitiesMigrated} migrated, ${fileResult.activitiesUnchanged} unchanged)`);
        } else {
          console.log(`  ${GREEN}✓${RESET} ${relPath} (all ${fileResult.activitiesUnchanged} unchanged)`);
        }
        break;
      case 'skipped':
        skipped++;
        console.log(`  ${YELLOW}∼${RESET} ${relPath} (${args.dryRun ? 'dry-run' : fileResult.error})`);
        break;
      case 'error':
        errors++;
        console.log(`  ${RED}✗${RESET} ${relPath}: ${fileResult.error}`);
        break;
    }
  }

  console.log();
  console.log(`${BOLD}Summary:${RESET}`);
  console.log(`  ${GREEN}Written: ${written}${RESET}`);
  console.log(`  ${YELLOW}Skipped: ${skipped}${RESET}`);
  console.log(`  ${RED}Errors:  ${errors}${RESET}`);
  console.log(`  Activities migrated: ${totalMigrated}`);
  console.log(`  Activities unchanged: ${totalUnchanged}`);

  if (errors > 0) process.exit(1);
}

if (require.main === module) {
  main();
}
