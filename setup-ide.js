#!/usr/bin/env node

/**
 * Crucible IDE Auto-Setup
 * Detects your IDE and generates appropriate configuration files
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

const CONFIGS = {
  windsurf: {
    name: 'Windsurf',
    files: [
      { path: '.windsurf/workflows/crucible-build.md', template: 'windsurf-build-workflow' },
      { path: '.windsurf/workflows/crucible-feature.md', template: 'windsurf-feature-workflow' },
      { path: '.windsurf/workflows/crucible-review.md', template: 'windsurf-review-workflow' },
    ]
  },
  cursor: {
    name: 'Cursor',
    files: [
      { path: '.cursorrules', template: 'cursorrules' },
      { path: '.cursor/prompts/crucible-build.md', template: 'cursor-build-prompt' },
    ]
  },
  cascade: {
    name: 'Cascade',
    files: [
      { path: '.cascade/rules.md', template: 'cascade-rules' },
    ]
  },
  vscode: {
    name: 'VS Code with Continue/Cline',
    files: [
      { path: '.continue/config.json', template: 'continue-config' },
      { path: '.vscode/crucible.code-snippets', template: 'vscode-snippets' },
    ]
  }
};

function detectIDE() {
  const detected = [];
  
  // Check for Windsurf
  if (fs.existsSync('.windsurf') || process.env.WINDSURF_SESSION) {
    detected.push('windsurf');
  }
  
  // Check for Cursor
  if (fs.existsSync('.cursor') || fs.existsSync('.cursorrules')) {
    detected.push('cursor');
  }
  
  // Check for Cascade
  if (fs.existsSync('.cascade')) {
    detected.push('cascade');
  }
  
  // Check for VS Code
  if (fs.existsSync('.vscode')) {
    detected.push('vscode');
  }
  
  return detected;
}

function ensureDir(filePath) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function generateConfig(ide, projectRoot) {
  const config = CONFIGS[ide];
  console.log(`\n📝 Setting up ${config.name} configuration...`);
  
  let created = 0;
  let skipped = 0;
  
  for (const file of config.files) {
    const filePath = path.join(projectRoot, file.path);
    
    if (fs.existsSync(filePath)) {
      console.log(`   ⏭️  Skipped ${file.path} (already exists)`);
      skipped++;
      continue;
    }
    
    ensureDir(filePath);
    const content = getTemplate(file.template, projectRoot);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`   ✅ Created ${file.path}`);
    created++;
  }
  
  return { created, skipped };
}

function getTemplate(templateName, projectRoot) {
  const skillsPath = path.join(projectRoot, 'skills');
  const hasSkills = fs.existsSync(skillsPath);
  const skillsRef = hasSkills ? './skills/' : '~/.claude/skills/';
  
  const templates = {
    'windsurf-build-workflow': `---
description: Build a complete project using Crucible skills
---

# Crucible: Full Project Build

Use this workflow to build a complete project from scratch using Crucible's production patterns.

## Steps

1. **Analyze Requirements**
   - Understand the project scope and technical requirements
   - Identify which Crucible skills are relevant

2. **Choose Starting Point**
   - Option A: Start from a Crucible template (${hasSkills ? './templates/' : 'recommended'})
   - Option B: Build from scratch using skill patterns

3. **Apply Workflow Orchestration**
   - Use \`workflow-launch-sequence\` skill for full product builds
   - Reference: \`${skillsRef}workflow-launch-sequence/SKILL.md\`

// turbo
4. **Set Up Project Structure**
   - Create necessary directories and files
   - Initialize package.json, tsconfig.json, etc.

5. **Apply Service Skills**
   - Database: Use \`neon\` skill patterns (${skillsRef}neon/)
   - Payments: Use \`stripe\` skill patterns (${skillsRef}stripe/)
   - Email: Use \`resend\` skill patterns (${skillsRef}resend/)
   - Testing: Use \`testing\` skill patterns (${skillsRef}testing/)

6. **Security Review**
   - Apply \`review-security\` skill before finalizing
   - Reference: \`${skillsRef}review-security/SKILL.md\`

7. **Generate Tests**
   - Create comprehensive test suite
   - Unit tests, integration tests, E2E tests

// turbo
8. **Install Dependencies**
   - Run package manager install command

9. **Verify Build**
   - Run type checking, linting, tests
   - Ensure everything compiles and runs

## Expected Output

- Fully functional project with all dependencies
- Complete test coverage
- Security best practices applied
- Production-ready configuration
`,

    'windsurf-feature-workflow': `---
description: Add a new feature using Crucible patterns
---

# Crucible: Feature Development

Use this workflow to add new features following Crucible's best practices.

## Steps

1. **Feature Specification**
   - Define the feature requirements clearly
   - Identify affected components and services

2. **Apply Feature Cycle**
   - Use \`workflow-feature-cycle\` skill
   - Reference: \`${skillsRef}workflow-feature-cycle/SKILL.md\`

3. **Implementation**
   - Write feature code following existing patterns
   - Apply relevant service skills (neon, stripe, etc.)

4. **Testing**
   - Write unit tests for new code
   - Add integration tests if needed
   - Reference: \`${skillsRef}testing/SKILL.md\`

5. **Review**
   - Self-review for security issues
   - Check architecture patterns
   - Use \`review-architecture\` and \`review-security\` skills

// turbo
6. **Run Tests**
   - Execute test suite to verify changes

## Expected Output

- Feature implemented and tested
- No regressions introduced
- Code follows project patterns
`,

    'windsurf-review-workflow': `---
description: Review code using Crucible's review skills
---

# Crucible: Code Review

Comprehensive code review using Crucible's review skills.

## Steps

1. **Architecture Review**
   - Use \`review-architecture\` skill
   - Reference: \`${skillsRef}review-architecture/SKILL.md\`
   - Check: coupling, scalability, maintainability

2. **Security Review**
   - Use \`review-security\` skill
   - Reference: \`${skillsRef}review-security/SKILL.md\`
   - Check: OWASP Top 10, secrets, dependencies

3. **Stack Health Check**
   - Use \`tool-stack-doctor\` skill
   - Reference: \`${skillsRef}tool-stack-doctor/SKILL.md\`
   - Identify outdated dependencies and risks

4. **Git Analysis** (if applicable)
   - Use \`tool-git-intel\` skill
   - Reference: \`${skillsRef}tool-git-intel/SKILL.md\`
   - Find hotspots and refactor candidates

## Expected Output

- Detailed review report
- List of issues found (if any)
- Recommended fixes
- Architecture decision records (ADRs) if needed
`,

    'cursorrules': `# Crucible AI Coding Rules

You have access to Crucible skills - production-grade patterns for building real applications.

## Core Principles

1. **Skills-First Approach**: Always check if a Crucible skill exists for the task before implementing
2. **Production Patterns**: Follow the patterns in skills, don't reinvent
3. **Composition**: Chain skills together for complex tasks
4. **Quality Gates**: Use review skills before finalizing code

## Available Skills

Skills are located in: \`${skillsRef}\`

### Workflow Skills (Orchestration)
- \`workflow-launch-sequence\`: Full product builds (intake → architect → build → test → deploy)
- \`workflow-feature-cycle\`: Feature lifecycle (spec → implement → review → ship)
- \`workflow-multi-agent-build\`: Parallel frontend/backend/test development

### Tool Skills (Diagnostics)
- \`tool-git-intel\`: Git analysis, hotspots, refactor candidates
- \`tool-stack-doctor\`: Stack health, dependency audits, upgrade recommendations

### Review Skills (Quality Gates)
- \`review-architecture\`: System design, coupling analysis, scalability
- \`review-security\`: OWASP Top 10, secrets scanning, threat modeling

### Service Skills (Deep Integration)
- \`neon\`: Neon Postgres patterns (branching, pooling, migrations, RLS)
- \`resend\`: Transactional email with React Email templates
- \`vercel-ai\`: Vercel AI SDK (streaming, tool calls, multi-model)
- \`stripe\`: Payments (subscriptions, webhooks, metered billing)
- \`cloudflare\`: Workers, R2, KV, Durable Objects, Queues
- \`observe\`: PostHog + Sentry + Axiom (events, errors, logs)
- \`testing\`: Vitest + Playwright + pytest patterns

## When Building Features

1. **Check for relevant skills first**
   - Example: Building auth? Check if there's an auth skill
   - Example: Adding payments? Use the \`stripe\` skill

2. **Follow skill patterns exactly**
   - Skills contain tested, production-ready code
   - Don't modify patterns unless you have a good reason

3. **Use workflow skills for orchestration**
   - \`workflow-launch-sequence\` for new projects
   - \`workflow-feature-cycle\` for adding features
   - \`workflow-multi-agent-build\` for complex multi-part builds

4. **Apply review skills before finalizing**
   - Run \`review-security\` on all code
   - Run \`review-architecture\` on new features
   - Use \`tool-stack-doctor\` to check dependencies

## Code Quality Standards

- **TypeScript**: Strict mode, proper types, no \`any\`
- **Testing**: Write tests alongside code (use \`testing\` skill)
- **Security**: Never hardcode secrets, sanitize inputs
- **Performance**: Code splitting, lazy loading, proper caching
- **Accessibility**: WCAG 2.1 AA compliance

## Templates

${hasSkills ? 'Templates available in ./templates/:' : 'Crucible templates provide production-ready starting points:'}

- \`001-ai-saas-core\`: Next.js 15 + Neon + Stripe + Vercel AI SDK
- \`002-conversational-api\`: Hono + Neon + Redis + Vercel AI SDK
- \`003-multi-tenant-saas\`: Next.js 15 + Neon RLS + Stripe + Clerk
- \`004-event-pipeline\`: Cloudflare Workers + R2 + Queues + D1
- \`005-realtime-collab\`: Next.js + Liveblocks + Neon + Clerk

## Example Prompts

**Building a new project:**
\`\`\`
Using Crucible's workflow-launch-sequence skill, build a SaaS for [description].
Use: Next.js 15, Neon DB, Stripe, Resend.
Apply security and architecture review skills before finalizing.
\`\`\`

**Adding a feature:**
\`\`\`
Using Crucible's workflow-feature-cycle skill, add [feature description].
Reference the neon skill for database patterns.
Include full test coverage using the testing skill.
\`\`\`

**Code review:**
\`\`\`
Review this code using Crucible's review-security and review-architecture skills.
Provide detailed findings and recommendations.
\`\`\`

## Remember

- Skills are documentation that you can execute
- Always prefer skill patterns over ad-hoc solutions
- Chain skills together for complex tasks
- Use review skills as quality gates
`,

    'cursor-build-prompt': `# Crucible: Full Project Build

Use this prompt to build a complete project using Crucible patterns.

## Prompt Template

\`\`\`
I want to build [PROJECT_DESCRIPTION].

Requirements:
- [Requirement 1]
- [Requirement 2]
- [Requirement 3]

Using Crucible:
1. Apply workflow-launch-sequence skill for orchestration
2. Use these service skills:
   - Database: neon (${skillsRef}neon/)
   - [Other services as needed]
3. Apply review-security skill before finalizing
4. Generate full test suite using testing skill

Build the complete project with:
- All necessary files and configurations
- Environment variable setup (.env.example)
- README with setup instructions
- Full test coverage
- Production-ready deployment config
\`\`\`

## Available Templates

Start from a template for faster development:
- 001-ai-saas-core: AI-powered SaaS
- 002-conversational-api: Stateful conversation API
- 003-multi-tenant-saas: Multi-tenant with RLS
- 004-event-pipeline: Edge-native event processing
- 005-realtime-collab: Real-time collaboration
`,

    'cascade-rules': `# Crucible Integration Rules

## Skill Discovery

When the user asks to build something, automatically:
1. Check ${skillsRef} for relevant skills
2. Load applicable workflow, tool, review, and service skills
3. Apply patterns from loaded skills

## Skill Priority

1. **Workflow skills** - Use for orchestration
2. **Service skills** - Use for specific integrations
3. **Review skills** - Use before finalizing
4. **Tool skills** - Use for diagnostics

## Auto-Apply Patterns

- Database setup → Use \`neon\` skill patterns
- Payment integration → Use \`stripe\` skill patterns
- Email sending → Use \`resend\` skill patterns
- Testing → Use \`testing\` skill patterns
- Security review → Use \`review-security\` skill

## Code Generation Rules

- Follow TypeScript strict mode
- Include all imports and dependencies
- Write tests alongside implementation
- Never hardcode secrets
- Use environment variables for config

## Quality Gates

Before marking work complete:
1. Run \`review-security\` skill checks
2. Run \`review-architecture\` skill checks
3. Verify all tests pass
4. Check for hardcoded secrets
5. Ensure proper error handling
`,

    'continue-config': `{
  "models": [
    {
      "title": "Claude 3.5 Sonnet",
      "provider": "anthropic",
      "model": "claude-3-5-sonnet-20241022",
      "apiKey": ""
    }
  ],
  "customCommands": [
    {
      "name": "crucible-build",
      "description": "Build a project using Crucible skills",
      "prompt": "Using Crucible's workflow-launch-sequence skill from ${skillsRef}workflow-launch-sequence/, build {{{ input }}}. Apply relevant service skills (neon, stripe, resend, testing) and review skills (review-security, review-architecture) before finalizing."
    },
    {
      "name": "crucible-feature",
      "description": "Add a feature using Crucible patterns",
      "prompt": "Using Crucible's workflow-feature-cycle skill from ${skillsRef}workflow-feature-cycle/, implement {{{ input }}}. Follow existing patterns and include tests using the testing skill."
    },
    {
      "name": "crucible-review",
      "description": "Review code using Crucible review skills",
      "prompt": "Review the current code using Crucible's review-security and review-architecture skills from ${skillsRef}. Provide detailed findings and recommendations."
    }
  ],
  "contextProviders": [
    {
      "name": "crucible-skills",
      "params": {
        "path": "${skillsRef}"
      }
    }
  ]
}`,

    'vscode-snippets': `{
  "Crucible: Full Build": {
    "prefix": "crucible-build",
    "body": [
      "Using Crucible's workflow-launch-sequence skill, build $1.",
      "",
      "Requirements:",
      "- $2",
      "",
      "Apply these skills:",
      "- Database: neon",
      "- Testing: testing",
      "- Security: review-security",
      "",
      "Generate complete project with all files, tests, and deployment config."
    ],
    "description": "Build a complete project using Crucible"
  },
  "Crucible: Add Feature": {
    "prefix": "crucible-feature",
    "body": [
      "Using Crucible's workflow-feature-cycle skill, add $1.",
      "",
      "Requirements:",
      "- $2",
      "",
      "Include:",
      "- Implementation following existing patterns",
      "- Full test coverage",
      "- Security review"
    ],
    "description": "Add a feature using Crucible patterns"
  },
  "Crucible: Code Review": {
    "prefix": "crucible-review",
    "body": [
      "Review this code using Crucible skills:",
      "- review-architecture: Check design patterns",
      "- review-security: Check for vulnerabilities",
      "- tool-stack-doctor: Check dependencies",
      "",
      "Provide detailed findings and recommendations."
    ],
    "description": "Review code using Crucible"
  }
}`
  };
  
  return templates[templateName] || '';
}

function main() {
  console.log('🔥 Crucible IDE Auto-Setup\n');
  
  const projectRoot = process.cwd();
  const detected = detectIDE();
  
  if (detected.length === 0) {
    console.log('ℹ️  No IDE detected. You can manually run this script later when you open the project in an IDE.\n');
    console.log('Supported IDEs:');
    console.log('  - Windsurf');
    console.log('  - Cursor');
    console.log('  - Cascade');
    console.log('  - VS Code (with Continue/Cline)');
    return;
  }
  
  console.log(`✅ Detected IDE(s): ${detected.map(ide => CONFIGS[ide].name).join(', ')}\n`);
  
  let totalCreated = 0;
  let totalSkipped = 0;
  
  for (const ide of detected) {
    const { created, skipped } = generateConfig(ide, projectRoot);
    totalCreated += created;
    totalSkipped += skipped;
  }
  
  console.log(`\n✨ Setup complete!`);
  console.log(`   Created: ${totalCreated} file(s)`);
  console.log(`   Skipped: ${totalSkipped} file(s) (already existed)`);
  
  console.log('\n📚 Next Steps:');
  console.log('   1. Restart your IDE to load new configurations');
  console.log('   2. Try a Crucible workflow or prompt');
  console.log('   3. Reference skills in your prompts (e.g., "use the neon skill")');
  console.log('\n   Learn more: https://github.com/pkurri/crucible\n');
}

if (require.main === module) {
  main();
}

module.exports = { detectIDE, generateConfig, getTemplate };
