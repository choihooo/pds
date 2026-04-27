# PDS Gstack Shared Docs Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `pds` 저장소를 gstack 팀 모드와 공용 문서 체계 위에서 바로 기능 개발을 시작할 수 있는 상태로 부트스트랩한다.

**Architecture:** 이 저장소는 아직 앱 코드가 없으므로, 먼저 gstack이 읽는 저장소 루트 규칙(`CLAUDE.md`, `.claude` hook)과 사람이 읽는 공용 문서(`docs/product`, `docs/architecture`, `docs/process`)를 확정한다. 이후 모든 기능 개발은 `/office-hours -> /autoplan -> /review -> /ship` 흐름을 따르도록 문서와 훅을 맞춘다.

**Tech Stack:** Git, gstack team mode, Markdown docs, Claude/Codex shared repo conventions, shell verification

---

## File Structure

- `CLAUDE.md`
  저장소 공용 운영 규칙. gstack 사용 강제, skill routing, 문서 우선순위, 기능 개발 흐름을 정의한다.
- `.claude/settings.json`
  gstack required mode에서 `PreToolUse` hook를 등록한다.
- `.claude/hooks/check-gstack.sh`
  전역 gstack 미설치 시 skill 실행을 막는 저장소 로컬 enforcement hook.
- `.gitignore`
  팀 모드에서 저장소에 vendored gstack이 들어오지 않도록 `.claude/skills/gstack/`를 무시한다.
- `docs/product/vision.md`
  `pds diary project`의 제품 목적, 사용자, 핵심 시나리오, 제외 범위를 정의한다.
- `docs/product/diary-entry-mvp.md`
  저장소 이름 기준의 첫 기능 문서. 일기 작성/조회 MVP를 다음 구현 계획의 입력 문서로 만든다.
- `docs/architecture/workflow.md`
  gstack 중심 개발 흐름, 문서 간 연결, 브랜치별 작업 순서를 설명한다.
- `docs/process/feature-lifecycle.md`
  기능 요청이 들어왔을 때 어떤 문서를 먼저 만들고 어떤 skill을 어떤 순서로 실행할지 절차를 적는다.
- `docs/superpowers/plans/2026-04-27-pds-gstack-shared-docs.md`
  현재 계획 문서.

## Assumptions

- 현재 저장소에는 앱 코드와 제품 스펙이 없다.
- `initial: pds diary project` 커밋 메시지를 제품의 유일한 로컬 힌트로 사용한다.
- 이번 작업의 목적은 앱 구현이 아니라, 이후 구현을 위한 gstack 공유 기반과 seed 문서를 만드는 것이다.

### Task 1: Bootstrap gstack Team Mode

**Files:**
- Create: `CLAUDE.md`
- Create: `.claude/settings.json`
- Create: `.claude/hooks/check-gstack.sh`
- Modify: `.gitignore`
- Test: shell verification from repo root

- [ ] **Step 1: Write the failing verification**

```bash
test -f CLAUDE.md && echo "CLAUDE_PRESENT" || echo "CLAUDE_MISSING"
test -f .claude/settings.json && echo "SETTINGS_PRESENT" || echo "SETTINGS_MISSING"
test -f .claude/hooks/check-gstack.sh && echo "HOOK_PRESENT" || echo "HOOK_MISSING"
rg -n "^\\.claude/skills/gstack/$" .gitignore || echo "GITIGNORE_MISSING"
```

Expected:
- `CLAUDE_MISSING`
- `SETTINGS_MISSING`
- `HOOK_MISSING`
- `GITIGNORE_MISSING`

- [ ] **Step 2: Run gstack team bootstrap in required mode**

```bash
cd ~/.claude/skills/gstack && ./setup --team
~/.claude/skills/gstack/bin/gstack-team-init required
```

Expected:
- `Team mode (required) initialized.`
- generated file summary includes `CLAUDE.md`
- generated file summary includes `.claude/hooks/check-gstack.sh`
- generated file summary includes `.claude/settings.json`

- [ ] **Step 3: Verify bootstrap files were created**

```bash
test -f CLAUDE.md && echo "CLAUDE_PRESENT"
test -f .claude/settings.json && echo "SETTINGS_PRESENT"
test -f .claude/hooks/check-gstack.sh && echo "HOOK_PRESENT"
rg -n "^\\.claude/skills/gstack/$" .gitignore
```

