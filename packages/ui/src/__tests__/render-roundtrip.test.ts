import { runRoundtrip, buildCorrectResponse } from '../render-roundtrip';

describe('buildCorrectResponse', () => {
  it('returns count for visual_counting', () => {
    const r = buildCorrectResponse('visual_counting', { count: 5 });
    expect(r.count).toBe(5);
  });

  it('returns sum for visual_counting addition variant', () => {
    const r = buildCorrectResponse('visual_counting', { left: [1, 2], right: [3], sum: 3 });
    expect(r.count).toBe(3);
  });

  it('returns correct pairs for matching', () => {
    const pairs = [{ id: 'p1', itemA: 'A', itemB: 'B' }];
    const r = buildCorrectResponse('matching', { pairs });
    expect(r.pairs).toEqual([{ id: 'p1', correct: true }]);
  });

  it('returns correct order for sequencing', () => {
    const r = buildCorrectResponse('sequencing', { correctOrder: ['a', 'b'] });
    expect(r.order).toEqual(['a', 'b']);
  });

  it('returns selectedIndex for multiple_choice', () => {
    const r = buildCorrectResponse('multiple_choice', { questions: [{ question: 'Q', options: ['a', 'b'], correctIndex: 1 }] });
    expect(r.selectedIndex).toBe(1);
  });

  it('returns selectedLabel for chart_reader', () => {
    const r = buildCorrectResponse('chart_reader', { correctLabel: 'A' });
    expect(r.selectedLabel).toBe('A');
  });

  it('returns targetTime for clock_time', () => {
    const r = buildCorrectResponse('clock_time', { targetTime: { hour: 3, minute: 0 } });
    expect(r.hour).toBe(3);
    expect(r.minute).toBe(0);
  });

  it('returns targetValue for measurement_scale', () => {
    const r = buildCorrectResponse('measurement_scale', { targetValue: 12 });
    expect(r.value).toBe(12);
  });

  it('returns answers for fill_blank', () => {
    const r = buildCorrectResponse('fill_blank', { blanks: [{ id: 'b1', correctAnswer: '5' }] });
    expect(r.answers).toEqual({ b1: '5' });
  });

  it('returns __skip for place_value_chart', () => {
    const r = buildCorrectResponse('place_value_chart', {});
    expect(r.__skip).toBe('click-driven');
  });

  it('returns completed for real_world', () => {
    const r = buildCorrectResponse('real_world', {});
    expect(r.completed).toBe(true);
  });
});

describe('runRoundtrip', () => {
  it('passes observe step', () => {
    const result = runRoundtrip({ id: 't1', type: 'visual_counting', step: 'observe', content: { count: 3 } });
    expect(result.passed).toBe(true);
  });

  it('passes visual_counting with correct count', () => {
    const result = runRoundtrip({ id: 't1', type: 'visual_counting', step: 'guided_practice', content: { count: 5 } });
    expect(result.passed).toBe(true);
  });

  it('passes matching with correct pairs', () => {
    const pairs = [{ id: 'p1', itemA: 'A', itemB: 'B' }];
    const result = runRoundtrip({ id: 't1', type: 'matching', step: 'guided_practice', content: { pairs } });
    expect(result.passed).toBe(true);
  });

  it('passes sequencing with correct order', () => {
    const items = [{ id: 's1', label: 'Step 1' }, { id: 's2', label: 'Step 2' }];
    const result = runRoundtrip({ id: 't1', type: 'sequencing', step: 'independent_practice', content: { items, correctOrder: ['s1', 's2'] } });
    expect(result.passed).toBe(true);
  });

  it('passes multiple_choice with correct answer', () => {
    const result = runRoundtrip({ id: 't1', type: 'multiple_choice', step: 'mastery_check', content: { questions: [{ question: 'Q', options: ['a', 'b', 'c', 'd'], correctIndex: 2 }] } });
    expect(result.passed).toBe(true);
  });

  it('passes story_question', () => {
    const result = runRoundtrip({ id: 't1', type: 'story_question', step: 'guided_practice', content: { scenario: 'Test', questions: [{ question: 'Q', options: ['a', 'b', 'c', 'd'], correctIndex: 0 }] } });
    expect(result.passed).toBe(true);
  });

  it('passes real_world', () => {
    const result = runRoundtrip({ id: 't1', type: 'real_world', step: 'guided_practice', content: { scenario: 'Test' } });
    expect(result.passed).toBe(true);
  });

  it('passes fraction_visual non-interactive', () => {
    const result = runRoundtrip({ id: 't1', type: 'fraction_visual', step: 'observe', content: { numerator: 1, denominator: 2, mode: 'bar', interactive: false } });
    expect(result.passed).toBe(true);
  });

  it('passes place_value_chart (click-driven skip)', () => {
    const result = runRoundtrip({ id: 't1', type: 'place_value_chart', step: 'observe', content: { maxPlaces: 'lakh', digits: [5, 4, 3], interactive: false } });
    expect(result.passed).toBe(true);
  });

  it('passes grid_area non-interactive', () => {
    const result = runRoundtrip({ id: 't1', type: 'grid_area', step: 'observe', content: { rows: 5, cols: 5, mode: 'area', highlighted: [{ row: 0, col: 0 }] } });
    expect(result.passed).toBe(true);
  });

  it('passes chart_reader with correctLabel', () => {
    const result = runRoundtrip({ id: 't1', type: 'chart_reader', step: 'guided_practice', content: { type: 'bar', data: [{ label: 'A', value: 1 }], interactive: true, correctLabel: 'A' } });
    expect(result.passed).toBe(true);
  });

  it('passes clock_time with targetTime', () => {
    const result = runRoundtrip({ id: 't1', type: 'clock_time', step: 'independent_practice', content: { hour: 3, minute: 0, mode: 'set', interactive: true, targetTime: { hour: 4, minute: 0 } } });
    expect(result.passed).toBe(true);
  });

  it('passes measurement_scale with targetValue', () => {
    const result = runRoundtrip({ id: 't1', type: 'measurement_scale', step: 'independent_practice', content: { type: 'ruler', min: 0, max: 30, step: 1, unit: 'cm', interactive: true, targetValue: 12 } });
    expect(result.passed).toBe(true);
  });

  it('passes fill_blank with correct answer', () => {
    const result = runRoundtrip({ id: 't1', type: 'fill_blank', step: 'independent_practice', content: { template: '3 + ___ = 8', blanks: [{ id: 'b1', position: 0, correctAnswer: '5' }], mode: 'select' } });
    expect(result.passed).toBe(true);
  });
});
