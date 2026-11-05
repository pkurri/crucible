# Hooks as approval gates

A hook is for a rule that must never depend on Claude remembering it. Put it in
the project's `.claude/settings.json` so it is checked in and applies to
everyone.

How a `PreToolUse` hook works:

- It gets the tool call as JSON on stdin. A Bash call has the command at
  `.tool_input.command`.
- **Exit code 2** blocks the call and shows stderr to Claude.
- Exit code 0 lets the call through.

## Recipe: block pushes to protected branches and destructive commands

`.claude/hooks/guard.sh` (make it executable with `chmod +x`):

```bash
#!/usr/bin/env bash
# Blocks commands that must go through a human. Edit PATTERNS for this repo.
cmd=$(jq -r '.tool_input.command // ""')
PATTERNS=(
  'git push[^|;&]*\b(main|master|release|prod)\b'   # protected branches
  'git push[^|;&]*--force'                           # force-push
  'db:seed|prisma migrate reset|DROP (TABLE|DATABASE)'
  'terraform (apply|destroy)|cdk deploy'
)
for p in "${PATTERNS[@]}"; do
  if grep -Eiq -- "$p" <<<"$cmd"; then
    echo "Blocked by .claude/hooks/guard.sh ($p). Ask the user to run this themselves." >&2
    exit 2
  fi
done
exit 0
```

`.claude/settings.json`:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "\"$CLAUDE_PROJECT_DIR\"/.claude/hooks/guard.sh"
          }
        ]
      }
    ]
  }
}
```

The script needs `jq`.

## Other gates worth a hook

- **Run the formatter or typecheck after edits:** a `PostToolUse` hook on
  `Edit|Write`. Keep it fast, or it slows every edit.
- **Block edits to generated or vendored paths:** a `PreToolUse` hook on
  `Edit|Write` that checks `.tool_input.file_path`.
- **Block secrets:** a `PreToolUse` hook on `Write` that refuses content
  matching key patterns.

Test a hook by piping sample JSON into it. This should print 2:

```bash
echo '{"tool_input":{"command":"git push origin main"}}' \
  | .claude/hooks/guard.sh; echo $?
```
