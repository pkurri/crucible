// ═══════════════════════════════════════════════════════════════════════
// 🧠 MAINFRAME — Neon Arcade Orchestrator
// ═══════════════════════════════════════════════════════════════════════
//
// Central coordinator for the 4-phase game development pipeline.
// Routes JSON messages between 7 specialized agents, enforces checkpoints,
// and manages the dev-iteration feedback loop (PIXEL ↔ GLITCH ↔ TURBO).
//
// ═══════════════════════════════════════════════════════════════════════

import * as fs from 'node:fs';
import * as path from 'node:path';
import * as readline from 'node:readline';
import { randomUUID } from 'node:crypto';

import {
  AGENT_ROSTER,
  PIPELINE_STAGES,
  PHASE_AGENTS,
  CHECKPOINTS,
  type AgentConfig,
} from './agents/agent-definitions';

import type {
  AgentId,
  AgentMessage,
  GameIdeaInput,
  MarketAnalysis,
  PRD,
  TaskBreakdown,
  CodeOutput,
  TestReport,
  PerformanceReport,
  ComplianceReport,
} from './schemas/schemas';

import { GameIdeaInput as GameIdeaInputSchema } from './schemas/schemas';
import { WorkspaceManager } from './workspace/workspace-manager';
import { StatusReporter } from './utils/status-reporter';

// ─── Types ──────────────────────────────────────────────────────────

interface PipelineState {
  gameIdea: GameIdeaInput;
  currentPhase: number;
  currentAgent: AgentId | null;
  completed: AgentId[];
  results: Map<AgentId, unknown>;
  startTime: number;
  status: 'RUNNING' | 'PAUSED' | 'COMPLETED' | 'FAILED';
}

// ─── MAINFRAME Orchestrator ─────────────────────────────────────────

export class MainframeOrchestrator {
  private workspace: WorkspaceManager;
  private state: PipelineState | null = null;

  constructor(workspacePath?: string) {
    this.workspace = new WorkspaceManager(workspacePath);
  }

  /**
   * Execute the full 4-phase game development pipeline.
   */
  async run(input: GameIdeaInput): Promise<void> {
    // Validate input
    const parsed = GameIdeaInputSchema.safeParse(input);
    if (!parsed.success) {
      console.error('❌ Invalid game idea input:', parsed.error.format());
      return;
    }

    this.state = {
      gameIdea: parsed.data,
      currentPhase: 0,
      currentAgent: null,
      completed: [],
      results: new Map(),
      startTime: Date.now(),
      status: 'RUNNING',
    };

    this.printBanner();
    console.log(`\n🎮 Game Idea: "${parsed.data.gameIdea}"`);
    console.log(`🎯 Platform: ${parsed.data.targetPlatform}`);
    console.log(`📂 Workspace: ${this.workspace.getWorkspacePath()}\n`);

    // Save input to workspace
    this.workspace.write('MAINFRAME', 'game-idea.json', parsed.data);

    // ═══ PHASE 1: Market & Feasibility ═══
    await this.executePhase1();

    // ═══ PHASE 2: Task Architecture ═══
    await this.executePhase2();

    // ═══ PHASE 3: Development Loop ═══
    await this.executePhase3();

    // ═══ PHASE 4: Deployment & Compliance ═══
    await this.executePhase4();

    // ═══ Final Summary ═══
    this.printFinalSummary();
  }

  // ─── Phase Implementations ──────────────────────────────────────

  private async executePhase1(): Promise<void> {
    this.printPhaseHeader('PHASE 1', 'Market & Feasibility', ['PULSE', 'SCHEMA']);

    // Step 1: PULSE — Market Analysis
    await this.executeAgent('PULSE', {
      gameIdea: this.state!.gameIdea.gameIdea,
      targetPlatform: this.state!.gameIdea.targetPlatform,
      targetGenre: this.state!.gameIdea.targetGenre,
      targetAudience: this.state!.gameIdea.targetAudience,
    });

    // 🔒 HUMAN CHECKPOINT — Approve market analysis
    await this.humanCheckpoint('PULSE');

    // Step 2: SCHEMA — PRD Generation
    await this.executeAgent('SCHEMA', {
      gameIdea: this.state!.gameIdea.gameIdea,
      marketAnalysis: this.state!.results.get('PULSE'),
    });
  }

