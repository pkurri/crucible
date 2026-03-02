---
name: tool-agent-coordinator
description: >
  Agent coordination and communication management tool. Handles message routing,
  dependency tracking, handoff protocols, and conflict resolution for multi-agent
  systems. Use when managing complex agent interactions, communication flows,
  or coordinating multiple specialized agents working on the same project.
triggers:
  - "coordinate agents"
  - "agent communication"
  - "message routing"
  - "agent handoffs"
  - "resolve agent conflicts"
  - "agent dependencies"
  - "multi-agent coordination"
---

# Tool: Agent Coordinator

Advanced agent coordination system for managing communication, dependencies, and handoffs in multi-agent environments.

---

## Setup

```bash
npm install @types/node ws eventemitter3
```

---

## Core Components

### 1. Message Bus System
```typescript
// src/coordination/MessageBus.ts
import { EventEmitter } from 'eventemitter3'

export interface AgentMessage {
  id: string
  from: AgentRole
  to: AgentRole | 'all' | 'coordinator'
  type: 'request' | 'response' | 'update' | 'blocker' | 'handoff' | 'escalation'
  priority: 'low' | 'medium' | 'high' | 'critical'
  subject: string
  content: string
  artifacts?: ArtifactReference[]
  dependencies?: DependencyReference[]
  timestamp: Date
  replyTo?: string
  threadId?: string
}

export class MessageBus extends EventEmitter {
  private messageHistory: Map<string, AgentMessage> = new Map()
  private agentSubscriptions: Map<AgentRole, Set<string>> = new Map()
  private routingRules: RoutingRule[] = []

  constructor() {
    super()
    this.setupDefaultRouting()
  }

  send(message: Omit<AgentMessage, 'id' | 'timestamp'>): string {
    const fullMessage: AgentMessage = {
      ...message,
      id: this.generateMessageId(),
      timestamp: new Date()
    }

    this.messageHistory.set(fullMessage.id, fullMessage)
    this.routeMessage(fullMessage)
    
    this.emit('message:sent', fullMessage)
    return fullMessage.id
  }

  private routeMessage(message: AgentMessage): void {
    // Apply routing rules
    const routedMessage = this.applyRoutingRules(message)
    
    if (routedMessage.to === 'all') {
      this.broadcast(routedMessage)
    } else if (routedMessage.to === 'coordinator') {
      this.emit('coordinator:message', routedMessage)
    } else {
      this.sendToAgent(routedMessage.to, routedMessage)
    }
  }

  private broadcast(message: AgentMessage): void {
    this.emit('broadcast', message)
    for (const [agent] of this.agentSubscriptions) {
      this.sendToAgent(agent, message)
    }
  }

  private sendToAgent(agent: AgentRole, message: AgentMessage): void {
    this.emit(`agent:${agent}:message`, message)
    this.trackAgentActivity(agent, message)
  }

  subscribe(agent: AgentRole, subscriptionId: string): void {
    if (!this.agentSubscriptions.has(agent)) {
      this.agentSubscriptions.set(agent, new Set())
    }
    this.agentSubscriptions.get(agent)!.add(subscriptionId)
  }

  unsubscribe(agent: AgentRole, subscriptionId: string): void {
    this.agentSubscriptions.get(agent)?.delete(subscriptionId)
  }
}
```

