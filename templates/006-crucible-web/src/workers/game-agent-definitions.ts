// ═══════════════════════════════════════════════════════════════════════
// NEON ARCADE — Agent Definitions & Role Configs
// ═══════════════════════════════════════════════════════════════════════

import type { AgentId, Phase } from '../lib/game-schemas';

// ─── Agent Role Config ──────────────────────────────────────────────

export interface AgentConfig {
  id: AgentId;
  codename: string;
  role: string;
  phase: Phase;
  emoji: string;
  upstream: AgentId | 'USER';
  downstream: AgentId | 'RELEASE';
  promptFile: string;
  maxIterations: number;
  timeoutMs: number;
  tools: string[];
  guardrails: string[];
}

// ─── The Neon Arcade Roster ─────────────────────────────────────────

export const AGENT_ROSTER: Record<AgentId, AgentConfig> = {
  PULSE: {
    id: 'PULSE',
    codename: 'PULSE',
    role: 'Market Analyst',
    phase: 'MARKET_FEASIBILITY',
    emoji: '📊',
    upstream: 'USER',
    downstream: 'SCHEMA',
    promptFile: 'agents/prompts/pulse-market-analyst.md',
    maxIterations: 1,
    timeoutMs: 120_000,
    tools: ['web_search', 'app_store_lookup', 'read_url', 'workspace_write'],
    guardrails: [
      'No fabrication of competitor data',
      'No scope creep — analyze only',
      'Mandatory verdict',
      'Token budget: 2000 tokens',
      'Triggers human checkpoint',
    ],
  },

  SCHEMA: {
    id: 'SCHEMA',
    codename: 'SCHEMA',
    role: 'Requirement Vetter',
    phase: 'MARKET_FEASIBILITY',
    emoji: '📋',
    upstream: 'PULSE',
    downstream: 'DISPATCH',
    promptFile: 'agents/prompts/schema-requirement-vetter.md',
    maxIterations: 1,
    timeoutMs: 120_000,
    tools: ['workspace_read', 'workspace_write', 'web_search', 'calculate'],
    guardrails: [
      'Exhaustive asset listing',
      'Engine justification ≥ 3 reasons',
      'No scope trimming',
      'Feasibility warnings if NO_GO',
      'Version-gated feature separation',
    ],
  },

  DISPATCH: {
    id: 'DISPATCH',
    codename: 'DISPATCH',
    role: 'Project Manager',
    phase: 'TASK_ARCHITECTURE',
    emoji: '📁',
    upstream: 'SCHEMA',
    downstream: 'PIXEL',
    promptFile: 'agents/prompts/dispatch-project-manager.md',
    maxIterations: 1,
    timeoutMs: 90_000,
    tools: ['workspace_read', 'workspace_write', 'calculate'],
    guardrails: [
      '100% PRD coverage',
      'Atomic tasks ≤ 4 hours',
      'Clear DoD for every task',
      'No circular dependencies',
      'No feature removal',
    ],
  },

  PIXEL: {
    id: 'PIXEL',
    codename: 'PIXEL',
    role: 'Software Engineer',
    phase: 'DEV_ITERATION',
    emoji: '💻',
    upstream: 'DISPATCH',
    downstream: 'GLITCH',
    promptFile: 'agents/prompts/pixel-software-engineer.md',
    maxIterations: 3,
    timeoutMs: 180_000,
    tools: ['workspace_read', 'workspace_write', 'code_lint', 'code_compile', 'web_search'],
    guardrails: [
      'One task at a time',
      'Compile clean before output',
      'DoD self-check required',
      'No dead code',
      'Max 200 lines per file',
      'Fix-it loop compliance',
    ],
  },

  GLITCH: {
    id: 'GLITCH',
    codename: 'GLITCH',
    role: 'QA & Debugger',
    phase: 'DEV_ITERATION',
    emoji: '🐛',
    upstream: 'PIXEL',
    downstream: 'TURBO',
    promptFile: 'agents/prompts/glitch-qa-debugger.md',
    maxIterations: 3,
    timeoutMs: 120_000,
    tools: ['workspace_read', 'workspace_write', 'code_lint', 'code_compile', 'static_analysis'],
    guardrails: [
      'Zero tolerance for criticals',
      'Max 3 iterations before escalate',
      'Constructive fixes required',
      'No direct code modification',
      'DoD verification mandatory',
    ],
  },

  TURBO: {
    id: 'TURBO',
    codename: 'TURBO',
    role: 'Performance Optimizer',
    phase: 'DEV_ITERATION',
    emoji: '⚡',
    upstream: 'GLITCH',
    downstream: 'SPECTRA',
    promptFile: 'agents/prompts/turbo-performance-optimizer.md',
    maxIterations: 2,
    timeoutMs: 90_000,
    tools: ['workspace_read', 'workspace_write', 'code_profile', 'calculate'],
    guardrails: [
      'Target-driven comparison',
      'Actionable RED/YELLOW fixes only',
      '80/20 focus',
      'No micro-optimizations',
      'Readability preserved',
    ],
  },

  SPECTRA: {
    id: 'SPECTRA',
    codename: 'SPECTRA',
    role: 'Playtest & Balance',
    phase: 'DEV_ITERATION',
    emoji: '🎮',
    upstream: 'TURBO',
    downstream: 'GATEWAY',
    promptFile: 'agents/prompts/spectra-playtest.md',
    maxIterations: 2,
    timeoutMs: 150_000,
    tools: ['workspace_read', 'workspace_write', 'calculate'],
    guardrails: [
      'Focus on "Fun Factor" (engagement loops)',
      'Balance difficulty curves',
      'No gameplay-breaking bugs',
      'Accessibility review mandatory',
    ],
  },

  GATEWAY: {
    id: 'GATEWAY',
    codename: 'GATEWAY',
    role: 'Store Policy Expert',
    phase: 'DEPLOYMENT_COMPLIANCE',
    emoji: '🏪',
    upstream: 'SPECTRA',
    downstream: 'GLITCH_MOD',
    promptFile: 'agents/prompts/gateway-store-policy-expert.md',
    maxIterations: 1,
    timeoutMs: 120_000,
    tools: ['workspace_read', 'workspace_write', 'web_search', 'read_url'],
    guardrails: [
      'Zero NON_COMPLIANT criticals',
      'Both Apple + Google review',
      'Current guidelines only',
      'Conservative flagging',
      'Privacy-first approach',
    ],
  },

  GLITCH_MOD: {
    id: 'GLITCH_MOD',
    codename: 'GLITCH_MOD',
    role: 'Hype & Social',
    phase: 'DEPLOYMENT_COMPLIANCE',
    emoji: '🤳',
    upstream: 'GATEWAY',
    downstream: 'RELEASE',
    promptFile: 'agents/prompts/glitch-mod-promotion.md',
    maxIterations: 1,
    timeoutMs: 90_000,
    tools: ['web_search', 'read_url'],
    guardrails: [
      'Viral post structure only',
      'Target Twitch/Discord/TikTok tags',
      'No deceptive marketing',
      'Highlight Pro tier features',
    ],
  },

  MAINFRAME: {
    id: 'MAINFRAME',
    codename: 'MAINFRAME',
    role: 'Orchestrator',
    phase: 'MARKET_FEASIBILITY',
    emoji: '🧠',
    upstream: 'USER',
    downstream: 'RELEASE',
    promptFile: '',
    maxIterations: 1,
    timeoutMs: 600_000,
    tools: ['all'],
    guardrails: [
      'Human checkpoint after PULSE',
      'Respect pipeline ordering',
      'Status reports at every stage',
    ],
  },
};

