import type { GeneratedConcept } from '../types';
import { VALID_TYPES_PER_STEP } from '../types';

const KEYWORD_MAP: Record<string, string[]> = {
  visual_counting: ['count', 'count', 'number', 'quantity', 'many', 'how many', 'objects', 'total'],
  matching: ['match', 'match', 'match', 'identify', 'classify', 'sort', 'pair', 'correspond'],
  drag_drop: ['drag', 'place', 'arrange', 'complete', 'fill', 'label', 'position'],
  sequencing: ['order', 'sequence', 'ascending', 'descending', 'arrange', 'first', 'next', 'last', 'before', 'after'],
  multiple_choice: ['which', 'choose', 'select', 'what is', 'identify'],
  story_question: ['scenario', 'story', 'real', 'everyday', 'world', 'situation'],
  real_world: ['real world', 'practical', 'everyday', 'apply', 'scenario'],
  fraction_visual: ['fraction', 'part', 'whole', 'numerator', 'denominator', 'equal parts', 'shaded', 'half', 'quarter'],
  place_value_chart: ['place value', 'digit', 'thousands', 'hundreds', 'tens', 'ones', 'lakh', 'crore'],
  grid_area: ['grid', 'area', 'perimeter', 'square', 'rows', 'columns'],
  chart_reader: ['chart', 'graph', 'bar', 'pictograph', 'data'],
  clock_time: ['clock', 'time', 'hour', 'minute', 'o\'clock', 'half past', 'quarter'],
  measurement_scale: ['measure', 'length', 'weight', 'ruler', 'scale', 'thermometer', 'cylinder', 'cm', 'meter', 'gram'],
  fill_blank: ['fill', 'complete', 'missing', 'blank', 'equation'],
};

function scoreKeywords(text: string, keywords: string[]): number {
  const lower = text.toLowerCase();
  return keywords.reduce((score, kw) => score + (lower.includes(kw) ? 1 : 0), 0);
}

export function selectTypeForStep(
  step: string,
  concept: GeneratedConcept,
): string {
  const allowed = VALID_TYPES_PER_STEP[step] as string[] | undefined;
  if (!allowed || allowed.length === 0) {
    throw new Error(`No valid types for step: ${step}`);
  }

  if (allowed.length === 1) return allowed[0];

  const conceptText = [
    concept.learningObjective,
    concept.coreIdea,
    ...concept.examples,
  ].join(' ');

  let bestType = allowed[0];
  let bestScore = -1;

  for (const type of allowed) {
    const keywords = KEYWORD_MAP[type] || [];
    const score = scoreKeywords(conceptText, keywords);
    if (score > bestScore) {
      bestScore = score;
      bestType = type;
    }
  }

  return bestType;
}

export function selectTypesForConcept(
  concept: GeneratedConcept,
): Record<string, string> {
  return {
    observe: selectTypeForStep('observe', concept),
    guided_practice: selectTypeForStep('guided_practice', concept),
    independent_practice: selectTypeForStep('independent_practice', concept),
    mastery_check: 'multiple_choice',
    positive_completion: 'visual_counting',
  };
}
