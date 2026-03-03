---
name: tool-agent-roles
description: >
  Agent role management system defining responsibilities, capabilities, and
  boundaries for specialized agents. Includes role definitions, permission
  management, capability mapping, and role-based access control. Use when
  defining agent teams, managing agent responsibilities, or enforcing role
  boundaries in multi-agent systems.
triggers:
  - 'agent roles'
  - 'role management'
  - 'agent permissions'
  - 'agent responsibilities'
  - 'role boundaries'
  - 'agent capabilities'
  - 'define agent roles'
---

# Tool: Agent Roles

Comprehensive role management system for defining and managing agent
responsibilities, capabilities, and boundaries in multi-agent environments.

---

## Setup

```bash
npm install @types/node jsonwebtoken bcrypt
```

---

## Core Role System

### 1. Role Definition Framework

```typescript
// src/roles/RoleDefinition.ts
export interface AgentRole {
  id: string
  name: string
  description: string
  category: 'technical' | 'business' | 'coordination' | 'quality'
  level: 'junior' | 'senior' | 'lead' | 'principal'
  capabilities: Capability[]
  responsibilities: Responsibility[]
  permissions: Permission[]
  boundaries: Boundary[]
  dependencies: RoleDependency[]
  metadata: RoleMetadata
}

export interface Capability {
  id: string
  name: string
  type: 'skill' | 'tool' | 'resource' | 'decision'
  level: 'basic' | 'intermediate' | 'advanced' | 'expert'
  required: boolean
  description: string
  validation?: ValidationCriteria
}

export interface Responsibility {
  id: string
  area: string
  tasks: string[]
  outcomes: string[]
  metrics: string[]
  dependencies: string[]
  priority: 'low' | 'medium' | 'high' | 'critical'
}

export interface Permission {
  resource: string
  actions: ('create' | 'read' | 'update' | 'delete' | 'execute')[]
  scope: 'own' | 'team' | 'project' | 'global'
  conditions?: PermissionCondition[]
}

export interface Boundary {
  type: 'scope' | 'resource' | 'communication' | 'decision'
  description: string
  enforcement: 'soft' | 'hard' | 'critical'
  violations: ViolationAction
}
```

### 2. Predefined Agent Roles

