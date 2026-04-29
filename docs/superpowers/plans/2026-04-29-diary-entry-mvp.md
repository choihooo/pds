# PDS Daily Plan-Do-See MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the daily Plan-Do-See diary page — one screen where Plan, Do, See are simultaneously visible and editable, with data persisted in Turso and served through Next.js App Router. Ship in a weekend, use from Monday.

**Architecture:** Next.js 15 App Router with Server Actions. Turso (libSQL/SQLite) for data. Drizzle ORM for type-safe queries. Tailwind CSS for styling. No auth (personal tool). Auto-save on every keystroke with debounce.

**Tech Stack:** Next.js 15, TypeScript, Turso, Drizzle ORM, Tailwind CSS 4, React 19

**Design Doc:** `~/.gstack/projects/pds/choiho-unknown-design-20260426-174857.md`

---

## Premises

1. **One date, one entry.** The primary object is `daily_entries` keyed by date (`YYYY-MM-DD`). No multiple entries per date. No title/content model — it's Plan/Do/See sections.
2. **Single-user, no auth.** Personal tool. Turso credentials stay server-side only (via `TURSO_DB_URL` / `TURSO_AUTH_TOKEN` in `.env.local`). No client-side DB access.
3. **Auto-save is core, not optional.** Every change saves after 300ms debounce. On blur, immediate flush. The user never clicks a Save button.
4. **Desktop-first, mobile-ok.** Three columns on desktop (>1024px), vertical stack on mobile. Date navigation with arrows + keyboard shortcuts.
5. **Bottom-up.** Daily page first. Weekly/monthly/yearly views are v2+. Tasks, tags, calendar are v2+.

## File Structure

```
pds/
├── .env.local                         # Turso credentials (server-only)
├── .env.example                       # Template
├── next.config.ts
├── package.json
├── tsconfig.json
├── drizzle.config.ts
├── src/
│   ├── app/
│   │   ├── layout.tsx                 # Root layout
│   │   ├── page.tsx                   # Redirects to /today
│   │   ├── globals.css                # Tailwind + CSS variables
│   │   └── [date]/
│   │       └── page.tsx               # Daily PDS page (Server Component)
│   ├── components/
│   │   ├── daily/
│   │   │   ├── pds-section.tsx        # Single Plan/Do/See section
│   │   │   └── mood-selector.tsx      # Mood/energy/focus picker (1-5)
│   │   └── layout/
│   │       └── date-nav.tsx           # Prev/next date arrows
│   ├── lib/
│   │   ├── db/
│   │   │   ├── index.ts               # Turso client singleton
│   │   │   ├── schema.ts              # Drizzle schema
│   │   │   └── queries.ts             # Typed query functions
│   │   ├── actions.ts                 # Server Actions (upsert, fetch)
│   │   └── utils.ts                   # cn() utility
│   └── types/
│       └── index.ts                   # DailyEntry type
├── supabase/                          # Removed — using Turso
└── docs/                              # Existing docs
```

## Database Schema

```sql
-- Turso (libSQL)
CREATE TABLE daily_entries (
  date TEXT PRIMARY KEY,            -- YYYY-MM-DD
  plan_text TEXT NOT NULL DEFAULT '',
  do_text TEXT NOT NULL DEFAULT '',
  see_text TEXT NOT NULL DEFAULT '',
  mood INTEGER CHECK (mood IS NULL OR (mood >= 1 AND mood <= 5)),
  energy INTEGER CHECK (energy IS NULL OR (energy >= 1 AND energy <= 5)),
  focus INTEGER CHECK (focus IS NULL OR (focus >= 1 AND focus <= 5)),
  userId: text("user_id").notNull().default("owner"),
  mood INTEGER CHECK (mood IS NULL OR (mood >= 1 AND mood <= 5)),
  energy INTEGER CHECK (energy IS NULL OR (energy >= 1 AND energy <= 5)),
  focus INTEGER CHECK (focus IS NULL OR (focus >= 1 AND focus <= 5)),
  user_id TEXT NOT NULL DEFAULT 'owner',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(user_id, date)
);
```

## Types

```typescript
// src/types/index.ts
export interface DailyEntry {
  date: string;        // YYYY-MM-DD
  planText: string;
  doText: string;
  seeText: string;
  mood: number | null;    // 1-5
  energy: number | null;  // 1-5
  focus: number | null;   // 1-5
  createdAt: string;
  updatedAt: string;
}

export interface DailyEntryInput {
  date: string;
  planText: string;
  doText: string;
  seeText: string;
  mood?: number | null;
  energy?: number | null;
  focus?: number | null;
}
```

---

