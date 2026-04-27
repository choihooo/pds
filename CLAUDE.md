## gstack (REQUIRED — global install)

**Before using repo skill commands, verify the global gstack install is complete:**

```bash
test -x ~/.claude/skills/gstack/bin/gstack-team-init \
  -a -x ~/.claude/skills/gstack/bin/gstack-session-update \
  -a -x ~/.claude/skills/gstack/browse/dist/browse \
  -a -f ~/.claude/skills/gstack/SKILL.md \
  && echo "GSTACK_OK" || echo "GSTACK_MISSING"
```

If GSTACK_MISSING: STOP. Do not proceed. Tell the user:

> gstack is required for AI-assisted skill usage in this repo.
> Install it:
> ```bash
> git clone --depth 1 https://github.com/garrytan/gstack.git ~/.claude/skills/gstack
> cd ~/.claude/skills/gstack && ./setup --team
> ```
> Then restart your AI coding tool.

This repo currently enforces gstack through a Claude Code `PreToolUse` hook on `Skill`
invocations. Do not skip skills, ignore gstack errors, or work around a missing install.

Using gstack skills: After install, skills like /qa, /ship, /review, /investigate,
and /browse are available. Use /browse for all web browsing.
Use ~/.claude/skills/gstack/... for gstack file paths (the global path).

## Skill routing

- Product ambiguity or scope change: run `/office-hours` first.
- New feature planning: run `/autoplan` and save the resulting plan under `docs/superpowers/plans/`.
- Architecture or risk review: run `/plan-eng-review` before implementation starts.
- Browser testing or visual verification: use `/browse` or `/qa`, never ad-hoc browser tools.
- Before merge: run `/review`.
- After implementation stabilizes: run `/ship`.

## Product Context

- `pds` starts as a diary product.
- The primary user is a single end user writing and revisiting personal diary entries.
- Seed feature docs live under `docs/product/`.

## Docs Source of Truth

- Product intent: `docs/product/vision.md`
- Feature-level scope: `docs/product/*.md`
- Workflow and technical rules: `docs/architecture/workflow.md`
- Execution process: `docs/process/feature-lifecycle.md`
- Task-by-task plans: `docs/superpowers/plans/*.md`
- Code/docs divergence should be fixed in the same branch before shipping.

## Delivery Flow

1. For product ambiguity or scope change, run `/office-hours` first.
2. For new feature planning, run `/autoplan` and save the resulting plan under `docs/superpowers/plans/`.
3. For architecture or risk review, run `/plan-eng-review` before implementation starts.
4. For browser testing or visual verification, use `/browse` or `/qa`, never ad-hoc browser tools.
5. Before merge, run `/review`.
6. After implementation stabilizes, run `/ship`.
