import { PrismaClient } from '@prisma/client';
import { runCurriculumPipeline, ConceptCurriculumEntry } from '../src/curriculum-pipeline';

const prisma = new PrismaClient();

async function seedFromPipeline(entries: ConceptCurriculumEntry[]): Promise<number> {
  let totalSeeded = 0;

  // Clean slate for idempotent re-seed
  await prisma.activityAttempt.deleteMany();
  await prisma.activity.deleteMany();

  // Group by level -> subject -> chapter
  const levelMap = new Map<string, { code: string; name: string; entries: ConceptCurriculumEntry[] }>();

  for (const entry of entries) {
    const key = entry.levelCode;
    if (!levelMap.has(key)) {
      levelMap.set(key, { code: entry.levelCode, name: entry.levelName, entries: [] });
    }
    levelMap.get(key)!.entries.push(entry);
  }

  for (const [, levelInfo] of levelMap) {
    // Create/upsert Level
    const level = await prisma.level.upsert({
      where: { code: levelInfo.code },
      update: { name: levelInfo.name },
      create: { code: levelInfo.code, name: levelInfo.name },
    });
    console.log(`  ✓ Level: ${level.name}`);

    // Group entries in this level by subject
    const subjectMap = new Map<string, { code: string; name: string; entries: ConceptCurriculumEntry[] }>();
    for (const entry of levelInfo.entries) {
      const key = entry.subjectCode;
      if (!subjectMap.has(key)) {
        subjectMap.set(key, { code: entry.subjectCode, name: entry.subjectName, entries: [] });
      }
      subjectMap.get(key)!.entries.push(entry);
    }

    for (const [, subjectInfo] of subjectMap) {
      // Create/upsert Subject
      const subjectId = `${levelInfo.code.toLowerCase()}-${subjectInfo.code.toLowerCase()}`;
      const subject = await prisma.subject.upsert({
        where: { id: subjectId },
        update: { name: subjectInfo.name },
        create: {
          id: subjectId,
          levelId: level.id,
          code: subjectInfo.code,
          name: subjectInfo.name,
        },
      });
      console.log(`  ✓ Subject: ${subject.name}`);

      // Group entries by chapter
      const chapterMap = new Map<string, { code: string; name: string; entries: ConceptCurriculumEntry[] }>();
      for (const entry of subjectInfo.entries) {
        const key = entry.chapterCode;
        if (!chapterMap.has(key)) {
          chapterMap.set(key, { code: entry.chapterCode, name: entry.chapterName, entries: [] });
        }
        chapterMap.get(key)!.entries.push(entry);
      }

      let chapterOrder = 0;
      for (const [, chapterInfo] of chapterMap) {
        chapterOrder++;
        const chapterId = `${subject.id}-${chapterInfo.code.toLowerCase()}`;

        // Create/upsert Chapter
        const chapter = await prisma.chapter.upsert({
          where: { id: chapterId },
          update: { name: chapterInfo.name, order: chapterOrder },
          create: {
            id: chapterId,
            subjectId: subject.id,
            code: chapterInfo.code,
            name: chapterInfo.name,
            order: chapterOrder,
          },
        });
        console.log(`    ✓ Chapter: ${chapter.name}`);

        // Create concepts and activities
        let conceptOrder = 0;
        for (const entry of chapterInfo.entries) {
          conceptOrder++;
          const conceptId = `${chapter.id}-c${conceptOrder}`;
          const conceptCode = entry.concept.conceptId.toUpperCase();

          const concept = await prisma.concept.upsert({
            where: { id: conceptId },
            update: {
              name: entry.concept.coreIdea.substring(0, 100),
              objective: entry.concept.learningObjective,
              order: conceptOrder,
              difficulty: entry.concept.difficulty || 'beginner',
            },
            create: {
              id: conceptId,
              chapterId: chapter.id,
              code: conceptCode,
              name: entry.concept.coreIdea.substring(0, 100),
              objective: entry.concept.learningObjective,
              order: conceptOrder,
              difficulty: entry.concept.difficulty || 'beginner',
            },
          });
          console.log(`      ✓ Concept: ${entry.concept.conceptId}`);

          // Create activities
          if (entry.activities.length > 0) {
            const activityData = entry.activities.map((act, idx) => ({
              id: `${conceptId}-a${idx + 1}`,
              conceptId: concept.id,
              type: act.type,
              step: act.step,
              order: act.order,
              content: act.content,
            }));

            await prisma.activity.createMany({
              data: activityData,
            });
          }

          totalSeeded++;
        }
      }
    }
  }

  return totalSeeded;
}

