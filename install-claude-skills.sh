#!/bin/bash
# Install crucible skills as global Claude Code slash commands
# Run this once from the crucible project root: bash install-claude-skills.sh

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
DEST="$HOME/.claude/commands"
mkdir -p "$DEST"

count=0
for d in "$SCRIPT_DIR/skills/"/*/; do
  name=$(basename "$d")
  if [ -f "$d/SKILL.md" ]; then
    cp "$d/SKILL.md" "$DEST/${name}.md"
    count=$((count + 1))
  fi
done

echo "✅ Installed $count crucible skills to $DEST"

# Skills that ship a Workflow script named <workflow-name>.workflow.js are also
# installed whole (with their templates/) as real skills, and each script is
# registered as a named workflow, so `Workflow({name: "<workflow-name>"})` finds it.
SKILLS_DEST="$HOME/.claude/skills"
WORKFLOWS_DEST="$HOME/.claude/workflows"
full=0
wf=0
for d in "$SCRIPT_DIR/skills/"/*/; do
  name=$(basename "$d")
  [ -f "$d/SKILL.md" ] || continue
  scripts=$(find "$d" -maxdepth 1 -name '*.workflow.js')
  if [ -n "$scripts" ]; then
    mkdir -p "$SKILLS_DEST/$name"
    cp -R "$d/." "$SKILLS_DEST/$name/"
    full=$((full + 1))
  fi
  for s in $scripts; do
    mkdir -p "$WORKFLOWS_DEST"
    cp "$s" "$WORKFLOWS_DEST/$(basename "$s" .workflow.js).js"
    wf=$((wf + 1))
  done
done
echo "✅ Installed $full full skill folders to $SKILLS_DEST and $wf workflows to $WORKFLOWS_DEST"
echo "   Restart Claude Code to pick up new commands, skills and workflows."

# Install agency-agents (if cloned alongside crucible)
AGENCY_DIR="$(dirname "$0")/../agency-agents"
if [ -d "$AGENCY_DIR" ]; then
  find "$AGENCY_DIR" -name "*.md" \
    -not -name "CONTRIBUTING*" -not -name "SECURITY*" \
    -not -path "*/.github/*" | while read f; do
      rel="${f#$AGENCY_DIR/}"
      flat=$(echo "$rel" | sed 's|/|--|g' | sed 's|\.md$||')
      cp "$f" "$DEST/agency--${flat}.md"
  done
  echo "✅ Also installed agency-agents from $AGENCY_DIR"
fi
