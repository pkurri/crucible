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
echo "   Restart Claude Code to pick up new commands."

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
