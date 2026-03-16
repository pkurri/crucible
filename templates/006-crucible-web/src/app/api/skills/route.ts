import { NextResponse } from 'next/server'

const SKILLS = [
  {
    id: 'workflow-multi-agent-orchestrator',
    name: 'Multi-Agent Orchestrator',
    description: 'Voxyz-style orchestration coordinating 6+ specialized agents with role-based communication',
    category: 'workflow',
    triggers: ['multi-agent team', 'orchestrate agents', 'coordinate multiple agents'],
  },
  {
    id: 'workflow-multi-agent-build',
    name: 'Multi-Agent Build',
    description: 'Enhanced build system with specialized agents for parallel development',
    category: 'workflow',
    triggers: ['in parallel', 'simultaneously', 'multi-agent'],
  },
  {
    id: 'tool-agent-coordinator',
    name: 'Agent Coordinator',
    description: 'Message routing, dependency tracking, and conflict resolution for multi-agent systems',
    category: 'tool',
    triggers: ['coordinate agents', 'agent communication', 'message routing'],
  },
  {
    id: 'tool-agent-roles',
    name: 'Agent Roles',
    description: 'Role management system with permissions, capabilities, and RBAC',
    category: 'tool',
    triggers: ['agent roles', 'role management', 'agent permissions'],
  },
  {
    id: 'tool-agent-monitoring',
    name: 'Agent Monitoring',
    description: 'Performance monitoring, analytics, and real-time dashboards',
    category: 'tool',
    triggers: ['agent monitoring', 'performance metrics', 'agent analytics'],
  },
  {
    id: 'compliance-circuit-breaker',
    name: 'Circuit Breaker Governance',
    description: 'Autonomous financial safety gate that terminates agentic loops and runaway token expenditure',
    category: 'compliance',
    triggers: ['cost control', 'limit tokens', 'stop loops'],
  },
  {
    id: 'security-pii-scrubber',
    name: 'PII Signature Redaction',
    description: 'High-precision security layer that redacts sensitive PII and API keys from agent transmissions',
    category: 'security',
    triggers: ['redact pii', 'hide secrets', 'secure transmission'],
  },
  {
    id: 'governance-logic-audit',
    name: 'Logic Scrutiny & Alignment',
    description: 'Post-execution validation that ensures agent trajectories remain aligned with enterprise constraints',
    category: 'compliance',
    triggers: ['verify logic', 'check alignment', 'audit reasoning'],
  },
  {
    id: 'review-code',
    name: 'Code Review',
    description: 'Thorough code review covering functionality, security, readability, and performance',
    category: 'workflow',
    triggers: ['review this code', 'code review', 'check this code'],
  },
]

export async function GET() {
  return NextResponse.json({ skills: SKILLS })
}