  private async executePhase2(): Promise<void> {
    this.printPhaseHeader('PHASE 2', 'Task & Milestone Architecture', ['DISPATCH']);

    await this.executeAgent('DISPATCH', {
      prd: this.state!.results.get('SCHEMA'),
    });
  }

  private async executePhase3(): Promise<void> {
    this.printPhaseHeader('PHASE 3', 'Development & Iteration Loop', ['PIXEL', 'GLITCH', 'TURBO']);

    const taskBreakdown = this.state!.results.get('DISPATCH') as TaskBreakdown;
    const executionOrder = taskBreakdown?.executionOrder || [];

    for (const sprint of executionOrder) {
      console.log(`\n  🏃 Sprint ${sprint.sprint} — ${sprint.taskIds.length} tasks`);

      for (const taskId of sprint.taskIds) {
        const task = this.findTask(taskBreakdown, taskId);
        if (!task) {
          console.warn(`  ⚠️ Task ${taskId} not found in breakdown, skipping`);
          continue;
        }

        let iteration = 0;
        let taskComplete = false;

        while (!taskComplete && iteration < 3) {
          iteration++;
          console.log(`\n  ── Task ${taskId} (iteration ${iteration}) ──`);

          // PIXEL: Write code
          await this.executeAgent('PIXEL', {
            task,
            fixItLog: iteration > 1 ? this.state!.results.get('GLITCH') : undefined,
          });

          // GLITCH: Review code
          await this.executeAgent('GLITCH', {
            codeOutput: this.state!.results.get('PIXEL'),
            taskDefinitionOfDone: task.definitionOfDone,
            iterationCount: iteration,
          });

          const testReport = this.state!.results.get('GLITCH') as TestReport;

          if (testReport?.verdict === 'PASS') {
            taskComplete = true;
          } else if (testReport?.verdict === 'ESCALATE') {
            console.log('  ⚠️ ESCALATED — Human review required');
            await this.humanCheckpoint('GLITCH');
            taskComplete = true;
          }
          // else: FAIL → loop back to PIXEL
        }

        // TURBO: Optimize (only after GLITCH passes)
        if (taskComplete) {
          await this.executeAgent('TURBO', {
            codeFiles: (this.state!.results.get('PIXEL') as CodeOutput)?.files || [],
            performanceTargets: (this.state!.results.get('SCHEMA') as PRD)?.performanceTargets,
            engine: (this.state!.results.get('SCHEMA') as PRD)?.technicalRequirements?.engine?.name,
          });

          const perfReport = this.state!.results.get('TURBO') as PerformanceReport;
          if (perfReport?.verdict === 'NEEDS_OPTIMIZATION') {
            console.log('  🔧 Performance issues found — sent to PIXEL');
            // In a real system, this would loop back to PIXEL with optimization tasks
          }
        }
      }
    }
  }

  private async executePhase4(): Promise<void> {
    this.printPhaseHeader('PHASE 4', 'Deployment & Compliance', ['GATEWAY']);

    await this.executeAgent('GATEWAY', {
      gamePRD: this.state!.results.get('SCHEMA'),
      gameMetadata: this.extractGameMetadata(),
      performanceReport: this.state!.results.get('TURBO'),
    });

    // 🔒 HUMAN CHECKPOINT — Final review
    await this.humanCheckpoint('GATEWAY');
  }

  // ─── Agent Execution ────────────────────────────────────────────

