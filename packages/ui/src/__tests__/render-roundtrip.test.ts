import { runRoundtrip, buildCorrectResponse } from '../render-roundtrip';
import { evaluateActivity } from '../activity-utils';

describe('buildCorrectResponse', () => {
  it('visual_counting: returns count when count field present', () => {
    const r = buildCorrectResponse('visual_counting', { count: 5 });
    expect(r.count).toBe(5);
  });

  it('visual_counting: returns sum for addition variant', () => {
    const r = buildCorrectResponse('visual_counting', { left: [1, 2], right: [3], sum: 3 });
    expect(r.count).toBe(3);
  });

  it('visual_counting: returns 0 when no count or sum present', () => {
    const r = buildCorrectResponse('visual_counting', {});
    expect(r.count).toBe(0);
  });

  it('matching: returns correct=true for each pair', () => {
    const pairs = [{ id: 'p1', itemA: 'A', itemB: 'B' }];
    const r = buildCorrectResponse('matching', { pairs });
    expect(r.pairs).toEqual([{ id: 'p1', correct: true }]);
  });

  it('matching: returns empty array when no pairs', () => {
    const r = buildCorrectResponse('matching', {});
    expect(r.pairs).toEqual([]);
  });

  it('sequencing: returns correct order', () => {
    const r = buildCorrectResponse('sequencing', { correctOrder: ['a', 'b'] });
    expect(r.order).toEqual(['a', 'b']);
  });

  it('sequencing: returns empty order when no correctOrder', () => {
    const r = buildCorrectResponse('sequencing', {});
    expect(r.order).toEqual([]);
  });

  it('multiple_choice: returns correctIndex from questions array', () => {
    const r = buildCorrectResponse('multiple_choice', { questions: [{ question: 'Q', options: ['a', 'b'], correctIndex: 1 }] });
    expect(r.selectedIndex).toBe(1);
  });

  it('multiple_choice: falls back to correctIndex at top level', () => {
    const r = buildCorrectResponse('multiple_choice', { correctIndex: 0 });
    expect(r.selectedIndex).toBe(0);
  });

  it('multiple_choice: defaults to 0 when no correctIndex found', () => {
    const r = buildCorrectResponse('multiple_choice', {});
    expect(r.selectedIndex).toBe(0);
  });

  it('drag_drop: returns expected positions', () => {
    const r = buildCorrectResponse('drag_drop', { expectedPositions: { i1: 't1', i2: 't2' } });
    expect(r.droppedPositions).toEqual({ i1: 't1', i2: 't2' });
  });

  it('drag_drop: returns empty object when no expectedPositions', () => {
    const r = buildCorrectResponse('drag_drop', {});
    expect(r.droppedPositions).toEqual({});
  });

  it('chart_reader: returns correctLabel', () => {
    const r = buildCorrectResponse('chart_reader', { correctLabel: 'A' });
    expect(r.selectedLabel).toBe('A');
  });

  it('chart_reader: returns empty string when no correctLabel', () => {
    const r = buildCorrectResponse('chart_reader', {});
    expect(r.selectedLabel).toBe('');
  });

  it('clock_time: returns targetTime hour and minute', () => {
    const r = buildCorrectResponse('clock_time', { targetTime: { hour: 3, minute: 0 } });
    expect(r.hour).toBe(3);
    expect(r.minute).toBe(0);
  });

  it('clock_time: returns 0:0 when no targetTime', () => {
    const r = buildCorrectResponse('clock_time', {});
    expect(r.hour).toBe(0);
    expect(r.minute).toBe(0);
  });

  it('measurement_scale: returns targetValue', () => {
    const r = buildCorrectResponse('measurement_scale', { targetValue: 12 });
    expect(r.value).toBe(12);
  });

  it('measurement_scale: returns 0 when no targetValue', () => {
    const r = buildCorrectResponse('measurement_scale', {});
    expect(r.value).toBe(0);
  });

  it('fill_blank: returns answers keyed by blank id', () => {
    const r = buildCorrectResponse('fill_blank', { blanks: [{ id: 'b1', correctAnswer: '5' }] });
    expect(r.answers).toEqual({ b1: '5' });
  });

  it('fill_blank: returns empty object when no blanks', () => {
    const r = buildCorrectResponse('fill_blank', {});
    expect(r.answers).toEqual({});
  });

  it('place_value_chart: returns placedDigits for lakh with targetNumber', () => {
    const r = buildCorrectResponse('place_value_chart', { maxPlaces: 'lakh', targetNumber: 543 });
    expect(r.placedDigits).toEqual({ 0: 0, 1: 0, 2: 0, 3: 5, 4: 4, 5: 3 });
  });

  it('place_value_chart: returns placedDigits for crore with targetNumber', () => {
    const r = buildCorrectResponse('place_value_chart', { maxPlaces: 'crore', targetNumber: 1234 });
    expect(r.placedDigits).toEqual({ 0: 0, 1: 0, 2: 0, 3: 0, 4: 1, 5: 2, 6: 3, 7: 4 });
  });

  it('place_value_chart: skips when no targetNumber', () => {
    const r = buildCorrectResponse('place_value_chart', { maxPlaces: 'lakh' });
    expect(r.__skip).toBe('no targetNumber');
  });

  it('real_world: returns completed=true', () => {
    const r = buildCorrectResponse('real_world', {});
    expect(r.completed).toBe(true);
  });

  it('fraction_visual: returns shaded from numerator', () => {
    const r = buildCorrectResponse('fraction_visual', { numerator: 3 });
    expect(r.shaded).toBe(3);
  });

  it('fraction_visual: returns 0 when no numerator', () => {
    const r = buildCorrectResponse('fraction_visual', {});
    expect(r.shaded).toBe(0);
  });

  it('grid_area: returns highlighted cells and count', () => {
    const highlighted = [{ row: 0, col: 0 }, { row: 0, col: 1 }];
    const r = buildCorrectResponse('grid_area', { highlighted });
    expect(r.highlighted).toEqual(highlighted);
    expect(r.count).toBe(2);
  });

  it('grid_area: returns empty array when no highlighted', () => {
    const r = buildCorrectResponse('grid_area', {});
    expect(r.highlighted).toEqual([]);
    expect(r.count).toBe(0);
  });

  it('story_question: returns selectedIndex from first question', () => {
    const r = buildCorrectResponse('story_question', { questions: [{ question: 'Q', options: ['a', 'b'], correctIndex: 0 }] });
    expect(r.selectedIndex).toBe(0);
  });

  it('story_question: falls back to top-level correctIndex', () => {
    const r = buildCorrectResponse('story_question', { correctIndex: 1 });
    expect(r.selectedIndex).toBe(1);
  });

  it('unknown type: returns __skip', () => {
    const r = buildCorrectResponse('unknown_type', {});
    expect(r.__skip).toContain('unknown');
  });
});

