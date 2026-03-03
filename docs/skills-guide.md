# Crucible Skills Guide

Complete guide to all 100+ Crucible skills for AI-powered development workflows.

---

## Overview

Crucible skills are specialized AI capabilities that enhance your development
workflow. Each skill is designed to automate specific tasks, provide expert
guidance, or integrate with external services.

**Total Skills:** 100+  
**Categories:** 12  
**Integration:** Seamless with Claude Code

---

## Quick Start

### Using Skills

Skills are invoked using the `@skill` syntax:

```markdown
@skill review-code @skill workflow-feature-shipper @skill tool-git-intel
```

### Chaining Skills

Combine multiple skills for complex workflows:

```markdown
@skill review-architecture @skill review-security @skill review-performance
```

---

## Skill Categories

### 🔍 Code Review & Quality (15)

**review-architecture** - Analyzes architectural patterns and provides
recommendations  
**review-clean-code** - Evaluates code against Clean Code principles  
**review-code** - General code quality assessment  
**review-doc-consistency** - Verifies documentation matches implementation  
**review-merge-readiness** - Evaluates PR readiness for merging  
**review-quality** - Comprehensive code quality analysis  
**review-react-best-practices** - React/Next.js optimization review  
**review-security** - Security vulnerability scanning  
**review-seo-audit** - SEO optimization analysis  
**review-performance** - Performance bottleneck identification  
**review-accessibility** - WCAG compliance checking  
**review-test-coverage** - Test completeness analysis  
**review-api-design** - REST/GraphQL API design review  
**review-database-schema** - Database design optimization  
**review-mobile-ux** - Mobile UX best practices

### 🛠️ Development Tools (20)

**tool-agent-coordinator** - Coordinates multiple AI agents  
**tool-agent-logger** - Structured logging and monitoring  
**tool-agent-monitoring** - Agent health tracking  
**tool-agent-roles** - Role-based agent management  
**tool-ast-grep-rules** - AST-based code search  
**tool-better-auth** - Authentication helper  
**tool-design-style-selector** - UI/UX style guide generator  
**tool-git-intel** - Git repository intelligence  
**tool-hooks-doctor** - React hooks analyzer  
**tool-openclaw** - OpenClaw integration  
**tool-programmatic-seo** - SEO automation  
**tool-schema-markup** - Schema.org markup builder  
**tool-stack-doctor** - Technology stack analyzer  
**tool-systematic-debugging** - Debugging framework  
**tool-ui-ux-pro-max** - Advanced UI/UX assistant  
**tool-x-article-publisher** - Social media publisher  
**tool-dependency-analyzer** - Dependency graph analysis  
**tool-code-formatter** - Multi-language formatting  
**tool-refactoring-assistant** - Refactoring suggestions  
**tool-migration-helper** - Framework migration guide

### 🔄 Workflow Automation (15)

**workflow-agent-orchestration** - Multi-agent coordination  
**workflow-brainstorm** - Ideation facilitator  
**workflow-creator** - Custom workflow builder  
**workflow-execute-plans** - Plan execution framework  
**workflow-feature-cycle** - Feature development lifecycle  
**workflow-feature-shipper** - Feature deployment automation  
**workflow-launch-sequence** - Product launch checklist  
**workflow-multi-agent-build** - Collaborative building  
**workflow-multi-agent-orchestrator** - Agent coordination  
**workflow-project-planner** - Project planning assistant  
**workflow-ci-cd-optimizer** - CI/CD optimization  
**workflow-release-manager** - Release planning  
**workflow-hotfix-handler** - Emergency fix workflow  
**workflow-code-review-flow** - Automated review process  
**workflow-onboarding** - Developer onboarding

### ☁️ Cloud & Infrastructure (12)

**cloudflare** - Cloudflare Workers/KV/R2/D1 management  
**deployment-commander** - Multi-cloud deployment  
**neon** - Neon Postgres integration  
**postgres-optimizer** - PostgreSQL tuning  
**mcp-cloudflare** - Cloudflare MCP server  
**mcp-stripe** - Stripe MCP server  
**mcp-supabase** - Supabase MCP server  
**aws-architect** - AWS infrastructure design  
**azure-optimizer** - Azure optimization  
**gcp-deployer** - Google Cloud deployment  
**kubernetes-manager** - K8s management  
**terraform-generator** - IaC template creation

### 🧪 Testing & QA (10)

**testing** - Comprehensive testing strategy  
**unit-test-code** - Unit test generation  
**integration-test-builder** - Integration test creation  
**e2e-test-generator** - End-to-end test automation  
**load-test-designer** - Performance testing  
**security-test-suite** - Security testing  
**visual-regression-tester** - UI visual testing  
**api-test-generator** - API test creation  
**mutation-testing** - Code mutation analysis  
**fuzz-testing** - Fuzzing test generation

### 📝 Documentation (8)

