import {
  mockSubjects,
  getSubject,
  getChapter,
  getConcept,
  getSubjectByChapterId,
  getSubjectByConceptId,
  getChapterByConceptId,
  type Subject as MockSubject,
  type Chapter as MockChapter,
  type Concept as MockConcept,
  type Activity as MockActivity,
} from "./mockData";

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";
const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === "true";

// ── Auth helpers ────────────────────────────────────────────────

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem("learn-easy-token");
  } catch {
    return null;
  }
}

function authHeaders(): Record<string, string> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

// ── Generic fetch wrapper ──────────────────────────────────────

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

// ── Subject helpers ─────────────────────────────────────────────

// Unused subject-helper constants removed to fix lint error

function guessEmoji(idOrCode: string): string {
  const lower = idOrCode.toLowerCase();
  if (lower.includes("math")) return "🔢";
  if (lower.includes("lang")) return "📖";
  if (lower.includes("evs")) return "🌍";
  return "📚";
}

function guessDescription(idOrCode: string): string {
  const lower = idOrCode.toLowerCase();
  if (lower.includes("math")) return "Foundational math concepts for early learners";
  if (lower.includes("lang")) return "Language and literacy skills";
  if (lower.includes("evs")) return "Environmental studies and science";
  return "";
}

// ── Transform helpers ───────────────────────────────────────────

interface ApiSubject {
  id: string;
  levelId?: string;
  code?: string;
  name?: string;
  _count?: { chapters?: number };
}

interface ApiChapter {
  id: string;
  subjectId?: string;
  code?: string;
  name?: string;
  order?: number;
  _count?: { concepts?: number };
}

interface ApiConcept {
  id: string;
  chapterId?: string;
  code?: string;
  name?: string;
  objective?: string;
  order?: number;
  difficulty?: string;
  _count?: { activities?: number };
  chapter?: { id: string; subjectId: string; name: string };
}

interface ApiActivity {
  id: string;
  conceptId?: string;
  type?: string;
  step?: string;
  order?: number;
  content?: Record<string, unknown>;
}

function toMockSubject(from: ApiSubject): MockSubject {
  const code = from.code || from.id || "";
  return {
    id: from.id,
    title: from.name || code,
    description: guessDescription(code),
    emoji: guessEmoji(code),
    chapters: [],
  };
}

function toMockChapter(from: ApiChapter): MockChapter {
  return {
    id: from.id,
    title: from.name || "",
    description: from.name || "",
    concepts: [],
  };
}

function toMockConcept(from: ApiConcept): MockConcept {
  return {
    id: from.id,
    title: from.name || "",
    description: from.objective || "",
    activities: [],
  };
}

function toMockActivity(from: ApiActivity): MockActivity {
  return {
    id: from.id,
    type: (from.type as MockActivity["type"]) || "visual-counter",
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- API response shape is unknown
    title: (from.content as any)?.description || "",
    config: from.content || {},
    step: from.step,
    order: from.order,
  };
}

// ── Public API functions ───────────────────────────────────────

export async function fetchSubjects(): Promise<ApiResponse<MockSubject[]>> {
  if (USE_MOCK) {
    return { data: mockSubjects, error: null };
  }

  const res = await apiFetch<ApiSubject[]>("/levels/A/subjects");
  if (!res.data) return { data: null as MockSubject[] | null, error: res.error };

  return {
    data: res.data.map(toMockSubject),
    error: null,
  };
}

export async function fetchSubject(
  id: string,
): Promise<ApiResponse<MockSubject>> {
  if (USE_MOCK) {
    const subject = getSubject(id);
    if (!subject) return { data: null, error: "Subject not found" };
    return { data: subject, error: null };
  }

  // Fetch chapters for this subject
  const chaptersRes = await apiFetch<ApiChapter[]>(`/subjects/${id}/chapters`);
  if (!chaptersRes.data) {
    // Try fetching subject alone
    const subRes = await apiFetch<ApiSubject>(`/subjects/${id}`);
    if (!subRes.data) return { data: null, error: chaptersRes.error || "Subject not found" };
    return { data: toMockSubject(subRes.data), error: null };
  }

  // Get subject metadata
  const subRes = await apiFetch<ApiSubject>(`/subjects/${id}`);

  const subject = subRes.data
    ? toMockSubject(subRes.data)
    : {
        id,
        title: id,
        description: "",
        emoji: guessEmoji(id),
        chapters: [],
      };

  subject.chapters = chaptersRes.data.map((ch) => toMockChapter(ch));

  return { data: subject, error: null };
}