```typescript
// src/roles/PredefinedRoles.ts

export const PRODUCT_MANAGER_ROLE: AgentRole = {
  id: 'product-manager',
  name: 'Product Manager',
  description:
    'Manages product requirements, prioritization, and stakeholder communication',
  category: 'business',
  level: 'senior',
  capabilities: [
    {
      id: 'requirements-gathering',
      name: 'Requirements Gathering',
      type: 'skill',
      level: 'expert',
      required: true,
      description: 'Elicit and document user requirements',
    },
    {
      id: 'stakeholder-management',
      name: 'Stakeholder Management',
      type: 'skill',
      level: 'advanced',
      required: true,
      description: 'Manage stakeholder expectations and communication',
    },
    {
      id: 'prioritization',
      name: 'Prioritization',
      type: 'decision',
      level: 'expert',
      required: true,
      description: 'Prioritize features and tasks based on business value',
    },
  ],
  responsibilities: [
    {
      id: 'product-requirements',
      area: 'Product Planning',
      tasks: [
        'Gather user requirements',
        'Create product specifications',
        'Define acceptance criteria',
        'Maintain product backlog',
      ],
      outcomes: [
        'Clear product requirements',
        'Prioritized feature list',
        'User story documentation',
      ],
      metrics: [
        'Requirements clarity score',
        'Stakeholder satisfaction',
        'Feature delivery timeline',
      ],
      dependencies: ['user-research', 'business-goals'],
      priority: 'critical',
    },
  ],
  permissions: [
    {
      resource: 'product-requirements',
      actions: ['create', 'read', 'update', 'delete'],
      scope: 'project',
    },
    {
      resource: 'feature-priorities',
      actions: ['create', 'read', 'update'],
      scope: 'project',
    },
  ],
  boundaries: [
    {
      type: 'scope',
      description: 'Cannot make technical implementation decisions',
      enforcement: 'hard',
      violations: 'escalate-to-architect',
    },
    {
      type: 'decision',
      description: 'Must consult technical team for feasibility assessments',
      enforcement: 'soft',
      violations: 'notify-architect',
    },
  ],
  dependencies: [],
  metadata: {
    created: new Date(),
    version: '1.0.0',
    author: 'system',
  },
}

export const ARCHITECT_ROLE: AgentRole = {
  id: 'architect',
  name: 'System Architect',
  description:
    'Designs system architecture, makes technical decisions, and ensures technical feasibility',
  category: 'technical',
  level: 'principal',
  capabilities: [
    {
      id: 'system-design',
      name: 'System Design',
      type: 'skill',
      level: 'expert',
      required: true,
      description: 'Design scalable and maintainable system architecture',
    },
    {
      id: 'technology-selection',
      name: 'Technology Selection',
      type: 'decision',
      level: 'expert',
      required: true,
      description: 'Select appropriate technologies and frameworks',
    },
    {
      id: 'technical-feasibility',
      name: 'Technical Feasibility Assessment',
      type: 'skill',
      level: 'advanced',
      required: true,
      description: 'Assess technical feasibility of requirements',
    },
  ],
  responsibilities: [
    {
      id: 'system-architecture',
      area: 'Technical Design',
      tasks: [
        'Design system architecture',
        'Create technical specifications',
        'Define integration patterns',
        'Document design decisions',
      ],
      outcomes: [
        'System architecture diagrams',
        'Technical specifications',
        'API contracts',
        'Design decision records',
      ],
      metrics: [
        'System scalability',
        'Technical debt ratio',
        'Architecture compliance',
      ],
      dependencies: ['product-requirements', 'business-constraints'],
      priority: 'critical',
    },
  ],
  permissions: [
    {
      resource: 'architecture-documents',
      actions: ['create', 'read', 'update', 'delete'],
      scope: 'project',
    },
    {
      resource: 'technology-stack',
      actions: ['create', 'read', 'update'],
      scope: 'project',
    },
  ],
  boundaries: [
    {
      type: 'scope',
      description: 'Cannot implement business logic',
      enforcement: 'hard',
      violations: 'block-implementation',
    },
    {
      type: 'resource',
      description: 'Cannot access production databases directly',
      enforcement: 'critical',
      violations: 'security-alert',
    },
  ],
  dependencies: [],
  metadata: {
    created: new Date(),
    version: '1.0.0',
    author: 'system',
  },
}

export const FRONTEND_DEVELOPER_ROLE: AgentRole = {
  id: 'frontend-developer',
  name: 'Frontend Developer',
  description:
    'Implements user interfaces, client-side logic, and user experience',
  category: 'technical',
  level: 'senior',
  capabilities: [
    {
      id: 'ui-implementation',
      name: 'UI Implementation',
      type: 'skill',
      level: 'expert',
      required: true,
      description: 'Implement user interfaces using modern frameworks',
    },
    {
      id: 'client-state-management',
      name: 'Client State Management',
      type: 'skill',
      level: 'advanced',
      required: true,
      description: 'Manage client-side application state',
    },
    {
      id: 'responsive-design',
      name: 'Responsive Design',
      type: 'skill',
      level: 'intermediate',
      required: true,
      description: 'Create responsive and accessible user interfaces',
    },
  ],
  responsibilities: [
    {
      id: 'frontend-implementation',
      area: 'Frontend Development',
      tasks: [
        'Implement UI components',
        'Create client-side logic',
        'Handle user interactions',
        'Optimize performance',
      ],
      outcomes: [
        'Functional user interface',
        'Responsive design',
        'Accessible components',
        'Optimized performance',
      ],
      metrics: [
        'Page load speed',
        'User interaction latency',
        'Accessibility compliance',
        'Cross-browser compatibility',
      ],
      dependencies: ['design-specifications', 'api-contracts'],
      priority: 'high',
    },
  ],
  permissions: [
    {
      resource: 'frontend-code',
      actions: ['create', 'read', 'update', 'delete'],
      scope: 'own',
    },
    {
      resource: 'ui-components',
      actions: ['create', 'read', 'update'],
      scope: 'team',
    },
  ],
  boundaries: [
    {
      type: 'scope',
      description: 'Cannot access backend databases or services',
      enforcement: 'hard',
      violations: 'security-alert',
    },
    {
      type: 'resource',
      description: 'Cannot modify API contracts',
      enforcement: 'soft',
      violations: 'notify-backend',
    },
  ],
  dependencies: [],
  metadata: {
    created: new Date(),
    version: '1.0.0',
    author: 'system',
  },
}

export const BACKEND_DEVELOPER_ROLE: AgentRole = {
  id: 'backend-developer',
  name: 'Backend Developer',
  description: 'Implements server-side logic, APIs, and data management',
  category: 'technical',
  level: 'senior',
  capabilities: [
    {
      id: 'api-development',
      name: 'API Development',
      type: 'skill',
      level: 'expert',
      required: true,
      description: 'Develop RESTful APIs and GraphQL endpoints',
    },
    {
      id: 'database-management',
      name: 'Database Management',
      type: 'skill',
      level: 'advanced',
      required: true,
      description: 'Design and manage database schemas',
    },
    {
      id: 'business-logic',
      name: 'Business Logic Implementation',
      type: 'skill',
      level: 'expert',
      required: true,
      description: 'Implement core business logic and services',
    },
  ],
  responsibilities: [
    {
      id: 'backend-implementation',
      area: 'Backend Development',
      tasks: [
        'Implement API endpoints',
        'Design database schema',
        'Write business logic',
        'Handle authentication',
      ],
      outcomes: [
        'Functional APIs',
        'Optimized database',
        'Secure authentication',
        'Business logic services',
      ],
      metrics: [
        'API response time',
        'Database query performance',
        'Security compliance',
        'Code coverage',
      ],
      dependencies: ['architecture-design', 'database-schema'],
      priority: 'high',
    },
  ],
  permissions: [
    {
      resource: 'backend-code',
      actions: ['create', 'read', 'update', 'delete'],
      scope: 'own',
    },
    {
      resource: 'database-schema',
      actions: ['read', 'update'],
      scope: 'team',
    },
  ],
  boundaries: [
    {
      type: 'scope',
      description: 'Cannot implement UI components',
      enforcement: 'hard',
      violations: 'block-implementation',
    },
    {
      type: 'resource',
      description: 'Cannot access production data without approval',
      enforcement: 'critical',
      violations: 'security-alert',
    },
  ],
  dependencies: [],
  metadata: {
    created: new Date(),
    version: '1.0.0',
    author: 'system',
  },
}
```

