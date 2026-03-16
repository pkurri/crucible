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
  VANGUARD: {
    id: 'VANGUARD',
    codename: 'VANGUARD',
    role: 'Aggressive Scouter',
    phase: 'MARKET_FEASIBILITY',
    emoji: '🔭',
    upstream: 'USER',
    downstream: 'ORACLE',
    promptFile: 'agents/prompts/vanguard-scout.md',
    maxIterations: 1,
    timeoutMs: 120_000,
    tools: ['web_search', 'read_url', 'app_store_lookup'],
    guardrails: [
      'Focus on games with >10M downloads',
      'Identify 6-month growth patterns',
      'Discard low-velocity concepts',
    ],
  },

  ORACLE: {
    id: 'ORACLE',
    codename: 'ORACLE',
    role: 'Trend Forecaster',
    phase: 'MARKET_FEASIBILITY',
    emoji: '🔮',
    upstream: 'VANGUARD',
    downstream: 'PULSE',
    promptFile: 'agents/prompts/oracle-trends.md',
    maxIterations: 1,
    timeoutMs: 120_000,
    tools: ['web_search', 'read_url'],
    guardrails: [
      'Focus on "Steam" and "Twitch" data',
      'Identify upcoming genre shifts',
      'No speculation without data',
    ],
  },

  PULSE: {
    id: 'PULSE',
    codename: 'PULSE',
    role: 'Market Analyst',
    phase: 'MARKET_FEASIBILITY',
    emoji: '📊',
    upstream: 'ORACLE',
    downstream: 'SCHEMA',
    promptFile: 'agents/prompts/pulse-market-analyst.md',
    maxIterations: 1,
    timeoutMs: 120_000,
    tools: ['web_search', 'app_store_lookup', 'read_url', 'workspace_write'],
    guardrails: [
      'No fabrication of competitor data',
      'No scope creep — analyze only',
      'Mandatory verdict',
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
      'Constructive fixes required',
    ],
  },

  TURBO: {
    id: 'TURBO',
    codename: 'TURBO',
    role: 'Performance Optimizer',
    phase: 'DEV_ITERATION',
    emoji: '⚡',
    upstream: 'GLITCH',
    downstream: 'DOPAMINE',
    promptFile: 'agents/prompts/turbo-performance-optimizer.md',
    maxIterations: 2,
    timeoutMs: 90_000,
    tools: ['workspace_read', 'workspace_write', 'code_profile', 'calculate'],
    guardrails: [
      'Target-driven comparison',
      'Actionable RED/YELLOW fixes only',
    ],
  },

  DOPAMINE: {
    id: 'DOPAMINE',
    codename: 'DOPAMINE',
    role: 'Retention Architect',
    phase: 'DEV_ITERATION',
    emoji: '🧠',
    upstream: 'TURBO',
    downstream: 'SENSORY',
    promptFile: 'agents/prompts/dopamine-retention.md',
    maxIterations: 2,
    timeoutMs: 120_000,
    tools: ['calculate', 'web_search'],
    guardrails: [
      'Design hook-reward-investment loops',
      'Establish fair monetization pacing',
      'Avoid dark patterns',
    ],
  },

  SENSORY: {
    id: 'SENSORY',
    codename: 'SENSORY',
    role: 'Juice Architect',
    phase: 'DEV_ITERATION',
    emoji: '🌈',
    upstream: 'DOPAMINE',
    downstream: 'SPECTRA',
    promptFile: 'agents/prompts/sensory-juice.md',
    maxIterations: 2,
    timeoutMs: 120_000,
    tools: ['workspace_read', 'workspace_write', 'calculate'],
    guardrails: [
      'Focus on "Game Feel" (particles, screenshake, sound logic)',
      'Maximize "Juiciness" without bloat',
    ],
  },

  SPECTRA: {
    id: 'SPECTRA',
    codename: 'SPECTRA',
    role: 'Playtest & Balance',
    phase: 'DEV_ITERATION',
    emoji: '🎮',
    upstream: 'SENSORY',
    downstream: 'GATEWAY',
    promptFile: 'agents/prompts/spectra-playtest.md',
    maxIterations: 2,
    timeoutMs: 150_000,
    tools: ['workspace_read', 'workspace_write', 'calculate'],
    guardrails: [
      'Focus on "Fun Factor"',
      'Balance difficulty curves',
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
    downstream: 'VIRAL',
    promptFile: 'agents/prompts/glitch-mod-promotion.md',
    maxIterations: 1,
    timeoutMs: 90_000,
    tools: ['web_search', 'read_url'],
    guardrails: [
      'Viral post structure only',
      'Highlight Pro tier features',
    ],
  },

  VIRAL: {
    id: 'VIRAL',
    codename: 'VIRAL',
    role: 'Growth Engineer',
    phase: 'HYPER_GROWTH',
    emoji: '🚀',
    upstream: 'GLITCH_MOD',
    downstream: 'UA_PRO',
    promptFile: 'agents/prompts/viral-growth.md',
    maxIterations: 1,
    timeoutMs: 120_000,
    tools: ['web_search', 'read_url'],
    guardrails: [
      'Design TikTok/Reels content cycles',
      'Map influencer collaboration paths',
    ],
  },

  UA_PRO: {
    id: 'UA_PRO',
    codename: 'UA_PRO',
    role: 'Acquisition Strategist',
    phase: 'HYPER_GROWTH',
    emoji: '📈',
    upstream: 'VIRAL',
    downstream: 'CHRONOS',
    promptFile: 'agents/prompts/ua-pro.md',
    maxIterations: 1,
    timeoutMs: 120_000,
    tools: ['calculate', 'web_search'],
    guardrails: [
      'Optimize LTV/CAC ratios',
      'Design high-velocity ad creative briefs',
    ],
  },

  CHRONOS: {
    id: 'CHRONOS',
    codename: 'CHRONOS',
    role: 'Procedural Director',
    phase: 'POST_LAUNCH_OPS',
    emoji: '⏳',
    upstream: 'UA_PRO',
    downstream: 'RELEASE',
    promptFile: 'agents/prompts/chronos-liveops.md',
    maxIterations: 1,
    timeoutMs: 120_000,
    tools: ['workspace_write', 'calculate'],
    guardrails: [
      'Design dynamic event schedules',
      'Generate personalized content hooks',
      'Monitor player churn metrics',
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
    ],
  },
};

