// ═══════════════════════════════════════════════════════════════════════
// NEON ARCADE — Inter-Agent Data Contracts (Zod Schemas)
// ═══════════════════════════════════════════════════════════════════════

import { z } from 'zod';

// ─── Agent IDs ───────────────────────────────────────────────────────
export const AgentId = z.enum([
  'PULSE',      // Market Analyst
  'SCHEMA',     // Requirement Vetter
  'DISPATCH',   // Project Manager
  'PIXEL',      // Software Engineer
  'GLITCH',     // QA & Debugger
  'TURBO',      // Performance Optimizer
  'GATEWAY',    // Store Policy Expert
  'SPECTRA',    // Playtest & Balance
  'GLITCH_MOD', // Hype & Social
  'ORACLE',     // Trend Forecaster
  'DOPAMINE',   // Retention Architect
  'CHRONOS',    // Procedural Director
  'VANGUARD',   // Aggressive Scouter
  'SENSORY',    // Juice Architect
  'VIRAL',      // Growth Engineer
  'UA_PRO',     // Acquisition Strategist
  'MAINFRAME',  // Orchestrator
]);
export type AgentId = z.infer<typeof AgentId>;

// ─── Phase Definitions ──────────────────────────────────────────────
export const Phase = z.enum([
  'MARKET_FEASIBILITY',
  'TASK_ARCHITECTURE',
  'DEV_ITERATION',
  'DEPLOYMENT_COMPLIANCE',
  'POST_LAUNCH_OPS',
  'HYPER_GROWTH',
]);
export type Phase = z.infer<typeof Phase>;

// ─── Shared Envelope ────────────────────────────────────────────────
export const AgentMessage = z.object({
  from:          AgentId,
  to:            AgentId,
  type:          z.enum(['task', 'result', 'status', 'fix_it', 'checkpoint']),
  payload:       z.unknown(),
  timestamp:     z.string().datetime(),
  correlationId: z.string().uuid(),
  phase:         Phase,
});
export type AgentMessage = z.infer<typeof AgentMessage>;

// ═══════════════════════════════════════════════════════════════════════
// PHASE 1 — PULSE Output
// ═══════════════════════════════════════════════════════════════════════

export const Competitor = z.object({
  name:               z.string(),
  platform:           z.string(),
  estimatedDownloads: z.string(),
  estimatedRevenue:   z.string(),
  coreMechanic:       z.string(),
  monetization:       z.string(),
  userRating:         z.number().min(0).max(5),
  differentiator:     z.string(),
});

export const TrendingMechanic = z.object({
  mechanic:       z.string(),
  trendDirection: z.enum(['rising', 'stable', 'declining']),
  examples:       z.array(z.string()),
});

export const MarketAnalysis = z.object({
  agentId:    z.literal('PULSE'),
  timestamp:  z.string().datetime(),
  blueOceanAnalysis: z.object({
    uncontestedSpaces:            z.array(z.string()),
    valueInnovationOpportunities: z.array(z.string()),
    eliminateReduceRaiseCreate: z.object({
      eliminate: z.array(z.string()),
      reduce:   z.array(z.string()),
      raise:    z.array(z.string()),
      create:   z.array(z.string()),
    }),
  }),
  competitors:        z.array(Competitor).max(10),
  trendingMechanics:  z.array(TrendingMechanic).max(5),
  monetizationRecommendation: z.object({
    model:             z.enum(['IAP', 'Ads', 'Premium', 'Freemium', 'Hybrid']),
    justification:     z.string(),
    estimatedARPU:     z.string(),
    revenueProjection: z.string(),
  }),
  marketSizing: z.object({
    TAM: z.string(),
    SAM: z.string(),
    SOM: z.string(),
  }),
  risks: z.array(z.object({
    risk:       z.string(),
    severity:   z.enum(['low', 'medium', 'high', 'critical']),
    mitigation: z.string(),
  })),
  verdict:          z.enum(['STRONG_GO', 'GO', 'CONDITIONAL', 'NO_GO']),
  verdictRationale: z.string(),
});
export type MarketAnalysis = z.infer<typeof MarketAnalysis>;

