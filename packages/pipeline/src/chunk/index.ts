import { z } from 'zod';
import type { LlmProvider } from '@learn-easy/llm-config';
import type { ChapterChunk, ConceptCandidate } from '../types';

const conceptCandidateSchema = z.object({
  concepts: z
    .array(
      z.object({
        conceptId: z.string().regex(/^[a-z]+[a-z0-9_]*$/, 'conceptId must be lowercase with underscores'),
        learningObjective: z.string().min(10, 'learningObjective must be at least 10 characters'),
        coreIdea: z.string().min(1),
        examples: z.array(z.string()).min(2).max(5),
        misconceptions: z.array(z.string()).min(0).max(3),
        suggestedDependencies: z.array(z.string()),
        estimatedDuration: z.number().positive(),
        sourceSections: z.array(z.string()),
      }),
    )
    .min(1)
    .max(10),
});

const TOKEN_LIMIT = 50000;

function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

function prepareChapterText(chapter: ChapterChunk, maxTokens: number): string[] {
  const fullText = chapter.sections
    .map((s) => {
      let text = s.heading ? `${s.heading}\n` : '';
      text += s.body ? `${s.body}\n` : '';
      text += s.examples.length > 0 ? s.examples.map((e) => `  ${e}`).join('\n') + '\n' : '';
      text += s.exercises.length > 0 ? s.exercises.map((e) => `  ${e}`).join('\n') + '\n' : '';
      return text;
    })
    .join('\n');

  if (estimateTokens(fullText) <= maxTokens) {
    return [fullText];
  }

  const chunks: string[] = [];
  let currentChunk = '';

  for (const section of chapter.sections) {
    const sectionText = [
      section.heading,
      section.body,
      ...section.examples.map((e) => `  ${e}`),
      ...section.exercises.map((e) => `  ${e}`),
    ]
      .filter(Boolean)
      .join('\n');

    if (estimateTokens(currentChunk + sectionText) > maxTokens && currentChunk) {
      chunks.push(currentChunk.trim());
      currentChunk = sectionText;
    } else {
      currentChunk += (currentChunk ? '\n' : '') + sectionText;
    }
  }

  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}

const PROMPT_TEMPLATE = `You are analyzing a textbook chapter from the NIOS OBE Level {LEVEL} {SUBJECT} curriculum. Your task is to identify discrete, teachable concepts within this chapter.

## Chapter Content

Chapter {CHAPTER_NUMBER}: {CHAPTER_TITLE}

\`\`\`
{CHAPTER_TEXT}
\`\`\`

## Existing Prerequisite Concepts

The learner has already mastered these concepts (available as prerequisites):
{EXISTING_CONCEPTS}

## ALX Guidelines for Learning Objectives

- Use plain, concrete language (no jargon).
- Focus on what the child will DO, not what they'll understand.
- Keep to 12 words or fewer.
- Start with an action verb (Identify, Count, Add, Compare, etc.).

## Output Requirements

For each concept you identify, provide:

1. **conceptId**: Lowercase with underscores (e.g., "fractions_intro")
2. **learningObjective**: What the child will do (≤12 words)
3. **coreIdea**: The key takeaway in one sentence
4. **examples**: 2-3 concrete examples from the chapter text (use emoji where possible)
5. **misconceptions**: 1-2 common mistakes (infer from exercises if possible)
6. **suggestedDependencies**: conceptIds this concept depends on (use IDs from the existing concepts list, or suggest new ones)
7. **estimatedDuration**: Minutes (10-30 based on content density)
8. **sourceSections**: Which sections of the chapter text this concept comes from

Identify between 3 and 8 concepts per chapter. Each concept must be distinct and teachable on its own. Do not combine concepts that should be taught separately.

Make sure dependency conceptIds use the correct format (lowercase_with_underscores).`;

function loadPromptTemplate(): string {
  return PROMPT_TEMPLATE;
}

function buildPrompt(
  template: string,
  chapter: ChapterChunk,
  chapterText: string,
  existingConceptIds: string[],
  level: string,
  subject: string,
): string {
  return template
    .replace(/{LEVEL}/g, level)
    .replace(/{SUBJECT}/g, subject)
    .replace(/{CHAPTER_NUMBER}/g, String(chapter.chapterNumber))
    .replace(/{CHAPTER_TITLE}/g, chapter.chapterTitle)
    .replace(/{CHAPTER_TEXT}/g, chapterText)
    .replace(/{EXISTING_CONCEPTS}/g, existingConceptIds.join('\n'));
}

export async function extractConceptsFromChapter(
  llm: LlmProvider,
  chapter: ChapterChunk,
  existingConceptIds: string[],
  level: string,
  subject: string,
): Promise<ConceptCandidate[]> {
  const template = loadPromptTemplate();
  const textParts = prepareChapterText(chapter, TOKEN_LIMIT);
  const allConcepts: ConceptCandidate[] = [];

  for (const part of textParts) {
    const prompt = buildPrompt(template, chapter, part, existingConceptIds, level, subject);

    try {
      const result = await llm.generateStructured(prompt, conceptCandidateSchema, {
        temperature: 0.3,
      });

      for (const c of result.concepts) {
        allConcepts.push({
          chapterNumber: chapter.chapterNumber,
          chapterName: chapter.chapterTitle,
          conceptId: c.conceptId,
          learningObjective: c.learningObjective,
          coreIdea: c.coreIdea,
          examples: c.examples,
          misconceptions: c.misconceptions,
          suggestedDependencies: c.suggestedDependencies,
          sourceSections: c.sourceSections,
          supportingText: part,
          estimatedDuration: c.estimatedDuration,
        });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      throw new Error(
        `Failed to extract concepts from chapter ${chapter.chapterNumber} "${chapter.chapterTitle}": ${message}`,
      );
    }
  }

  return allConcepts;
}

export async function chunkContent(
  llm: LlmProvider,
  chapters: ChapterChunk[],
  existingConceptIds: string[],
  level: string,
  subject: string,
): Promise<ConceptCandidate[]> {
  const allCandidates: ConceptCandidate[] = [];

  for (const chapter of chapters) {
    const candidates = await extractConceptsFromChapter(
      llm,
      chapter,
      existingConceptIds,
      level,
      subject,
    );
    allCandidates.push(...candidates);
  }

  return allCandidates;
}
