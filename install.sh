#!/usr/bin/env bash
# Crucible — Install script
# Usage: curl -fsSL https://raw.githubusercontent.com/pkurri/crucible/main/install.sh | bash

set -euo pipefail

SKILLS_DIR="${CLAUDE_SKILLS_DIR:-$HOME/.claude/skills}"
REPO="pkurri/crucible"
BRANCH="main"

echo "🔥 Installing Crucible skills to $SKILLS_DIR"

# Create skills directory if it doesn't exist
mkdir -p "$SKILLS_DIR"

# Download and extract
TMP=$(mktemp -d)
curl -fsSL "https://github.com/$REPO/archive/refs/heads/$BRANCH.tar.gz" \
  | tar -xz -C "$TMP" --strip-components=1

# Copy skills
cp -r "$TMP/skills/"* "$SKILLS_DIR/"

# Cleanup
rm -rf "$TMP"

echo ""
echo "✅ Crucible installed! Skills available in $SKILLS_DIR"
echo ""
echo "Installed skills:"
ls "$SKILLS_DIR" | sed 's/^/  - /'
echo ""
echo "Start a new project:"
echo "  claude 'build me a SaaS for [your idea]'"