Expected:
- `CLAUDE_PRESENT`
- `SETTINGS_PRESENT`
- `HOOK_PRESENT`
- `.claude/skills/gstack/`

- [ ] **Step 4: Commit the bootstrap**

```bash
git add CLAUDE.md .claude/settings.json .claude/hooks/check-gstack.sh .gitignore
git commit -m "chore: require gstack team mode in pds"
```

### Task 2: Normalize Shared Repo Rules in `CLAUDE.md`

**Files:**
- Modify: `CLAUDE.md`
- Test: `CLAUDE.md` section checks

- [ ] **Step 1: Write the failing verification**

```bash
rg -n "^## Skill routing$|^## Product Context$|^## Docs Source of Truth$|^## Delivery Flow$" CLAUDE.md || echo "MISSING_SECTIONS"
```

Expected:
- `MISSING_SECTIONS`

- [ ] **Step 2: Append shared working rules**

```md
## Skill routing

- Product ambiguity or scope change: run `/office-hours` first.
- New feature planning: run `/autoplan` and save the resulting plan under `docs/superpowers/plans/`.
- Architecture or risk review: run `/plan-eng-review` before implementation starts.
- Browser testing or visual verification: use `/browse` or `/qa`, never ad-hoc browser tools.
- Before merge: run `/review`.
- After implementation stabilizes: run `/ship`.

## Product Context

`pds` starts as a diary product. Until a stronger product spec replaces this section,
assume the primary user is a single end user writing and revisiting personal diary entries.
Seed feature docs live under `docs/product/`.

## Docs Source of Truth

- Product intent: `docs/product/vision.md`
- Feature-level scope: `docs/product/*.md`
- Workflow and technical rules: `docs/architecture/workflow.md`
- Execution process: `docs/process/feature-lifecycle.md`
- Task-by-task plans: `docs/superpowers/plans/*.md`

When code and docs diverge, update the docs in the same branch before shipping.

## Delivery Flow

1. Capture or revise product intent in `docs/product/`.
2. Run `/office-hours` if the request changes product framing.
3. Run `/autoplan` to create an implementation plan.
4. Implement in a feature branch.
5. Run `/review` and resolve findings.
6. Run `/ship` once tests and docs are current.
```

- [ ] **Step 3: Run verification**

```bash
rg -n "^## Skill routing$|^## Product Context$|^## Docs Source of Truth$|^## Delivery Flow$" CLAUDE.md
```

Expected:
- four matching section headers printed from `CLAUDE.md`

- [ ] **Step 4: Commit the shared rules**

```bash
git add CLAUDE.md
git commit -m "docs: add shared gstack workflow rules"
```

### Task 3: Create Product Seed Docs

**Files:**
- Create: `docs/product/vision.md`
- Create: `docs/product/diary-entry-mvp.md`
- Test: markdown content checks

- [ ] **Step 1: Write the failing verification**

```bash
test -f docs/product/vision.md && echo "VISION_PRESENT" || echo "VISION_MISSING"
test -f docs/product/diary-entry-mvp.md && echo "MVP_PRESENT" || echo "MVP_MISSING"
```

Expected:
- `VISION_MISSING`
- `MVP_MISSING`

- [ ] **Step 2: Create the product vision doc**

```md
# PDS Product Vision

## Problem

The repository currently has no executable product definition.
Without a shared statement of intent, planning tools will optimize for different products.

## Product Direction

PDS is a personal diary system centered on low-friction daily writing and simple re-reading.
The first version should make one user successful at three actions:
- create an entry quickly
- review entries in reverse chronological order
- reopen one entry and edit or delete it safely

## Primary User

- a single end user writing personal notes

## Non-Goals For The First Iteration

- multi-user collaboration
- social sharing
- rich media editing
- analytics dashboards
- AI summarization

## Success Criteria

- the team can point to one stable MVP feature document
- future plans can reference this file instead of guessing the product
```

- [ ] **Step 3: Create the seed feature doc**

```md
# Diary Entry MVP

## User Story

As a diary user, I want to write today's entry, see previous entries, and update or remove an entry later.

## Required Capabilities

1. Create an entry with `title`, `content`, and `entryDate`.
2. View entries sorted by newest `entryDate` first.
3. Open one entry and edit its fields.
4. Delete one entry with an explicit confirmation step.

## Acceptance Criteria

- empty title is rejected
- empty content is rejected
- a saved entry appears in the list without a manual refresh
- editing an entry persists the new title and content
- deleting an entry removes it from the list

## Open Questions

- should draft autosave exist in v1: no
- should tags exist in v1: no
- should mood metadata exist in v1: no
```

- [ ] **Step 4: Run verification**

```bash
rg -n "^# PDS Product Vision$|^## Success Criteria$" docs/product/vision.md
rg -n "^# Diary Entry MVP$|^## Acceptance Criteria$" docs/product/diary-entry-mvp.md
```

Expected:
- heading matches from both files

- [ ] **Step 5: Commit the product docs**

```bash
git add docs/product/vision.md docs/product/diary-entry-mvp.md
git commit -m "docs: add pds product seed documents"
```

### Task 4: Document the gstack-First Delivery Process

**Files:**
- Create: `docs/architecture/workflow.md`
- Create: `docs/process/feature-lifecycle.md`
- Test: markdown content checks

- [ ] **Step 1: Write the failing verification**

```bash
test -f docs/architecture/workflow.md && echo "WORKFLOW_PRESENT" || echo "WORKFLOW_MISSING"
test -f docs/process/feature-lifecycle.md && echo "PROCESS_PRESENT" || echo "PROCESS_MISSING"
```

Expected:
- `WORKFLOW_MISSING`
- `PROCESS_MISSING`

- [ ] **Step 2: Create the workflow architecture doc**

```md
# PDS Workflow Architecture

## Source Order

1. `CLAUDE.md`
2. `docs/product/vision.md`
3. `docs/product/*.md`
4. `docs/superpowers/plans/*.md`
5. code and tests

## gstack Flow

The repo follows the gstack sprint order:

`/office-hours -> /autoplan -> implementation -> /review -> /qa -> /ship`

## Practical Rule

- if the request changes what the product is, update `docs/product/vision.md` first
- if the request changes one feature, update or create one file in `docs/product/`
- if implementation starts without a plan, stop and create one under `docs/superpowers/plans/`
```

- [ ] **Step 3: Create the feature lifecycle doc**

```md
# Feature Lifecycle

## Intake

1. Read `CLAUDE.md`.
2. Read `docs/product/vision.md`.
3. Read the relevant file under `docs/product/`.

## Planning

1. Run `/office-hours` when the request is still fuzzy.
2. Run `/autoplan`.
3. Save the approved plan under `docs/superpowers/plans/YYYY-MM-DD-<feature>.md`.

## Execution

1. Implement on a feature branch.
2. Keep docs updated in the same branch.
3. Run `/review` before asking to merge.

## Validation

1. Run project tests.
2. Run `/qa` when UI exists.
3. Run `/ship` only after code and docs match.
```

- [ ] **Step 4: Run verification**

```bash
rg -n "^# PDS Workflow Architecture$|^## gstack Flow$" docs/architecture/workflow.md
rg -n "^# Feature Lifecycle$|^## Planning$|^## Validation$" docs/process/feature-lifecycle.md
```

Expected:
- heading matches from both files

- [ ] **Step 5: Commit the process docs**

```bash
git add docs/architecture/workflow.md docs/process/feature-lifecycle.md
git commit -m "docs: add gstack-first delivery process"
```

## Self-Review

- Spec coverage:
  현재 요청의 핵심인 "gstack 문서를 보고, 문서 공유가 가능한 형태로 계획 수립"은 Task 1-4에 모두 반영했다. Task 1은 팀 모드 공유 기반, Task 2는 공용 저장소 규칙, Task 3은 제품 seed 문서, Task 4는 이후 기능 작업의 절차를 다룬다.
- Placeholder scan:
  `TODO`, `TBD`, "적절히", "나중에" 같은 표현을 쓰지 않았다. 각 단계에 파일, 명령, 기대 결과를 모두 적었다.
- Type consistency:
  문서 경로는 전 구간에서 `docs/product/`, `docs/architecture/`, `docs/process/`, `docs/superpowers/plans/`로 일관되게 사용했다. 계획 흐름도 `/office-hours -> /autoplan -> /review -> /qa -> /ship`로 통일했다.

Plan complete and saved to `docs/superpowers/plans/2026-04-27-pds-gstack-shared-docs.md`. Two execution options:

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

Which approach?
