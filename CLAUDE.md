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