### 2. Dependency Manager
```typescript
// src/coordination/DependencyManager.ts
export interface Dependency {
  id: string
  from: AgentRole
  to: AgentRole
  type: 'data' | 'api' | 'service' | 'artifact' | 'approval'
  description: string
  status: 'pending' | 'in-progress' | 'completed' | 'blocked'
  requiredFor: string[]
  createdAt: Date
  completedAt?: Date
}

export class DependencyManager {
  private dependencies: Map<string, Dependency> = new Map()
  private dependencyGraph: Map<string, Set<string>> = new Map()

  addDependency(dependency: Omit<Dependency, 'id' | 'createdAt'>): string {
    const fullDependency: Dependency = {
      ...dependency,
      id: this.generateDependencyId(),
      createdAt: new Date()
    }

    this.dependencies.set(fullDependency.id, fullDependency)
    this.updateDependencyGraph(fullDependency)
    
    return fullDependency.id
  }

  completeDependency(dependencyId: string, completedBy: AgentRole): void {
    const dependency = this.dependencies.get(dependencyId)
    if (!dependency) return

    dependency.status = 'completed'
    dependency.completedAt = new Date()

    this.notifyDependents(dependencyId)
    this.checkForBlockedAgents()
  }

  getBlockingDependencies(agent: AgentRole): Dependency[] {
    return Array.from(this.dependencies.values()).filter(
      dep => dep.to === agent && dep.status === 'pending'
    )
  }

  getAgentDependencies(agent: AgentRole): Dependency[] {
    return Array.from(this.dependencies.values()).filter(
      dep => dep.from === agent || dep.to === agent
    )
  }

  canAgentProceed(agent: AgentRole): boolean {
    const blocking = this.getBlockingDependencies(agent)
    return blocking.length === 0
  }

  private notifyDependents(completedDependencyId: string): void {
    const dependents = this.dependencyGraph.get(completedDependencyId) || new Set()
    
    for (const dependentId of dependents) {
      const dependent = this.dependencies.get(dependentId)
      if (dependent && this.canAgentProceed(dependent.to)) {
        this.emit('dependency:unblocked', { agent: dependent.to, dependency: dependent })
      }
    }
  }

  generateDependencyReport(): DependencyReport {
    const report: DependencyReport = {
      total: this.dependencies.size,
      completed: 0,
      pending: 0,
      blocked: 0,
      byAgent: {},
      criticalPath: this.findCriticalPath()
    }

    for (const dependency of this.dependencies.values()) {
      report[dependency.status]++
      
      if (!report.byAgent[dependency.from]) {
        report.byAgent[dependency.from] = { outgoing: 0, incoming: 0 }
      }
      if (!report.byAgent[dependency.to]) {
        report.byAgent[dependency.to] = { outgoing: 0, incoming: 0 }
      }
      
      report.byAgent[dependency.from].outgoing++
      report.byAgent[dependency.to].incoming++
    }

    return report
  }
}
```

### 3. Handoff Manager
```typescript
// src/coordination/HandoffManager.ts
export interface Handoff {
  id: string
  from: AgentRole
  to: AgentRole
  deliverables: Deliverable[]
  requirements: Requirement[]
  validation: ValidationCriteria[]
  status: 'pending' | 'in-progress' | 'completed' | 'rejected'
  signoffs: Map<AgentRole, Signoff>
  createdAt: Date
  completedAt?: Date
  notes?: string
}

export class HandoffManager {
  private handoffs: Map<string, Handoff> = new Map()
  private handoffTemplates: Map<string, HandoffTemplate> = new Map()

  initiateHandoff(handoff: Omit<Handoff, 'id' | 'status' | 'signoffs' | 'createdAt'>): string {
    const fullHandoff: Handoff = {
      ...handoff,
      id: this.generateHandoffId(),
      status: 'pending',
      signoffs: new Map(),
      createdAt: new Date()
    }

    this.handoffs.set(fullHandoff.id, fullHandoff)
    this.notifyHandoffInitiated(fullHandoff)
    
    return fullHandoff.id
  }

  acceptHandoff(handoffId: string, agent: AgentRole, notes?: string): void {
    const handoff = this.handoffs.get(handoffId)
    if (!handoff || handoff.to !== agent) return

    handoff.signoffs.set(agent, {
      agent,
      status: 'accepted',
      timestamp: new Date(),
      notes
    })

    this.evaluateHandoffStatus(handoffId)
  }

  rejectHandoff(handoffId: string, agent: AgentRole, reason: string): void {
    const handoff = this.handoffs.get(handoffId)
    if (!handoff || handoff.to !== agent) return

    handoff.status = 'rejected'
    handoff.notes = reason
    handoff.signoffs.set(agent, {
      agent,
      status: 'rejected',
      timestamp: new Date(),
      notes: reason
    })

    this.notifyHandoffRejected(handoff)
  }

  completeHandoff(handoffId: string, agent: AgentRole): void {
    const handoff = this.handoffs.get(handoffId)
    if (!handoff || handoff.to !== agent) return

    handoff.status = 'completed'
    handoff.completedAt = new Date()
    handoff.signoffs.set(agent, {
      agent,
      status: 'completed',
      timestamp: new Date()
    })

    this.notifyHandoffCompleted(handoff)
  }

  validateDeliverables(handoffId: string, validation: ValidationResult[]): void {
    const handoff = this.handoffs.get(handoffId)
    if (!handoff) return

    const allValid = validation.every(v => v.passed)
    
    if (allValid) {
      this.completeHandoff(handoffId, handoff.to)
    } else {
      this.notifyValidationFailed(handoff, validation)
    }
  }

  private evaluateHandoffStatus(handoffId: string): void {
    const handoff = this.handoffs.get(handoffId)
    if (!handoff) return

    const acceptance = handoff.signoffs.get(handoff.to)
    if (acceptance?.status === 'accepted') {
      handoff.status = 'in-progress'
      this.notifyHandoffAccepted(handoff)
    }
  }
}
```

