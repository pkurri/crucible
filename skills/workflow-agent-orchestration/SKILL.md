---
name: workflow-agent-orchestration
description: >
  Multi-agent orchestration workflow using OpenClaw and PicoClaw frameworks.
  Coordinates multiple AI agents for parallel task execution, resource-aware
  deployment, agent communication protocols, and hybrid orchestration (heavy +
  lightweight agents). Use when building systems that need multiple specialized
  agents working together.
triggers:
  - 'multi-agent'
  - 'agent orchestration'
  - 'coordinate agents'
  - 'agent swarm'
  - 'distributed agents'
  - 'agent team'
---

# Workflow: Agent Orchestration

This workflow guides you through building multi-agent systems using OpenClaw
(full-featured) and PicoClaw (lightweight) frameworks. It handles agent
coordination, communication protocols, and resource-aware deployment.

## When to Use This Workflow

- Building systems with multiple specialized agents
- Coordinating agents across different resource constraints
- Implementing agent swarms for parallel task execution
- Creating hybrid deployments (cloud + edge agents)
- Orchestrating autonomous agent teams

## Workflow Steps

### 1. Define Agent Roles and Responsibilities

Identify what agents you need and their specific roles.

**Agent Types:**

- **Coordinator Agent** (OpenClaw): Orchestrates other agents, makes high-level
  decisions
- **Specialist Agents** (OpenClaw): Deep expertise in specific domains
  (deployment, testing, monitoring)
- **Edge Agents** (PicoClaw): Lightweight agents for resource-constrained
  environments
- **Monitor Agents** (PicoClaw): Continuous monitoring with minimal footprint

**Example Agent Team:**

```typescript
interface AgentTeam {
  coordinator: {
    name: 'TaskCoordinator'
    framework: 'openclaw'
    role: 'Distribute tasks, aggregate results, make decisions'
    resources: {memory: '1GB'; cpu: '1 core'}
  }
  specialists: [
    {
      name: 'DeploymentAgent'
      framework: 'openclaw'
      role: 'Handle all deployment tasks'
      tools: ['git', 'docker', 'kubectl']
      resources: {memory: '512MB'; cpu: '0.5 core'}
    },
    {
      name: 'TestingAgent'
      framework: 'openclaw'
      role: 'Run tests, report results'
      tools: ['npm', 'pytest', 'playwright']
      resources: {memory: '512MB'; cpu: '0.5 core'}
    },
  ]
  edge: [
    {
      name: 'MonitorAgent'
      framework: 'picoclaw'
      role: 'Monitor system health, alert on issues'
      resources: {memory: '10MB'; cpu: '0.1 core'}
      deployment: 'raspberry-pi'
    },
  ]
}
```

### 2. Design Communication Protocols

Define how agents communicate with each other.

**Message Queue Architecture:**

```typescript
// Central message bus
interface MessageBus {
  publish(topic: string, message: AgentMessage): Promise<void>
  subscribe(topic: string, handler: MessageHandler): void
  request(agentId: string, task: Task): Promise<Result>
}

interface AgentMessage {
  from: string
  to: string
  type: 'task' | 'result' | 'status' | 'alert'
  payload: any
  timestamp: number
  correlationId: string
}

// Example: Redis-based message bus
class RedisMessageBus implements MessageBus {
  private redis: Redis

  async publish(topic: string, message: AgentMessage) {
    await this.redis.publish(topic, JSON.stringify(message))
  }

  subscribe(topic: string, handler: MessageHandler) {
    this.redis.subscribe(topic)
    this.redis.on('message', (channel, msg) => {
      if (channel === topic) {
        handler(JSON.parse(msg))
      }
    })
  }

  async request(agentId: string, task: Task): Promise<Result> {
    const correlationId = generateId()
    const responseChannel = `response:${correlationId}`

    return new Promise(resolve => {
      this.subscribe(responseChannel, msg => {
        resolve(msg.payload)
      })

      this.publish(`agent:${agentId}`, {
        from: 'coordinator',
        to: agentId,
        type: 'task',
        payload: task,
        timestamp: Date.now(),
        correlationId,
      })
    })
  }
}
```