// ─── Pipeline Order ─────────────────────────────────────────────────

export const PIPELINE_STAGES: AgentId[] = [
  'VANGUARD',   // Phase 1: High-Velocity Scouting
  'ORACLE',    // Phase 1: Trend Discovery
  'PULSE',     // Phase 1: Analysis
  'SCHEMA',    // Phase 1: Blueprint
  'DISPATCH',  // Phase 2: Logistics
  'PIXEL',     // Phase 3: Build
  'GLITCH',    // Phase 3: QA
  'TURBO',     // Phase 3: Perf
  'DOPAMINE',  // Phase 3: Psychology
  'SENSORY',   // Phase 3: Juice
  'SPECTRA',   // Phase 3: Balance
  'GATEWAY',   // Phase 4: Compliance
  'GLITCH_MOD',// Phase 4: Promotion
  'VIRAL',     // Phase 5: Hyper-Growth
  'UA_PRO',    // Phase 5: Ad-Optimization
  'CHRONOS',   // Phase 6: Evolution
];

// ─── Phase Groupings ────────────────────────────────────────────────

export const PHASE_AGENTS: Record<Phase, AgentId[]> = {
  MARKET_FEASIBILITY:    ['VANGUARD', 'ORACLE', 'PULSE', 'SCHEMA'],
  TASK_ARCHITECTURE:     ['DISPATCH'],
  DEV_ITERATION:         ['PIXEL', 'GLITCH', 'TURBO', 'DOPAMINE', 'SENSORY', 'SPECTRA'],
  DEPLOYMENT_COMPLIANCE: ['GATEWAY', 'GLITCH_MOD'],
  POST_LAUNCH_OPS:       ['CHRONOS'],
  HYPER_GROWTH:          ['VIRAL', 'UA_PRO'],
};

// ─── Checkpoint Config ──────────────────────────────────────────────

export interface Checkpoint {
  afterAgent: AgentId;
  description: string;
  approvalRequired: boolean;
}

export const CHECKPOINTS: Checkpoint[] = [
  {
    afterAgent: 'VANGUARD',
    description: 'Review high-growth scouts (10M+ targets)',
    approvalRequired: false,
  },
  {
    afterAgent: 'PULSE',
    description: 'Review market analysis before investing in development',
    approvalRequired: true,
  },
  {
    afterAgent: 'DISPATCH',
    description: 'Review task breakdown before coding begins',
    approvalRequired: false,
  },
  {
    afterAgent: 'GATEWAY',
    description: 'Final compliance review before store submission',
    approvalRequired: true,
  },
];
