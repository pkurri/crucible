---
name: openclaw
description: >
  Deep knowledge of OpenClaw (formerly Clawdbot) AI agent framework: 6-stage execution pipeline,
  Lane Queue architecture for reliability, JSONL transcripts, semantic snapshots for web browsing,
  hybrid memory system, security allowlists, and multi-channel integration (Telegram, Discord, Slack).
  Use when building autonomous AI agents that need controlled tool execution, persistent memory,
  and production-grade reliability.
triggers:
  - "openclaw"
  - "clawdbot"
  - "ai agent framework"
  - "autonomous agent"
  - "agent orchestration"
  - "lane queue"
  - "agentic loop"
  - "multi-agent system"
---

# OpenClaw: Production-Grade AI Agent Framework

OpenClaw is an engineering-first AI agent framework that runs on your machine to perform controlled, reliable autonomous tasks. Unlike simple chatbots, OpenClaw enforces serial execution by default, maintains structured logs, and provides security boundaries for tool execution.

## Core Architecture

OpenClaw is built around three primary capabilities:

1. **Message Interception**: Receives inputs from multiple channels (Telegram, Discord, Slack)
2. **LLM Orchestration**: Calls LLM APIs (OpenAI, Anthropic, local models)
3. **Controlled Tool Execution**: Runs shell commands, file operations, browser tasks in sandboxed environments

## 6-Stage Execution Pipeline

Every message flows through a strictly defined pipeline for controllability and traceability:

### 1. Channel Adapter
Standardizes inputs from different platforms into unified message format.

```typescript
// Example: Discord message → Unified format
interface UnifiedMessage {
  sessionId: string;
  content: string;
  attachments: Attachment[];
  channel: 'discord' | 'telegram' | 'slack';
  timestamp: number;
}
```

### 2. Gateway Server
Session coordinator that routes messages to appropriate queues.

```typescript
class GatewayServer {
  routeMessage(msg: UnifiedMessage): LaneQueue {
    const sessionId = msg.sessionId;
    return this.getLaneForSession(sessionId);
  }
}
```

### 3. Lane Queue (Critical Reliability Layer)
**Default Serial, Explicit Parallel** - prevents state corruption and race conditions.

```typescript
class LaneQueue {
  private queue: Task[] = [];
  private isProcessing = false;

  async enqueue(task: Task) {
    this.queue.push(task);
    if (!this.isProcessing) {
      await this.processSerial();
    }
  }

  private async processSerial() {
    this.isProcessing = true;
    while (this.queue.length > 0) {
      const task = this.queue.shift();
      await this.executeTask(task); // One at a time
    }
    this.isProcessing = false;
  }
}
```

**Key Benefits:**
- Session isolation: Each session has its own lane
- Serial execution: Tasks happen one after another (default)
- Controlled parallelism: Only low-risk tasks run in parallel
- Reduced debugging: Failures are isolated, logs stay readable

### 4. Agent Runner
The "assembly line" for the model - handles:
- Model selection and API key rotation
- Prompt assembly and context window management
- Token budget tracking
- Response streaming

```typescript
class AgentRunner {
  async run(context: AgentContext): Promise<AgentResponse> {
    const model = this.selectModel(context.requirements);
    const prompt = this.assemblePrompt(context);
    const response = await this.callLLM(model, prompt);
    return this.streamResponse(response);
  }
}
```

### 5. Agentic Loop
Iterative cycle: model proposes tool → system executes → result backfilled → repeat until resolved.

```typescript
async function agenticLoop(initialPrompt: string): Promise<string> {
  let context = { prompt: initialPrompt, history: [] };
  let iterations = 0;
  const maxIterations = 10;

  while (iterations < maxIterations) {
    const response = await callLLM(context);
    
    if (response.type === 'final_answer') {
      return response.content;
    }
    
    if (response.type === 'tool_call') {
      const result = await executeTool(response.tool, response.args);
      context.history.push({ tool: response.tool, result });
    }
    
    iterations++;
  }
  
  throw new Error('Max iterations reached');
}
```

### 6. Response Path
Streams content back to user while writing JSONL transcripts for auditing.

```typescript
async function sendResponse(response: string, sessionId: string) {
  // Stream to user
  await streamToChannel(response);
  
  // Write audit log
  const transcript = {
    timestamp: Date.now(),
    sessionId,
    response,
    toolCalls: context.history
  };
  await appendToJSONL(`logs/${sessionId}.jsonl`, transcript);
}
```

## Memory System: Two-Tiered Hybrid

### 1. JSONL Transcripts (Structured, Editable)
Complete conversation history in append-only JSONL format.

```jsonl
{"timestamp":1709251200,"session":"abc123","role":"user","content":"Deploy the app"}
{"timestamp":1709251201,"session":"abc123","role":"assistant","tool":"exec","args":{"cmd":"npm run build"}}
{"timestamp":1709251205,"session":"abc123","role":"tool","result":"Build successful"}
```

