import { needsNormalization, normalizeContent } from '../normalize-content';

describe('needsNormalization', () => {
  describe('matching', () => {
    it('returns false when all pairs have canonical shape (itemA/itemB)', () => {
      const result = needsNormalization('matching', {
        pairs: [
          { itemA: '1', itemB: 'one' },
          { itemA: '2', itemB: 'two' },
        ],
      });
      expect(result).toBe(false);
    });

    it('returns true when first pair lacks itemA', () => {
      const result = needsNormalization('matching', {
        pairs: [
          { number: '1', value: 'one' },
          { number: '2', value: 'two' },
        ],
      });
      expect(result).toBe(true);
    });

    it('returns true when only some pairs lack itemA (mixed shape)', () => {
      const result = needsNormalization('matching', {
        pairs: [
          { itemA: '1', itemB: 'one' },
          { number: '2', value: 'two' },
        ],
      });
      expect(result).toBe(true);
    });

    it('returns true for empty pairs array', () => {
      const result = needsNormalization('matching', { pairs: [] });
      expect(result).toBe(true);
    });

    it('returns false when pairs is not an array', () => {
      const result = needsNormalization('matching', { pairs: 'not-array' });
      expect(result).toBe(false);
    });

    it('returns false when pairs is undefined', () => {
      const result = needsNormalization('matching', {});
      expect(result).toBe(false);
    });
  });

  describe('story_question', () => {
    it('returns false when scenario is present', () => {
      const result = needsNormalization('story_question', { scenario: 'hello' });
      expect(result).toBe(false);
    });

    it('returns true when scenario is missing but story is present', () => {
      const result = needsNormalization('story_question', { story: 'once upon a time' });
      expect(result).toBe(true);
    });

    it('returns false when both scenario and story are missing', () => {
      const result = needsNormalization('story_question', { description: 'no story field' });
      expect(result).toBe(false);
    });
  });

  describe('sequencing', () => {
    it('returns false for canonical items with correctOrder', () => {
      const result = needsNormalization('sequencing', {
        items: [{ id: 'item-0', label: 'first' }],
        correctOrder: ['item-0'],
      });
      expect(result).toBe(false);
    });

    it('returns true when items are strings', () => {
      const result = needsNormalization('sequencing', {
        items: ['first', 'second'],
      });
      expect(result).toBe(true);
    });

    it('returns true when items are objects but correctOrder is missing', () => {
      const result = needsNormalization('sequencing', {
        items: [{ id: 'item-0', label: 'first' }],
      });
      expect(result).toBe(true);
    });

    it('returns false when items is not an array', () => {
      const result = needsNormalization('sequencing', { items: 'not-array' });
      expect(result).toBe(false);
    });
  });

  describe('other types', () => {
    it('returns false for visual_counting', () => {
      const result = needsNormalization('visual_counting', { items: ['★'], count: 1 });
      expect(result).toBe(false);
    });

    it('returns false for drag_drop', () => {
      const result = needsNormalization('drag_drop', { items: [{ id: 'i1', label: 'a' }] });
      expect(result).toBe(false);
    });

    it('returns false for fill_blank', () => {
      const result = needsNormalization('fill_blank', { template: '___', blanks: [] });
      expect(result).toBe(false);
    });

    it('returns false for fraction_visual', () => {
      const result = needsNormalization('fraction_visual', { numerator: 1, denominator: 2 });
      expect(result).toBe(false);
    });
  });
});

