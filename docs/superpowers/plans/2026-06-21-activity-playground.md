# Activity Type Playground Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use subagent-driven-development (recommended) or executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a developer playground page showing all 14 activity types with their YAML definitions and live rendered components side by side.

**Architecture:** A new Next.js page (`/playground`) in the student app loads a reference YAML file at build time via `getStaticProps`, parses it with `js-yaml`, and renders each example as a split-pane card — YAML code block on the left, `<ActivityRenderer>` on the right. The YAML file lives in `apps/student/lib/` as a source-of-truth reference.

**Tech Stack:** Next.js 16 (pages router), `@learn-easy/ui` (ActivityRenderer), `js-yaml` for YAML parsing, Tailwind CSS for layout.

**Spec:** `knowledge/design/activity-playground.md`

---

### Task 1: Reference YAML file

**Files:**
- Create: `apps/student/lib/activity-examples.yaml`

- [ ] **Step 1: Create the YAML file**

Already done — see `apps/student/lib/activity-examples.yaml`. It contains all 14 activity types with canonical content shapes. Verify it exists:

```bash
ls -la apps/student/lib/activity-examples.yaml
```

Expected: file exists with 14 entries.

- [ ] **Step 2: Validate the YAML is parseable**

```bash
node -e "const fs = require('fs'); const yaml = require('js-yaml'); const doc = yaml.load(fs.readFileSync('apps/student/lib/activity-examples.yaml', 'utf8')); console.log(doc.length, 'entries')"
```

If `js-yaml` is not available globally, install it or just verify syntax:

```bash
node -e "JSON.parse(JSON.stringify(require('js-yaml').load(require('fs').readFileSync('apps/student/lib/activity-examples.yaml','utf8')))); console.log('valid')"
```

Run from repo root. Expected: `14 entries` or `valid`.

- [ ] **Step 3: Commit**

```bash
git add apps/student/lib/activity-examples.yaml
git commit -m "feat: add activity type examples reference YAML"
```

---

### Task 2: Add js-yaml dependency to student app

**Files:**
- Modify: `apps/student/package.json`

- [ ] **Step 1: Add js-yaml and @types/js-yaml as devDependencies**

Edit `apps/student/package.json` to add:

```
"devDependencies": {
    ...
    "@types/js-yaml": "^4.0.9",
    "js-yaml": "^4.2.0",
    ...
}
```

Exact edit — insert after the last existing devDependency (`@playwright/test`):

```json
    "@playwright/test": "^1.50.0",
    "@types/js-yaml": "^4.0.9",
    "js-yaml": "^4.2.0"
```

- [ ] **Step 2: Install dependencies**

```bash
pnpm install
```

Expected: no errors, `js-yaml` and `@types/js-yaml` installed for the student workspace.

- [ ] **Step 3: Commit**

```bash
git add apps/student/package.json pnpm-lock.yaml
git commit -m "feat: add js-yaml dependency for playground page"
```

---

### Task 3: Create the playground page

**Files:**
- Create: `apps/student/pages/playground.tsx`

- [ ] **Step 1: Create `pages/playground.tsx` with getStaticProps**

```typescript
import fs from "fs";
import path from "path";
import yaml from "js-yaml";
import { ActivityRenderer } from "@learn-easy/ui";
import { AppShell } from "@learn-easy/ui";
import type { GetStaticProps } from "next";

interface ActivityExample {
  type: string;
  step: string;
  description: string;
  content: Record<string, unknown>;
}

interface PlaygroundProps {
  rawYaml: string;
  examples: ActivityExample[];
}

export const getStaticProps: GetStaticProps<PlaygroundProps> = async () => {
  const filePath = path.join(process.cwd(), "lib", "activity-examples.yaml");
  const rawYaml = fs.readFileSync(filePath, "utf-8");
  const examples = yaml.load(rawYaml) as ActivityExample[];
  return { props: { rawYaml, examples } };
};
```

- [ ] **Step 2: Add the page component with split-pane layout**

