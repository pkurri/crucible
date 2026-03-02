# IDE Integration Guide

Crucible automatically generates IDE-specific configurations to enhance your AI coding experience. This guide explains how the auto-setup works and how to use it.

## Automatic Setup

When you install Crucible, it automatically detects your IDE and generates appropriate configuration files:

- **Windsurf**: `.windsurf/workflows/` with build, feature, and review workflows
- **Cursor**: `.cursorrules` and `.cursor/prompts/`
- **Cascade**: `.cascade/rules.md`
- **VS Code**: `.continue/config.json` and `.vscode/crucible.code-snippets`

## Manual Setup

If you want to generate IDE configs in a specific project:

```bash
# From your project directory
node /path/to/crucible/setup-ide.js

# Or if Crucible is installed globally
node ~/.claude/skills/../setup-ide.js
```

On Windows:
```powershell
node C:\Users\YourName\.claude\skills\..\setup-ide.js
```

## What Gets Created

### Windsurf

**`.windsurf/workflows/crucible-build.md`**
- Full project build workflow
- Uses `workflow-launch-sequence` skill
- Applies service skills (neon, stripe, resend, testing)
- Includes security and architecture reviews

**`.windsurf/workflows/crucible-feature.md`**
- Feature development workflow
- Uses `workflow-feature-cycle` skill
- Includes testing and review steps

**`.windsurf/workflows/crucible-review.md`**
- Comprehensive code review workflow
- Uses `review-architecture` and `review-security` skills
- Includes stack health checks and git analysis

### Cursor

**`.cursorrules`**
- Complete Crucible integration rules
- Lists all available skills with descriptions
- Defines code quality standards
- Provides example prompts

**`.cursor/prompts/crucible-build.md`**
- Template for building complete projects
- Pre-configured with Crucible skill references

### Cascade

**`.cascade/rules.md`**
- Skill discovery and auto-application rules
- Priority ordering for skill usage
- Quality gates before completion

### VS Code (Continue/Cline)

**`.continue/config.json`**
- Custom commands for Crucible workflows
- Context providers for skills
- Model configuration

**`.vscode/crucible.code-snippets`**
- Quick snippets for common Crucible prompts
- Trigger prefixes: `crucible-build`, `crucible-feature`, `crucible-review`

## Using the Generated Configs

### In Windsurf

1. Open the Workflows panel
2. Select a Crucible workflow (build, feature, or review)
3. Follow the steps - some are marked with `// turbo` for auto-run

Example prompt:
```
Use the crucible-build workflow to create a SaaS for team collaboration
```

### In Cursor

The `.cursorrules` file is automatically loaded. Just reference Crucible skills in your prompts:

```
Using Crucible's workflow-launch-sequence skill, build a multi-tenant SaaS with:
- Next.js 15 + TypeScript
- Neon Postgres with RLS
- Stripe subscriptions
- Full test coverage
```

### In Cascade

Rules are auto-applied. Cascade will automatically:
- Detect when to use Crucible skills
- Apply appropriate patterns
- Run quality gates before completion

### In VS Code

**Using Continue/Cline:**
- Type `/crucible-build` to start a full project build
- Type `/crucible-feature` to add a feature
- Type `/crucible-review` to review code

**Using snippets:**
- Type `crucible-build` and press Tab
- Fill in the template
- Send to your AI assistant

## Customization

All generated files can be customized to fit your workflow:

1. **Modify workflows**: Edit `.windsurf/workflows/*.md` to add/remove steps
2. **Adjust rules**: Edit `.cursorrules` or `.cascade/rules.md` to change behavior
3. **Add commands**: Edit `.continue/config.json` to add custom commands
4. **Create snippets**: Edit `.vscode/crucible.code-snippets` for new templates

## Skill References

The auto-generated configs reference skills from:
- `./skills/` if Crucible is cloned in your project
- `~/.claude/skills/` if Crucible is installed globally

You can manually adjust these paths in the generated files if needed.

## Troubleshooting

**Config files not created:**
- Ensure Node.js is installed (`node --version`)
- Run `node setup-ide.js` manually from your project directory
- Check that your IDE's marker directory exists (e.g., `.windsurf/`, `.cursor/`)

**Skills not loading:**
- Verify skill paths in generated configs
- Ensure Crucible skills are installed in `~/.claude/skills/`
- Check that skill YAML frontmatter is valid

**IDE not detected:**
- Create the IDE's marker directory manually (e.g., `mkdir .windsurf`)
- Run `node setup-ide.js` again
- The script will detect the newly created directory

## Advanced: Custom IDE Support

To add support for a new IDE, edit `setup-ide.js`:

```javascript
const CONFIGS = {
  // ... existing configs ...
  
  myide: {
    name: 'My IDE',
    files: [
      { path: '.myide/config.json', template: 'myide-config' },
    ]
  }
};

// Add detection logic
function detectIDE() {
  // ... existing detection ...
  
  if (fs.existsSync('.myide')) {
    detected.push('myide');
  }
  
  return detected;
}

// Add template
function getTemplate(templateName, projectRoot) {
  const templates = {
    // ... existing templates ...
    
    'myide-config': `{
      "crucible": {
        "skills": "${skillsRef}",
        "enabled": true
      }
    }`
  };
  
  return templates[templateName] || '';
}
```

## Examples

### Building a Complete SaaS (Windsurf)

1. Run workflow: Select `crucible-build` from Workflows panel
2. Or use prompt:
```
Using Crucible workflow-launch-sequence, build a team collaboration SaaS:
- Real-time updates (use Liveblocks patterns)
- Stripe subscriptions
- Neon Postgres with RLS
- Full test coverage
```

### Adding a Feature (Cursor)

```
Using Crucible workflow-feature-cycle, add user notifications:
- Email via Resend (use resend skill)
- In-app notifications
- User preferences
- Tests for all notification types
```

### Code Review (Any IDE)

```
Review this codebase using Crucible:
- review-architecture: Check system design
- review-security: Find vulnerabilities
- tool-stack-doctor: Check dependencies
- tool-git-intel: Find refactor candidates
```

## Best Practices

1. **Always reference skills explicitly** in prompts for better results
2. **Use workflows for multi-step tasks** rather than one-off prompts
3. **Run review skills before finalizing** any significant changes
4. **Keep configs in version control** so team members get the same setup
5. **Customize workflows** to match your team's processes

## Learn More

- [Skill Authoring Guide](./skill-authoring-guide.md)
- [Architecture Decisions](./architecture-decisions.md)
- [Main README](../README.md)
- [Contributing Guide](../CONTRIBUTING.md)
