export interface ExtractedPDF {
  metadata: {
    title: string;
    totalPages: number;
  };
  chapters: ChapterChunk[];
}

export interface ChapterChunk {
  chapterNumber: number;
  chapterTitle: string;
  sections: SectionChunk[];
  pages: number[];
}

export interface SectionChunk {
  heading: string;
  body: string;
  examples: string[];
  exercises: string[];
}

export interface ConceptCandidate {
  chapterNumber: number;
  chapterName: string;
  conceptId: string;
  learningObjective: string;
  coreIdea: string;
  examples: string[];
  misconceptions: string[];
  suggestedDependencies: string[];
  sourceSections: string[];
  supportingText: string;
  estimatedDuration: number;
}

export interface GeneratedConcept {
  conceptId: string;
  chapterCode: string;
  chapterName: string;
  learningObjective: string;
  coreIdea: string;
  examples: string[];
  misconceptions: string[];
  supports: { visual: boolean };
  masteryCriteria: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedDuration: number;
  dependencies: string[];
}

export interface GeneratedActivity {
  step: 'observe' | 'guided_practice' | 'independent_practice' | 'mastery_check' | 'positive_completion';
  type: string;
  order: number;
  content: Record<string, unknown>;
}

export interface ValidatedOutput {
  passed: ConceptActivityPair[];
  failed: FailedConcept[];
  warnings: ConceptWarning[];
}

export interface ConceptActivityPair {
  concept: GeneratedConcept;
  activities: GeneratedActivity[];
}

export interface FailedConcept {
  concept: GeneratedConcept;
  errors: string[];
  retries: number;
}

export interface ConceptWarning {
  conceptId: string;
  warnings: string[];
}

export interface PipelineState {
  pdfPath: string;
  levelCode: string;
  subject: string;
  force: boolean;
  outputDir: string;
  llmProvider: string;
  llmModel: string;
  interactive: boolean;
  dryRun: boolean;
  verbose: boolean;

  rawText: string | null;
  chapters: ChapterChunk[];
  concepts: GeneratedConcept[];
  activities: Map<string, GeneratedActivity[]>;
  validated: ValidatedOutput | null;
  outputPaths: string[];

  retryCounts: Map<string, number>;
  maxRetries: number;
  errors: string[];
  status: 'running' | 'complete' | 'partial' | 'failed';
  startedAt: string;
  completedAt: string | null;
}

export const VALID_STEPS = [
  'observe',
  'guided_practice',
  'independent_practice',
  'mastery_check',
  'positive_completion',
] as const;

export const VALID_ACTIVITY_TYPES = [
  'visual_counting',
  'matching',
  'drag_drop',
  'sequencing',
  'multiple_choice',
  'story_question',
  'real_world',
  'fraction_visual',
  'place_value_chart',
  'grid_area',
  'chart_reader',
  'clock_time',
  'measurement_scale',
  'fill_blank',
] as const;

export const VALID_TYPES_PER_STEP: Record<string, readonly string[]> = {
  observe: [
    'visual_counting', 'story_question', 'fraction_visual',
    'place_value_chart', 'grid_area', 'clock_time',
    'measurement_scale', 'chart_reader',
  ],
  guided_practice: [
    'visual_counting', 'matching', 'drag_drop', 'sequencing',
    'story_question', 'fraction_visual', 'place_value_chart', 'fill_blank',
  ],
  independent_practice: [
    'visual_counting', 'matching', 'drag_drop', 'sequencing',
    'fraction_visual', 'place_value_chart', 'fill_blank',
  ],
  mastery_check: ['multiple_choice', 'fill_blank'],
  positive_completion: ['visual_counting'],
};