### 3. Role Manager

```typescript
// src/roles/RoleManager.ts
export class RoleManager {
  private roles: Map<string, AgentRole> = new Map()
  private roleAssignments: Map<string, RoleAssignment> = new Map()
  private permissionCache: Map<string, PermissionSet> = new Map()

  constructor() {
    this.loadPredefinedRoles()
  }

  private loadPredefinedRoles(): void {
    const predefinedRoles = [
      PRODUCT_MANAGER_ROLE,
      ARCHITECT_ROLE,
      FRONTEND_DEVELOPER_ROLE,
      BACKEND_DEVELOPER_ROLE,
      // Add more predefined roles as needed
    ]

    predefinedRoles.forEach(role => {
      this.roles.set(role.id, role)
    })
  }

  createRole(role: Omit<AgentRole, 'id' | 'metadata'>): string {
    const fullRole: AgentRole = {
      ...role,
      id: this.generateRoleId(),
      metadata: {
        created: new Date(),
        version: '1.0.0',
        author: 'user',
      },
    }

    this.roles.set(fullRole.id, fullRole)
    this.invalidatePermissionCache()

    return fullRole.id
  }

  assignRole(
    agentId: string,
    roleId: string,
    context: AssignmentContext
  ): void {
    const role = this.roles.get(roleId)
    if (!role) {
      throw new Error(`Role ${roleId} not found`)
    }

    const assignment: RoleAssignment = {
      agentId,
      roleId,
      assignedAt: new Date(),
      assignedBy: context.assignedBy,
      context: context.projectId,
      status: 'active',
      permissions: this.calculatePermissions(roleId),
    }

    this.roleAssignments.set(agentId, assignment)
    this.invalidatePermissionCache(agentId)
  }

  hasPermission(agentId: string, resource: string, action: string): boolean {
    const permissions = this.getAgentPermissions(agentId)
    return permissions.some(
      p => p.resource === resource && p.actions.includes(action as any)
    )
  }

  getAgentPermissions(agentId: string): Permission[] {
    const cached = this.permissionCache.get(agentId)
    if (cached) {
      return cached.permissions
    }

    const assignment = this.roleAssignments.get(agentId)
    if (!assignment) {
      return []
    }

    const role = this.roles.get(assignment.roleId)
    if (!role) {
      return []
    }

    const permissions = this.calculatePermissions(assignment.roleId)
    this.permissionCache.set(agentId, {permissions, timestamp: new Date()})

    return permissions
  }

  private calculatePermissions(roleId: string): Permission[] {
    const role = this.roles.get(roleId)
    if (!role) return []

    // Start with direct role permissions
    let permissions = [...role.permissions]

    // Add inherited permissions from dependencies
    for (const dep of role.dependencies) {
      const depRole = this.roles.get(dep.roleId)
      if (depRole) {
        permissions = this.mergePermissions(
          permissions,
          depRole.permissions,
          dep.scope
        )
      }
    }

    return permissions
  }

  validateRoleBoundary(
    roleId: string,
    action: string,
    resource: string
  ): BoundaryValidation {
    const role = this.roles.get(roleId)
    if (!role) {
      return {valid: false, violation: 'Role not found'}
    }

    for (const boundary of role.boundaries) {
      if (this.violatesBoundary(boundary, action, resource)) {
        return {
          valid: false,
          violation: boundary.description,
          enforcement: boundary.enforcement,
          action: boundary.violations,
        }
      }
    }

    return {valid: true}
  }

  getRoleCapabilities(roleId: string): Capability[] {
    const role = this.roles.get(roleId)
    return role?.capabilities || []
  }

  getAgentCapabilities(agentId: string): Capability[] {
    const assignment = this.roleAssignments.get(agentId)
    if (!assignment) return []

    return this.getRoleCapabilities(assignment.roleId)
  }

  generateRoleReport(roleId: string): RoleReport {
    const role = this.roles.get(roleId)
    if (!role) {
      throw new Error(`Role ${roleId} not found`)
    }

    const assignments = Array.from(this.roleAssignments.values()).filter(
      a => a.roleId === roleId
    )

    return {
      role,
      activeAssignments: assignments.length,
      assignedAgents: assignments.map(a => a.agentId),
      utilization: this.calculateRoleUtilization(roleId),
      performance: this.calculateRolePerformance(roleId),
    }
  }
}
```

