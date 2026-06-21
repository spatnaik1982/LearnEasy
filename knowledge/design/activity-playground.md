# Activity Type Playground

## Purpose

A developer-only page in the student app that displays all 14 supported activity types
side-by-side with their YAML definitions and live rendered components. This serves as a
reference tool for developers writing curriculum content — they can see exactly what YAML
shape produces what visual output.

## Files

### Created

| File | Purpose |
|------|---------|
| `apps/student/lib/activity-examples.yaml` | Reference YAML — one entry per activity type |
| `apps/student/pages/playground.tsx` | The playground page |

### Modified

| File | Change |
|------|--------|
| `apps/student/pages/_app.tsx` | Add `/playground` to `PUBLIC_ROUTES` |
| `apps/student/package.json` | Add `js-yaml` and `@types/js-yaml` as devDependencies |

## Reference YAML Structure

**File:** `apps/student/lib/activity-examples.yaml`

A list of activity examples (not a valid curriculum concept — this is a reference document):

```yaml
- type: visual_counting
  step: observe
  description: "Displays items for counting. Supports singular item groups and dual groups (addition)."
  content:
    description: "Count the apples"
    items: ["🍎"]
    count: 5
    text: "There are five apples."

- type: matching
  step: guided_practice
  description: "Match each item to its category."
  content:
    description: "Match each as plant or animal"
    pairs:
      - itemA: "🌳"
        itemB: "Plant"
      - itemA: "🐱"
        itemB: "Animal"

# ... 12 more entries covering all types from the content creation guide
```

Each entry has:
- `type` — activity type string (maps to `ActivityRenderer`'s switch case)
- `step` — learning step (affects auto-complete, hints, interactivity)
- `description` — plain English explanation
- `content` — the canonical content payload for this type

## Playground Page Layout

**Route:** `apps/student/pages/playground.tsx`
**Auth:** Public (no login required) — added to `PUBLIC_ROUTES` in `_app.tsx`

```
┌──────────────────────────────────────────────────────┐
│  🎮 Activity Type Playground                   [dev] │
├──────────────────────────────────────────────────────┤
│                                                      │
│  ┌─ visual_counting ──────────────────────────────┐  │
│  │ ┌─ YAML ───────────┐ ┌─ Rendered ───────────┐ │  │
│  │ │ type: visual_... │ │ 🍎🍎🍎🍎🍎            │ │  │
│  │ │ content: {       │ │ [VisualCounter]      │ │  │
│  │ │   items: ["🍎"]  │ │ Count: 5             │ │  │
│  │ │   count: 5       │ │                      │ │  │
│  │ │ }                │ │                      │ │  │
│  │ └──────────────────┘ └──────────────────────┘ │  │
│  │ 📝 Displays items for counting.               │  │
│  └───────────────────────────────────────────────┘  │
│                                                      │
│  ┌─ matching ─────────────────────────────────────┐  │
│  │ ...                                            │  │
│  └────────────────────────────────────────────────┘  │
│  (14 total, vertically stacked)                      │
└──────────────────────────────────────────────────────┘
```

### Card Layout

Each section card contains:

1. **Header bar** — Activity type label (monospace, bold) + step badge (small pill)
2. **Split pane** — CSS grid 2-column:
   - Left (~45%): `<pre><code>` block with raw YAML syntax-highlighted
   - Right (~55%): `<ActivityRenderer>` with the example's content
3. **Description footer** — Italic text explaining the activity's purpose

### Responsive Behavior

On narrow screens (<768px): the split pane stacks vertically — YAML on top, rendered component below.

## Data Flow

```
activity-examples.yaml
        │
        ▼  fs.readFileSync + js-yaml.parse (in getStaticProps)
        │
        ▼
Page props: { rawYaml: string, examples: ActivityExample[] }
        │
        ├── rawYaml → displayed per-example (split by --- boundaries)
        │
        └── examples[] → map to <ActivityRenderer>
```

### getStaticProps

```typescript
export async function getStaticProps() {
  const filePath = path.join(process.cwd(), 'lib', 'activity-examples.yaml');
  const rawYaml = fs.readFileSync(filePath, 'utf-8');
  const examples = yaml.parse(rawYaml) as ActivityExample[];
  return { props: { rawYaml, examples } };
}
```

## Auth

- The playground page is added to `PUBLIC_ROUTES` in `_app.tsx`
- No authentication required
- This is intentional — it's a dev tool that should be quickly accessible

## Activity Rendering

Each example is rendered using the same `<ActivityRenderer>` component used in production:

```tsx
<ActivityRenderer
  activity={{ id: `demo-${type}`, type: entry.type, content: entry.content }}
  stepLabel={entry.step}
  onComplete={() => {}}  // no-op for demo
/>
```

- All activity types are rendered as-is with no scoring
- Interactive components are displayed in their initial state
- Observe-step auto-complete fires after 1500ms for visual types

## Implementation Order

1. Create `apps/student/lib/activity-examples.yaml` with all 14 activity types
2. Add `js-yaml` + `@types/js-yaml` to `apps/student/package.json`
3. Create `apps/student/pages/playground.tsx` with split-pane layout
4. Modify `apps/student/pages/_app.tsx` to add `/playground` to public routes