**Direct HTTP Communication:**

```typescript
// For simpler setups without message queue
class AgentClient {
  async sendTask(agentUrl: string, task: Task): Promise<Result> {
    const response = await fetch(`${agentUrl}/task`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(task),
    })
    return response.json()
  }

  async getStatus(agentUrl: string): Promise<AgentStatus> {
    const response = await fetch(`${agentUrl}/status`)
    return response.json()
  }
}
```

### 3. Implement Agent Coordination Logic

**Coordinator Agent (OpenClaw):**

```typescript
import {OpenClawAgent} from 'openclaw'

class CoordinatorAgent {
  private agents: Map<string, AgentClient>
  private messageBus: MessageBus

  constructor() {
    this.agents = new Map()
    this.messageBus = new RedisMessageBus()
  }

  async executeWorkflow(workflow: Workflow): Promise<WorkflowResult> {
    const tasks = this.planTasks(workflow)
    const results = await this.executeTasks(tasks)
    return this.aggregateResults(results)
  }

  private planTasks(workflow: Workflow): Task[] {
    // Break down workflow into tasks
    // Assign tasks to appropriate agents
    // Determine dependencies and execution order

    return workflow.steps.map(step => ({
      id: generateId(),
      type: step.type,
      assignedTo: this.selectAgent(step),
      dependencies: step.dependencies,
      payload: step.data,
    }))
  }

  private selectAgent(step: WorkflowStep): string {
    // Select agent based on:
    // - Agent capabilities
    // - Current load
    // - Resource availability

    if (step.type === 'deploy') return 'DeploymentAgent'
    if (step.type === 'test') return 'TestingAgent'
    if (step.type === 'monitor') return 'MonitorAgent'

    throw new Error(`No agent for step type: ${step.type}`)
  }

  private async executeTasks(tasks: Task[]): Promise<Result[]> {
    // Execute tasks respecting dependencies
    const results: Result[] = []
    const completed = new Set<string>()

    while (tasks.length > 0) {
      // Find tasks with satisfied dependencies
      const ready = tasks.filter(task =>
        task.dependencies.every(dep => completed.has(dep))
      )

      if (ready.length === 0) {
        throw new Error('Circular dependency detected')
      }

      // Execute ready tasks in parallel
      const batchResults = await Promise.all(
        ready.map(task => this.executeTask(task))
      )

      results.push(...batchResults)
      ready.forEach(task => {
        completed.add(task.id)
        tasks = tasks.filter(t => t.id !== task.id)
      })
    }

    return results
  }

  private async executeTask(task: Task): Promise<Result> {
    const agent = this.agents.get(task.assignedTo)

    try {
      const result = await this.messageBus.request(task.assignedTo, task)
      return {taskId: task.id, status: 'success', data: result}
    } catch (error) {
      return {taskId: task.id, status: 'failed', error: error.message}
    }
  }

  private aggregateResults(results: Result[]): WorkflowResult {
    const failed = results.filter(r => r.status === 'failed')

    if (failed.length > 0) {
      return {
        status: 'failed',
        failedTasks: failed,
        successfulTasks: results.filter(r => r.status === 'success'),
      }
    }

    return {
      status: 'success',
      results: results.map(r => r.data),
    }
  }
}
```

### 4. Deploy Agent Infrastructure

**Docker Compose for Multi-Agent System:**