async function main() {
  console.log('Seeding curriculum data...');

  // Try to use the curriculum pipeline
  const pipelineResult = runCurriculumPipeline();

  if (pipelineResult.success && pipelineResult.data.length > 0) {
    console.log(`Curriculum pipeline found ${pipelineResult.data.length} concept(s) from curriculum files.`);
    console.log('Seeding from curriculum pipeline...');

    const seeded = await seedFromPipeline(pipelineResult.data);
    console.log(`\n✅ Pipeline seeding complete!`);
    console.log(`   ${seeded} concept(s) and their activities seeded from curriculum/ directory.`);
    return;
  }

  // If pipeline had errors, log them
  if (pipelineResult.errors.length > 0) {
    console.warn('Curriculum pipeline encountered issues:');
    for (const err of pipelineResult.errors) {
      console.warn(`  [${err.type}]${err.conceptId ? ` concept='${err.conceptId}'` : ''}${err.file ? ` file='${err.file}'` : ''}: ${err.message}`);
    }
    console.warn('Falling back to hardcoded seed data...\n');
  } else {
    console.log('No curriculum files found. Using hardcoded seed data...\n');
  }

  // ── Fallback: hardcoded seed ─────────────────────
  // ── Level A ──────────────────────────────────────
  const levelA = await prisma.level.upsert({
    where: { code: 'A' },
    update: {},
    create: { code: 'A', name: 'Level A' },
  });
  console.log(`  ✓ Level: ${levelA.name}`);

  // ── Subject: Mathematics ─────────────────────────
  const mathSubject = await prisma.subject.upsert({
    where: { id: 'math-a' },
    update: {},
    create: {
      id: 'math-a',
      levelId: levelA.id,
      code: 'MATH',
      name: 'Mathematics',
    },
  });
  console.log(`  ✓ Subject: ${mathSubject.name}`);

  // ── Chapter: Numbers ─────────────────────────────
  const numbersChapter = await prisma.chapter.create({
    data: {
      id: 'math-a-ch1',
      subjectId: mathSubject.id,
      code: 'CH1',
      name: 'Numbers',
      order: 1,
    },
  });

  // ── Concept: Counting 1-10 ───────────────────────
  const countingConcept = await prisma.concept.create({
    data: {
      id: 'math-a-ch1-c1',
      chapterId: numbersChapter.id,
      code: 'COUNTING_1_10',
      name: 'Counting 1 to 10',
      objective: 'Count objects from 1 to 10',
      order: 1,
      difficulty: 'beginner',
    },
  });

  // Activities for Counting 1-10
  await prisma.activity.createMany({
    data: [
      {
        id: 'math-a-ch1-c1-a1',
        conceptId: countingConcept.id,
        type: 'visual_counting',
        step: 'observe',
        order: 1,
        content: { description: 'Observe apples', items: ['🍎'], count: 3, text: 'There are three apples.' },
      },
      {
        id: 'math-a-ch1-c1-a2',
        conceptId: countingConcept.id,
        type: 'visual_counting',
        step: 'guided_practice',
        order: 2,
        content: { description: 'Count the stars', items: ['⭐'], count: 5, hint: 'Count each star one by one.' },
      },
      {
        id: 'math-a-ch1-c1-a3',
        conceptId: countingConcept.id,
        type: 'visual_counting',
        step: 'independent_practice',
        order: 3,
        content: { description: 'Count the flowers', items: ['🌸'], count: 7 },
      },
      {
        id: 'math-a-ch1-c1-a4',
        conceptId: countingConcept.id,
        type: 'multiple_choice',
        step: 'mastery_check',
        order: 4,
        content: {
          questions: [
            { question: 'How many apples? 🍎🍎', options: ['1', '2', '3', '4'], correctIndex: 1 },
            { question: 'How many stars? ⭐⭐⭐⭐⭐', options: ['4', '5', '6', '7'], correctIndex: 1 },
            { question: 'How many flowers? 🌸🌸🌸🌸🌸🌸', options: ['4', '5', '6', '7'], correctIndex: 2 },
          ],
        },
      },
      {
        id: 'math-a-ch1-c1-a5',
        conceptId: countingConcept.id,
        type: 'visual_counting',
        step: 'positive_completion',
        order: 5,
        content: { message: 'Great work! You counted correctly.', encouragement: true },
      },
    ],
  });
  console.log(`  ✓ Concept: ${countingConcept.name}`);

  // ── Concept: Number Recognition 1-10 ─────────────
  const numRecConcept = await prisma.concept.create({
    data: {
      id: 'math-a-ch1-c2',
      chapterId: numbersChapter.id,
      code: 'NUMBER_RECOGNITION',
      name: 'Number Recognition 1 to 10',
      objective: 'Recognize numbers from 1 to 10',
      order: 2,
      difficulty: 'beginner',
    },
  });

  await prisma.activity.createMany({
    data: [
      {
        id: 'math-a-ch1-c2-a1',
        conceptId: numRecConcept.id,
        type: 'matching',
        step: 'observe',
        order: 1,
        content: { description: 'See the number 5', display: '5', text: 'This is the number five.' },
      },
      {
        id: 'math-a-ch1-c2-a2',
        conceptId: numRecConcept.id,
        type: 'matching',
        step: 'guided_practice',
        order: 2,
        content: { description: 'Match the number to its name', pairs: [{ number: '3', name: 'Three' }, { number: '7', name: 'Seven' }] },
      },
      {
        id: 'math-a-ch1-c2-a3',
        conceptId: numRecConcept.id,
        type: 'multiple_choice',
        step: 'mastery_check',
        order: 3,
        content: {
          questions: [
            { question: 'Which number is five?', options: ['4', '5', '6', '7'], correctIndex: 1 },
            { question: 'Which number is eight?', options: ['6', '7', '8', '9'], correctIndex: 2 },
            { question: 'Which number is three?', options: ['1', '2', '3', '4'], correctIndex: 2 },
          ],
        },
      },
    ],
  });
  console.log(`  ✓ Concept: ${numRecConcept.name}`);

  // ── Chapter: Shapes ──────────────────────────────
  const shapesChapter = await prisma.chapter.create({
    data: {
      id: 'math-a-ch2',
      subjectId: mathSubject.id,
      code: 'CH2',
      name: 'Shapes',
      order: 2,
    },
  });

  const shapesConcept = await prisma.concept.create({
    data: {
      id: 'math-a-ch2-c1',
      chapterId: shapesChapter.id,
      code: 'BASIC_SHAPES',
      name: 'Basic Shapes',
      objective: 'Identify basic shapes: circle, square, triangle, rectangle',
      order: 1,
      difficulty: 'beginner',
    },
  });

  await prisma.activity.createMany({
    data: [
      {
        id: 'math-a-ch2-c1-a1',
        conceptId: shapesConcept.id,
        type: 'visual_counting',
        step: 'observe',
        order: 1,
        content: { description: 'Look at the shapes', shapes: ['⬤', '■', '▲', '▬'], text: 'Circle, Square, Triangle, Rectangle' },
      },
      {
        id: 'math-a-ch2-c1-a2',
        conceptId: shapesConcept.id,
        type: 'matching',
        step: 'guided_practice',
        order: 2,
        content: { description: 'Match the shape to its name', pairs: [{ shape: '⬤', name: 'Circle' }, { shape: '■', name: 'Square' }] },
      },
      {
        id: 'math-a-ch2-c1-a3',
        conceptId: shapesConcept.id,
        type: 'multiple_choice',
        step: 'mastery_check',
        order: 3,
        content: {
          questions: [
            { question: 'Which shape is a circle?', options: ['⬤', '■', '▲', '▬'], correctIndex: 0 },
            { question: 'Which shape is a triangle?', options: ['⬤', '■', '▲', '▬'], correctIndex: 2 },
          ],
        },
      },
    ],
  });
  console.log(`  ✓ Concept: ${shapesConcept.name}`);

  // ── Chapter: Addition ────────────────────────────
  const additionChapter = await prisma.chapter.create({
    data: {
      id: 'math-a-ch3',
      subjectId: mathSubject.id,
      code: 'CH3',
      name: 'Addition',
      order: 3,
    },
  });

  const additionConcept = await prisma.concept.create({
    data: {
      id: 'math-a-ch3-c1',
      chapterId: additionChapter.id,
      code: 'ADDITION_1_10',
      name: 'Addition within 10',
      objective: 'Add two numbers with sum up to 10',
      order: 1,
      difficulty: 'beginner',
    },
  });

  await prisma.activity.createMany({
    data: [
      {
        id: 'math-a-ch3-c1-a1',
        conceptId: additionConcept.id,
        type: 'visual_counting',
        step: 'observe',
        order: 1,
        content: { description: 'Adding apples', left: ['🍎', '🍎'], right: ['🍎'], sum: 3, text: 'Two apples plus one apple equals three apples.' },
      },
      {
        id: 'math-a-ch3-c1-a2',
        conceptId: additionConcept.id,
        type: 'visual_counting',
        step: 'guided_practice',
        order: 2,
        content: { description: 'Add the stars', left: 3, right: 2, hint: 'Count all the stars together.' },
      },
      {
        id: 'math-a-ch3-c1-a3',
        conceptId: additionConcept.id,
        type: 'multiple_choice',
        step: 'mastery_check',
        order: 3,
        content: {
          questions: [
            { question: '2 + 1 = ?', options: ['2', '3', '4', '5'], correctIndex: 1 },
            { question: '3 + 2 = ?', options: ['4', '5', '6', '7'], correctIndex: 1 },
            { question: '1 + 1 = ?', options: ['1', '2', '3', '4'], correctIndex: 1 },
          ],
        },
      },
    ],
  });
  console.log(`  ✓ Concept: ${additionConcept.name}`);

  // ── Chapter: Subtraction ─────────────────────────
  const subtractionChapter = await prisma.chapter.create({
    data: {
      id: 'math-a-ch4',
      subjectId: mathSubject.id,
      code: 'CH4',
      name: 'Subtraction',
      order: 4,
    },
  });

  const subtractionConcept = await prisma.concept.create({
    data: {
      id: 'math-a-ch4-c1',
      chapterId: subtractionChapter.id,
      code: 'SUBTRACTION_1_10',
      name: 'Subtraction within 10',
      objective: 'Subtract numbers with difference up to 10',
      order: 1,
      difficulty: 'beginner',
    },
  });

  await prisma.activity.createMany({
    data: [
      {
        id: 'math-a-ch4-c1-a1',
        conceptId: subtractionConcept.id,
        type: 'visual_counting',
        step: 'observe',
        order: 1,
        content: { description: 'Taking away apples', total: ['🍎', '🍎', '🍎'], takeAway: 1, remaining: 2, text: 'Three apples, take one away. Two apples remain.' },
      },
      {
        id: 'math-a-ch4-c1-a2',
        conceptId: subtractionConcept.id,
        type: 'visual_counting',
        step: 'guided_practice',
        order: 2,
        content: { description: 'Subtract the stars', total: 5, takeAway: 2, hint: 'Count the stars that are left.' },
      },
      {
        id: 'math-a-ch4-c1-a3',
        conceptId: subtractionConcept.id,
        type: 'multiple_choice',
        step: 'mastery_check',
        order: 3,
        content: {
          questions: [
            { question: '3 - 1 = ?', options: ['1', '2', '3', '4'], correctIndex: 1 },
            { question: '5 - 2 = ?', options: ['2', '3', '4', '5'], correctIndex: 1 },
            { question: '2 - 1 = ?', options: ['0', '1', '2', '3'], correctIndex: 1 },
          ],
        },
      },
    ],
  });
  console.log(`  ✓ Concept: ${subtractionConcept.name}`);

  console.log('\n✅ Seeding complete!');
  console.log(`   Level A Mathematics with 4 chapters, 5 concepts, and 16 activities seeded.`);
}

async function seedUsers() {
  const bcrypt = await import('bcryptjs');
  const hashed = await bcrypt.hash('test123', 10);

  const testParent = await prisma.parent.upsert({
    where: { email: 'testparent@learn-easy.com' },
    update: {},
    create: {
      email: 'testparent@learn-easy.com',
      name: 'Test Parent',
      password: hashed,
    },
  });

  const testStudent = await prisma.student.upsert({
    where: { email: 'teststudent@learn-easy.com' },
    update: {},
    create: {
      email: 'teststudent@learn-easy.com',
      name: 'Test Student',
      password: hashed,
      age: 8,
      level: 'A',
      autismSupportLevel: 2,
      readingLevel: 'medium',
      visualSupport: true,
      audioSupport: false,
      sensorySensitivity: true,
      attentionSpan: 'medium',
      parentId: testParent.id,
    },
  });

  console.log(`  ✓ Test parent: ${testParent.email}`);
  console.log(`  ✓ Test student: ${testStudent.email} (linked to parent)`);
}

main()
  .then(() => seedUsers())
  .then(() => console.log('\n✅ All seeding complete!'))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
