import { writeFileSync, mkdirSync, existsSync, renameSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { dump } from 'js-yaml';
import type { GeneratedConcept, GeneratedActivity, ConceptActivityPair } from '../types';

export function yamlForConcept(concept: GeneratedConcept, activities: GeneratedActivity[]): string {
  const data: Record<string, unknown> = {
    conceptId: concept.conceptId,
    chapter: {
      code: concept.chapterCode,
      name: concept.chapterName,
    },
    learningObjective: concept.learningObjective,
    coreIdea: concept.coreIdea,
    examples: concept.examples,
    misconceptions: concept.misconceptions,
    supports: concept.supports,
    masteryCriteria: concept.masteryCriteria,
    difficulty: concept.difficulty,
    estimatedDuration: concept.estimatedDuration,
    dependencies: concept.dependencies,
    activities: activities.map((a) => ({
      step: a.step,
      type: a.type,
      order: a.order,
      content: a.content,
    })),
  };

  return dump(data, {
    indent: 2,
    lineWidth: 120,
    noRefs: true,
    sortKeys: false,
    forceQuotes: false,
    quotingType: '"',
  });
}

export function writeConceptYAML(
  baseDir: string,
  levelCode: string,
  subject: string,
  concept: GeneratedConcept,
  activities: GeneratedActivity[],
  force: boolean,
): string {
  const dirPath = join(baseDir, `level-${levelCode.toLowerCase()}`, subject);
  const filename = `${concept.conceptId}.yaml`;
  const filePath = join(dirPath, filename);

  if (!existsSync(dirPath)) {
    mkdirSync(dirPath, { recursive: true });
  }

  if (existsSync(filePath) && !force) {
    throw new Error(
      `File already exists: ${filePath}. Use --force to overwrite.`,
    );
  }

  const content = yamlForConcept(concept, activities);

  const tmpPath = join(tmpdir(), `curriculum-${concept.conceptId}-${Date.now()}.yaml`);
  writeFileSync(tmpPath, content, 'utf-8');
  renameSync(tmpPath, filePath);

  return filePath;
}

export function writeAllConcepts(
  baseDir: string,
  levelCode: string,
  subject: string,
  entries: ConceptActivityPair[],
  force: boolean,
): { written: string[]; skipped: string[]; errors: { conceptId: string; error: string }[] } {
  const written: string[] = [];
  const skipped: string[] = [];
  const errors: { conceptId: string; error: string }[] = [];

  for (const entry of entries) {
    try {
      const path = writeConceptYAML(
        baseDir,
        levelCode,
        subject,
        entry.concept,
        entry.activities,
        force,
      );
      written.push(path);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      if (message.includes('already exists')) {
        skipped.push(entry.concept.conceptId);
      } else {
        errors.push({ conceptId: entry.concept.conceptId, error: message });
      }
    }
  }

  return { written, skipped, errors };
}
