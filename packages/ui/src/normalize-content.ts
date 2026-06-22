/**
 * Normalizes legacy content shapes from Level A YAML files into the
 * canonical shape the UI components expect.
 *
 * The pipeline (EPIC-18+) generates content in the canonical schema
 * shape directly — it never needs normalization. Only hand-authored
 * Level A YAML files may use pre-canonical field names.
 *
 * When adding a new normalization rule, first check whether the source
 * is a Level A YAML file. If it's pipeline-generated, fix the pipeline
 * instead of adding another normalization branch here.
 */

const EMOJI_PREFIX_RE = /^(\p{Extended_Pictographic})\s*/u;

function splitEmojiLabel(raw: string): { label: string; emoji?: string } {
  const match = raw.match(EMOJI_PREFIX_RE);
  if (match) {
    const remaining = raw.slice(match[0].length);
    if (remaining) {
      return { emoji: match[1], label: remaining };
    }
    return { label: raw };
  }
  return { label: raw };
}

function hasCanonicalPairs(pairs: unknown): boolean {
  return Array.isArray(pairs) && pairs.length > 0
    && pairs.every(
      (p) => typeof p === "object" && p !== null && "itemA" in (p as Record<string, unknown>) && "id" in (p as Record<string, unknown>),
    );
}

// Canonical fields that indicate content is already in the right shape.
// If these are present, the function skips cloning + transformations.
export function needsNormalization(type: string, content: Record<string, unknown>): boolean {
  const t = type.toLowerCase().replace(/-/g, "_");

  if (t === "story_question") return !content.scenario && !!content.story;
  if (t === "matching") return Array.isArray(content.pairs) && !hasCanonicalPairs(content.pairs);
  if (t === "sequencing") return Array.isArray(content.items) && (typeof (content.items as unknown[])[0] === "string" || !content.correctOrder);

  return false;
}

export function normalizeContent(type: string, content: Record<string, unknown>): Record<string, unknown> {
  const t = type.toLowerCase().replace(/-/g, "_");

  if (!needsNormalization(type, content)) return content;

  const n = { ...content };

  // story_question: some YAML files use "story" instead of "scenario"
  if (t === "story_question" && !n.scenario && n.story) {
    n.scenario = n.story;
  }

  // matching: translate legacy pair keys to canonical itemA/itemB
  // Handles {number,name}, {shape,name}, {word,picture}, {shape,position}, etc.
  if (t === "matching" && Array.isArray(n.pairs)) {
    n.pairs = (n.pairs as Array<Record<string, unknown>>).map((p, i) => ({
      id: p.id ?? `pair-${i}`,
      itemA: p.itemA ?? p.number ?? p.shape ?? p.word ?? String(p[p.key ? Object.keys(p)[0] : ''] ?? ''),
      itemB: p.itemB ?? p.name ?? p.picture ?? p.position ?? String(p.value ?? ''),
    }));
  }

  // sequencing: canonical items array, correctOrder, shuffled
  if (t === "sequencing" && Array.isArray(n.items)) {
    if (typeof (n.items as unknown[])[0] === "string") {
      n.items = (n.items as string[]).map((s, i) => {
        const { label, emoji } = splitEmojiLabel(s);
        return { id: `item-${i}`, label, emoji };
      });
    }
    if (!n.correctOrder) {
      n.correctOrder = (n.items as Array<Record<string, unknown>>).map((item, i) => (item.id as string) ?? `item-${i}`);
    }
  }

  return n;
}