### 4. Conflict Resolution System
```typescript
// src/coordination/ConflictResolver.ts
export interface Conflict {
  id: string
  type: 'scope' | 'resource' | 'dependency' | 'communication' | 'priority'
  severity: 'low' | 'medium' | 'high' | 'critical'
  agents: AgentRole[]
  description: string
  context: Record<string, any>
  status: 'active' | 'resolving' | 'resolved' | 'escalated'
  resolution?: ConflictResolution
  createdAt: Date
  resolvedAt?: Date
}

export class ConflictResolver {
  private conflicts: Map<string, Conflict> = new Map()
  private resolutionStrategies: Map<string, ResolutionStrategy> = new Map()

  detectConflict(conflict: Omit<Conflict, 'id' | 'status' | 'createdAt'>): string {
    const fullConflict: Conflict = {
      ...conflict,
      id: this.generateConflictId(),
      status: 'active',
      createdAt: new Date()
    }

    this.conflicts.set(fullConflict.id, fullConflict)
    this.attemptAutoResolution(fullConflict.id)
    
    return fullConflict.id
  }

  private attemptAutoResolution(conflictId: string): void {
    const conflict = this.conflicts.get(conflictId)
    if (!conflict) return

    const strategy = this.selectResolutionStrategy(conflict)
    
    if (strategy.autoResolve) {
      this.applyResolution(conflictId, strategy.generateResolution(conflict))
    } else {
      this.escalateConflict(conflictId)
    }
  }

  private selectResolutionStrategy(conflict: Conflict): ResolutionStrategy {
    // Strategy selection logic based on conflict type and severity
    switch (conflict.type) {
      case 'scope':
        return new ScopeConflictStrategy()
      case 'resource':
        return new ResourceConflictStrategy()
      case 'dependency':
        return new DependencyConflictStrategy()
      case 'communication':
        return new CommunicationConflictStrategy()
      case 'priority':
        return new PriorityConflictStrategy()
      default:
        return new DefaultConflictStrategy()
    }
  }

  applyResolution(conflictId: string, resolution: ConflictResolution): void {
    const conflict = this.conflicts.get(conflictId)
    if (!conflict) return

    conflict.status = 'resolved'
    conflict.resolution = resolution
    conflict.resolvedAt = new Date()

    this.notifyConflictResolved(conflict)
    this.implementResolution(resolution)
  }

  escalateConflict(conflictId: string): void {
    const conflict = this.conflicts.get(conflictId)
    if (!conflict) return

    conflict.status = 'escalated'
    this.notifyConflictEscalated(conflict)
  }
}
```

---

## Usage Patterns

### 1. Basic Agent Coordination
```typescript
// Initialize coordination system
const messageBus = new MessageBus()
const dependencyManager = new DependencyManager()
const handoffManager = new HandoffManager()
const conflictResolver = new ConflictResolver()

// Set up agent subscriptions
messageBus.subscribe('frontend', 'frontend-001')
messageBus.subscribe('backend', 'backend-001')
messageBus.subscribe('data', 'data-001')

// Handle agent messages
messageBus.on('agent:frontend:message', (message) => {
  console.log(`Frontend received: ${message.subject}`)
})

// Create dependencies between agents
const apiDependency = dependencyManager.addDependency({
  from: 'backend',
  to: 'frontend',
  type: 'api',
  description: 'User API endpoints',
  requiredFor: ['user-management', 'authentication']
})
```

### 2. Handoff Management
```typescript
// Initiate handoff from Backend to Frontend
const handoffId = handoffManager.initiateHandoff({
  from: 'backend',
  to: 'frontend',
  deliverables: [
    { type: 'api', name: 'User API', endpoint: '/api/users' },
    { type: 'api', name: 'Auth API', endpoint: '/api/auth' }
  ],
  requirements: [
    { type: 'validation', description: 'All endpoints must be tested' },
    { type: 'documentation', description: 'API documentation included' }
  ],
  validation: [
    { type: 'test', criteria: 'All integration tests pass' },
    { type: 'performance', criteria: 'Response time < 200ms' }
  ]
})

// Frontend accepts handoff
handoffManager.acceptHandoff(handoffId, 'frontend', 'APIs look good, proceeding with integration')
```