export async function fetchChapters(
  subjectId: string,
): Promise<ApiResponse<MockChapter[]>> {
  if (USE_MOCK) {
    const subject = getSubject(subjectId);
    if (!subject) return { data: null, error: "Subject not found" };
    return { data: subject.chapters, error: null };
  }

  const res = await apiFetch<ApiChapter[]>(`/subjects/${subjectId}/chapters`);
  if (!res.data) return { data: null as MockChapter[] | null, error: res.error };

  return {
    data: res.data.map(toMockChapter),
    error: null,
  };
}

export async function fetchChapter(
  subjectId: string,
  chapterId: string,
): Promise<ApiResponse<MockChapter>> {
  if (USE_MOCK) {
    const chapter = getChapter(subjectId, chapterId);
    if (!chapter) return { data: null, error: "Chapter not found" };
    return { data: chapter, error: null };
  }

  // Fetch chapter info
  const chRes = await apiFetch<ApiChapter>(`/chapters/${chapterId}`);
  const conceptsRes = await apiFetch<ApiConcept[]>(
    `/chapters/${chapterId}/concepts`,
  );

  if (!chRes.data) {
    return { data: null, error: "Chapter not found" };
  }

  const chapter = toMockChapter(chRes.data);
  if (conceptsRes.data) {
    chapter.concepts = conceptsRes.data.map(toMockConcept);
  }

  return { data: chapter, error: null };
}

export async function fetchConcepts(
  subjectId: string,
  chapterId: string,
): Promise<ApiResponse<MockConcept[]>> {
  if (USE_MOCK) {
    const chapter = getChapter(subjectId, chapterId);
    if (!chapter) return { data: null, error: "Chapter not found" };
    return { data: chapter.concepts, error: null };
  }

  const res = await apiFetch<ApiConcept[]>(`/chapters/${chapterId}/concepts`);
  if (!res.data) return { data: null as MockConcept[] | null, error: res.error };

  return {
    data: res.data.map(toMockConcept),
    error: null,
  };
}

export async function fetchConcept(
  subjectId: string,
  chapterId: string,
  conceptId: string,
): Promise<ApiResponse<MockConcept>> {
  if (USE_MOCK) {
    const concept = getConcept(subjectId, chapterId, conceptId);
    if (!concept) return { data: null, error: "Concept not found" };
    return { data: concept, error: null };
  }

  // Fetch concept info
  const conceptRes = await apiFetch<ApiConcept>(`/concepts/${conceptId}`);
  const activitiesRes = await apiFetch<ApiActivity[]>(
    `/concepts/${conceptId}/activities`,
  );

  if (!conceptRes.data) {
    return { data: null, error: "Concept not found" };
  }

  const concept = toMockConcept(conceptRes.data);
  if (activitiesRes.data) {
    concept.activities = activitiesRes.data.map(toMockActivity);
  }

  return { data: concept, error: null };
}

export async function fetchChapterBySubject(
  chapterId: string,
): Promise<ApiResponse<MockChapter & { subject: MockSubject }>> {
  if (USE_MOCK) {
    const subject = getSubjectByChapterId(chapterId);
    const chapter = getChapterByConceptId(chapterId);
    if (!subject || !chapter)
      return { data: null, error: "Chapter not found" };
    return { data: { ...chapter, subject }, error: null };
  }

  const chRes = await apiFetch<ApiChapter>(`/chapters/${chapterId}`);
  if (!chRes.data) return { data: null, error: "Chapter not found" };

  const chapter = toMockChapter(chRes.data);

  // Try to get subject info
  const subjectId = chRes.data.subjectId;
  let subject: MockSubject = {
    id: subjectId || "",
    title: "",
    description: "",
    emoji: "",
    chapters: [],
  };
  if (subjectId) {
    const subRes = await apiFetch<ApiSubject>(`/subjects/${subjectId}`);
    if (subRes.data) {
      subject = toMockSubject(subRes.data);
    }
  }

  return { data: { ...chapter, subject }, error: null };
}

