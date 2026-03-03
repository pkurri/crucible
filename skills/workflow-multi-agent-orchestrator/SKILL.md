---
name: workflow-multi-agent-orchestrator
description: >
  Voxyz-style multi-agent orchestration system that coordinates 6+ specialized
  agents (Product Manager, Architect, Frontend Dev, Backend Dev, DevOps, QA)
  with role-based communication, task distribution, and centralized
  coordination. Use for complex projects requiring multiple specialized agents
  working in parallel with clear handoffs.
triggers:
  - 'multi-agent team'
  - 'orchestrate agents'
  - 'coordinate multiple agents'
  - 'agent team lead'
  - 'voxyz style agents'
  - '6 agents working together'
  - 'agent coordination'
---

# Workflow: Multi-Agent Orchestrator

Voxyz-inspired multi-agent orchestration with role-based coordination,
communication patterns, and centralized task management.

---

## Agent Roles

### 1. Product Manager Agent

- **Scope**: Requirements gathering, user stories, prioritization
- **Communicates**: All agents (coordination)
- **Artifacts**: PRD, user stories, acceptance criteria

### 2. Architect Agent

- **Scope**: System design, technical decisions, integration patterns
- **Communicates**: All agents (technical guidance)
- **Artifacts**: Architecture diagrams, ADRs, API contracts

### 3. Frontend Agent

- **Scope**: UI/UX implementation, component architecture, user flows
- **Communicates**: PM, QA, Architect
- **Artifacts**: Components, pages, user interfaces

### 4. Backend Agent

- **Scope**: API development, database design, business logic
- **Communicates**: PM, Architect, DevOps, QA
- **Artifacts**: APIs, services, database schemas

### 5. DevOps Agent

- **Scope**: Infrastructure, CI/CD, deployment, monitoring
- **Communicates**: Backend, Architect, PM
- **Artifacts**: Infrastructure as code, pipelines, monitoring

### 6. QA Agent

- **Scope**: Testing strategy, test automation, quality assurance
- **Communicates**: All agents (quality validation)
- **Artifacts**: Test suites, test plans, quality reports

---

## Orchestration Patterns

### Phase 1: Kickoff & Planning

```
PM Agent: Gather requirements → Create PRD → Distribute to all agents
Architect Agent: Review PRD → Design system → Share architecture
All Agents: Review architecture → Provide feedback → Confirm approach
```

### Phase 2: Parallel Development

```
Frontend Agent: Build UI components → Coordinate with Backend on APIs
Backend Agent: Build APIs → Coordinate with DevOps on infrastructure
DevOps Agent: Setup infrastructure → Configure monitoring
QA Agent: Create test plans → Coordinate with all on testing strategy
```

### Phase 3: Integration & Testing

```
All Agents: Integrate work → Resolve dependencies → Test together
QA Agent: Run integration tests → Report issues → Coordinate fixes
DevOps Agent: Deploy to staging → Monitor performance
```

### Phase 4: Deployment & Monitoring

```
DevOps Agent: Deploy to production → Monitor systems
PM Agent: Validate features → Gather feedback
All Agents: Monitor performance → Address issues → Plan improvements
```

---

## Communication Protocols

### Agent-to-Agent Messages

```typescript
interface AgentMessage {
  from: AgentRole
  to: AgentRole | 'all'
  type: 'request' | 'response' | 'update' | 'blocker'
  priority: 'low' | 'medium' | 'high' | 'critical'
  subject: string
  content: string
  artifacts?: string[]
  dependencies?: string[]
  deadline?: Date
}
```

### Standup Updates

```typescript
interface AgentStandup {
  agent: AgentRole
  yesterday: CompletedTask[]
  today: PlannedTask[]
  blockers: Blocker[]
  needs: string[]
  eta?: Date
}
```

### Handoff Protocol

```typescript
interface AgentHandoff {
  from: AgentRole
  to: AgentRole
  deliverables: Deliverable[]
  requirements: Requirement[]
  dependencies: Dependency[]
  validation: ValidationCriteria[]
  signoff: boolean
}
```

---

## Implementation Template

### 1. Orchestration Setup

```typescript
// src/orchestration/AgentOrchestrator.ts
export class AgentOrchestrator {
  private agents: Map<AgentRole, Agent> = new Map()
  private messageBus: MessageBus
  private taskQueue: TaskQueue
  private coordinator: Coordinator

  constructor(project: ProjectConfig) {
    this.initializeAgents(project)
    this.setupCommunication()
    this.startCoordination()
  }

  private initializeAgents(project: ProjectConfig) {
    this.agents.set('pm', new ProductManagerAgent(project))
    this.agents.set('architect', new ArchitectAgent(project))
    this.agents.set('frontend', new FrontendAgent(project))
    this.agents.set('backend', new BackendAgent(project))
    this.agents.set('devops', new DevOpsAgent(project))
    this.agents.set('qa', new QAAgent(project))
  }

  async executeProject(): Promise<ProjectResult> {
    // Phase 1: Planning
    await this.runPhase('planning', [
      'pm.gather_requirements',
      'architect.design_system',
      'all.review_architecture',
    ])

    // Phase 2: Development
    await this.runPhase('development', [
      'frontend.build_components',
      'backend.build_apis',
      'devops.setup_infrastructure',
      'qa.create_tests',
    ])

    // Phase 3: Integration
    await this.runPhase('integration', [
      'all.integrate_work',
      'qa.run_integration_tests',
      'devops.deploy_staging',
    ])

    // Phase 4: Deployment
    await this.runPhase('deployment', [
      'devops.deploy_production',
      'pm.validate_features',
      'all.monitor_performance',
    ])

    return this.getProjectResult()
  }
}
```

