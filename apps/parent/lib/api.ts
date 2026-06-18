import {
  mockParent,
  mockChildren,
  getMockProgress,
  getMockReport,
  getMockInsights,
  type Parent,
  type Child,
  type ConceptProgress,
  type WeeklyReport,
  type Insight,
} from "./mockData";

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function getParent(parentId: string): Promise<ApiResponse<Parent>> {
  await delay(200);
  if (mockParent.id === parentId) {
    return { data: mockParent, error: null };
  }
  return { data: null, error: "Parent not found" };
}

export async function getChildren(parentId: string): Promise<ApiResponse<Child[]>> {
  await delay(200);
  if (mockParent.id === parentId) {
    return { data: mockChildren, error: null };
  }
  return { data: null, error: "Parent not found" };
}

export async function getStudentProgress(studentId: string): Promise<ApiResponse<ConceptProgress[]>> {
  await delay(250);
  const progress = getMockProgress(studentId);
  return { data: progress, error: null };
}

export async function getStudentReports(studentId: string): Promise<ApiResponse<WeeklyReport>> {
  await delay(250);
  const report = getMockReport(studentId);
  return { data: report, error: null };
}

export async function getStudentInsights(studentId: string): Promise<ApiResponse<Insight[]>> {
  await delay(250);
  const insights = getMockInsights(studentId);
  return { data: insights, error: null };
}