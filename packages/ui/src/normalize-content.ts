/**
 * Normalizes content from a YAML activity into the prop shape the corresponding
 * UI component expects. The pipeline (EPIC-13) may emit several different shapes
 * for the same activity type; this function translates them all into the canonical
 * shape documented in `knowledge/curriculum/content-creation-guide.md`.
 *
 * For each activity type, the function:
 *   1. Reads the canonical field first
 *   2. Falls back to common pipeline variants
 *   3. Coerces types where the pipeline emits strings instead of numbers
 *
 * Adding a new normalization branch: add an `if (t === "<type>")` block.
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

export function normalizeContent(type: string, content: Record<string, unknown>): Record<string, unknown> {
  const n = { ...content };
  const t = type.toLowerCase().replace(/-/g, "_");

  if (t === "story_question" && !n.scenario && n.story) {
    n.scenario = n.story;
  }

  if ((t === "real_world" || t === "real_world_task") && !n.taskDescription && n.prompt) {
    n.taskDescription = n.prompt;
  }

  if (t === "matching" && Array.isArray(n.pairs)) {
    n.pairs = (n.pairs as Array<Record<string, unknown>>).map((p, i) => ({
      id: p.id ?? `pair-${i}`,
      itemA: p.itemA ?? p.number ?? p.value ?? String(p[p.key ? Object.keys(p)[0] : ''] ?? ''),
      itemB: p.itemB ?? p.name ?? String(p.value ?? ''),
    }));
  }

  if (t === "sequencing" && Array.isArray(n.items)) {
    if (typeof (n.items as unknown[])[0] === "string") {
      n.items = (n.items as string[]).map((s, i) => {
        const { label, emoji } = splitEmojiLabel(s);
        return {
          id: `item-${i}`,
          label,
          emoji,
        };
      });
    }
    if (!n.correctOrder) {
      n.correctOrder = (n.items as Array<Record<string, unknown>>).map((item) => item.id as string);
    }
    if (n.shuffled) {
      const items = n.items as Array<{ id: string; label: string; emoji?: string }>;
      const shuffledLabels = n.shuffled as string[];
      const itemMap = new Map(items.map((i) => [i.label, i]));
      n.items = shuffledLabels
        .map((label) => itemMap.get(label))
        .filter(Boolean);
      delete n.shuffled;
    }
  }

  // Handle YAML sequencing shape: { question, numbers: [12, 5, 8] }
  if (t === "sequencing" && !Array.isArray(n.items) && Array.isArray(n.numbers)) {
    n.items = (n.numbers as number[]).map((num, i) => ({
      id: `item-${i}`,
      label: String(num),
    }));
    n.correctOrder = (n.items as Array<{ id: string }>).map((item) => item.id);
  }

  if ((t === "drag_drop" || t === "dragdrop") && n.groups) {
    const groups = n.groups as Array<{ label: string; target: string[] }>;
    n.targets = groups.map((g, i) => ({ id: `target-${i}`, label: g.label }));

    if (Array.isArray(n.items) && typeof (n.items as unknown[])[0] === "string") {
      n.items = (n.items as string[]).map((s, i) => {
        const { label, emoji } = splitEmojiLabel(s);
        return {
          id: `item-${i}`,
          label,
          emoji,
        };
      });
    }

    const expected: Record<string, string> = {};
    groups.forEach((g, gIdx) => {
      g.target.forEach((itemStr) => {
        const items = n.items as Array<{ id: string; label: string }>;
        const item = items.find((i) => i.label === itemStr || i.id === itemStr);
        if (item) {
          expected[item.id] = `target-${gIdx}`;
        }
      });
    });
    n.expectedPositions = expected;
    delete n.groups;
  }

  // Handle YAML drag_drop shape: { prompt, items: [{ value, place }] }
  if ((t === "drag_drop" || t === "dragdrop") && !n.groups && Array.isArray(n.items) && typeof n.items[0] === "object" && n.items[0] !== null && ("value" in n.items[0] || "place" in n.items[0])) {
    const items = n.items as Array<{ value: string; place: string }>;
    n.items = items.map((item, i) => ({
      id: `item-${i}`,
      label: item.value,
    }));
    const placeSet = new Set(items.map((item) => item.place));
    const targets = Array.from(placeSet);
    n.targets = targets.map((place, i) => ({
      id: `target-${i}`,
      label: place,
    }));
    const expected: Record<string, string> = {};
    items.forEach((item, i) => {
      const targetIdx = targets.indexOf(item.place);
      expected[`item-${i}`] = `target-${targetIdx}`;
    });
    n.expectedPositions = expected;
  }

  // Handle YAML drag_drop shape: { prompt, options: [{ digit, place }] }
  if ((t === "drag_drop" || t === "dragdrop") && Array.isArray(n.options) && n.options.length > 0 && typeof n.options[0] === "object" && n.options[0] !== null && ("digit" in n.options[0] || "value" in n.options[0])) {
    const opts = n.options as Array<{ digit?: string; value?: string; place: string }>;
    n.items = opts.map((o, i) => ({ id: `item-${i}`, label: o.digit ?? o.value ?? "" }));
    const placeSet = new Set(opts.map((o) => o.place));
    const targets = Array.from(placeSet);
    n.targets = targets.map((p, i) => ({ id: `target-${i}`, label: p }));
    const expected: Record<string, string> = {};
    opts.forEach((o, i) => {
      expected[`item-${i}`] = `target-${targets.indexOf(o.place)}`;
    });
    n.expectedPositions = expected;
    delete n.options;
  }

  // Handle YAML drag_drop shape: { question, options: { thousands: [1,3], ... } }
  if ((t === "drag_drop" || t === "dragdrop") && n.options && typeof n.options === "object" && !Array.isArray(n.options)) {
    const groups = Object.entries(n.options as Record<string, unknown[]>).map(([label, values]) => ({
      label,
      target: values.map(String),
    }));
    const allItems: Array<{ id: string; label: string }> = [];
    const expected: Record<string, string> = {};
    groups.forEach((g, gIdx) => {
      g.target.forEach((val) => {
        const id = `item-${allItems.length}`;
        allItems.push({ id, label: val });
        expected[id] = `target-${gIdx}`;
      });
    });
    n.items = allItems;
    n.targets = groups.map((g, i) => ({ id: `target-${i}`, label: g.label }));
    n.expectedPositions = expected;
    delete n.options;
  }

  // Handle fill_blank YAML shapes: { statement, answers } or { question, answer } or { prompt, answer }
  // For the template, prefer the equation-like text (statement/question) over descriptive prompt text.
  if (t === "fill_blank") {
    if (!n.template && (n.statement || n.question || n.prompt)) {
      const rawTemplate = (n.statement || n.question || n.prompt) as string;
      const answer = n.answer ?? n.answers;
      if (answer) {
        const answers = Array.isArray(answer) ? answer : [answer];
        n.blanks = (answers as (string | number)[]).map((a, i) => ({
          id: `blank-${i}`,
          position: i,
          correctAnswer: a,
        }));
        n.template = rawTemplate;
      }
    }
  }

  // Handle fraction_visual YAML shapes: pipeline variant uses description instead of label
  if (t === "fraction_visual") {
    if (!n.label && typeof n.description === "string") {
      n.label = n.description;
    }
    // If label is set but showLabel isn't, default to true so the label is visible.
    // Many existing pipeline-emitted YAMLs (and hand-written ones) set label without showLabel.
    if (n.label && n.showLabel === undefined) {
      n.showLabel = true;
    }
    if (n.compare && typeof n.compare === "object") {
      n.compare = {
        numerator: Number((n.compare as any).numerator ?? 0),
        denominator: Number((n.compare as any).denominator ?? 1),
      };
    }
  }

  // Handle grid_area YAML shapes: pipeline variant uses cells instead of highlighted
  if (t === "grid_area") {
    if (!n.highlighted && Array.isArray(n.cells)) {
      n.highlighted = n.cells;
    }
    if (n.highlighted && !Array.isArray(n.highlighted)) {
      n.highlighted = [];
    }
  }

  // Handle chart_reader YAML shapes: pipeline variant uses categories instead of data
  if (t === "chart_reader") {
    if (!n.data && Array.isArray(n.categories)) {
      n.data = (n.categories as any[]).map((c) => ({
        label: c.name ?? c.label ?? "",
        value: Number(c.count ?? c.value ?? 0),
        emoji: c.emoji,
      }));
      delete n.categories;
    }
    if (Array.isArray(n.data)) {
      n.data = (n.data as any[]).map((d) => ({
        label: String(d.label ?? d.name ?? ""),
        value: Number(d.value ?? d.count ?? 0),
        emoji: d.emoji,
      }));
    }
  }

  // Handle clock_time YAML shapes: pipeline variant uses time field
  if (t === "clock_time") {
    if (n.time && typeof n.time === "object") {
      const t = n.time as any;
      n.hour = Number(n.hour ?? t.hour ?? t.h ?? 12);
      n.minute = Number(n.minute ?? t.minute ?? t.m ?? 0);
      delete n.time;
    }
    if (n.targetTime && typeof n.targetTime === "object") {
      const tt = n.targetTime as any;
      n.targetTime = {
        hour: Number(tt.hour ?? tt.h ?? 12),
        minute: Number(tt.minute ?? tt.m ?? 0),
      };
    }
  }

  // Handle measurement_scale YAML shapes: pipeline variant uses range/reading
  if (t === "measurement_scale") {
    if (n.range && typeof n.range === "object") {
      const r = n.range as any;
      n.min = Number(n.min ?? r.from ?? r.min ?? 0);
      n.max = Number(n.max ?? r.to ?? r.max ?? 10);
      delete n.range;
    }
    if (n.reading !== undefined && n.value === undefined) {
      n.value = Number(n.reading);
      delete n.reading;
    }
  }

  // Handle place_value_chart YAML shapes
  if (t === "place_value_chart") {
    const chart = n.chart as unknown;
    if (chart && typeof chart === "object" && !Array.isArray(chart)) {
      const obj = chart as Record<string, unknown>;
      if (obj.thousands !== undefined) {
        n.digits = [obj.thousands, obj.hundreds, obj.tens, obj.ones].map((v) => (v != null ? Number(v) : null));
        n.maxPlaces = "lakh";
      } else if (Array.isArray(obj.columns)) {
        const cols = obj.columns as string[];
        n.maxPlaces = cols.length <= 6 ? "lakh" : "crore";
      }
    }
    if (Array.isArray(chart) && chart.length > 0 && typeof chart[0] === "object" && chart[0] !== null) {
      const first = chart[0] as Record<string, unknown>;
      if (first.digit !== undefined) {
        n.digits = (chart as Array<Record<string, unknown>>).map((e) => Number(e.digit));
        // Size the grid to the actual number of entries, not a fixed crore.
        n.maxPlaces = chart.length <= 6 ? "lakh" : "crore";
      }
    }
  }

  return n;
}
