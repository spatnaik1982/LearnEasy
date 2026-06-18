import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding curriculum data...');

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

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
