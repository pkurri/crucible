# AI Agent Framework Integration

Crucible integrates with production-grade AI agent frameworks to enable
autonomous, multi-agent systems. This guide covers OpenClaw (full-featured) and
PicoClaw (lightweight) integration.

## Overview

Crucible provides three new skills for building AI agent systems:

1. **`openclaw`** - Full-featured agent framework with 6-stage pipeline, lane
   queues, and production reliability
2. **`picoclaw`** - Ultra-lightweight agent framework (<10MB RAM) for edge and
   resource-constrained deployments
3. **`workflow-agent-orchestration`** - Multi-agent coordination and
   orchestration patterns

## Quick Start

### Install Agent Frameworks

**OpenClaw:**

```bash
npm install openclaw
# or
pip install openclaw
```

**PicoClaw:**

```bash
# Download binary for your platform
wget https://github.com/sipeed/picoclaw/releases/latest/download/picoclaw-linux-amd64
chmod +x picoclaw-linux-amd64
sudo mv picoclaw-linux-amd64 /usr/local/bin/picoclaw
```

### Build Your First Agent

**Using Crucible Skills in Windsurf/Cursor:**

```
Using Crucible's openclaw skill, build a deployment agent that:
- Monitors GitHub for new releases
- Runs tests automatically
- Deploys to staging if tests pass
- Uses lane queue for serial execution
- Logs all actions to JSONL transcripts
```

**Or with PicoClaw for edge deployment:**

```
Using Crucible's picoclaw skill, build a monitoring agent that:
- Runs on Raspberry Pi (<10MB RAM)
- Checks system health every 5 minutes
- Sends alerts via Telegram
- Stores minimal state in workspace
```

## Architecture Comparison

| Feature    | OpenClaw         | PicoClaw           | Use Case                                            |
| ---------- | ---------------- | ------------------ | --------------------------------------------------- |
| Memory     | ~1GB             | <10MB              | OpenClaw: Cloud/Server, PicoClaw: Edge/IoT          |
| Language   | Python/Node.js   | Go                 | OpenClaw: Rich ecosystem, PicoClaw: Performance     |
| Boot Time  | ~5s              | 1s                 | PicoClaw: Fast restarts needed                      |
| Pipeline   | 6-stage          | 3-stage            | OpenClaw: Complex workflows, PicoClaw: Simple tasks |
| Deployment | Docker           | Single binary      | PicoClaw: Easier deployment                         |
| Cost       | $600+ (Mac mini) | $10 (Raspberry Pi) | PicoClaw: Budget-constrained                        |

## When to Use Which Framework

### Use OpenClaw When:

- Building complex multi-step workflows
- Need rich tool ecosystem and integrations
- Running on cloud/server infrastructure
- Require detailed audit trails and replay capability
- Managing multiple communication channels (Telegram, Discord, Slack)
- Need sophisticated error handling and recovery

### Use PicoClaw When:

- Deploying to edge devices (Raspberry Pi, Android, IoT)
- Memory/resource constraints (<50MB RAM)
- Need fast boot times (<1s)
- Simple autonomous tasks (monitoring, alerts, cron jobs)
- Want single-binary deployment
- Running on low-cost hardware

### Use Both (Hybrid) When:

- Coordinator agent (OpenClaw) orchestrates edge agents (PicoClaw)
- Cloud processing with edge data collection
- Cost optimization (expensive tasks on OpenClaw, simple tasks on PicoClaw)

## Multi-Agent Orchestration

### Example: CI/CD Agent System

```typescript
// Coordinator (OpenClaw) - Runs on server
const coordinator = new OpenClawAgent({
  role: 'coordinator',
  workspace: './workspace/coordinator',
  channels: ['slack'],
})

// Deployment Agent (OpenClaw) - Runs on server
const deployAgent = new OpenClawAgent({
  role: 'deployment',
  workspace: './workspace/deploy',
  allowedCommands: ['git', 'docker', 'kubectl'],
})

// Monitor Agents (PicoClaw) - Run on edge devices
const monitors = [
  new PicoClawAgent({role: 'monitor-us-east', device: 'rpi-1'}),
  new PicoClawAgent({role: 'monitor-eu-west', device: 'rpi-2'}),
]

// Workflow
coordinator.on('release-detected', async release => {
  // Deploy using OpenClaw agent
  const deployResult = await deployAgent.deploy(release)

  // Monitor using PicoClaw agents
  await Promise.all(monitors.map(m => m.startMonitoring(release)))
})
```