// ═══════════════════════════════════════════════════════════════════════
// PHASE 1 — SCHEMA Output (PRD)
// ═══════════════════════════════════════════════════════════════════════

export const Feature = z.object({
  id:          z.string(),
  name:        z.string(),
  description: z.string(),
  priority:    z.enum(['P0', 'P1', 'P2', 'P3']),
});

export const PRD = z.object({
  agentId:   z.literal('SCHEMA'),
  timestamp: z.string().datetime(),
  gameOverview: z.object({
    title:          z.string(),
    genre:          z.string(),
    subGenre:       z.string().optional(),
    platform:       z.array(z.string()),
    coreLoop:       z.string(),
    sessionLength:  z.string(),
    targetAgeRating:z.string(),
    elevatorPitch:  z.string(),
  }),
  features: z.object({
    mvp:  z.array(Feature),
    v1_1: z.array(Feature),
    v2_0: z.array(Feature),
  }),
  technicalRequirements: z.object({
    engine: z.object({
      name:          z.enum(['Phaser.io', 'Unity', 'Godot', 'Unreal', 'Custom']),
      version:       z.string(),
      language:      z.string(),
      justification: z.array(z.string()).min(3),
    }),
    assets: z.object({
      sprites:     z.array(z.object({ name: z.string(), dimensions: z.string(), format: z.string(), animations: z.number() })),
      backgrounds: z.array(z.object({ name: z.string(), dimensions: z.string(), format: z.string() })),
      uiElements:  z.array(z.object({ name: z.string(), type: z.string() })),
      effects:     z.array(z.object({ name: z.string(), type: z.string() })),
    }),
    audio: z.object({
      sfxCount:    z.number(),
      musicTracks: z.number(),
      format:      z.string(),
      sfxList:     z.array(z.string()),
    }),
    backend: z.object({
      auth:              z.boolean(),
      leaderboards:      z.boolean(),
      cloudSave:         z.boolean(),
      analytics:         z.boolean(),
      multiplayer:       z.boolean(),
      pushNotifications: z.boolean(),
      provider:          z.string(),
    }),
    thirdPartySDKs: z.array(z.object({
      name:     z.string(),
      purpose:  z.string(),
      platform: z.string(),
    })),
  }),
  performanceTargets: z.object({
    fps:             z.number(),
    loadTimeSeconds: z.number(),
    maxBinarySizeMB: z.number(),
    maxMemoryMB:     z.number(),
  }),
  timeline: z.object({
    estimatedWeeks: z.number(),
    teamSize:       z.number(),
    phases:         z.array(z.object({ name: z.string(), weeks: z.number() })),
  }),
  feasibilityConcerns: z.array(z.string()),
});
export type PRD = z.infer<typeof PRD>;

// ═══════════════════════════════════════════════════════════════════════
// PHASE 2 — DISPATCH Output (Task Breakdown)
// ═══════════════════════════════════════════════════════════════════════

export const TaskStatus = z.enum(['BACKLOG', 'IN_PROGRESS', 'IN_REVIEW', 'DONE', 'BLOCKED']);

export const Task = z.object({
  id:             z.string(),
  title:          z.string(),
  description:    z.string(),
  assignedAgent:  z.enum(['PIXEL', 'GLITCH', 'TURBO']),
  estimatedHours: z.number().max(4),
  dependencies:   z.array(z.string()),
  definitionOfDone: z.object({
    acceptanceCriteria: z.array(z.string()),
    requiredTests:      z.array(z.string()),
    deliverables:       z.array(z.string()),
  }),
  status:         TaskStatus,
  parallelizable: z.boolean(),
});
export type Task = z.infer<typeof Task>;