### 4. Role-Based Access Control

```typescript
// src/roles/AccessControl.ts
export class AccessControl {
  constructor(private roleManager: RoleManager) {}

  checkAccess(
    agentId: string,
    resource: string,
    action: string,
    context?: AccessContext
  ): AccessResult {
    // Check if agent has permission
    const hasPermission = this.roleManager.hasPermission(
      agentId,
      resource,
      action
    )
    if (!hasPermission) {
      return {
        allowed: false,
        reason: 'Insufficient permissions',
        requiredPermissions: [{resource, action}],
      }
    }

    // Get agent's role
    const assignment = this.roleManager.getAgentAssignment(agentId)
    if (!assignment) {
      return {
        allowed: false,
        reason: 'No role assignment found',
      }
    }

    // Check role boundaries
    const boundaryValidation = this.roleManager.validateRoleBoundary(
      assignment.roleId,
      action,
      resource
    )
    if (!boundaryValidation.valid) {
      return {
        allowed: false,
        reason: `Role boundary violation: ${boundaryValidation.violation}`,
        enforcement: boundaryValidation.enforcement,
        action: boundaryValidation.action,
      }
    }

    // Check contextual constraints
    const contextValidation = this.validateContext(
      agentId,
      resource,
      action,
      context
    )
    if (!contextValidation.valid) {
      return {
        allowed: false,
        reason: contextValidation.reason,
      }
    }

    return {
      allowed: true,
      grantedAt: new Date(),
      scope: this.determineAccessScope(agentId, resource),
    }
  }

  private validateContext(
    agentId: string,
    resource: string,
    action: string,
    context?: AccessContext
  ): ContextValidation {
    if (!context) return {valid: true}

    // Check time-based restrictions
    if (context.timeRestrictions) {
      const now = new Date()
      const currentTime = now.getHours() * 60 + now.getMinutes()

      if (
        context.timeRestrictions.start &&
        currentTime < context.timeRestrictions.start
      ) {
        return {valid: false, reason: 'Access outside allowed time window'}
      }

      if (
        context.timeRestrictions.end &&
        currentTime > context.timeRestrictions.end
      ) {
        return {valid: false, reason: 'Access outside allowed time window'}
      }
    }

    // Check location-based restrictions
    if (context.locationRestrictions) {
      // Implement location validation logic
    }

    // Check project-based restrictions
    if (context.projectRestrictions) {
      const assignment = this.roleManager.getAgentAssignment(agentId)
      if (
        assignment &&
        !context.projectRestrictions.includes(assignment.context)
      ) {
        return {valid: false, reason: 'Access not allowed for this project'}
      }
    }

    return {valid: true}
  }

  createAccessPolicy(agentId: string, policies: AccessPolicy[]): void {
    // Store and manage access policies for agents
  }

  auditAccess(agentId: string, timeRange: TimeRange): AccessAudit {
    // Generate access audit reports
    return {
      agentId,
      timeRange,
      accessAttempts: [],
      violations: [],
      grantedAccess: 0,
      deniedAccess: 0,
    }
  }
}
```

---