### Communication Patterns

**Message Queue (Redis):**

```typescript
// All agents connect to shared Redis
const messageBus = new RedisMessageBus('redis://localhost:6379')

// Coordinator publishes tasks
messageBus.publish('tasks:deploy', {
  type: 'deploy',
  payload: {version: 'v1.2.3'},
})

// Deployment agent subscribes
messageBus.subscribe('tasks:deploy', async task => {
  const result = await handleDeploy(task.payload)
  messageBus.publish('results:deploy', result)
})
```

**Direct HTTP:**

```typescript
// Simpler for small deployments
const deployAgent = new AgentClient('http://deploy-agent:3000')
const result = await deployAgent.sendTask({
  type: 'deploy',
  version: 'v1.2.3',
})
```

## Deployment Patterns

### Docker Compose (Multi-Agent)

```yaml
version: '3.8'

services:
  redis:
    image: redis:7-alpine

  coordinator:
    image: myorg/coordinator-openclaw:latest
    environment:
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - REDIS_URL=redis://redis:6379
    mem_limit: 1g

  deployment:
    image: myorg/deployment-openclaw:latest
    environment:
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - REDIS_URL=redis://redis:6379
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
    mem_limit: 512m

  monitor:
    image: myorg/monitor-picoclaw:latest
    environment:
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - REDIS_URL=redis://redis:6379
    mem_limit: 50m
```

### Raspberry Pi (PicoClaw)

```bash
# Install on Raspberry Pi
wget https://github.com/sipeed/picoclaw/releases/latest/download/picoclaw-linux-arm
chmod +x picoclaw-linux-arm
sudo mv picoclaw-linux-arm /usr/local/bin/picoclaw

# Create config
cat > ~/.picoclaw/config.json << EOF
{
  "agents": {
    "defaults": {
      "workspace": "~/.picoclaw/workspace",
      "restrict_to_workspace": true,
      "model": "gpt-3.5-turbo"
    }
  },
  "providers": {
    "openai": {
      "api_key": "${OPENAI_API_KEY}"
    }
  }
}
EOF

# Run as systemd service
sudo tee /etc/systemd/system/picoclaw.service << EOF
[Unit]
Description=PicoClaw AI Agent
After=network.target

[Service]
Type=simple
User=pi
ExecStart=/usr/local/bin/picoclaw agent --config /home/pi/.picoclaw/config.json
Restart=always

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl enable picoclaw
sudo systemctl start picoclaw
```

## Security Best Practices

### OpenClaw Security

```typescript
// Allowlist-based command execution
const ALLOWED_COMMANDS = ['npm', 'git', 'docker', 'kubectl']
const BLOCKED_PATTERNS = [/rm\s+-rf\s+\//, /sudo/, /chmod\s+777/]

function validateCommand(cmd: string): boolean {
  const baseCmd = cmd.split(' ')[0]
  if (!ALLOWED_COMMANDS.includes(baseCmd)) {
    throw new Error(`Command not in allowlist: ${baseCmd}`)
  }

  for (const pattern of BLOCKED_PATTERNS) {
    if (pattern.test(cmd)) {
      throw new Error(`Command matches blocked pattern`)
    }
  }

  return true
}

// Workspace sandboxing
const WORKSPACE_ROOT = '/home/agent/workspace'
function validatePath(path: string): string {
  const resolved = resolvePath(path)
  if (!resolved.startsWith(WORKSPACE_ROOT)) {
    throw new Error('Path outside workspace boundary')
  }
  return resolved
}
```

### PicoClaw Security

```json
{
  "agents": {
    "defaults": {
      "workspace": "~/.picoclaw/workspace",
      "restrict_to_workspace": true
    }
  }
}
```

Blocked commands (always):

- `rm -rf`, `del /f`, `rmdir /s` - Bulk deletion
- `format`, `mkfs`, `diskpart` - Disk operations
- `shutdown`, `reboot`, `poweroff` - System control
- `:(){ :|:& };:` - Fork bomb