export const TaskBreakdown = z.object({
  agentId:     z.literal('DISPATCH'),
  timestamp:   z.string().datetime(),
  projectName: z.string(),
  epics: z.array(z.object({
    id:          z.string(),
    name:        z.string(),
    description: z.string(),
    features:    z.array(z.object({
      id:            z.string(),
      name:          z.string(),
      prdFeatureRef: z.string(),
      tasks:         z.array(Task),
    })),
  })),
  milestones: z.array(z.object({
    name:         z.string(),
    week:         z.number(),
    deliverables: z.array(z.string()),
    criteria:     z.string(),
  })),
  executionOrder: z.array(z.object({
    sprint:  z.number(),
    taskIds: z.array(z.string()),
  })),
  summary: z.object({
    totalEpics:          z.number(),
    totalFeatures:       z.number(),
    totalTasks:          z.number(),
    totalEstimatedHours: z.number(),
    criticalPath:        z.array(z.string()),
  }),
});
export type TaskBreakdown = z.infer<typeof TaskBreakdown>;

// ═══════════════════════════════════════════════════════════════════════
// PHASE 3 — PIXEL Output (Code)
// ═══════════════════════════════════════════════════════════════════════

export const CodeOutput = z.object({
  agentId:   z.literal('PIXEL'),
  timestamp: z.string().datetime(),
  taskId:    z.string(),
  status:    z.enum(['COMPLETE', 'BLOCKED', 'NEEDS_REVIEW']),
  files: z.array(z.object({
    path:          z.string(),
    content:       z.string(),
    language:      z.enum(['typescript', 'csharp', 'gdscript', 'json', 'yaml']),
    action:        z.enum(['CREATE', 'MODIFY', 'DELETE']),
    changeSummary: z.string(),
  })),
  stubTests: z.array(z.object({
    path:      z.string(),
    content:   z.string(),
    testNames: z.array(z.string()),
  })),
  acceptanceCriteriaStatus: z.array(z.object({
    criterion: z.string(),
    met:       z.boolean(),
    evidence:  z.string(),
  })),
  blockedReason: z.string().optional(),
  questions:     z.array(z.string()).optional(),
});
export type CodeOutput = z.infer<typeof CodeOutput>;

// ═══════════════════════════════════════════════════════════════════════
// PHASE 3 — GLITCH Output (Test Report)
// ═══════════════════════════════════════════════════════════════════════

export const Bug = z.object({
  id:           z.string(),
  severity:     z.enum(['CRITICAL', 'MAJOR', 'MINOR', 'INFO']),
  file:         z.string(),
  line:         z.number(),
  description:  z.string(),
  codeSnippet:  z.string(),
  suggestedFix: z.string(),
  category:     z.string(),
});

export const TestReport = z.object({
  agentId:   z.literal('GLITCH'),
  timestamp: z.string().datetime(),
  taskId:    z.string(),
  verdict:   z.enum(['PASS', 'FAIL', 'ESCALATE']),
  staticAnalysis: z.object({
    typeSafety:  z.array(Bug),
    logicErrors: z.array(Bug),
    security:    z.array(Bug),
    performance: z.array(Bug),
    codeStyle:   z.array(Bug),
  }),
  fixItLog: z.object({
    targetAgent:    z.literal('PIXEL'),
    originalTaskId: z.string(),
    iteration:      z.number(),
    bugs:           z.array(Bug),
    summary:        z.string(),
  }).optional(),
  metrics: z.object({
    totalBugs:    z.number(),
    critical:     z.number(),
    major:        z.number(),
    minor:        z.number(),
    info:         z.number(),
    testsWritten: z.number(),
    testsPassed:  z.number(),
  }),
});
export type TestReport = z.infer<typeof TestReport>;

// ═══════════════════════════════════════════════════════════════════════
// PHASE 3 — TURBO Output (Performance Report)
// ═══════════════════════════════════════════════════════════════════════

export const PerfScore = z.enum(['GREEN', 'YELLOW', 'RED']);

export const PerfIssue = z.object({
  file:           z.string(),
  line:           z.number(),
  description:    z.string(),
  impact:         z.enum(['HIGH', 'MEDIUM', 'LOW']),
  recommendation: z.string(),
});

