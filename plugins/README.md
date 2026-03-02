# Crucible Plugins System

**Version:** 1.0.0  
**Last Updated:** February 27, 2026

---

## Overview

The Crucible Plugin System enables third-party extensions to integrate seamlessly with the platform. Plugins can add new templates, skills, workflows, and integrations without modifying core code.

---

## Plugin Architecture

### Core Concepts

- **Plugin:** Self-contained package that extends Crucible functionality
- **Hook:** Extension points where plugins can inject behavior
- **Manifest:** Plugin metadata and configuration
- **Sandbox:** Isolated execution environment for plugins

### Plugin Types

1. **Template Plugins** - Add new application templates
2. **Skill Plugins** - Add AI-powered skills
3. **Integration Plugins** - Connect to external services
4. **Workflow Plugins** - Add automation workflows
5. **UI Plugins** - Extend the web interface

---

## Directory Structure

```
plugins/
├── core/                      # Core plugin system
│   ├── plugin-manager.ts      # Plugin lifecycle management
│   ├── hook-system.ts         # Hook registration and execution
│   ├── sandbox.ts             # Plugin isolation
│   └── manifest-validator.ts  # Manifest validation
├── registry/                  # Plugin registry
│   ├── official/             # Official plugins
│   ├── community/            # Community plugins
│   └── internal/             # Organization-private plugins
├── examples/                  # Example plugins
│   ├── template-plugin/      # Template plugin example
│   ├── skill-plugin/         # Skill plugin example
│   └── integration-plugin/   # Integration plugin example
├── types/                     # TypeScript definitions
│   ├── plugin.ts             # Core plugin interfaces
│   ├── manifest.ts           # Manifest types
│   └── hooks.ts              # Hook definitions
└── README.md                  # This file
```

---

## Plugin Manifest

Every plugin requires a `crucible.plugin.json` manifest file:

```json
{
  "name": "my-crucible-plugin",
  "version": "1.0.0",
  "description": "Description of what this plugin does",
  "author": "Author Name",
  "license": "MIT",
  "type": "template|skill|integration|workflow|ui",
  "entry": "dist/index.js",
  "hooks": [
    "template:register",
    "skill:register",
    "cli:command"
  ],
  "permissions": [
    "read:templates",
    "write:skills",
    "execute:scripts"
  ],
  "dependencies": {
    "@crucible/core": ">=1.0.0"
  },
  "config": {
    "schema": "./config-schema.json"
  }
}
```

---

## Creating a Plugin

### 1. Initialize Plugin

```bash
# Using CLI
npx @crucible/cli create-plugin my-plugin

# Or manually
mkdir my-crucible-plugin
cd my-crucible-plugin
npm init
```

### 2. Plugin Structure

```
my-crucible-plugin/
├── crucible.plugin.json    # Plugin manifest
├── package.json            # NPM manifest
├── src/
│   ├── index.ts           # Plugin entry point
│   ├── hooks.ts           # Hook implementations
│   └── config.ts          # Configuration handling
├── templates/             # Template files (if template plugin)
├── skills/                # Skill files (if skill plugin)
├── tests/                 # Plugin tests
└── README.md              # Plugin documentation
```

### 3. Plugin Entry Point

```typescript
// src/index.ts
import { CruciblePlugin, HookContext } from '@crucible/core';

export default class MyPlugin implements CruciblePlugin {
  name = 'my-crucible-plugin';
  version = '1.0.0';

  async activate(context: HookContext): Promise<void> {
    // Register hooks
    context.on('template:register', this.registerTemplates.bind(this));
    context.on('skill:register', this.registerSkills.bind(this));
    
    // Initialize plugin
    console.log('MyPlugin activated');
  }

  async deactivate(): Promise<void> {
    // Cleanup
    console.log('MyPlugin deactivated');
  }

  private async registerTemplates(context: HookContext) {
    const templates = await context.loadTemplates('./templates');
    return templates;
  }

  private async registerSkills(context: HookContext) {
    const skills = await context.loadSkills('./skills');
    return skills;
  }
}
```

---

## Available Hooks

### Template Hooks

- `template:register` - Register new templates
- `template:before-render` - Modify template before rendering
- `template:after-render` - Post-render processing
- `template:validate` - Custom validation logic

### Skill Hooks

- `skill:register` - Register new skills
- `skill:before-execute` - Pre-execution hook
- `skill:after-execute` - Post-execution hook
- `skill:on-error` - Error handling

### CLI Hooks

- `cli:command` - Add CLI commands
- `cli:init` - CLI initialization
- `cli:validate` - Custom validation

### Workflow Hooks

- `workflow:register` - Register workflows
- `workflow:step` - Workflow step execution
- `workflow:complete` - Workflow completion

---

## Installing Plugins

### From NPM

```bash
npm install @crucible/plugin-name
npx crucible plugin enable @crucible/plugin-name
```

### From GitHub

```bash
npx crucible plugin install github:user/repo
```

### From Local Path

```bash
npx crucible plugin install ./path/to/plugin
```

---

## Plugin Development

### Development Mode

```bash
# Link plugin for development
npx crucible plugin link ./my-plugin

# Watch for changes
npx crucible plugin watch ./my-plugin
```

### Testing

```typescript
// tests/plugin.test.ts
import { PluginTester } from '@crucible/testing';
import MyPlugin from '../src/index';

describe('MyPlugin', () => {
  const tester = new PluginTester();

  beforeEach(async () => {
    await tester.loadPlugin(MyPlugin);
  });

  it('should register templates', async () => {
    const templates = await tester.triggerHook('template:register');
    expect(templates).toHaveLength(3);
  });
});
```

---

## Security & Permissions

### Permission System

Plugins must declare required permissions:

```json
{
  "permissions": [
    "read:templates",
    "write:skills",
    "execute:scripts",
    "network:external",
    "filesystem:read",
    "filesystem:write"
  ]
}
```

### Sandbox Restrictions

Plugins run in a sandboxed environment:
- No direct filesystem access (use APIs)
- No network access without permission
- No process spawning
- Memory and CPU limits
- Timeout enforcement

---

## Official Plugins

| Plugin | Description | Install |
|--------|-------------|---------|
| `@crucible/plugin-vercel` | Vercel deployment integration | `npm i @crucible/plugin-vercel` |
| `@crucible/plugin-aws` | AWS service integration | `npm i @crucible/plugin-aws` |
| `@crucible/plugin-supabase` | Supabase integration | `npm i @crucible/plugin-supabase` |
| `@crucible/plugin-stripe` | Stripe payment integration | `npm i @crucible/plugin-stripe` |
| `@crucible/plugin-github` | GitHub workflow automation | `npm i @crucible/plugin-github` |

---

## Contributing

To create an official plugin:

1. Fork the `crucible-plugins` repository
2. Create your plugin in `plugins/your-plugin-name/`
3. Include comprehensive tests
4. Submit a pull request
5. Pass code review and security audit

---

## Resources

- **Plugin API Docs:** https://docs.crucible.dev/plugins/api
- **Plugin Examples:** https://github.com/crucible/plugins/examples
- **Community Plugins:** https://plugins.crucible.dev
- **Support:** https://github.com/pkurri/crucible/issues

---

## License

MIT License - See [LICENSE](../LICENSE) for details.