## Monitoring and Observability

### Using Crucible's Observe Skill

```typescript
import {PostHog} from 'posthog-node'
import * as Sentry from '@sentry/node'

// Track agent performance
posthog.capture({
  distinctId: 'deployment-agent',
  event: 'task_executed',
  properties: {
    taskType: 'deploy',
    duration: 45000,
    status: 'success',
  },
})

// Error tracking
Sentry.captureException(error, {
  tags: {
    agent: 'deployment-agent',
    task: 'deploy-v1.2.3',
  },
})
```

### Health Checks

```typescript
// Agent health endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    activeTasks: taskQueue.length,
    lastTaskCompleted: lastTaskTimestamp,
  })
})
```

## Example Projects

### 1. Autonomous Deployment Pipeline

**Agents:**

- Coordinator (OpenClaw): Orchestrates the pipeline
- Testing Agent (OpenClaw): Runs tests
- Deployment Agent (OpenClaw): Deploys to production
- Monitor Agents (PicoClaw): Monitor deployed services

**Workflow:**

```
GitHub Release → Coordinator → Testing Agent → Deployment Agent → Monitor Agents
                                     ↓                  ↓               ↓
                                  Run Tests         Deploy to K8s    Alert on Issues
```

### 2. Edge Monitoring Network

**Agents:**

- Central Coordinator (OpenClaw): Aggregates data, makes decisions
- Edge Monitors (PicoClaw): Deployed on Raspberry Pis at each location

**Use Case:**

- Monitor server rooms, data centers, remote locations
- <10MB RAM per monitor
- $10 hardware cost per location
- Real-time alerts via Telegram

### 3. Multi-Tenant SaaS Operations

**Agents:**

- Tenant Provisioning (OpenClaw): Creates new tenant infrastructure
- Backup Agents (PicoClaw): Lightweight backup monitoring per tenant
- Support Agent (OpenClaw): Handles customer support requests

## Integration with Other Crucible Skills

### With Neon (Database)

```typescript
// Store agent state in Neon Postgres
import {neon} from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL)

// Save agent execution history
await sql`
  INSERT INTO agent_executions (agent_id, task_type, status, duration)
  VALUES (${agentId}, ${taskType}, ${status}, ${duration})
`
```

### With Stripe (Billing)

```typescript
// Bill based on agent usage
const usage = await getAgentUsage(customerId)
await stripe.subscriptionItems.createUsageRecord(subscriptionItemId, {
  quantity: usage.taskCount,
})
```

### With Testing Skill

```typescript
// Test agent coordination
describe('Agent Orchestration', () => {
  it('should coordinate deployment workflow', async () => {
    const coordinator = new CoordinatorAgent()
    const result = await coordinator.executeWorkflow(deployWorkflow)
    expect(result.status).toBe('success')
  })
})
```

## Troubleshooting

### OpenClaw Issues

**High memory usage:**

- Reduce context window size
- Limit concurrent sessions
- Clean up old JSONL transcripts

**Lane queue bottlenecks:**

- Identify tasks that can run in parallel
- Use explicit parallel lanes for safe tasks

### PicoClaw Issues

**Memory exceeded:**

- Reduce session history
- Use lighter models (gpt-3.5-turbo)
- Limit concurrent operations

**Slow response:**

- Check network latency to LLM API
- Use local models (Ollama) if possible
- Reduce heartbeat frequency

## Resources

- [OpenClaw Skill](../skills/openclaw/SKILL.md)
- [PicoClaw Skill](../skills/picoclaw/SKILL.md)
- [Agent Orchestration Workflow](../skills/workflow-agent-orchestration/SKILL.md)
- [OpenClaw GitHub](https://github.com/openclaw/openclaw)
- [PicoClaw GitHub](https://github.com/sipeed/picoclaw)

## Next Steps

1. **Choose your framework** based on resource constraints
2. **Define agent roles** using the orchestration workflow
3. **Set up communication** (Redis or HTTP)
4. **Deploy infrastructure** (Docker Compose or K8s)
5. **Monitor and iterate** using observe skill

Use Crucible skills in your IDE to generate complete agent systems with all
necessary code, configurations, and deployment setups.
