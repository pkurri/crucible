export interface Skill {
  id: string
  name: string
  description: string
  category: 'workflow' | 'tool' | 'pattern'
  triggers: string[]
  path: string
  content: string
  createdAt: Date
  updatedAt: Date
}

export interface Agent {
  id: string
  name: string
  role: AgentRole
  status: 'active' | 'idle' | 'busy' | 'offline'
  capabilities: string[]
  currentTask?: string
  performance: AgentPerformance
}

export type AgentRole = 
  | 'product-manager'
  | 'architect'
  | 'frontend-developer'
  | 'backend-developer'
  | 'devops-engineer'
  | 'qa-engineer'

export interface AgentPerformance {
  productivity: number
  communication: number
  collaboration: number
  quality: number
}

export interface AgentTeam {
  id: string
  name: string
  description: string
  agents: Agent[]
  project: string
  status: 'planning' | 'active' | 'completed'
  createdAt: Date
}

export interface Message {
  id: string
  from: string
  to: string | 'all'
  type: 'request' | 'response' | 'update' | 'blocker'
  priority: 'low' | 'medium' | 'high' | 'critical'
  subject: string
  content: string
  timestamp: Date
  read: boolean
}

export interface Metric {
  id: string
  agentId: string
  timestamp: Date
  type: 'productivity' | 'communication' | 'collaboration' | 'performance'
  value: number
  metadata?: Record<string, any>
}

export interface SearchFilters {
  query: string
  category?: Skill['category']
  tags?: string[]
}

export interface DashboardStats {
  totalSkills: number
  totalAgents: number
  activeTeams: number
  avgPerformance: number
}
