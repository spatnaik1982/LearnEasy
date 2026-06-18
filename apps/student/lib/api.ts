import {
  mockSubjects,
  getSubject,
  getChapter,
  getConcept,
  getSubjectByChapterId,
  getSubjectByConceptId,
  getChapterByConceptId,
  type Subject,
  type Chapter,
  type Concept,
} from "./mockData";

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function fetchSubjects(): Promise<ApiResponse<Subject[]>> {
  await delay(200);
  return { data: mockSubjects, error: null };
}

export async function fetchSubject(id: string): Promise<ApiResponse<Subject>> {
  await delay(150);
  const subject = getSubject(id);
  if (!subject) return { data: null, error: "Subject not found" };
  return { data: subject, error: null };
}

export async function fetchChapters(subjectId: string): Promise<ApiResponse<Chapter[]>> {
  await delay(150);
  const subject = getSubject(subjectId);
  if (!subject) return { data: null, error: "Subject not found" };
  return { data: subject.chapters, error: null };
}

export async function fetchChapter(subjectId: string, chapterId: string): Promise<ApiResponse<Chapter>> {
  await delay(100);
  const chapter = getChapter(subjectId, chapterId);
  if (!chapter) return { data: null, error: "Chapter not found" };
  return { data: chapter, error: null };
}

export async function fetchConcepts(subjectId: string, chapterId: string): Promise<ApiResponse<Concept[]>> {
  await delay(100);
  const chapter = getChapter(subjectId, chapterId);
  if (!chapter) return { data: null, error: "Chapter not found" };
  return { data: chapter.concepts, error: null };
}

export async function fetchConcept(
  subjectId: string,
  chapterId: string,
  conceptId: string,
): Promise<ApiResponse<Concept>> {
  await delay(100);
  const concept = getConcept(subjectId, chapterId, conceptId);
  if (!concept) return { data: null, error: "Concept not found" };
  return { data: concept, error: null };
}

export async function fetchChapterBySubject(chapterId: string): Promise<ApiResponse<Chapter & { subject: Subject }>> {
  await delay(100);
  const subject = getSubjectByChapterId(chapterId);
  const chapter = getChapterByConceptId(chapterId);
  if (!subject || !chapter) return { data: null, error: "Chapter not found" };
  return { data: { ...chapter, subject }, error: null };
}

export async function fetchParentIds(conceptId: string): Promise<
  ApiResponse<{ subjectId: string; chapterId: string }>
> {
  await delay(100);
  const subject = getSubjectByConceptId(conceptId);
  const chapter = getChapterByConceptId(conceptId);
  if (!subject || !chapter) return { data: null, error: "Concept not found" };
  return { data: { subjectId: subject.id, chapterId: chapter.id }, error: null };
}