describe('runRoundtrip — correct responses', () => {
  it('observe step: visual_counting passes with observed:true', () => {
    const result = runRoundtrip({ id: 't1', type: 'visual_counting', step: 'observe', content: { count: 3 } });
    expect(result.passed).toBe(true);
  });

  it('visual_counting: guided_practice with correct count', () => {
    const result = runRoundtrip({ id: 't1', type: 'visual_counting', step: 'guided_practice', content: { count: 5 } });
    expect(result.passed).toBe(true);
  });

  it('visual_counting: independent_practice with sum', () => {
    const result = runRoundtrip({ id: 't1', type: 'visual_counting', step: 'independent_practice', content: { left: ['🐦', '🐦'], right: ['🐦'], sum: 3 } });
    expect(result.passed).toBe(true);
  });

  it('matching: guided_practice with correct pairs', () => {
    const pairs = [{ id: 'p1', itemA: 'A', itemB: 'B' }];
    const result = runRoundtrip({ id: 't1', type: 'matching', step: 'guided_practice', content: { pairs } });
    expect(result.passed).toBe(true);
  });

  it('matching: independent_practice with multiple pairs', () => {
    const pairs = [{ id: 'p1', itemA: '1', itemB: 'one' }, { id: 'p2', itemA: '2', itemB: 'two' }, { id: 'p3', itemA: '3', itemB: 'three' }];
    const result = runRoundtrip({ id: 't1', type: 'matching', step: 'independent_practice', content: { pairs } });
    expect(result.passed).toBe(true);
  });

  it('sequencing: independent_practice with correct order', () => {
    const items = [{ id: 's1', label: 'Step 1' }, { id: 's2', label: 'Step 2' }];
    const result = runRoundtrip({ id: 't1', type: 'sequencing', step: 'independent_practice', content: { items, correctOrder: ['s1', 's2'] } });
    expect(result.passed).toBe(true);
  });

  it('multiple_choice: mastery_check with correct answer', () => {
    const result = runRoundtrip({ id: 't1', type: 'multiple_choice', step: 'mastery_check', content: { questions: [{ question: 'Q', options: ['a', 'b', 'c', 'd'], correctIndex: 2 }] } });
    expect(result.passed).toBe(true);
  });

  it('multiple_choice: multi-question all correct', () => {
    const result = runRoundtrip({ id: 't1', type: 'multiple_choice', step: 'mastery_check', content: { questions: [{ question: 'Q1', options: ['a', 'b'], correctIndex: 0 }, { question: 'Q2', options: ['a', 'b'], correctIndex: 1 }] } });
    expect(result.passed).toBe(true);
  });

  it('story_question: guided_practice with correct answer', () => {
    const result = runRoundtrip({ id: 't1', type: 'story_question', step: 'guided_practice', content: { scenario: 'Test', questions: [{ question: 'Q', options: ['a', 'b', 'c', 'd'], correctIndex: 0 }] } });
    expect(result.passed).toBe(true);
  });

  it('drag_drop: guided_practice with correct positions', () => {
    const result = runRoundtrip({ id: 't1', type: 'drag_drop', step: 'guided_practice', content: { items: [{ id: 'i1', label: 'A' }], targets: [{ id: 't1', label: 'T' }], expectedPositions: { i1: 't1' } } });
    expect(result.passed).toBe(true);
  });

  it('drag_drop: independent_practice multi-item', () => {
    const result = runRoundtrip({ id: 't1', type: 'drag_drop', step: 'independent_practice', content: { items: [{ id: 'i1', label: 'A' }, { id: 'i2', label: 'B' }], targets: [{ id: 't1', label: 'T1' }, { id: 't2', label: 'T2' }], expectedPositions: { i1: 't1', i2: 't2' } } });
    expect(result.passed).toBe(true);
  });

  it('real_world: guided_practice always passes', () => {
    const result = runRoundtrip({ id: 't1', type: 'real_world', step: 'guided_practice', content: { scenario: 'Test' } });
    expect(result.passed).toBe(true);
  });

  it('fraction_visual: observe non-interactive passes', () => {
    const result = runRoundtrip({ id: 't1', type: 'fraction_visual', step: 'observe', content: { numerator: 1, denominator: 2, mode: 'bar', interactive: false } });
    expect(result.passed).toBe(true);
  });

  it('fraction_visual: interactive guided_practice with correct shade', () => {
    const result = runRoundtrip({ id: 't1', type: 'fraction_visual', step: 'guided_practice', content: { numerator: 3, denominator: 4, mode: 'bar', interactive: true } });
    expect(result.passed).toBe(true);
  });

  it('place_value_chart: observe non-interactive passes', () => {
    const result = runRoundtrip({ id: 't1', type: 'place_value_chart', step: 'observe', content: { maxPlaces: 'lakh', digits: [5, 4, 3], interactive: false } });
    expect(result.passed).toBe(true);
  });

  it('place_value_chart: interactive guided_practice with targetNumber', () => {
    const result = runRoundtrip({ id: 't1', type: 'place_value_chart', step: 'guided_practice', content: { maxPlaces: 'lakh', targetNumber: 543, interactive: true, draggableDigits: [5, 4, 3] } });
    expect(result.passed).toBe(true);
  });

  it('grid_area: observe non-interactive passes', () => {
    const result = runRoundtrip({ id: 't1', type: 'grid_area', step: 'observe', content: { rows: 5, cols: 5, mode: 'area', highlighted: [{ row: 0, col: 0 }] } });
    expect(result.passed).toBe(true);
  });

  it('grid_area: interactive guided_practice with authored target', () => {
    const result = runRoundtrip({ id: 't1', type: 'grid_area', step: 'guided_practice', content: { rows: 5, cols: 5, mode: 'area', interactive: true, highlighted: [{ row: 0, col: 0 }, { row: 0, col: 1 }] } });
    expect(result.passed).toBe(true);
  });

  it('chart_reader: observe non-interactive passes', () => {
    const result = runRoundtrip({ id: 't1', type: 'chart_reader', step: 'observe', content: { type: 'bar', data: [{ label: 'A', value: 1 }], interactive: false } });
    expect(result.passed).toBe(true);
  });

  it('chart_reader: interactive with correctLabel', () => {
    const result = runRoundtrip({ id: 't1', type: 'chart_reader', step: 'guided_practice', content: { type: 'bar', data: [{ label: 'A', value: 1 }], interactive: true, correctLabel: 'A' } });
    expect(result.passed).toBe(true);
  });

  it('clock_time: observe non-interactive passes', () => {
    const result = runRoundtrip({ id: 't1', type: 'clock_time', step: 'observe', content: { hour: 3, minute: 0, interactive: false } });
    expect(result.passed).toBe(true);
  });

  it('clock_time: interactive with targetTime', () => {
    const result = runRoundtrip({ id: 't1', type: 'clock_time', step: 'independent_practice', content: { hour: 3, minute: 0, mode: 'set', interactive: true, targetTime: { hour: 4, minute: 0 } } });
    expect(result.passed).toBe(true);
  });

  it('measurement_scale: observe non-interactive passes', () => {
    const result = runRoundtrip({ id: 't1', type: 'measurement_scale', step: 'observe', content: { type: 'ruler', min: 0, max: 30, step: 1, unit: 'cm', interactive: false } });
    expect(result.passed).toBe(true);
  });

  it('measurement_scale: interactive with targetValue', () => {
    const result = runRoundtrip({ id: 't1', type: 'measurement_scale', step: 'independent_practice', content: { type: 'ruler', min: 0, max: 30, step: 1, unit: 'cm', interactive: true, targetValue: 12 } });
    expect(result.passed).toBe(true);
  });

  it('fill_blank: guided_practice select mode with correct answer', () => {
    const result = runRoundtrip({ id: 't1', type: 'fill_blank', step: 'guided_practice', content: { template: '3 + ___ = 8', blanks: [{ id: 'b1', position: 0, correctAnswer: '5' }], mode: 'select' } });
    expect(result.passed).toBe(true);
  });

  it('fill_blank: independent_practice with multiple blanks', () => {
    const result = runRoundtrip({ id: 't1', type: 'fill_blank', step: 'independent_practice', content: { template: '___ + ___ = 10', blanks: [{ id: 'b1', position: 0, correctAnswer: '3' }, { id: 'b2', position: 1, correctAnswer: '7' }], mode: 'type' } });
    expect(result.passed).toBe(true);
  });
});