### 3. Conflict Detection and Resolution
```typescript
// Detect scope conflict
const conflictId = conflictResolver.detectConflict({
  type: 'scope',
  severity: 'medium',
  agents: ['frontend', 'backend'],
  description: 'Both agents modifying user authentication flow',
  context: {
    frontendChanges: ['login-form', 'auth-hooks'],
    backendChanges: ['auth-middleware', 'jwt-handling']
  }
})

// Handle conflict resolution
conflictResolver.on('conflict:resolved', (conflict) => {
  console.log(`Conflict resolved: ${conflict.resolution?.strategy}`)
})
```

### 4. Advanced Coordination Patterns
```typescript
// Coordinator class that ties everything together
export class AgentCoordinator {
  constructor(
    private messageBus: MessageBus,
    private dependencyManager: DependencyManager,
    private handoffManager: HandoffManager,
    private conflictResolver: ConflictResolver
  ) {
    this.setupEventHandlers()
  }

  private setupEventHandlers(): void {
    // Handle dependency completion
    this.dependencyManager.on('dependency:unblocked', ({ agent }) => {
      this.messageBus.send({
        from: 'coordinator',
        to: agent,
        type: 'update',
        priority: 'medium',
        subject: 'Dependencies cleared',
        content: 'Your dependencies are now complete. You may proceed.'
      })
    })

    // Handle handoff events
    this.handoffManager.on('handoff:completed', (handoff) => {
      this.messageBus.send({
        from: 'coordinator',
        to: 'all',
        type: 'update',
        priority: 'low',
        subject: `Handoff completed: ${handoff.from} → ${handoff.to}`,
        content: `${handoff.deliverables.length} deliverables transferred successfully.`
      })
    })

    // Handle conflicts
    this.conflictResolver.on('conflict:escalated', (conflict) => {
      this.messageBus.send({
        from: 'coordinator',
        to: 'all',
        type: 'escalation',
        priority: 'high',
        subject: `Conflict escalated: ${conflict.type}`,
        content: conflict.description
      })
    })
  }

  generateCoordinationReport(): CoordinationReport {
    return {
      messages: this.messageBus.getMessageStats(),
      dependencies: this.dependencyManager.generateDependencyReport(),
      handoffs: this.handoffManager.generateHandoffReport(),
      conflicts: this.conflictResolver.generateConflictReport(),
      timestamp: new Date()
    }
  }
}
```

---

## Monitoring & Analytics

### Real-time Dashboard
```typescript
// Generate real-time coordination metrics
const dashboard = {
  activeAgents: messageBus.getActiveAgents(),
  pendingDependencies: dependencyManager.getPendingCount(),
  activeHandoffs: handoffManager.getActiveCount(),
  activeConflicts: conflictResolver.getActiveCount(),
  messageVolume: messageBus.getMessageVolume(),
  averageResponseTime: messageBus.getAverageResponseTime()
}
```

### Performance Metrics
```typescript
interface CoordinationMetrics {
  throughput: {
    messagesPerMinute: number
    handoffsPerHour: number
    resolutionsPerHour: number
  }
  latency: {
    averageMessageDelivery: number
    averageDependencyResolution: number
    averageHandoffCompletion: number
  }
  efficiency: {
    agentUtilization: Map<AgentRole, number>
    dependencySatisfactionRate: number
    conflictResolutionRate: number
  }
}
```

---

## Best Practices

1. **Clear Communication Protocols**: Define message types and formats upfront
2. **Dependency Management**: Track all cross-agent dependencies explicitly
3. **Handoff Validation**: Always validate deliverables before completing handoffs
4. **Conflict Prevention**: Use clear boundaries to prevent scope conflicts
5. **Monitoring**: Track coordination metrics to identify bottlenecks
6. **Escalation Paths**: Define clear escalation procedures for unresolved conflicts

---

## Environment Variables

```bash
# Message Bus Configuration
MESSAGE_BUS_RETENTION_HOURS=24
MESSAGE_BUS_MAX_SIZE=10000

# Dependency Management
DEPENDENCY_TIMEOUT_HOURS=8
DEPENDENCY_AUTO_ESCALATION=true

# Handoff Management
HANDOFF_TIMEOUT_HOURS=4
HANDOFF_AUTO_REJECTION=true

# Conflict Resolution
CONFLICT_ESCALATION_THRESHOLD=medium
CONFLICT_AUTO_RESOLUTION=true
```