// ─── Pipeline Order ─────────────────────────────────────────────────

export const PIPELINE_STAGES: AgentId[] = [
  'PULSE',     // Phase 1
  'SCHEMA',    // Phase 1
  'DISPATCH',  // Phase 2
  'PIXEL',     // Phase 3 (loops with GLITCH/TURBO)
  'GLITCH',    // Phase 3
  'TURBO',     // Phase 3
  'SPECTRA',   // Phase 3
  'GATEWAY',   // Phase 4
  'GLITCH_MOD',// Phase 4
];

// ─── Phase Groupings ────────────────────────────────────────────────

export const PHASE_AGENTS: Record<Phase, AgentId[]> = {
  MARKET_FEASIBILITY:    ['PULSE', 'SCHEMA'],
  TASK_ARCHITECTURE:     ['DISPATCH'],
  DEV_ITERATION:         ['PIXEL', 'GLITCH', 'TURBO', 'SPECTRA'],
  DEPLOYMENT_COMPLIANCE: ['GATEWAY', 'GLITCH_MOD'],
};

// ─── Checkpoint Config ──────────────────────────────────────────────

export interface Checkpoint {
  afterAgent: AgentId;
  description: string;
  approvalRequired: boolean;
}

export const CHECKPOINTS: Checkpoint[] = [
  {
    afterAgent: 'PULSE',
    description: 'Review market analysis before investing in development',
    approvalRequired: true,
  },
  {
    afterAgent: 'DISPATCH',
    description: 'Review task breakdown and milestones before coding begins',
    approvalRequired: false,
  },
  {
    afterAgent: 'GATEWAY',
    description: 'Final compliance review before store submission',
    approvalRequired: true,
  },
];