```yaml
version: '3.8'

services:
  # Message bus
  redis:
    image: redis:7-alpine
    ports:
      - '6379:6379'
    volumes:
      - redis-data:/data

  # Coordinator agent (OpenClaw)
  coordinator:
    build:
      context: ./agents/coordinator
      dockerfile: Dockerfile.openclaw
    environment:
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - REDIS_URL=redis://redis:6379
      - AGENT_ROLE=coordinator
    depends_on:
      - redis
    volumes:
      - ./workspace/coordinator:/workspace
    mem_limit: 1g
    cpus: 1

  # Deployment agent (OpenClaw)
  deployment:
    build:
      context: ./agents/deployment
      dockerfile: Dockerfile.openclaw
    environment:
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - REDIS_URL=redis://redis:6379
      - AGENT_ROLE=deployment
      - ALLOWED_COMMANDS=git,docker,kubectl,npm
    depends_on:
      - redis
    volumes:
      - ./workspace/deployment:/workspace
      - /var/run/docker.sock:/var/run/docker.sock
    mem_limit: 512m
    cpus: 0.5

  # Testing agent (OpenClaw)
  testing:
    build:
      context: ./agents/testing
      dockerfile: Dockerfile.openclaw
    environment:
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - REDIS_URL=redis://redis:6379
      - AGENT_ROLE=testing
      - ALLOWED_COMMANDS=npm,pytest,playwright
    depends_on:
      - redis
    volumes:
      - ./workspace/testing:/workspace
    mem_limit: 512m
    cpus: 0.5

  # Monitor agent (PicoClaw) - lightweight
  monitor:
    build:
      context: ./agents/monitor
      dockerfile: Dockerfile.picoclaw
    environment:
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - REDIS_URL=redis://redis:6379
      - AGENT_ROLE=monitor
      - PICOCLAW_WORKSPACE=/workspace
    depends_on:
      - redis
    volumes:
      - ./workspace/monitor:/workspace
    mem_limit: 50m
    cpus: 0.1

volumes:
  redis-data:
```

**Kubernetes Deployment:**

```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: agent-system

---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: coordinator-agent
  namespace: agent-system
spec:
  replicas: 1
  selector:
    matchLabels:
      app: coordinator
  template:
    metadata:
      labels:
        app: coordinator
    spec:
      containers:
        - name: coordinator
          image: myregistry/coordinator-openclaw:latest
          env:
            - name: OPENAI_API_KEY
              valueFrom:
                secretKeyRef:
                  name: agent-secrets
                  key: openai-key
            - name: REDIS_URL
              value: redis://redis:6379
          resources:
            requests:
              memory: '512Mi'
              cpu: '500m'
            limits:
              memory: '1Gi'
              cpu: '1000m'
          volumeMounts:
            - name: workspace
              mountPath: /workspace
      volumes:
        - name: workspace
          persistentVolumeClaim:
            claimName: coordinator-workspace

---
apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: monitor-agent
  namespace: agent-system
spec:
  selector:
    matchLabels:
      app: monitor
  template:
    metadata:
      labels:
        app: monitor
    spec:
      containers:
        - name: monitor
          image: myregistry/monitor-picoclaw:latest
          env:
            - name: OPENAI_API_KEY
              valueFrom:
                secretKeyRef:
                  name: agent-secrets
                  key: openai-key
          resources:
            requests:
              memory: '10Mi'
              cpu: '100m'
            limits:
              memory: '50Mi'
              cpu: '200m'
```

### 5. Implement Monitoring and Observability

**Agent Health Monitoring:**

```typescript
class AgentMonitor {
  private agents: Map<string, AgentHealth>

  async monitorHealth() {
    setInterval(async () => {
      for (const [agentId, client] of this.agents) {
        try {
          const status = await client.getStatus()
          this.updateHealth(agentId, status)

          if (status.health === 'unhealthy') {
            await this.handleUnhealthyAgent(agentId)
          }
        } catch (error) {
          await this.handleAgentFailure(agentId, error)
        }
      }
    }, 30000) // Check every 30 seconds
  }

  private async handleUnhealthyAgent(agentId: string) {
    // Attempt recovery
    await this.restartAgent(agentId)

    // Redistribute tasks
    await this.redistributeTasks(agentId)

    // Alert operators
    await this.sendAlert({
      severity: 'warning',
      message: `Agent ${agentId} is unhealthy`,
      timestamp: Date.now(),
    })
  }
}
```

**Metrics Collection:**

