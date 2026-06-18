export interface Activity {
  id: string;
  type: "visual-counter" | "matching" | "multiple-choice" | "sequencing";
  title: string;
  config: Record<string, unknown>;
}

export interface Concept {
  id: string;
  title: string;
  description: string;
  activities: Activity[];
}

export interface Chapter {
  id: string;
  title: string;
  description: string;
  concepts: Concept[];
}

export interface Subject {
  id: string;
  title: string;
  description: string;
  emoji: string;
  chapters: Chapter[];
}

export const mockSubjects: Subject[] = [
  {
    id: "level-a-math",
    title: "Level A Math",
    description: "Foundational math concepts for early learners",
    emoji: "🔢",
    chapters: [
      {
        id: "numbers",
        title: "Numbers",
        description: "Learn to count and recognize numbers 1-10",
        concepts: [
          {
            id: "counting-1-10",
            title: "Counting 1 to 10",
            description: "Practice counting objects from 1 to 10",
            activities: [
              {
                id: "counting-visual",
                type: "visual-counter",
                title: "How Many Apples?",
                config: { count: 5, emoji: "🍎" },
              },
              {
                id: "counting-match",
                type: "matching",
                title: "Match Number to Count",
                config: {
                  pairs: [
                    { id: "c1", itemA: "🍎🍎", itemB: "2" },
                    { id: "c2", itemA: "🍎🍎🍎🍎🍎", itemB: "5" },
                    { id: "c3", itemA: "🍎🍎🍎", itemB: "3" },
                  ],
                },
              },
              {
                id: "counting-mc",
                type: "multiple-choice",
                title: "Counting Quiz",
                config: {
                  question: "How many stars are there? ⭐⭐⭐⭐",
                  options: [
                    { id: "a", label: "3" },
                    { id: "b", label: "4" },
                    { id: "c", label: "5" },
                  ],
                  correctIndex: 1,
                },
              },
            ],
          },
          {
            id: "number-recognition-1-10",
            title: "Number Recognition 1 to 10",
            description: "Identify numbers from 1 to 10",
            activities: [
              {
                id: "number-match",
                type: "matching",
                title: "Match Number to Word",
                config: {
                  pairs: [
                    { id: "n1", itemA: "1", itemB: "One" },
                    { id: "n2", itemA: "5", itemB: "Five" },
                    { id: "n3", itemA: "10", itemB: "Ten" },
                  ],
                },
              },
              {
                id: "number-seq",
                type: "sequencing",
                title: "Order the Numbers",
                config: {
                  items: [
                    { id: "s1", label: "Three" },
                    { id: "s2", label: "Seven" },
                    { id: "s3", label: "One" },
                  ],
                  correctOrder: ["s3", "s1", "s2"],
                },
              },
              {
                id: "number-mc",
                type: "multiple-choice",
                title: "Number Quiz",
                config: {
                  question: "Which number comes after 3?",
                  options: [
                    { id: "a", label: "2" },
                    { id: "b", label: "4" },
                    { id: "c", label: "5" },
                  ],
                  correctIndex: 1,
                },
              },
            ],
          },
        ],
      },
      {
        id: "shapes",
        title: "Shapes",
        description: "Learn to identify basic shapes",
        concepts: [
          {
            id: "basic-shapes",
            title: "Basic Shapes",
            description: "Identify circles, squares, triangles, and rectangles",
            activities: [
              {
                id: "shapes-visual",
                type: "visual-counter",
                title: "Shape Counter",
                config: { count: 4, emoji: "⬛" },
              },
              {
                id: "shapes-match",
                type: "matching",
                title: "Match the Shape",
                config: {
                  pairs: [
                    { id: "sh1", itemA: "🟠", itemB: "Circle" },
                    { id: "sh2", itemA: "🟩", itemB: "Square" },
                    { id: "sh3", itemA: "🔺", itemB: "Triangle" },
                  ],
                },
              },
              {
                id: "shapes-mc",
                type: "multiple-choice",
                title: "Shape Quiz",
                config: {
                  question: "Which shape has 3 sides?",
                  options: [
                    { id: "a", label: "⬛ Square", emoji: "⬛" },
                    { id: "b", label: "🔺 Triangle", emoji: "🔺" },
                    { id: "c", label: "🟠 Circle", emoji: "🟠" },
                  ],
                  correctIndex: 1,
                },
              },
            ],
          },
        ],
      },
      {
        id: "addition",
        title: "Addition",
        description: "Learn to add numbers within 10",
        concepts: [
          {
            id: "addition-within-10",
            title: "Addition within 10",
            description: "Practice simple addition problems",
            activities: [
              {
                id: "add-visual",
                type: "visual-counter",
                title: "Count the Total",
                config: { count: 7, emoji: "🍪" },
              },
              {
                id: "add-match",
                type: "matching",
                title: "Match the Sum",
                config: {
                  pairs: [
                    { id: "a1", itemA: "2 + 3", itemB: "5" },
                    { id: "a2", itemA: "4 + 1", itemB: "5" },
                    { id: "a3", itemA: "3 + 4", itemB: "7" },
                  ],
                },
              },
              {
                id: "add-mc",
                type: "multiple-choice",
                title: "Addition Quiz",
                config: {
                  question: "What is 3 + 4?",
                  options: [
                    { id: "a", label: "6" },
                    { id: "b", label: "7" },
                    { id: "c", label: "8" },
                  ],
                  correctIndex: 1,
                },
              },
            ],
          },
        ],
      },
      {
        id: "subtraction",
        title: "Subtraction",
        description: "Learn to subtract numbers within 10",
        concepts: [
          {
            id: "subtraction-within-10",
            title: "Subtraction within 10",
            description: "Practice simple subtraction problems",
            activities: [
              {
                id: "sub-visual",
                type: "visual-counter",
                title: "Take Away",
                config: { count: 3, emoji: "🧁" },
              },
              {
                id: "sub-match",
                type: "matching",
                title: "Match the Difference",
                config: {
                  pairs: [
                    { id: "s1", itemA: "5 - 2", itemB: "3" },
                    { id: "s2", itemA: "7 - 3", itemB: "4" },
                    { id: "s3", itemA: "9 - 4", itemB: "5" },
                  ],
                },
              },
              {
                id: "sub-mc",
                type: "multiple-choice",
                title: "Subtraction Quiz",
                config: {
                  question: "What is 7 - 3?",
                  options: [
                    { id: "a", label: "3" },
                    { id: "b", label: "4" },
                    { id: "c", label: "5" },
                  ],
                  correctIndex: 1,
                },
              },
            ],
          },
        ],
      },
    ],
  },
];

export function getSubject(id: string): Subject | undefined {
  return mockSubjects.find((s) => s.id === id);
}

export function getChapter(subjectId: string, chapterId: string): Chapter | undefined {
  const subject = getSubject(subjectId);
  return subject?.chapters.find((c) => c.id === chapterId);
}

export function getConcept(subjectId: string, chapterId: string, conceptId: string): Concept | undefined {
  const chapter = getChapter(subjectId, chapterId);
  return chapter?.concepts.find((c) => c.id === conceptId);
}

export function getSubjectByChapterId(chapterId: string): Subject | undefined {
  return mockSubjects.find((s) => s.chapters.some((c) => c.id === chapterId));
}

export function getSubjectByConceptId(conceptId: string): Subject | undefined {
  return mockSubjects.find((s) =>
    s.chapters.some((c) => c.concepts.some((co) => co.id === conceptId)),
  );
}

export function getChapterByConceptId(conceptId: string): Chapter | undefined {
  for (const subject of mockSubjects) {
    const chapter = subject.chapters.find((c) =>
      c.concepts.some((co) => co.id === conceptId),
    );
    if (chapter) return chapter;
  }
  return undefined;
}