### 2. Agent Base Class

```typescript
// src/agents/BaseAgent.ts
export abstract class BaseAgent {
  protected role: AgentRole
  protected messageBus: MessageBus
  protected taskQueue: TaskQueue
  protected logger: AgentLogger

  constructor(role: AgentRole, messageBus: MessageBus) {
    this.role = role
    this.messageBus = messageBus
    this.setupMessageHandlers()
  }

  protected setupMessageHandlers() {
    this.messageBus.on(this.role, this.handleMessage.bind(this))
  }

  protected abstract handleMessage(message: AgentMessage): Promise<void>
  protected abstract executeTask(task: Task): Promise<TaskResult>

  protected sendMessage(to: AgentRole | 'all', message: Partial<AgentMessage>) {
    this.messageBus.send({
      from: this.role,
      to,
      type: 'update',
      priority: 'medium',
      ...message,
    })
  }

  protected requestHandoff(to: AgentRole, deliverables: Deliverable[]) {
    this.sendMessage(to, {
      type: 'request',
      subject: `Handoff to ${to}`,
      content: `Ready to handoff deliverables`,
      artifacts: deliverables.map(d => d.id),
    })
  }
}
```

---

## Task Distribution

### Parallel Task Execution

```typescript
const parallelTasks = [
  agent('frontend').buildComponents(),
  agent('backend').buildAPIs(),
  agent('devops').setupInfrastructure(),
  agent('qa').createTestPlans(),
]

const results = await Promise.allSettled(parallelTasks)
```

### Dependency Management

```typescript
const taskGraph = {
  'frontend.components': ['backend.apis', 'architect.design'],
  'backend.apis': ['architect.design', 'devops.database'],
  'qa.integration_tests': ['frontend.components', 'backend.apis'],
  'devops.deployment': ['all.features_complete'],
}
```

---

## Output Format

### Project Execution Summary

```
## Multi-Agent Project Execution

### 🎯 Project: [Project Name]
### 👥 Team: 6 specialized agents
### ⏱️ Duration: [X days]

### Phase Results:
- **Planning**: ✅ Complete (2 days)
- **Development**: ✅ Complete (5 days)
- **Integration**: ✅ Complete (2 days)
- **Deployment**: ✅ Complete (1 day)

### Agent Contributions:
- **PM**: 12 user stories, 8 acceptance criteria
- **Architect**: 5 ADRs, 12 API contracts
- **Frontend**: 24 components, 8 pages
- **Backend**: 15 APIs, 8 services
- **DevOps**: 3 environments, CI/CD pipeline
- **QA**: 180 tests, 95% coverage

### Communication Metrics:
- **Messages**: 247 total
- **Handoffs**: 18 successful
- **Blockers**: 5 resolved
- **Avg Response Time**: 2.3 hours

### Deliverables:
- [ ] PRD v1.0
- [ ] Architecture diagrams
- [ ] Frontend application
- [ ] Backend APIs
- [ ] Infrastructure setup
- [ ] Test suite
- [ ] Deployment pipeline

### Next Steps:
1. Monitor production performance
2. Gather user feedback
3. Plan iteration 2
```

---

## Usage Examples

### Start Multi-Agent Project

```typescript
const orchestrator = new AgentOrchestrator({
  name: 'E-commerce Platform',
  timeline: '8 weeks',
  team: {
    pm: true,
    architect: true,
    frontend: true,
    backend: true,
    devops: true,
    qa: true,
  },
})

const result = await orchestrator.executeProject()
```

### Monitor Agent Activity

```typescript
orchestrator.on('agentUpdate', update => {
  console.log(`${update.agent}: ${update.status}`)
})

orchestrator.on('blocker', blocker => {
  console.warn(`Blocker: ${blocker.description}`)
  // Auto-escalate critical blockers
})
```

---

## Best Practices

1. **Clear Role Boundaries**: Each agent has specific responsibilities
2. **Structured Communication**: Use message protocols for all coordination
3. **Dependency Management**: Explicitly track and manage task dependencies
4. **Regular Checkpoints**: Daily standups and phase reviews
5. **Quality Gates**: QA approval required for phase transitions
6. **Monitoring**: Track agent performance and communication metrics