export async function fetchParentIds(
  conceptId: string,
): Promise<ApiResponse<{ subjectId: string; chapterId: string }>> {
  if (USE_MOCK) {
    const subject = getSubjectByConceptId(conceptId);
    const chapter = getChapterByConceptId(conceptId);
    if (!subject || !chapter)
      return { data: null, error: "Concept not found" };
    return {
      data: { subjectId: subject.id, chapterId: chapter.id },
      error: null,
    };
  }

  // GET /concepts/:id returns concept with { chapter: { id, subjectId, name } }
  const res = await apiFetch<ApiConcept>(`/concepts/${conceptId}`);
  if (!res.data) return { data: null, error: "Concept not found" };

  const chapterInfo = res.data.chapter;
  if (!chapterInfo) return { data: null, error: "Concept parent info not found" };

  return {
    data: { subjectId: chapterInfo.subjectId, chapterId: chapterInfo.id },
    error: null,
  };
}

// ── New: Progress & Attempts ───────────────────────────────────

export async function recordAttempt(
  activityId: string,
  response: Record<string, unknown>,
  hintsUsed = 0,
  timeSpent = 0,
): Promise<ApiResponse<{ attemptId: string; correct: boolean; feedback: string }>> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 200));
    return {
      data: {
        attemptId: "mock-attempt-" + Date.now(),
        correct: true,
        feedback: "Great work!",
      },
      error: null,
    };
  }

  const studentId = getStudentIdFromToken();
  return apiFetch(`/activities/${activityId}/attempt`, {
    method: "POST",
    body: JSON.stringify({ studentId, response, hintsUsed, timeSpent }),
  });
}

export async function fetchProgress(
  studentId: string,
): Promise<ApiResponse<unknown>> {
  if (USE_MOCK) {
    return { data: [], error: null };
  }

  return apiFetch(`/students/${studentId}/progress`);
}

export async function startSession(
  studentId: string,
): Promise<ApiResponse<{ id: string }>> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 100));
    return {
      data: { id: "mock-session-" + Date.now() },
      error: null,
    };
  }

  return apiFetch("/sessions", {
    method: "POST",
    body: JSON.stringify({ studentId }),
  });
}

export async function endSession(
  sessionId: string,
): Promise<ApiResponse<unknown>> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 100));
    return { data: { ended: true }, error: null };
  }

  return apiFetch(`/sessions/${sessionId}/end`, {
    method: "PATCH",
  });
}

// ── Resume learning ────────────────────────────────────────────

export async function fetchResumeState(
  studentId: string,
): Promise<
  ApiResponse<{
    hasResumableSession: boolean;
    hasCompletedToday?: boolean;
    conceptId?: string;
    chapterId?: string;
    subjectId?: string;
    step?: number;
    activityId?: string;
  }>
> {
  if (USE_MOCK) {
    return { data: { hasResumableSession: false }, error: null };
  }

  return apiFetch(`/students/${studentId}/resume-state`);
}

// ── Onboarding ──────────────────────────────────────────────────

export async function completeOnboarding(
  studentId: string,
): Promise<ApiResponse<{ completed: boolean }>> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 100));
    return { data: { completed: true }, error: null };
  }
  return apiFetch(`/students/${studentId}/onboarding/complete`, {
    method: "PATCH",
  });
}

// ── Utility ─────────────────────────────────────────────────────

function getStudentIdFromToken(): string {
  try {
    const token = getToken();
    if (!token) return "unknown";
    const payload = token.split(".")[1];
    const decoded = JSON.parse(atob(payload));
    return decoded.sub || "unknown";
  } catch {
    return "unknown";
  }
}