  private async executeAgent(agentId: AgentId, input: unknown): Promise<void> {
    const config = AGENT_ROSTER[agentId];
    this.state!.currentAgent = agentId;

    console.log(`\n  ${config.emoji} ${config.codename} — ${config.role}`);
    console.log(`  ${'─'.repeat(50)}`);

    // Create inter-agent message
    const message: AgentMessage = {
      from: 'MAINFRAME',
      to: agentId,
      type: 'task',
      payload: input,
      timestamp: new Date().toISOString(),
      correlationId: randomUUID(),
      phase: config.phase,
    };

    this.workspace.sendMessage(message);

    // Read agent prompt
    const promptPath = path.join(__dirname, config.promptFile);
    let systemPrompt = '';
    if (config.promptFile && fs.existsSync(promptPath)) {
      systemPrompt = fs.readFileSync(promptPath, 'utf-8');
    }

    // ══════════════════════════════════════════════════════════════
    // INTEGRATION POINT: Replace this with actual LLM call
    //
    // Example with OpenAI:
    //   const response = await openai.chat.completions.create({
    //     model: 'gpt-4o',
    //     messages: [
    //       { role: 'system', content: systemPrompt },
    //       { role: 'user', content: JSON.stringify(input) },
    //     ],
    //     response_format: { type: 'json_object' },
    //   });
    //   const result = JSON.parse(response.choices[0].message.content);
    //
    // Example with CrewAI / LangChain:
    //   const agent = new Agent({ role: config.role, goal: '...', backstory: systemPrompt });
    //   const task = new Task({ description: JSON.stringify(input), agent });
    //   const result = await crew.kickoff();
    // ══════════════════════════════════════════════════════════════

    console.log(`  📨 Input sent (${JSON.stringify(input).length} chars)`);
    console.log(`  🔧 Tools: [${config.tools.join(', ')}]`);
    console.log(`  🛡️ Guardrails: ${config.guardrails.length} active`);
    console.log(`  ⏱️ Timeout: ${config.timeoutMs / 1000}s`);
    console.log(`  💡 [INTEGRATION POINT] — Connect your LLM provider here`);

    // Placeholder result — replace with actual LLM output
    const placeholderResult = {
      agentId,
      timestamp: new Date().toISOString(),
      status: 'COMPLETE',
      _placeholder: true,
      _note: `Replace with actual ${agentId} output from LLM`,
    };

    // Store result
    this.state!.results.set(agentId, placeholderResult);
    this.state!.completed.push(agentId);

    // Save to workspace
    const filename = `${agentId.toLowerCase()}-output-${Date.now()}.json`;
    this.workspace.write(agentId, filename, placeholderResult);

    // Generate status report
    const report = StatusReporter.generate({
      agentId,
      status: 'COMPLETE',
      summary: `${config.role} task completed`,
      metrics: {
        'Input Size': `${JSON.stringify(input).length} chars`,
        'Execution': 'Placeholder (connect LLM)',
      },
      nextAgent: config.downstream === 'RELEASE'
        ? 'RELEASE'
        : config.downstream as AgentId,
    });
    this.workspace.writeStatusReport(agentId, report);

    console.log(`  ✅ ${config.codename} complete\n`);
  }

  // ─── Human Checkpoints ──────────────────────────────────────────

  private async humanCheckpoint(afterAgent: AgentId): Promise<void> {
    const checkpoint = CHECKPOINTS.find(c => c.afterAgent === afterAgent);
    if (!checkpoint) return;

    console.log(`\n  🔒 ═══ HUMAN CHECKPOINT ═══`);
    console.log(`  📋 ${checkpoint.description}`);

    if (checkpoint.approvalRequired) {
      console.log(`  ⏸️ Pipeline paused — awaiting human approval`);
      this.state!.status = 'PAUSED';

      const approved = await this.promptUser(
        '  ✋ Approve and continue? (y/n): '
      );

      if (approved.toLowerCase() !== 'y') {
        console.log('  ❌ Pipeline halted by human');
        this.state!.status = 'FAILED';
        process.exit(0);
      }

      this.state!.status = 'RUNNING';
      console.log('  ✅ Approved — resuming pipeline\n');
    }
  }