## Task 1: Project Scaffold + Turso

**Files:**
- Create: `package.json`, `next.config.ts`, `tsconfig.json`, `tailwind.config.ts`, `drizzle.config.ts`
- Create: `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`
- Create: `src/lib/utils.ts`
- Create: `.env.example`

- [ ] **Step 1: Initialize Next.js project**

```bash
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-pnpm
```

- [ ] **Step 2: Install dependencies**

```bash
pnpm add @libsql/client drizzle-orm
pnpm add -D drizzle-kit @types/node
```

- [ ] **Step 3: Create `.env.example`**

```
TURSO_DB_URL=libsql://your-db-name-your-org.turso.co
TURSO_AUTH_TOKEN=your-auth-token
```

- [ ] **Step 4: Create `drizzle.config.ts`**

- [ ] **Step 5: Update `.gitignore` — ensure `.env.local`, `node_modules/`, `.next/` present**

- [ ] **Step 6: Verify scaffold**

```bash
pnpm build
```

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "chore: scaffold Next.js 15 with Turso + Drizzle"
```

## Task 2: Database Layer

**Files:**
- Create: `src/lib/db/index.ts`
- Create: `src/lib/db/schema.ts`
- Create: `src/lib/db/queries.ts`
- Create: `src/types/index.ts`

- [ ] **Step 1: Create Turso client singleton**

```typescript
// src/lib/db/index.ts
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";

