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
  });

  describe('other types', () => {
    it('returns false for non-transformed types', () => {
      const result = needsNormalization('visual_counting', { items: ['★'], count: 1 });
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

  it('normalizes story_question story → scenario', () => {
    const result = normalizeContent('story_question', { story: 'my story' });
    expect(result.scenario).toBe('my story');
  });

  it('normalizes matching legacy pairs to canonical shape', () => {
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
});
