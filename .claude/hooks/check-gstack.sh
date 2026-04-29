#!/bin/bash
# Block skill usage when the global gstack install is missing or incomplete.

install_root="$HOME/.claude/skills/gstack"

if [ ! -d "$install_root" ]; then
  cat >&2 <<'MSG'
BLOCKED: gstack is not installed globally.

gstack is required for AI-assisted skill usage in this repo.

Install it:
  git clone --depth 1 https://github.com/garrytan/gstack.git ~/.claude/skills/gstack
  cd ~/.claude/skills/gstack && ./setup --team

Then restart your AI coding tool.
MSG
  echo '{"permissionDecision":"deny","message":"gstack is required but not installed. See stderr for install instructions."}'
  exit 0
fi

required_execs=(
  "$install_root/bin/gstack-team-init"
  "$install_root/bin/gstack-session-update"
  "$install_root/browse/dist/browse"
)

required_files=(
  "$install_root/SKILL.md"
)

for path in "${required_execs[@]}"; do
  if [ ! -x "$path" ]; then
    cat >&2 <<MSG
BLOCKED: gstack install is incomplete.

Missing executable:
  $path

Run:
  cd ~/.claude/skills/gstack && ./setup --team

Then restart your AI coding tool.
MSG
    echo '{"permissionDecision":"deny","message":"gstack is installed incompletely. See stderr for repair instructions."}'
    exit 0
  fi
done

for path in "${required_files[@]}"; do
  if [ ! -f "$path" ]; then
    cat >&2 <<'MSG'
BLOCKED: gstack install is incomplete.

Missing required file:
  ~/.claude/skills/gstack/SKILL.md

Run:
  cd ~/.claude/skills/gstack && ./setup --team

Then restart your AI coding tool.
MSG
    echo '{"permissionDecision":"deny","message":"gstack is installed incompletely. See stderr for repair instructions."}'
    exit 0
  fi
done

echo '{}'