**doc-generator** - Automated documentation  
**api-doc-builder** - API documentation  
**readme-creator** - README templates  
**changelog-manager** - Changelog automation  
**architecture-diagram** - System diagrams  
**onboarding-docs** - Onboarding guides  
**troubleshooting-guide** - Debug guides  
**migration-docs** - Migration documentation

### 🎨 Frontend & Design (10)

**react-component-builder** - React component generator  
**tailwind-designer** - TailwindCSS helper  
**responsive-layout** - Responsive design assistant  
**animation-creator** - CSS/JS animation builder  
**icon-optimizer** - SVG optimization  
**color-palette-generator** - Color scheme creator  
**typography-advisor** - Font pairing  
**accessibility-fixer** - A11y issue resolver  
**component-library-builder** - Design system creator  
**css-optimizer** - CSS optimization

### 🔐 Security & Auth (8)

**stripe** - Stripe payment integration  
**supabase** - Supabase authentication  
**auth-flow-builder** - Authentication flows  
**jwt-manager** - JWT token management  
**oauth-integrator** - OAuth provider setup  
**rbac-designer** - Role-based access control  
**encryption-helper** - Data encryption  
**security-headers** - HTTP security headers

### 📊 Data & Analytics (8)

**analytics-tracker** - Event tracking setup  
**data-pipeline-builder** - ETL pipeline creator  
**sql-query-optimizer** - SQL optimization  
**data-visualization** - Chart generation  
**metrics-dashboard** - Metrics monitoring  
**ab-test-analyzer** - A/B test analysis  
**cohort-analyzer** - User cohort analysis  
**funnel-optimizer** - Conversion optimization

### 🤖 AI & ML Integration (10)

**vercel-ai** - Vercel AI SDK integration  
**openai-integrator** - OpenAI API helper  
**anthropic-claude** - Claude API integration  
**langchain-builder** - LangChain applications  
**vector-db-setup** - Vector database config  
**rag-pipeline** - RAG system builder  
**prompt-optimizer** - Prompt engineering  
**embedding-generator** - Text embeddings  
**llm-router** - Multi-model routing  
**ai-agent-framework** - AI agent architecture

### 🎯 Meta & Automation (10)

**skill-creator** - New skill generator  
**skill-evolution** - Skill improvement  
**skill-improver** - Skill optimization  
**automation-code** - Code automation  
**github-integration** - GitHub API integration  
**observe** - Observability setup  
**python-backend-expert** - Python backend helper  
**resend** - Email service integration  
**structured-prompting** - Prompt templates  
**deep-research** - Research automation

### 📱 Mobile & Cross-Platform (5)

**react-native-builder** - React Native apps  
**flutter-generator** - Flutter templates  
**mobile-api-optimizer** - Mobile API optimization  
**push-notification-setup** - Push notifications  
**mobile-analytics** - Mobile analytics

---

## Skill Usage Examples

### Code Review Workflow

```markdown
# Review architecture first

@skill review-architecture

# Then check code quality

@skill review-clean-code

# Finally verify security

@skill review-security
```

### Feature Development

```markdown
# Plan the feature

@skill workflow-project-planner

# Build with best practices

@skill review-react-best-practices

# Ship it

@skill workflow-feature-shipper
```

### Infrastructure Setup

```markdown
# Design AWS architecture

@skill aws-architect

# Generate Terraform

@skill terraform-generator

# Set up monitoring

@skill tool-agent-monitoring
```

---

## Creating Custom Skills

### Skill Structure

```
skills/my-custom-skill/
├── SKILL.md           # Skill description
├── examples/          # Usage examples
├── templates/         # Code templates
└── docs/             # Documentation
```

### SKILL.md Format

```markdown
# My Custom Skill

## Description

What this skill does

## Usage

How to use it

## Examples

Code examples

## Configuration

Required setup
```

---

## Best Practices

### Skill Selection

1. **Use specific skills** - Choose the most targeted skill for your task
2. **Chain logically** - Order skills from general to specific
3. **Avoid redundancy** - Don't use overlapping skills
4. **Check dependencies** - Some skills require others

### Skill Customization

1. **Read SKILL.md** - Understand capabilities
2. **Review examples** - See usage patterns
3. **Configure properly** - Set required variables
4. **Test thoroughly** - Verify behavior

---

## Contributing

To create a new skill:

1. Create directory: `skills/my-skill/`
2. Write SKILL.md documentation
3. Add examples and templates
4. Test with various scenarios
5. Submit a pull request

See [CONTRIBUTING.md](../CONTRIBUTING.md) for details.

---

## Support

- **Documentation**: Check skill-specific SKILL.md files
- **Issues**: https://github.com/pkurri/crucible/issues
- **Discussions**: https://github.com/pkurri/crucible/discussions

---

## License

All skills are MIT licensed. See [LICENSE](../LICENSE) for details.
