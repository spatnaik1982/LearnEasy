import { readFileSync } from 'fs';
import pdfParse from 'pdf-parse';
import type { ExtractedPDF, ChapterChunk, SectionChunk } from '../types';

const CHAPTER_HEADING = /^(Lesson|Chapter|Unit)\s+(\d+)\s*[:\-–—]\s*(.+)$/im;

const SECTION_HEADING = /^(\d+\.\d+)\s+(.+)$/m;

const EXAMPLE_MARKER = /^(Example|उदाहरण)\b/i;

const EXERCISE_MARKER =
  /^(Let us see what you have learnt|Exercise|Practice|Answer|Answers)/im;

export async function extractPDF(pdfPath: string): Promise<ExtractedPDF> {
  if (!pdfPath.endsWith('.pdf')) {
    throw new Error(`Not a PDF file: ${pdfPath}`);
  }

  let dataBuffer: Buffer;
  try {
    dataBuffer = readFileSync(pdfPath);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(`Failed to read PDF file: ${message}`);
  }

  let pdfData;
  try {
    pdfData = await pdfParse(dataBuffer);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(`Failed to parse PDF: ${message}`);
  }

  const text = pdfData.text;
  const chapters = parseChapters(text);

  return {
    metadata: {
      title: (pdfData.info?.Title as string) || pdfPath.split('/').pop() || 'Untitled',
      totalPages: pdfData.numpages,
    },
    chapters,
  };
}

function parseChapters(text: string): ChapterChunk[] {
  const lines = text.split('\n');
  const chapters: ChapterChunk[] = [];
  let currentChapter: ChapterChunk | null = null;
  let currentSection: SectionChunk | null = null;
  let inExercise = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (!line) continue;

    const chapterMatch = line.match(CHAPTER_HEADING);
    if (chapterMatch) {
      if (currentSection && currentChapter) {
        currentChapter.sections.push(currentSection);
      }
      currentSection = null;
      currentChapter = {
        chapterNumber: parseInt(chapterMatch[2], 10),
        chapterTitle: chapterMatch[3].trim(),
        sections: [],
        pages: [],
      };
      chapters.push(currentChapter);
      inExercise = false;
      continue;
    }

    if (!currentChapter) continue;

    if (EXERCISE_MARKER.test(line)) {
      if (currentSection) {
        currentChapter.sections.push(currentSection);
      }
      currentSection = {
        heading: line,
        body: '',
        examples: [],
        exercises: [line],
      };
      inExercise = true;
      continue;
    }

    if (inExercise) {
      if (currentSection && currentSection.exercises) {
        if (currentSection.exercises.length === 1 && currentSection.exercises[0] === line) {
        } else {
          currentSection.exercises.push(line);
        }
      }
      continue;
    }

    const sectionMatch = line.match(SECTION_HEADING);
    if (sectionMatch && !EXAMPLE_MARKER.test(line)) {
      if (currentSection) {
        currentChapter.sections.push(currentSection);
      }
      currentSection = {
        heading: line,
        body: '',
        examples: [],
        exercises: [],
      };
      continue;
    }

    if (EXAMPLE_MARKER.test(line)) {
      if (currentSection) {
        currentSection.examples.push(line);
      } else {
        currentSection = {
          heading: 'Example',
          body: '',
          examples: [line],
          exercises: [],
        };
      }
      continue;
    }

    if (currentSection) {
      const isExampleContent =
        currentSection.examples.length > 0 &&
        currentSection.body === '' &&
        !SECTION_HEADING.test(line);

      if (isExampleContent) {
        currentSection.examples.push(line);
      } else if (currentSection.heading === 'Example' || currentSection.heading.startsWith('Example')) {
        currentSection.examples.push(line);
      } else {
        currentSection.body += (currentSection.body ? '\n' : '') + line;
      }
    } else {
      currentSection = {
        heading: 'Content',
        body: line,
        examples: [],
        exercises: [],
      };
    }
  }

  if (currentSection && currentChapter) {
    currentChapter.sections.push(currentSection);
  }

  return chapters;
}

export function extractTextFromPDF(pdfPath: string): Promise<string> {
  return extractPDF(pdfPath).then((pdf) =>
    pdf.chapters
      .map(
        (ch) =>
          `Chapter ${ch.chapterNumber}: ${ch.chapterTitle}\n\n` +
          ch.sections
            .map((s) => {
              let text = s.heading ? `${s.heading}\n` : '';
              text += s.body ? `${s.body}\n` : '';
              text += s.examples.length > 0 ? s.examples.map((e) => `  ${e}`).join('\n') + '\n' : '';
              text += s.exercises.length > 0 ? s.exercises.map((e) => `  ${e}`).join('\n') + '\n' : '';
              return text;
            })
            .join('\n'),
      )
      .join('\n\n===\n\n'),
  );
}