```typescript
import { useState } from "react";

function yamlBlock(raw: string, index: number): string {
  const blocks = raw.split(/\n(?=- )/);
  return blocks[index] || blocks[0];
}

export default function Playground({ rawYaml, examples }: PlaygroundProps) {
  const [visibleType, setVisibleType] = useState<string | null>(null);

  return (
    <AppShell variant="student" footer={null}>
      <div className="mx-auto max-w-6xl px-4 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-slate-text">
            Activity Type Playground
          </h1>
          <p className="mt-1 text-sm text-on-surface-variant">
            Developer reference — all 14 supported activity types with YAML
            definitions and rendered output
          </p>
        </header>

        <div className="space-y-10">
          {examples.map((example, i) => (
            <ActivityCard
              key={example.type}
              example={example}
              yamlSource={yamlBlock(rawYaml, i)}
              index={i}
              isVisible={visibleType === example.type}
              onToggle={() =>
                setVisibleType(
                  visibleType === example.type ? null : example.type
                )
              }
            />
          ))}
        </div>
      </div>
    </AppShell>
  );
}

function ActivityCard({
  example,
  yamlSource,
  index,
  isVisible,
  onToggle,
}: {
  example: ActivityExample;
  yamlSource: string;
  index: number;
  isVisible: boolean;
  onToggle: () => void;
}) {
  return (
    <section className="rounded-xl border border-outline-variant bg-white shadow-sm">
      <button
        onClick={onToggle}
        className="flex w-full items-center gap-3 px-6 py-4 text-left"
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-soft-blue/10 text-xs font-semibold text-soft-blue">
          {index + 1}
        </span>
        <code className="rounded bg-surface-container-high px-2 py-0.5 font-mono text-sm font-semibold text-primary">
          {example.type}
        </code>
        <span className="rounded-full bg-surface-container-high px-2.5 py-0.5 text-xs text-on-surface-variant">
          {example.step}
        </span>
        <span className="ml-auto text-on-surface-variant">
          {isVisible ? "▲" : "▼"}
        </span>
      </button>

      {isVisible && (
        <div className="border-t border-outline-variant px-6 py-5">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                YAML Definition
              </h3>
              <pre className="overflow-x-auto rounded-lg bg-surface-container-high p-4 text-xs leading-relaxed">
                <code>{yamlSource}</code>
              </pre>
            </div>
            <div>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                Rendered Output
              </h3>
              <div className="flex min-h-[200px] items-center justify-center rounded-lg border border-dashed border-outline-variant bg-warm-off-white/50 p-6">
                <ActivityRenderer
                  activity={{
                    id: `demo-${example.type}`,
                    type: example.type,
                    content: example.content,
                  }}
                  stepLabel={example.step}
                  onComplete={() => {}}
                />
              </div>
            </div>
          </div>
          <p className="mt-4 text-sm italic text-on-surface-variant">
            {example.description}
          </p>
        </div>
      )}
    </section>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add apps/student/pages/playground.tsx
git commit -m "feat: add activity type playground page with split-pane layout"
```

---

### Task 4: Add playground route to public routes

**Files:**
- Modify: `apps/student/pages/_app.tsx:15` — add `/playground` to `PUBLIC_ROUTES`
- Modify: `apps/student/pages/_app.tsx:31` — add `router.pathname !== "/playground"` to the redirect exception

- [ ] **Step 1: Update PUBLIC_ROUTES array**

Edit `apps/student/pages/_app.tsx` line 15:

```typescript
const PUBLIC_ROUTES = ["/login", "/signup", "/calm-zone", "/playground"];
```

- [ ] **Step 2: Allow authenticated users to access playground**

Edit line 31 to add playground to the exception (alongside calm-zone):

```typescript
    } else if (isPublic && isAuthenticated && router.pathname !== "/calm-zone" && router.pathname !== "/playground") {
```

- [ ] **Step 3: Commit**

```bash
git add apps/student/pages/_app.tsx
git commit -m "feat: add /playground to public routes"
```

---

### Task 5: Verify the build

- [ ] **Step 1: Build the student app**

```bash
pnpm --filter @learn-easy/student build
```

Expected: Build succeeds with no errors. The playground page compiles and the YAML file is accessible at build time.

- [ ] **Step 2: Verify the playground renders**

Start the dev server and visit `/playground`:

```bash
pnpm --filter @learn-easy/student dev
```

Open `http://localhost:3000/playground` in a browser. Expected:
- Page loads with all 14 activity type cards collapsed
- Clicking each card expands to show YAML on left and rendered component on right
- All 14 activity types render without errors
- Responsive layout stacks vertically on narrow viewports

- [ ] **Step 3: Start e2e test for playground**

If playwright is configured, or verify by checking the browser console for errors.