describe('runRoundtrip — observe step auto-complete', () => {
  const autoCompletableTypes = [
    ['visual_counting', { count: 3 }],
    ['fraction_visual', { numerator: 1, denominator: 2, mode: 'bar', interactive: false }],
    ['place_value_chart', { maxPlaces: 'lakh', digits: [5, 4, 3], interactive: false }],
    ['grid_area', { rows: 5, cols: 5, mode: 'area', highlighted: [{ row: 0, col: 0 }], interactive: false }],
    ['chart_reader', { type: 'bar', data: [{ label: 'A', value: 1 }], interactive: false }],
    ['clock_time', { hour: 3, minute: 0, interactive: false }],
    ['measurement_scale', { type: 'ruler', min: 0, max: 30, step: 1, unit: 'cm', interactive: false }],
  ] as const;

  for (const [type, content] of autoCompletableTypes) {
    it(`${type}: observe step passes with observed:true`, () => {
      const result = runRoundtrip({ id: 't1', type, step: 'observe', content: content as Record<string, unknown> });
      expect(result.passed).toBe(true);
    });
  }
});

describe('evaluateActivity — incorrect responses for scored types', () => {
  const wrongCases: Array<{ type: string; content: Record<string, unknown>; wrongResponse: Record<string, unknown>; description: string }> = [
    { type: 'visual_counting', content: { count: 5 }, wrongResponse: { count: 999 }, description: 'wrong count' },
    { type: 'matching', content: { pairs: [{ id: 'p1', itemA: 'A', itemB: 'B' }] }, wrongResponse: { pairs: [{ id: 'p1', correct: false }] }, description: 'wrong match' },
    { type: 'drag_drop', content: { expectedPositions: { i1: 't1' } }, wrongResponse: { droppedPositions: { i1: 'wrong' } }, description: 'wrong placement' },
    { type: 'sequencing', content: { correctOrder: ['a', 'b'] }, wrongResponse: { order: ['b', 'a'] }, description: 'wrong order' },
    { type: 'multiple_choice', content: { questions: [{ question: 'Q', options: ['a', 'b'], correctIndex: 0 }] }, wrongResponse: { selectedIndex: 1 }, description: 'wrong selection' },
    { type: 'story_question', content: { scenario: 'S', questions: [{ question: 'Q', options: ['a', 'b'], correctIndex: 1 }] }, wrongResponse: { selectedIndex: 0, questionIndex: 0 }, description: 'wrong story answer' },
    { type: 'fraction_visual', content: { numerator: 3, interactive: true }, wrongResponse: { shaded: 1 }, description: 'wrong shade count' },
    { type: 'place_value_chart', content: { maxPlaces: 'lakh', targetNumber: 543, interactive: true }, wrongResponse: { placedDigits: { 3: 9, 4: 9, 5: 9 } }, description: 'wrong digit placement' },
    { type: 'grid_area', content: { interactive: true, highlighted: [{ row: 0, col: 0 }, { row: 0, col: 1 }] }, wrongResponse: { highlighted: [{ row: 5, col: 5 }], count: 1 }, description: 'wrong cells highlighted' },
    { type: 'chart_reader', content: { correctLabel: 'A', interactive: true }, wrongResponse: { selectedLabel: 'B' }, description: 'wrong label selection' },
    { type: 'clock_time', content: { targetTime: { hour: 4, minute: 0 }, interactive: true }, wrongResponse: { hour: 8, minute: 0 }, description: 'wrong hour set' },
    { type: 'measurement_scale', content: { targetValue: 12, step: 1 }, wrongResponse: { value: 99 }, description: 'wrong value on scale' },
    { type: 'fill_blank', content: { blanks: [{ id: 'b1', correctAnswer: '5' }] }, wrongResponse: { answers: { b1: '999' } }, description: 'wrong fill answer' },
  ];

  for (const { type, content, wrongResponse, description } of wrongCases) {
    it(`${type}: ${description} returns correct:false`, () => {
      const result = evaluateActivity(type, wrongResponse, content);
      expect(result.correct).toBe(false);
    });
  }
});

