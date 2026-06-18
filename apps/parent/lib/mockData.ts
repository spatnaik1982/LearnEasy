export interface Parent {
  id: string;
  name: string;
  email: string;
}

export interface Child {
  id: string;
  name: string;
  age: number;
  level: string;
}

export interface ConceptProgress {
  conceptName: string;
  chapter: string;
  mastery: number;
  completed: boolean;
  lastActivity: string;
}

export interface WeeklyReport {
  dailyActivity: number[];
  days: string[];
  totalTimeMinutes: number;
}

export interface Insight {
  text: string;
  category: "strength" | "area-for-growth" | "suggestion";
}

export const mockParent: Parent = {
  id: "parent-1",
  name: "Priya Sharma",
  email: "priya.sharma@example.com",
};

export const mockChildren: Child[] = [
  { id: "child-1", name: "Rohan", age: 8, level: "Level A" },
  { id: "child-2", name: "Anya", age: 10, level: "Level B" },
];

export function getMockProgress(childId: string): ConceptProgress[] {
  if (childId === "child-1") {
    return [
      { conceptName: "Counting 1 to 10", chapter: "Numbers", mastery: 95, completed: true, lastActivity: "2026-06-17" },
      { conceptName: "Number Recognition 1 to 10", chapter: "Numbers", mastery: 88, completed: true, lastActivity: "2026-06-16" },
      { conceptName: "Basic Shapes", chapter: "Shapes", mastery: 72, completed: false, lastActivity: "2026-06-15" },
      { conceptName: "Addition within 10", chapter: "Addition", mastery: 60, completed: false, lastActivity: "2026-06-17" },
      { conceptName: "Subtraction within 10", chapter: "Subtraction", mastery: 35, completed: false, lastActivity: "2026-06-14" },
    ];
  }
  return [
    { conceptName: "Counting 1 to 20", chapter: "Numbers", mastery: 100, completed: true, lastActivity: "2026-06-10" },
    { conceptName: "Number Recognition 1 to 20", chapter: "Numbers", mastery: 92, completed: true, lastActivity: "2026-06-09" },
    { conceptName: "Addition within 20", chapter: "Addition", mastery: 78, completed: false, lastActivity: "2026-06-16" },
    { conceptName: "Subtraction within 20", chapter: "Subtraction", mastery: 55, completed: false, lastActivity: "2026-06-15" },
    { conceptName: "Skip Counting by 2s", chapter: "Multiplication Readiness", mastery: 40, completed: false, lastActivity: "2026-06-14" },
  ];
}

export function getMockReport(childId: string): WeeklyReport {
  if (childId === "child-1") {
    return {
      dailyActivity: [3, 5, 2, 4, 6, 1, 0],
      days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      totalTimeMinutes: 210,
    };
  }
  return {
    dailyActivity: [4, 3, 5, 2, 7, 2, 1],
    days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    totalTimeMinutes: 280,
  };
}

export function getMockInsights(childId: string): Insight[] {
  if (childId === "child-1") {
    return [
      { text: "Rohan completes counting exercises quickly but takes longer on subtraction.", category: "strength" },
      { text: "He responds well to visual prompts and rewards. Consider using more visual aids for new concepts.", category: "suggestion" },
      { text: "Rohan's focus time is around 15 minutes. Shorter, more frequent sessions may improve retention.", category: "area-for-growth" },
      { text: "He shows strong pattern recognition — skip counting and sequences could be a good next step.", category: "strength" },
    ];
  }
  return [
    { text: "Anya excels at addition but needs more practice with subtraction word problems.", category: "strength" },
    { text: "She works best in quiet environments with minimal distractions.", category: "suggestion" },
    { text: "Anya's confidence grows when she reviews previously mastered concepts before attempting new ones.", category: "suggestion" },
    { text: "Consider introducing multiplication readiness — she shows interest in grouping objects.", category: "area-for-growth" },
  ];
}