describe('normalizeContent', () => {
  it('returns content unchanged when no normalization is needed', () => {
    const content = { items: ['★'], count: 5 };
    const result = normalizeContent('visual_counting', content);
    expect(result).toBe(content);
  });

  it('returns content unchanged for canonical matching', () => {
    const content = { pairs: [{ itemA: '1', itemB: 'one' }] };
    const result = normalizeContent('matching', content);
    expect(result).toBe(content);
  });

  it('returns content unchanged for canonical sequencing', () => {
    const content = { items: [{ id: 'item-0', label: 'first' }], correctOrder: ['item-0'] };
    const result = normalizeContent('sequencing', content);
    expect(result).toBe(content);
  });

  it('normalizes story_question story → scenario', () => {
    const result = normalizeContent('story_question', { story: 'my story' });
    expect(result.scenario).toBe('my story');
  });

  it('normalizes story_question and preserves other fields', () => {
    const result = normalizeContent('story_question', { story: 'my story', questions: [], hints: ['hint'] });
    expect(result.scenario).toBe('my story');
    expect(result.questions).toEqual([]);
    expect(result.hints).toEqual(['hint']);
  });

  it('does not change story_question with canonical scenario', () => {
    const content = { scenario: 'my scenario', questions: [] };
    const result = normalizeContent('story_question', content);
    expect(result).toBe(content);
  });

  it('normalizes matching legacy pairs (number/name) to canonical shape', () => {
    const result = normalizeContent('matching', {
      pairs: [
        { number: '1', name: 'one' },
        { number: '2', name: 'two' },
      ],
    });
    expect(result.pairs).toEqual([
      { id: 'pair-0', itemA: '1', itemB: 'one' },
      { id: 'pair-1', itemA: '2', itemB: 'two' },
    ]);
  });

  it('normalizes matching legacy pairs (shape/name) to canonical shape', () => {
    const result = normalizeContent('matching', {
      pairs: [
        { shape: '⬤', name: 'Circle' },
        { shape: '■', name: 'Square' },
      ],
    });
    expect(result.pairs).toEqual([
      { id: 'pair-0', itemA: '⬤', itemB: 'Circle' },
      { id: 'pair-1', itemA: '■', itemB: 'Square' },
    ]);
  });

  it('normalizes matching with mixed-shape pairs', () => {
    const result = normalizeContent('matching', {
      pairs: [
        { itemA: '1', itemB: 'one' },
        { number: '2', value: 'two' },
      ],
    });
    expect(result.pairs).toEqual([
      { id: 'pair-0', itemA: '1', itemB: 'one' },
      { id: 'pair-1', itemA: '2', itemB: 'two' },
    ]);
  });

  it('normalizes matching with word/picture keys', () => {
    const result = normalizeContent('matching', {
      pairs: [
        { word: 'cat', picture: '🐱' },
        { word: 'dog', picture: '🐶' },
      ],
    });
    expect(result.pairs).toEqual([
      { id: 'pair-0', itemA: 'cat', itemB: '🐱' },
      { id: 'pair-1', itemA: 'dog', itemB: '🐶' },
    ]);
  });

  it('normalizes sequencing string items to objects', () => {
    const result = normalizeContent('sequencing', {
      items: ['🌱 First', '🌿 Second'],
    });
    expect(result.items).toEqual([
      { id: 'item-0', label: 'First', emoji: '🌱' },
      { id: 'item-1', label: 'Second', emoji: '🌿' },
    ]);
    expect(result.correctOrder).toEqual(['item-0', 'item-1']);
  });

  it('normalizes sequencing string items without emoji prefix', () => {
    const result = normalizeContent('sequencing', {
      items: ['Step 1', 'Step 2'],
    });
    expect(result.items).toEqual([
      { id: 'item-0', label: 'Step 1' },
      { id: 'item-1', label: 'Step 2' },
    ]);
    expect(result.correctOrder).toEqual(['item-0', 'item-1']);
  });

  it('adds default correctOrder for sequencing items that lack it', () => {
    const result = normalizeContent('sequencing', {
      items: [{ id: 'a', label: 'A' }, { id: 'b', label: 'B' }],
    });
    expect(result.correctOrder).toEqual(['a', 'b']);
  });

  it('normalizes matching with shape/position keys', () => {
    const result = normalizeContent('matching', {
      pairs: [
        { shape: '⬤', position: 'left' },
        { shape: '■', position: 'right' },
      ],
    });
    expect(result.pairs).toEqual([
      { id: 'pair-0', itemA: '⬤', itemB: 'left' },
      { id: 'pair-1', itemA: '■', itemB: 'right' },
    ]);
  });
});
