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

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === "true";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function getParentToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem("learn-easy-parent-token");
  } catch {
    return null;
  }
}

function authHeaders(): Record<string, string> {
  const token = getParentToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

async function apiFetch<T>(
  url: string,
  options?: RequestInit,
): Promise<ApiResponse<T>> {
  try {
    const res = await fetch(`${API_URL}${url}`, {
      ...options,
      headers: {
        ...authHeaders(),
        ...(options?.headers || {}),
      },
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      const message =
        body.message || body.error || `HTTP ${res.status}: ${res.statusText}`;
      return { data: null, error: message };
    }

    const data = await res.json();
    return { data, error: null };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "An unexpected error occurred";
    return { data: null, error: message };
  }
}

export async function getParent(parentId: string): Promise<ApiResponse<Parent>> {
  if (USE_MOCK) {
    await delay(200);
    if (mockParent.id === parentId) {
      return { data: mockParent, error: null };
    }
    return { data: null, error: "Parent not found" };
  }
  const res = await apiFetch<{ data: Parent }>(`/parents/${parentId}`);
  if (res.data) return { data: res.data.data, error: null };
  return { data: null, error: res.error };
}

export async function getChildren(parentId: string): Promise<ApiResponse<Child[]>> {
  if (USE_MOCK) {
    await delay(200);
    if (mockParent.id === parentId) {
      return { data: mockChildren, error: null };
    }
    return { data: null, error: "Parent not found" };
  }
  const res = await apiFetch<{ data: { children: Child[] } }>(`/parents/${parentId}`);
  if (res.data) return { data: res.data.data.children, error: null };
  return { data: null, error: res.error };
}

export async function updateParentProfile(
  parentId: string,
  data: Record<string, unknown>,
): Promise<ApiResponse<Record<string, unknown>>> {
  if (USE_MOCK) {
    await delay(200);
    return { data: { id: parentId, ...data }, error: null };
  }
  return apiFetch(`/parents/${parentId}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function getStudentProgress(studentId: string): Promise<ApiResponse<ConceptProgress[]>> {
  if (USE_MOCK) {
    await delay(250);
    const progress = getMockProgress(studentId);
    return { data: progress, error: null };
  }
  return { data: null, error: "Not implemented" };
}

export async function getStudentReports(studentId: string): Promise<ApiResponse<WeeklyReport>> {
  if (USE_MOCK) {
    await delay(250);
    const report = getMockReport(studentId);
    return { data: report, error: null };
  }
  return { data: null, error: "Not implemented" };
}

export async function getStudentInsights(studentId: string): Promise<ApiResponse<Insight[]>> {
  if (USE_MOCK) {
    await delay(250);
    const insights = getMockInsights(studentId);
    return { data: insights, error: null };
  }
  return { data: null, error: "Not implemented" };
}