**Benefits:**
- Human-readable and editable
- Easy to replay for debugging
- No vendor lock-in (plain text)
- Grep-friendly for analysis

### 2. Markdown Files (Long-term Memory)
Persistent knowledge stored as markdown files.

```
workspace/
├── memory/
│   ├── IDENTITY.md      # Agent's identity and role
│   ├── USER.md          # User preferences and context
│   ├── PROJECTS.md      # Active projects and status
│   └── LEARNINGS.md     # Accumulated knowledge
```

### Hybrid Retrieval Strategy

```typescript
async function retrieveContext(query: string): Promise<string> {
  // 1. Recent context from JSONL
  const recentMessages = await searchJSONL(query, limit: 20);
  
  // 2. Long-term memory from markdown
  const memoryDocs = await searchMarkdown(query);
  
  // 3. Combine with recency bias
  return combineContext(recentMessages, memoryDocs);
}
```

## Security: Allowlist-Based Tool Execution

Unlike prompt-based "please be safe" instructions, OpenClaw uses structural blocking.

### Allowlist Configuration

```typescript
const ALLOWED_COMMANDS = [
  'npm', 'node', 'git', 'curl', 'grep', 'cat', 'ls',
  'mkdir', 'touch', 'echo', 'cd', 'pwd'
];

const BLOCKED_PATTERNS = [
  /rm\s+-rf\s+\//, // Dangerous deletions
  /sudo/, // Privilege escalation
  /chmod\s+777/, // Insecure permissions
  /eval\(/, // Code injection
];

function validateCommand(cmd: string): boolean {
  const baseCmd = cmd.split(' ')[0];
  
  if (!ALLOWED_COMMANDS.includes(baseCmd)) {
    throw new Error(`Command '${baseCmd}' not in allowlist`);
  }
  
  for (const pattern of BLOCKED_PATTERNS) {
    if (pattern.test(cmd)) {
      throw new Error(`Command matches blocked pattern: ${pattern}`);
    }
  }
  
  return true;
}
```

### Workspace Sandboxing

```typescript
const WORKSPACE_ROOT = '/home/agent/workspace';

function validatePath(path: string): string {
  const resolved = resolvePath(path);
  if (!resolved.startsWith(WORKSPACE_ROOT)) {
    throw new Error('Path outside workspace boundary');
  }
  return resolved;
}
```

## Web Browsing: Semantic Snapshots

Instead of expensive vision-based screenshots, OpenClaw uses accessibility trees.

### Traditional Approach (Expensive)
```typescript
// ❌ Vision-heavy: 1000+ tokens per screenshot
const screenshot = await page.screenshot();
const analysis = await analyzeImage(screenshot); // Expensive
```

### OpenClaw Approach (Efficient)
```typescript
// ✅ Semantic snapshot: ~100 tokens
const snapshot = await page.evaluate(() => {
  const elements = document.querySelectorAll('[role], a, button, input');
  return Array.from(elements).map(el => ({
    role: el.getAttribute('role') || el.tagName.toLowerCase(),
    text: el.textContent?.trim(),
    aria: el.getAttribute('aria-label'),
    href: el.getAttribute('href'),
  }));
});

// Returns structured data like:
// [
//   { role: "button", text: "Sign In", aria: "Login button" },
//   { role: "link", text: "Pricing", href: "/pricing" },
//   { role: "navigation", text: "Main Menu" }
// ]
```

**Token Savings:** 90% reduction compared to vision-based approaches.

## Multi-Channel Integration

### Telegram Bot

```typescript
import TelegramBot from 'node-telegram-bot-api';

const bot = new TelegramBot(process.env.TELEGRAM_TOKEN, { polling: true });

bot.on('message', async (msg) => {
  const sessionId = `telegram_${msg.chat.id}`;
  const unifiedMsg = {
    sessionId,
    content: msg.text,
    channel: 'telegram',
    timestamp: msg.date * 1000,
  };
  
  await gateway.routeMessage(unifiedMsg);
});
```

### Discord Bot

```typescript
import { Client, GatewayIntentBits } from 'discord.js';

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages]
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  
  const sessionId = `discord_${message.channel.id}`;
  const unifiedMsg = {
    sessionId,
    content: message.content,
    channel: 'discord',
    timestamp: message.createdTimestamp,
  };
  
  await gateway.routeMessage(unifiedMsg);
});
```

## Production Deployment Patterns

### Docker Compose Setup

```yaml
version: '3.8'

services:
  openclaw:
    image: openclaw/agent:latest
    environment:
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - TELEGRAM_TOKEN=${TELEGRAM_TOKEN}
      - WORKSPACE_ROOT=/workspace
    volumes:
      - ./workspace:/workspace
      - ./logs:/logs
    restart: unless-stopped
    
  postgres:
    image: postgres:15
    environment:
      - POSTGRES_DB=openclaw
      - POSTGRES_PASSWORD=${DB_PASSWORD}
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:
```