const client = createClient({
  url: process.env.TURSO_DB_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

export const db = drizzle(client);
```

Throws at import time if env vars missing — caught at build, not runtime.

- [ ] **Step 2: Create Drizzle schema**

```typescript
// src/lib/db/schema.ts
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const dailyEntries = sqliteTable("daily_entries", {
  date: text("date").primaryKey(),
  planText: text("plan_text").notNull().default(""),
  doText: text("do_text").notNull().default(""),
  seeText: text("see_text").notNull().default(""),
  mood: integer("mood"),
  energy: integer("energy"),
  focus: integer("focus"),
  createdAt: text("created_at").notNull().default("(datetime('now'))"),
  updatedAt: text("updated_at").notNull().default("(datetime('now'))"),
});
```

- [ ] **Step 3: Create query functions**

```typescript
// src/lib/db/queries.ts
import { eq } from "drizzle-orm";
import { db } from "./index";
import { dailyEntries } from "./schema";

export async function getEntry(date: string) {
  const rows = await db.select().from(dailyEntries).where(eq(dailyEntries.date, date));
  return rows[0] ?? null;
}

export async function upsertEntry(data: {
  date: string;
  planText?: string;
  doText?: string;
  seeText?: string;
  mood?: number | null;
  energy?: number | null;
  focus?: number | null;
}) {
  return db.insert(dailyEntries).values({
    date: data.date,
    planText: data.planText ?? "",
    doText: data.doText ?? "",
    seeText: data.seeText ?? "",
    mood: data.mood ?? null,
    energy: data.energy ?? null,
    focus: data.focus ?? null,
    updatedAt: new Date().toISOString(),
  }).onConflictDoUpdate({
    target: dailyEntries.date,
    set: {
      ...(data.planText !== undefined && { planText: data.planText }),
      ...(data.doText !== undefined && { doText: data.doText }),
      ...(data.seeText !== undefined && { seeText: data.seeText }),
      ...(data.mood !== undefined && { mood: data.mood }),
      ...(data.energy !== undefined && { energy: data.energy }),
      ...(data.focus !== undefined && { focus: data.focus }),
      updatedAt: new Date().toISOString(),
    },
  }).returning();
}
```

- [ ] **Step 4: Run Drizzle migration**

```bash
pnpm drizzle-kit generate
pnpm drizzle-kit migrate
```

Or run the SQL directly in Turso dashboard.

- [ ] **Step 5: Verify types compile**

```bash
pnpm tsc --noEmit
```

- [ ] **Step 6: Commit**

```bash
git add src/lib/ src/types/ drizzle.config.ts
git commit -m "feat: add Turso database layer with Drizzle ORM"
```

## Task 3: Server Actions

**Files:**
- Create: `src/lib/actions.ts`

- [ ] **Step 1: Create server actions**

```typescript
// src/lib/actions.ts
"use server";

import { getEntry, upsertEntry } from "./db/queries";

export async function fetchDailyEntry(date: string) {
  return getEntry(date);
}

export async function saveSection(
  date: string,
  field: "planText" | "doText" | "seeText",
  value: string,
) {
  return upsertEntry({ date, [field]: value });
}

export async function saveMood(
  date: string,
  type: "mood" | "energy" | "focus",
  value: number | null,
) {
  return upsertEntry({ date, [type]: value });
}
```

All DB access is server-side. No client-side Turso calls. Credentials never leave the server.

- [ ] **Step 2: Verify types compile**

```bash
pnpm tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/actions.ts
git commit -m "feat: add Server Actions for daily entry CRUD"
```

## Task 4: PDS Section Component

**Files:**
- Create: `src/components/daily/pds-section.tsx`

- [ ] **Step 1: Create PDS section component**

A single Plan/Do/See section. Full-height scrollable panel. Contains:
- Section label (Plan / Do / See)
- `<textarea>` that fills available height
- Auto-save: 300ms debounce via `useEffect` + `setTimeout`, immediate flush on blur
- "Saved" / "Saving..." / "Failed to save" status indicator
- Placeholder text when empty ("오늘 계획을 적어보세요" / "오늘 한 일을 적어보세요" / "오늘의 회고를 적어보세요")
- On save failure: toast notification, retry every 10 seconds in background

Props: `label`, `field` (planText/doText/seeText), `date`, `initialValue`, `placeholder`.

- [ ] **Step 2: Verify component compiles**

```bash
pnpm tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add src/components/daily/pds-section.tsx
git commit -m "feat: add PDS section component with auto-save"
```

## Task 5: Mood Selector + Date Navigation

**Files:**
- Create: `src/components/daily/mood-selector.tsx`
- Create: `src/components/layout/date-nav.tsx`

- [ ] **Step 1: Create mood/energy/focus selector**

Three rows of 5 dots (1-5). Selected dot filled. Optional — null by default. Calls `saveMood` server action on click.

- [ ] **Step 2: Create date navigation**

- Displays current date in `YYYY-MM-DD (요일)` format
- Left/right arrows for prev/next day
- `Alt+Left` / `Alt+Right` keyboard shortcuts
- Clicking date opens native date picker for jumping to specific date
- Uses `useRouter().push(\`/\${newDate}\`)` for navigation

- [ ] **Step 3: Verify components compile**

```bash
pnpm tsc --noEmit
```

- [ ] **Step 4: Commit**

```bash
git add src/components/daily/mood-selector.tsx src/components/layout/date-nav.tsx
git commit -m "feat: add mood selector and date navigation"
```

## Task 6: Daily Page Assembly

**Files:**
- Modify: `src/app/page.tsx` — redirect `/` to `/[today's date]`
- Create: `src/app/[date]/page.tsx`

- [ ] **Step 1: Root page redirects to today**

```typescript
// src/app/page.tsx
import { redirect } from "next/navigation";

export default function Home() {
  // Use local date, not UTC — avoids timezone bug near midnight
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  redirect(`/${today}`);
}
```

- [ ] **Step 2: Create the daily PDS page**

Server Component that:
1. Validates `date` param is valid `YYYY-MM-DD`
2. Fetches entry via `fetchDailyEntry(date)` server action
3. Renders layout: DateNav at top, MoodSelector below, then three PDS sections

Layout:
```
┌──────────────────────────────────────────────┐
│  ← 2026-04-29 (화) →                         │
│  😊 1 2 3 4 5   ⚡ 1 2 3 4 5   🎯 1 2 3 4 5 │
├──────────────┬──────────────┬────────────────┤
│    Plan      │     Do       │      See       │
│              │              │                │
│  (textarea)  │  (textarea)  │   (textarea)   │
│              │              │                │
│              │              │                │
│  Saved ✓     │  Saving...   │  Saved ✓       │
└──────────────┴──────────────┴────────────────┘
```

Mobile (<1024px): vertical stack, Plan → Do → See order.

- [ ] **Step 3: Style the layout**

Three equal-width columns. Each column full viewport height minus header. Warm white background (#FAFAFA). Base font 16px, line-height 1.6 for readability.

- [ ] **Step 4: Verify full build**

```bash
pnpm build
```

- [ ] **Step 5: Commit**

```bash
git add src/app/
git commit -m "feat: assemble daily PDS page with three-column layout"
```

## Task 7: Integration Verification

- [ ] **Step 1: Create Turso database**

```bash
turso db create pds-diary
turso db shell pds-diary < migration.sql
```

Or run SQL directly in Turso dashboard.

- [ ] **Step 2: Run dev server and verify flows**

```bash
pnpm dev
```

Manual checklist:
- [ ] `/` redirects to `/[today]`
- [ ] Three columns render: Plan | Do | See
- [ ] Typing in Plan auto-saves after 300ms, shows "Saved ✓"
- [ ] Switching date via arrows loads correct entry
- [ ] `Alt+Left` / `Alt+Right` keyboard shortcuts work
- [ ] Empty date shows placeholder text in each section
- [ ] Mood/energy/focus selectors work and persist
- [ ] Previous data survives page refresh
- [ ] Mobile: three sections stack vertically
- [ ] Save failure shows toast notification

- [ ] **Step 3: Fix any issues found, commit each fix atomically**

- [ ] **Step 4: Final build check**

```bash
pnpm build
```

---

## Error Handling

| Scenario | UI Response |
|----------|------------|
| Turso unreachable | Top banner: "Connection lost. Retrying..." |
| Section save fails | Toast: "Save failed. Retrying..." + auto-retry every 10s |
| Invalid date in URL | Redirect to today |
| No entry for date | Empty textareas with placeholder text |
| Env vars missing | Build-time error (not runtime) |

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Alt+Left` | Previous day |
| `Alt+Right` | Next day |
| `Tab` | Move between Plan → Do → See sections |

## Not In Scope (Deferred to v2+)

- Weekly/monthly/yearly views
- Tasks and checklists
- Tags and categories
- Rich text / markdown editing
- Calendar sidebar
- Streak counter
- Heatmap / analytics
- Dark mode
- Multi-user / auth
- Image/media attachments
- Search
- Export / import

## CEO Review Results

### Premises (Confirmed by User)
1. Single-user no-auth accepted for v1. `user_id TEXT DEFAULT 'owner'` added to schema for future multi-user.
2. Turso stays — chosen in design doc, acceptable for v1.
3. Auto-save is core, not optional.
4. Desktop-first, mobile stack acceptable.
5. V1 is a habit formation test. Success = 7 consecutive days of non-empty entries.

### CEO Consensus
Both Claude and Codex agreed: plan is well-engineered and aligned with design doc, but solves layout replication rather than habit formation. Both flag MVP scope as slightly bloated. User chose to ship full scope.

### Decision Audit Trail

| # | Phase | Decision | Classification | Principle | Rationale |
|---|-------|----------|-----------|-----------|----------|
| 1 | CEO | Add user_id to schema | Mechanical | P1 | Zero cost today, expensive retrofit later |
| 2 | CEO | Keep Turso over local-first | Deferred | P3 | Design doc chose it, revisit for v2 |
| 3 | CEO | Keep mobile responsive stack | Accepted | P6 | Desktop-first per design doc |
| 4 | CEO | Add 7-day usage success criterion | Mechanical | P1 | Measurable habit formation test |
| 5 | CEO | Ship full scope including mood/retry/shortcuts | Accepted | P6 | User chose full scope |

### NOT in Scope (CEO)
- Habit formation mechanics (streaks, reminders, notifications) — v2
- Local-first architecture — v2 evaluation
- Multi-user / auth — v2
- Market testing / distribution — post-MVP

### What Already Exists
No app code. Greenfield. Only docs + gstack config.

### Dream State Delta
CURRENT (docs only) → THIS PLAN (PDS daily page with auto-save) → 12-MONTH IDEAL (calendar, tasks, tags, streaks, heatmaps, weekly synthesis)

### Error & Rescue Registry

| Scenario | Error | Rescue | User Sees |
|----------|-------|--------|-----------|
| Turso unreachable | Network error | Top banner + auto-retry 10s | "Connection lost. Retrying..." |
| Section save fails | Mutation error | Toast + preserve textarea content | "Save failed. Retrying..." |
| Invalid date URL | Bad param | Redirect to today | Seamless redirect |
| No entry for date | Empty query | Empty textareas with placeholder | "오늘 계획을 적어보세요" |

### Failure Modes Registry

| Failure Mode | Severity | Mitigation | Gap |
|-------------|----------|------------|-----|
| Auto-save race condition | Medium | 300ms debounce + blur flush | Covered |
| Turso outage | Medium | Error banner + retry | Accepted for v1 |
| Data loss on concurrent tabs | Low | Last-write-wins via upsert | Accepted for v1 |
| Schema migration for v2 | Medium | Flat text columns, plan entry_blocks table | Deferred |

---

## Self-Review

- Design doc alignment: Plan-Do-See three-panel layout matches approved design doc exactly. Same data model (`daily_entries` with `plan_text`/`do_text`/`see_text`), same auto-save behavior, same date navigation.
- Spec coverage: All capabilities from design doc v1 section are covered.
- Security: All DB calls through Server Actions. Turso credentials server-side only. No client-side DB access.
- No TODO/TBD placeholders. Every step has concrete files, code, and verification.
- Type consistency: DailyEntry type defined once, used across queries and components.
