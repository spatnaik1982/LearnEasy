export interface Activity {
  id: string;
  type: "visual-counter" | "matching" | "multiple-choice" | "sequencing" | "drag-drop" | "story-question" | "real-world-task" | "fraction-visual" | "place-value-chart" | "grid-area" | "chart-reader" | "clock-time" | "measurement-scale" | "fill-blank";
  title: string;
  config: Record<string, unknown>;
  step?: string;
  order?: number;
}

export interface Concept {
  id: string;
  title: string;
  description: string;
  activities: Activity[];
  mastery?: number;
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
                step: "observe",
                order: 1,
                config: { count: 5, emoji: "🍎" },
              },
              {
                id: "counting-match",
                type: "matching",
                title: "Match Number to Count",
                step: "guided_practice",
                order: 2,
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
                step: "mastery_check",
                order: 3,
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
                step: "guided_practice",
                order: 1,
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
                step: "independent_practice",
                order: 2,
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
                step: "mastery_check",
                order: 3,
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
                step: "observe",
                order: 1,
                config: { count: 4, emoji: "⬛" },
              },
              {
                id: "shapes-match",
                type: "matching",
                title: "Match the Shape",
                step: "guided_practice",
                order: 2,
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
                step: "mastery_check",
                order: 3,
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
                step: "observe",
                order: 1,
                config: { count: 7, emoji: "🍪" },
              },
              {
                id: "add-match",
                type: "matching",
                title: "Match the Sum",
                step: "guided_practice",
                order: 2,
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
                step: "mastery_check",
                order: 3,
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
                step: "observe",
                order: 1,
                config: { count: 3, emoji: "🧁" },
              },
              {
                id: "sub-match",
                type: "matching",
                title: "Match the Difference",
                step: "guided_practice",
                order: 2,
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
                step: "mastery_check",
                order: 3,
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
  {
    id: "level-b-math",
    title: "Level B Math",
    description: "Advanced math concepts for Level B learners",
    emoji: "📐",
    chapters: [
      {
        id: "fractions",
        title: "Fractions",
        description: "Understanding fractions",
        concepts: [
          {
            id: "fractions-intro",
            title: "Introduction to Fractions",
            description: "Learn about fractions as parts of a whole",
            activities: [
              {
                id: "fraction-demo",
                type: "fraction-visual",
                title: "Understanding 3/4",
                step: "observe",
                order: 1,
                config: { numerator: 3, denominator: 4, mode: "bar", showLabel: true },
              },
              {
                id: "fraction-gp",
                type: "fraction-visual",
                title: "Shade 1/2",
                step: "guided_practice",
                order: 2,
                config: { numerator: 1, denominator: 2, mode: "circle", interactive: true },
              },
              {
                id: "fraction-mc",
                type: "multiple-choice",
                title: "Fraction Quiz",
                step: "mastery_check",
                order: 3,
                config: {
                  question: "Which fraction is shaded? (3 out of 4 parts)",
                  options: [
                    { id: "a", label: "1/4" },
                    { id: "b", label: "3/4" },
                    { id: "c", label: "4/3" },
                  ],
                  correctIndex: 1,
                },
              },
            ],
          },
        ],
      },
      {
        id: "measurement",
        title: "Measurement",
        description: "Learn to measure length, weight, volume, and time",
        concepts: [
          {
            id: "telling-time",
            title: "Telling Time",
            description: "Learn to read analog clocks",
            activities: [
              {
                id: "clock-demo",
                type: "clock-time",
                title: "Reading a Clock",
                step: "observe",
                order: 1,
                config: { hour: 3, minute: 45, showDigital: true },
              },
              {
                id: "clock-gp",
                type: "clock-time",
                title: "Set the Clock",
                step: "guided_practice",
                order: 2,
                config: { hour: 7, minute: 30, mode: "set", interactive: true, targetTime: { hour: 7, minute: 30 } },
              },
              {
                id: "clock-mc",
                type: "multiple-choice",
                title: "Time Quiz",
                step: "mastery_check",
                order: 3,
                config: {
                  question: "What time is shown? (Clock shows 8:15)",
                  options: [
                    { id: "a", label: "8:00" },
                    { id: "b", label: "8:15" },
                    { id: "c", label: "8:30" },
                  ],
                  correctIndex: 1,
                },
              },
            ],
          },
          {
            id: "temperature-reading",
            title: "Reading Temperature",
            description: "Learn to read a thermometer",
            activities: [
              {
                id: "thermometer-demo",
                type: "measurement-scale",
                title: "Reading a Thermometer",
                step: "observe",
                order: 1,
                config: { type: "thermometer", min: 0, max: 100, step: 10, unit: "°C", value: 37, showReading: true },
              },
            ],
          },
        ],
      },
      {
        id: "place-value",
        title: "Place Value",
        description: "Understanding place values up to crore",
        concepts: [
          {
            id: "place-value-intro",
            title: "Place Value Chart",
            description: "Learn about place values",
            activities: [
              {
                id: "pv-demo",
                type: "place-value-chart",
                title: "Place Value: Crores",
                step: "observe",
                order: 1,
                config: { maxPlaces: "crore", digits: [1, 2, 3, 4, 5, 6, 7, 8], targetNumber: 12345678 },
              },
              {
                id: "pv-gp",
                type: "place-value-chart",
                title: "Fill the Chart",
                step: "guided_practice",
                order: 2,
                config: { maxPlaces: "lakh", interactive: true, draggableDigits: [1, 5, 3, 2, 7, 0] },
              },
            ],
          },
        ],
      },
      {
        id: "data-handling",
        title: "Data Handling",
        description: "Reading charts and graphs",
        concepts: [
          {
            id: "bar-chart-reading",
            title: "Reading Bar Charts",
            description: "Learn to read bar charts",
            activities: [
              {
                id: "chart-demo",
                type: "chart-reader",
                title: "Favorite Sports",
                step: "observe",
                order: 1,
                config: {
                  type: "bar",
                  data: [
                    { label: "Cricket", value: 8 },
                    { label: "Football", value: 5 },
                    { label: "Tennis", value: 3 },
                  ],
                  title: "Favorite Sports",
                  showValues: true,
                },
              },
            ],
          },
        ],
      },
      {
        id: "geometry",
        title: "Perimeter & Area",
        description: "Counting area on a grid",
        concepts: [
          {
            id: "area-grid",
            title: "Area by Counting Squares",
            description: "Count squares to find area",
            activities: [
              {
                id: "grid-demo",
                type: "grid-area",
                title: "Area: 6 squares",
                step: "observe",
                order: 1,
                config: { rows: 3, cols: 4, highlighted: [{ row: 0, col: 0 }, { row: 0, col: 1 }, { row: 1, col: 0 }, { row: 1, col: 1 }, { row: 2, col: 0 }, { row: 2, col: 1 }], mode: "area", showCount: true },
              },
              {
                id: "grid-gp",
                type: "grid-area",
                title: "Find the Area",
                step: "guided_practice",
                order: 2,
                config: { rows: 4, cols: 5, mode: "area", interactive: true, maxHighlights: 8, showCount: true },
              },
            ],
          },
        ],
      },
      {
        id: "equations",
        title: "Equations & Sequences",
        description: "Fill in missing numbers",
        concepts: [
          {
            id: "fill-blank-intro",
            title: "Fill in the Blanks",
            description: "Complete equations and sequences",
            activities: [
              {
                id: "fb-demo",
                type: "fill-blank",
                title: "Complete the Equation",
                step: "guided_practice",
                order: 1,
                config: {
                  template: "3 + ___ = 8",
                  blanks: [{ id: "b1", position: 0, correctAnswer: "5", options: ["4", "5", "6"] }],
                  mode: "select",
                },
              },
              {
                id: "fb-ip",
                type: "fill-blank",
                title: "Number Pattern",
                step: "independent_practice",
                order: 2,
                config: {
                  template: "2, 4, ___, 8",
                  blanks: [{ id: "b1", position: 0, correctAnswer: "6", options: ["5", "6", "7"] }],
                  mode: "select",
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