### Environment Variables

```bash
# LLM Configuration
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...

# Channel Tokens
TELEGRAM_TOKEN=123456:ABC-DEF...
DISCORD_TOKEN=MTk4...

# Security
WORKSPACE_ROOT=/home/agent/workspace
ALLOWED_COMMANDS=npm,node,git,curl
MAX_ITERATIONS=10

# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/openclaw
```

## Comparison: OpenClaw vs Traditional Frameworks

| Feature | Traditional Agents | OpenClaw |
|---------|-------------------|----------|
| Execution | Random async/await (race conditions) | Lane Queue (serial by default) |
| Logs | Intertwined, messy | JSONL transcripts (structured) |
| Security | Prompt-based "be safe" | Allowlist + structural blocking |
| Web Browsing | Vision-heavy screenshots | Semantic snapshots (90% cheaper) |
| Memory | Opaque vector DB only | JSONL + Markdown (editable) |
| Debugging | Difficult to trace | Replayable transcripts |

## Best Practices

### 1. Design for Serial Execution
```typescript
// ✅ Good: Serial by default
await processTask1();
await processTask2();
await processTask3();

// ❌ Bad: Uncontrolled parallelism
Promise.all([processTask1(), processTask2(), processTask3()]);
```

### 2. Use Structured Logging
```typescript
// ✅ Good: JSONL format
logger.info({ event: 'tool_call', tool: 'exec', cmd: 'npm build' });

// ❌ Bad: Unstructured strings
console.log('Running npm build...');
```

### 3. Implement Circuit Breakers
```typescript
class ToolExecutor {
  private failureCount = 0;
  private readonly maxFailures = 3;

  async execute(tool: string, args: any) {
    if (this.failureCount >= this.maxFailures) {
      throw new Error('Circuit breaker open');
    }
    
    try {
      const result = await this.runTool(tool, args);
      this.failureCount = 0; // Reset on success
      return result;
    } catch (error) {
      this.failureCount++;
      throw error;
    }
  }
}
```

### 4. Maintain Audit Trails
```typescript
async function executeWithAudit(tool: string, args: any) {
  const auditEntry = {
    timestamp: Date.now(),
    tool,
    args,
    user: getCurrentUser(),
  };
  
  try {
    const result = await executeTool(tool, args);
    auditEntry.result = result;
    auditEntry.status = 'success';
  } catch (error) {
    auditEntry.error = error.message;
    auditEntry.status = 'failed';
    throw error;
  } finally {
    await appendToJSONL('audit.jsonl', auditEntry);
  }
}
```

## Integration with Crucible

When building AI agents with Crucible + OpenClaw:

1. **Use workflow-multi-agent-build** for orchestrating multiple OpenClaw agents
2. **Apply review-security** to validate allowlists and sandbox configurations
3. **Use neon skill** for persistent storage of JSONL transcripts
4. **Apply observe skill** for monitoring agent performance with PostHog/Sentry

## Example: Building a Deployment Agent

```typescript
import { OpenClawAgent } from 'openclaw';

const deployAgent = new OpenClawAgent({
  identity: 'Deployment Specialist',
  workspace: './workspace/deploy',
  allowedCommands: ['git', 'npm', 'docker', 'kubectl'],
  channels: ['slack'],
  memory: {
    jsonl: './logs/deploy.jsonl',
    markdown: './memory/deploy.md',
  },
});

// Define tools
deployAgent.registerTool('deploy', async (args) => {
  const { environment, branch } = args;
  
  // Validate
  if (!['staging', 'production'].includes(environment)) {
    throw new Error('Invalid environment');
  }
  
  // Execute deployment pipeline
  await deployAgent.exec(`git checkout ${branch}`);
  await deployAgent.exec('npm run build');
  await deployAgent.exec(`docker build -t app:${branch} .`);
  await deployAgent.exec(`kubectl apply -f k8s/${environment}.yaml`);
  
  return { status: 'deployed', environment, branch };
});

// Start agent
await deployAgent.start();
```

## Resources

- [OpenClaw Architecture Guide](https://vertu.com/ai-tools/openclaw-clawdbot-architecture-engineering-reliable-and-controllable-ai-agents/)
- [OpenClaw GitHub](https://github.com/openclaw/openclaw)
- Lane Queue Pattern: Serial by default, explicit parallel
- JSONL Transcripts: Structured, replayable logs
- Semantic Snapshots: 90% cheaper than vision-based browsing

## Output Format

When using this skill, provide:
1. **Architecture diagram** showing the 6-stage pipeline
2. **Lane queue configuration** with serial/parallel decisions
3. **Security allowlist** for tools and commands
4. **JSONL schema** for audit logs
5. **Deployment configuration** (Docker Compose, env vars)
6. **Integration code** for channels (Telegram, Discord, Slack)