```typescript
import {PostHog} from 'posthog-node'

class AgentMetrics {
  private posthog: PostHog

  trackTaskExecution(task: Task, result: Result, duration: number) {
    this.posthog.capture({
      distinctId: task.assignedTo,
      event: 'task_executed',
      properties: {
        taskType: task.type,
        status: result.status,
        duration,
        agentId: task.assignedTo,
      },
    })
  }

  trackAgentLoad(agentId: string, metrics: AgentMetrics) {
    this.posthog.capture({
      distinctId: agentId,
      event: 'agent_metrics',
      properties: {
        memoryUsage: metrics.memory,
        cpuUsage: metrics.cpu,
        activeTask: metrics.activeTasks,
        queuedTasks: metrics.queuedTasks,
      },
    })
  }
}
```

### 6. Handle Failure and Recovery

**Circuit Breaker Pattern:**

```typescript
class CircuitBreaker {
  private failures = new Map<string, number>()
  private readonly threshold = 5
  private readonly timeout = 60000 // 1 minute

  async execute<T>(agentId: string, fn: () => Promise<T>): Promise<T> {
    const failureCount = this.failures.get(agentId) || 0

    if (failureCount >= this.threshold) {
      throw new Error(`Circuit breaker open for ${agentId}`)
    }

    try {
      const result = await fn()
      this.failures.set(agentId, 0) // Reset on success
      return result
    } catch (error) {
      this.failures.set(agentId, failureCount + 1)

      if (failureCount + 1 >= this.threshold) {
        setTimeout(() => {
          this.failures.set(agentId, 0) // Reset after timeout
        }, this.timeout)
      }

      throw error
    }
  }
}
```

**Task Retry Logic:**

```typescript
async function executeWithRetry(
  task: Task,
  maxRetries = 3,
  backoff = 1000
): Promise<Result> {
  let lastError: Error

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await executeTask(task)
    } catch (error) {
      lastError = error

      if (attempt < maxRetries - 1) {
        await sleep(backoff * Math.pow(2, attempt)) // Exponential backoff
      }
    }
  }

  throw new Error(
    `Task failed after ${maxRetries} attempts: ${lastError.message}`
  )
}
```

## Example: Building a CI/CD Agent System

```typescript
// Coordinator orchestrates the CI/CD pipeline
const coordinator = new CoordinatorAgent()

const cicdWorkflow = {
  name: 'Deploy Application',
  steps: [
    {
      id: 'test',
      type: 'test',
      data: {branch: 'main', tests: ['unit', 'integration']},
      dependencies: [],
    },
    {
      id: 'build',
      type: 'build',
      data: {branch: 'main', target: 'production'},
      dependencies: ['test'],
    },
    {
      id: 'deploy',
      type: 'deploy',
      data: {environment: 'production', image: 'app:latest'},
      dependencies: ['build'],
    },
    {
      id: 'monitor',
      type: 'monitor',
      data: {duration: '1h', metrics: ['errors', 'latency']},
      dependencies: ['deploy'],
    },
  ],
}

const result = await coordinator.executeWorkflow(cicdWorkflow)
console.log('Deployment result:', result)
```

## Best Practices

1. **Design for Failure**: Assume agents will fail and build recovery mechanisms
2. **Use Async Communication**: Avoid blocking calls between agents
3. **Implement Timeouts**: Every inter-agent call should have a timeout
4. **Monitor Everything**: Track agent health, task execution, resource usage
5. **Resource Awareness**: Deploy heavy agents (OpenClaw) on servers, light
   agents (PicoClaw) on edge
6. **Idempotent Tasks**: Design tasks to be safely retryable
7. **Audit Trails**: Log all agent communications for debugging

## Integration with Crucible Skills

- **Use neon skill** for persistent storage of agent state and task history
- **Use observe skill** for monitoring agent performance with PostHog/Sentry
- **Use review-security skill** to validate agent allowlists and communication
  security
- **Use testing skill** to test agent coordination logic

## Output Format

When using this workflow, provide:

1. **Agent team diagram** showing roles and responsibilities
2. **Communication protocol** specification
3. **Deployment configuration** (Docker Compose or Kubernetes)
4. **Monitoring setup** with health checks and metrics
5. **Failure handling** strategy with circuit breakers and retries
6. **Complete working code** for coordinator and specialist agents