describe('evaluateActivity — edge cases', () => {
  it('visual_counting: missing both count and sum returns false', () => {
    expect(evaluateActivity('visual_counting', { count: 5 }, {}).correct).toBe(false);
  });

  it('visual_counting: count 0 with sum 0 returns true', () => {
    expect(evaluateActivity('visual_counting', { count: 0 }, { count: 0 }).correct).toBe(true);
  });

  it('matching: empty pairs returns false', () => {
    expect(evaluateActivity('matching', { pairs: [{ id: 'p1', correct: true }] }, {}).correct).toBe(false);
  });

  it('matching: missing response pairs returns false', () => {
    expect(evaluateActivity('matching', {}, { pairs: [{ id: 'p1', itemA: 'A', itemB: 'B' }] }).correct).toBe(false);
  });

  it('sequencing: missing order returns false', () => {
    expect(evaluateActivity('sequencing', {}, { correctOrder: ['a', 'b'] }).correct).toBe(false);
  });

  it('drag_drop: missing droppedPositions returns false', () => {
    expect(evaluateActivity('drag_drop', {}, { expectedPositions: { i1: 't1' } }).correct).toBe(false);
  });

  it('multiple_choice: missing selectedIndex returns false', () => {
    expect(evaluateActivity('multiple_choice', {}, { correctIndex: 0 }).correct).toBe(false);
  });

  it('fill_blank: missing answers returns false', () => {
    expect(evaluateActivity('fill_blank', {}, { blanks: [{ id: 'b1', correctAnswer: '5' }] }).correct).toBe(false);
  });

  it('fill_blank: type mismatch on answer still compares as strings', () => {
    expect(evaluateActivity('fill_blank', { answers: { b1: '5' } }, { blanks: [{ id: 'b1', correctAnswer: 5 }] }).correct).toBe(true);
  });
});