  private promptUser(question: string): Promise<string> {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    return new Promise(resolve => {
      rl.question(question, answer => {
        rl.close();
        resolve(answer);
      });
    });
  }

  // ─── Utilities ──────────────────────────────────────────────────

  private findTask(breakdown: TaskBreakdown, taskId: string): unknown {
    for (const epic of breakdown?.epics || []) {
      for (const feature of epic.features || []) {
        for (const task of feature.tasks || []) {
          if (task.id === taskId) return task;
        }
      }
    }
    return null;
  }

  private extractGameMetadata(): Record<string, unknown> {
    const prd = this.state!.results.get('SCHEMA') as PRD;
    return {
      title: prd?.gameOverview?.title || 'Untitled Game',
      description: prd?.gameOverview?.elevatorPitch || '',
      genre: prd?.gameOverview?.genre || 'Unknown',
      targetAge: prd?.gameOverview?.targetAgeRating || 'Everyone',
      platforms: prd?.gameOverview?.platform || ['web'],
      hasIAP: false,
      hasAds: false,
      hasMultiplayer: prd?.technicalRequirements?.backend?.multiplayer || false,
      collectsPersonalData: false,
    };
  }

  private printBanner(): void {
    console.log(`
╔══════════════════════════════════════════════════════════╗
║                                                          ║
║   ⚡  N E O N   A R C A D E  ⚡                         ║
║   ══════════════════════════                              ║
║   AI Game Studio — Multi-Agent Pipeline                   ║
║                                                          ║
║   🧠 MAINFRAME Orchestrator v1.0                         ║
║                                                          ║
║   Agents:                                                ║
║   📊 PULSE    → 📋 SCHEMA  → 📁 DISPATCH               ║
║   💻 PIXEL   ↔ 🐛 GLITCH  → ⚡ TURBO                   ║
║   🏪 GATEWAY  → ✅ RELEASE                               ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
`);
  }

  private printPhaseHeader(phase: string, name: string, agents: AgentId[]): void {
    const agentIcons = agents
      .map(a => `${AGENT_ROSTER[a].emoji} ${a}`)
      .join(' → ');

    console.log(`\n${'═'.repeat(60)}`);
    console.log(`  ${phase}: ${name}`);
    console.log(`  Agents: ${agentIcons}`);
    console.log(`${'═'.repeat(60)}`);
  }

  private printFinalSummary(): void {
    const elapsed = ((Date.now() - this.state!.startTime) / 1000).toFixed(1);

    console.log(`\n${'═'.repeat(60)}`);
    console.log('  🏁 PIPELINE COMPLETE');
    console.log(`${'═'.repeat(60)}`);
    console.log(`  ⏱️ Total time: ${elapsed}s`);
    console.log(`  ✅ Agents completed: ${this.state!.completed.length}/7`);
    console.log(`  📂 Workspace: ${this.workspace.getWorkspacePath()}`);
    console.log();

    // Generate final pipeline summary
    const summary = StatusReporter.generatePipelineSummary(
      this.state!.completed.map(agentId => ({
        agentId,
        status: 'COMPLETE',
        summary: `${AGENT_ROSTER[agentId].role} finished`,
      }))
    );
    this.workspace.writeStatusReport('MAINFRAME', summary);

    this.state!.status = 'COMPLETED';
  }
}

// ─── CLI Entry Point ────────────────────────────────────────────────

async function main() {
  const gameIdea = process.argv[2] || 'A casual puzzle game where players match colored crystals that fall from the sky, with power-ups, daily challenges, and a competitive leaderboard.';

  const orchestrator = new MainframeOrchestrator();
  await orchestrator.run({
    gameIdea,
    targetPlatform: 'web',
    targetGenre: 'puzzle',
    targetAudience: 'casual gamers 18-35',
  });
}

main().catch(console.error);