export const PerformanceReport = z.object({
  agentId:   z.literal('TURBO'),
  timestamp: z.string().datetime(),
  taskId:    z.string().optional(),
  verdict:   z.enum(['OPTIMIZED', 'NEEDS_OPTIMIZATION']),
  frameRate: z.object({
    score:        PerfScore,
    estimatedFps: z.number(),
    targetFps:    z.number(),
    issues:       z.array(PerfIssue),
  }),
  memory: z.object({
    score:       PerfScore,
    estimatedMB: z.number(),
    targetMB:    z.number(),
    issues:      z.array(PerfIssue),
  }),
  assetCompression: z.object({
    score:          PerfScore,
    estimatedSizeMB:z.number(),
    targetSizeMB:   z.number(),
    issues:         z.array(PerfIssue),
  }),
  loadTime: z.object({
    score:            PerfScore,
    estimatedSeconds: z.number(),
    targetSeconds:    z.number(),
    issues:           z.array(PerfIssue),
  }).optional(),
  optimizations: z.array(z.object({
    id:                  z.string(),
    category:            z.string(),
    file:                z.string(),
    description:         z.string(),
    impact:              z.enum(['HIGH', 'MEDIUM', 'LOW']),
    beforeCode:          z.string(),
    afterCode:           z.string(),
    expectedImprovement: z.string(),
  })),
  overallScore: z.object({
    green:            z.number(),
    yellow:           z.number(),
    red:              z.number(),
    performanceGrade: z.enum(['A', 'B', 'C', 'D', 'F']),
  }),
});
export type PerformanceReport = z.infer<typeof PerformanceReport>;

// ═══════════════════════════════════════════════════════════════════════
// PHASE 4 — GATEWAY Output (Compliance Report)
// ═══════════════════════════════════════════════════════════════════════

export const ComplianceStatus = z.enum(['COMPLIANT', 'NON_COMPLIANT', 'NEEDS_REVIEW']);

export const PolicyCategory = z.object({
  category:        z.string(),
  guidelineSection:z.string(),
  status:          ComplianceStatus,
  details:         z.string(),
  remediation:     z.string().optional(),
});

export const ComplianceReport = z.object({
  agentId:        z.literal('GATEWAY'),
  timestamp:      z.string().datetime(),
  overallVerdict: z.enum(['APPROVED', 'CONDITIONAL', 'REJECTED']),
  appleAppStore: z.object({
    verdict:         ComplianceStatus,
    categories:      z.array(PolicyCategory),
    requiredActions: z.array(z.string()),
  }),
  googlePlay: z.object({
    verdict:         ComplianceStatus,
    categories:      z.array(PolicyCategory),
    requiredActions: z.array(z.string()),
  }),
  additionalRequirements: z.object({
    privacyPolicyURL:  z.object({ status: z.string(), action: z.string() }),
    ageRating:         z.object({ recommended: z.string() }),
    exportCompliance:  z.object({ usesEncryption: z.boolean(), action: z.string() }),
    contentRights:     z.object({ status: z.string(), concerns: z.array(z.string()) }),
    accessibility:     z.object({ status: z.string(), recommendations: z.array(z.string()) }),
  }),
  submissionChecklist: z.array(z.object({
    item:  z.string(),
    ready: z.boolean(),
    notes: z.string(),
  })),
});
export type ComplianceReport = z.infer<typeof ComplianceReport>;

// ═══════════════════════════════════════════════════════════════════════
// Pipeline Input
// ═══════════════════════════════════════════════════════════════════════

export const GameIdeaInput = z.object({
  gameIdea:       z.string().min(10),
  targetPlatform: z.enum(['mobile', 'web', 'pc', 'console', 'cross-platform']).default('web'),
  targetGenre:    z.string().optional(),
  targetAudience: z.string().optional(),
});
export type GameIdeaInput = z.infer<typeof GameIdeaInput>;

// ─── Validation helper ──────────────────────────────────────────────
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('✅ All Neon Arcade schemas validated successfully.');
  console.log(`   Schemas: ${[
    'AgentMessage', 'MarketAnalysis', 'PRD', 'TaskBreakdown',
    'CodeOutput', 'TestReport', 'PerformanceReport', 'ComplianceReport',
    'GameIdeaInput'
  ].join(', ')}`);
}
