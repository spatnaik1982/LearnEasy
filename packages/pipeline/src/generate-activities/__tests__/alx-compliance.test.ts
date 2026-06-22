import { describe, it, expect } from 'vitest';
import { checkALXCompliance } from '../index';

describe('checkALXCompliance', () => {
  const WORD_LIMIT = 12;

  it('returns empty warnings for content under the word limit', () => {
    const warnings = checkALXCompliance('observe', 'visual_counting', { description: 'Short text' });
    expect(warnings).toHaveLength(0);
  });

  it('warns when description exceeds word limit', () => {
    const longText = 'one two three four five six seven eight nine ten eleven twelve thirteen';
    const warnings = checkALXCompliance('observe', 'visual_counting', { description: longText });
    expect(warnings).toHaveLength(1);
    expect(warnings[0].field).toBe('description');
    expect(warnings[0].message).toContain('13 words');
  });

  it('warns when scenario exceeds word limit', () => {
    const longText = 'one two three four five six seven eight nine ten eleven twelve thirteen fourteen';
    const warnings = checkALXCompliance('observe', 'story_question', { scenario: longText });
    expect(warnings).toHaveLength(1);
    expect(warnings[0].field).toBe('scenario');
  });

  it('warns when template exceeds word limit (fill_blank)', () => {
    const longText = 'one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen';
    const warnings = checkALXCompliance('guided_practice', 'fill_blank', {
      template: longText,
      blanks: [{ id: 'b1', position: 0, correctAnswer: '42' }],
    });
    expect(warnings).toHaveLength(1);
    expect(warnings[0].field).toBe('template');
  });

  it('warns when title exceeds word limit (chart_reader)', () => {
    const longText = 'one two three four five six seven eight nine ten eleven twelve thirteen';
    const warnings = checkALXCompliance('observe', 'chart_reader', {
      type: 'bar',
      data: [{ label: 'x', value: 1 }],
      title: longText,
      interactive: false,
    });
    expect(warnings).toHaveLength(1);
    expect(warnings[0].field).toBe('title');
  });

  it('warns when taskDescription exceeds word limit (real_world)', () => {
    const longText = 'one two three four five six seven eight nine ten eleven twelve thirteen fourteen';
    const warnings = checkALXCompliance('guided_practice', 'real_world', {
      scenario: 'test',
      taskDescription: longText,
    });
    expect(warnings).toHaveLength(1);
    expect(warnings[0].field).toBe('taskDescription');
  });

  it('warns when label exceeds word limit (fraction_visual)', () => {
    const longText = 'one two three four five six seven eight nine ten eleven twelve thirteen';
    const warnings = checkALXCompliance('observe', 'fraction_visual', {
      numerator: 1,
      denominator: 2,
      mode: 'bar',
      interactive: false,
      label: longText,
    });
    expect(warnings).toHaveLength(1);
    expect(warnings[0].field).toBe('label');
  });

  it('warns when text exceeds word limit (visual_counting)', () => {
    const longText = 'one two three four five six seven eight nine ten eleven twelve thirteen fourteen';
    const warnings = checkALXCompliance('observe', 'visual_counting', { text: longText });
    expect(warnings).toHaveLength(1);
    expect(warnings[0].field).toBe('text');
  });

  it('warns on multiple fields simultaneously', () => {
    const long = 'one two three four five six seven eight nine ten eleven twelve thirteen';
    const warnings = checkALXCompliance('observe', 'story_question', {
      description: long,
      scenario: long,
      questions: [{ question: 'short?', options: ['a', 'b'], correctIndex: 0 }],
    });
    expect(warnings).toHaveLength(2);
    expect(warnings.map((w) => w.field)).toEqual(['description', 'scenario']);
  });

  it('warns when questions[].question exceeds word limit', () => {
    const long = 'one two three four five six seven eight nine ten eleven twelve thirteen fourteen';
    const warnings = checkALXCompliance('mastery_check', 'multiple_choice', {
      questions: [
        { question: long, options: ['a', 'b'], correctIndex: 0 },
        { question: 'short?', options: ['c', 'd'], correctIndex: 1 },
      ],
    });
    expect(warnings).toHaveLength(1);
    expect(warnings[0].field).toBe('questions[0].question');
  });

  it('warns on fill_blank blanks[].options text', () => {
    const warnings = checkALXCompliance('guided_practice', 'fill_blank', {
      template: 'short',
      blanks: [
        {
          id: 'b1',
          position: 0,
          correctAnswer: 'x',
          options: ['one two three four five six seven eight nine ten eleven twelve thirteen'],
        },
      ],
      mode: 'select',
    });
    expect(warnings).toHaveLength(1);
    expect(warnings[0].field).toBe('blanks[0].options[0]');
  });

  it('warns on real_world prompt and expectedAnswer', () => {
    const long = 'one two three four five six seven eight nine ten eleven twelve thirteen fourteen';
    const warnings = checkALXCompliance('guided_practice', 'real_world', {
      scenario: 'test',
      prompt: long,
      expectedAnswer: long,
    });
    expect(warnings).toHaveLength(2);
    expect(warnings.map((w) => w.field)).toEqual(['prompt', 'expectedAnswer']);
  });

  it('is silent for undefined/null fields', () => {
    const warnings = checkALXCompliance('observe', 'visual_counting', {
      description: undefined,
      message: null,
    });
    expect(warnings).toHaveLength(0);
  });

  it('is silent for empty or absent content', () => {
    const warnings = checkALXCompliance('observe', 'visual_counting', {});
    expect(warnings).toHaveLength(0);
  });
});