## Usage Examples

### 1. Setting Up Agent Roles

```typescript
// Initialize role manager
const roleManager = new RoleManager()

// Create custom role
const customRole = roleManager.createRole({
  name: 'DevOps Engineer',
  description: 'Manages infrastructure, deployment, and monitoring',
  category: 'technical',
  level: 'senior',
  capabilities: [
    {
      id: 'infrastructure-management',
      name: 'Infrastructure Management',
      type: 'skill',
      level: 'expert',
      required: true,
      description: 'Manage cloud infrastructure and deployments',
    },
  ],
  responsibilities: [
    {
      id: 'deployment',
      area: 'DevOps',
      tasks: ['Deploy applications', 'Monitor infrastructure'],
      outcomes: ['Successful deployments', 'System monitoring'],
      metrics: ['Deployment success rate', 'System uptime'],
      dependencies: ['application-code'],
      priority: 'high',
    },
  ],
  permissions: [
    {
      resource: 'infrastructure',
      actions: ['create', 'read', 'update', 'delete'],
      scope: 'project',
    },
  ],
  boundaries: [
    {
      type: 'scope',
      description: 'Cannot modify application business logic',
      enforcement: 'hard',
      violations: 'block-action',
    },
  ],
  dependencies: [],
})

// Assign role to agent
roleManager.assignRole('agent-001', customRole, {
  assignedBy: 'system',
  projectId: 'project-123',
})
```

### 2. Access Control

```typescript
// Initialize access control
const accessControl = new AccessControl(roleManager)

// Check access permissions
const accessResult = accessControl.checkAccess(
  'agent-001',
  'infrastructure',
  'create',
  {
    projectRestrictions: ['project-123'],
    timeRestrictions: {start: 9 * 60, end: 17 * 60}, // 9 AM to 5 PM
  }
)

if (accessResult.allowed) {
  console.log('Access granted')
} else {
  console.log(`Access denied: ${accessResult.reason}`)
}
```

### 3. Role Validation

```typescript
// Validate agent capabilities
const capabilities = roleManager.getAgentCapabilities('agent-001')
const hasRequiredCapability = capabilities.some(
  cap => cap.id === 'infrastructure-management' && cap.level === 'expert'
)

// Check role boundaries
const boundaryCheck = roleManager.validateRoleBoundary(
  'devops-engineer',
  'modify',
  'business-logic'
)

if (!boundaryCheck.valid) {
  console.log(`Boundary violation: ${boundaryCheck.violation}`)
}
```

---

## Role Templates

### Quick-Start Role Templates

```typescript
// Standard role templates for common agent types
export const ROLE_TEMPLATES = {
  'full-stack-developer': {
    baseRole: BACKEND_DEVELOPER_ROLE,
    additionalCapabilities: [
      FRONTEND_DEVELOPER_ROLE.capabilities.find(
        c => c.id === 'ui-implementation'
      ),
    ],
    additionalPermissions: [
      FRONTEND_DEVELOPER_ROLE.permissions.find(
        p => p.resource === 'frontend-code'
      ),
    ],
  },
  'tech-lead': {
    baseRole: ARCHITECT_ROLE,
    additionalCapabilities: [
      {
        id: 'team-leadership',
        name: 'Team Leadership',
        type: 'skill',
        level: 'advanced',
        required: true,
        description: 'Lead development team and coordinate work',
      },
    ],
    additionalPermissions: [
      {
        resource: 'team-management',
        actions: ['read', 'update'],
        scope: 'team',
      },
    ],
  },
}
```

---

## Best Practices

1. **Principle of Least Privilege**: Grant only necessary permissions for each
   role
2. **Clear Boundaries**: Define explicit role boundaries to prevent scope creep
3. **Regular Audits**: Periodically review role assignments and permissions
4. **Role Evolution**: Update roles as project needs and responsibilities change
5. **Documentation**: Maintain clear documentation of role definitions and
   changes
6. **Separation of Duties**: Ensure critical actions require multiple role
   approvals

---

## Environment Variables

```bash
# Role Management Configuration
ROLE_CACHE_TTL=3600
ROLE_VALIDATION_STRICT=true
BOUNDARY_ENFORCEMENT=true

# Access Control Configuration
ACCESS_LOG_LEVEL=info
ACCESS_AUDIT_RETENTION_DAYS=90
SESSION_TIMEOUT_MINUTES=30

# Security Configuration
JWT_SECRET=your-secret-key
PERMISSION_CACHE_SIZE=1000
RATE_LIMIT_REQUESTS_PER_MINUTE=100
```
