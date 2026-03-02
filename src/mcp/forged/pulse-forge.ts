/**
 * @module PulseForge: The Crucible Observability Engine
 * @description
 * An integral MCP (Master Control Program) tool designed to provide deep
 * operational visibility into the Swarm Reactor and the intricate dance
 * of Crucible Agents. Inspired by Vercel's "Trace every step," PulseForge
 * extends Crucible's native monitoring by synthesizing agent telemetry,
 * task execution traces, and resource utilization into actionable insights
 * for real-time diagnostics and performance optimization.
 *
 * This system monitors the 'pulse' of the Forge, ensuring peak operational
 * efficiency and identifying anomalies before they impact output.
 *
 * Aesthetic: Neobrutalist data streams, dynamic SVG/WebGL visualizations
 * integrated with the Swarm Reactor's existing display.
 */

// --- Interfaces for agent telemetry --- 
export interface AgentTelemetry {
  agentId: string; // e.g., 'Tungsten', 'Cobalt'
  timestamp: string; // ISO 8601
  taskContext: string; // e.g., 'Structuring foundational schema for X'
  status: 'running' | 'completed' | 'failed' | 'idle' | 'warning';
  cpuLoadPercentage: number; // 0-100
  memoryUsageBytes: number;
  tokenConsumptionUnits: number; // Cost tracking, e.g., LLM tokens
  logEntries: string[]; // Recent critical log snippets
  dependencies: string[]; // Other agents or external services this agent interacts with
  traceId: string; // Correlation ID for distributed tracing
}

export interface TaskTraceSpan {
  spanId: string;
  parentSpanId?: string; // For hierarchical traces, if applicable
  agentId: string;
  operation: string; // e.g., 'data_schema_generation', 'vulnerability_scan', 'market_signal_analysis'
  startTime: string; // ISO 8601
  endTime?: string; // ISO 8601
  durationMs?: number;
  status: 'success' | 'failure' | 'pending' | 'timeout';
  metadata: Record<string, any>; // Additional context, e.g., input/output hashes, error details
}

// --- The PulseForge Core Class ---
export class PulseForge {
  private telemetryBuffer: AgentTelemetry[] = [];
  private taskTraces: TaskTraceSpan[] = [];
  private maxBufferSize: number = 2000; // Limit for in-memory buffer to prevent excessive memory usage

  constructor() {
    console.log("[PulseForge] Initializing Crucible's Observability Engine...");
  }

  /**
   * Ingests telemetry data from a specific agent.
   * This method would be called by agents or the Swarm Reactor periodically.
   * @param telemetry The agent's operational telemetry.
   */
  public ingestAgentTelemetry(telemetry: AgentTelemetry): void {
    this.telemetryBuffer.push(telemetry);
    if (this.telemetryBuffer.length > this.maxBufferSize) {
      this.telemetryBuffer.shift(); // Remove oldest entry to maintain buffer size
    }
    this.processTelemetry(telemetry);
  }

  /**
   * Ingests a new trace span for a task execution.
   * Agents report the start and end of their key operations as spans.
   * @param span The trace span data.
   */
  public ingestTaskTraceSpan(span: TaskTraceSpan): void {
    this.taskTraces.push(span);
    // In a real system, this would typically be sent to a distributed tracing backend
    // (e.g., OpenTelemetry collector, integrated with Supabase analytics/vector storage).
    console.log(`[PulseForge::Trace] Agent ${span.agentId} performed ${span.operation} (Span: ${span.spanId})`);
  }

  /**
   * Internal processing logic for incoming telemetry.
   * This could trigger alerts, update real-time dashboards, or flag anomalies.
   * @param telemetry The ingested agent telemetry.
   */
  private processTelemetry(telemetry: AgentTelemetry): void {
    // Example: Detect high CPU load or high token consumption
    if (telemetry.cpuLoadPercentage > 85 && telemetry.status === 'running') {
      console.warn(`[PulseForge::ALERT::Critical] High CPU load detected for ${telemetry.agentId}: ${telemetry.cpuLoadPercentage}% on task '${telemetry.taskContext}'`);
      // Future integration: Notify Cobalt (Threat Vanguard) for resource hogging or potential attack vector,
      // or Titanium (Deployment Frame) for scaling recommendations.
    }
    if (telemetry.tokenConsumptionUnits > 5000 && telemetry.status === 'running') {
      console.warn(`[PulseForge::ALERT::Cost] High token consumption by ${telemetry.agentId}: ${telemetry.tokenConsumptionUnits} units on task '${telemetry.taskContext}'`);
    }
    // Placeholder for actual R3F/SVG interaction with the Swarm Reactor display
    this.updateSwarmReactorDisplay(telemetry);
  }

  /**
   * Retrieves the current aggregated operational status of all active agents.
   * Returns the most recent telemetry entry for each unique agent ID.
   * @returns An array of the latest agent telemetry.
   */
  public getCurrentAgentStatuses(): AgentTelemetry[] {
    const latestStatuses = new Map<string, AgentTelemetry>();
    // Iterate backwards to ensure we get the absolute latest status for each agent
    for (let i = this.telemetryBuffer.length - 1; i >= 0; i--) {
      const tel = this.telemetryBuffer[i];
      if (!latestStatuses.has(tel.agentId)) {
        latestStatuses.set(tel.agentId, tel);
      }
    }
    return Array.from(latestStatuses.values());
  }

  /**
   * Retrieves all task traces recorded within the current buffer.
   * @returns An array of task trace spans.
   */
  public getAllTaskTraces(): TaskTraceSpan[] {
    return [...this.taskTraces]; // Return a shallow copy
  }

  /**
   * Generates a comprehensive operational report for a given time period.
   * (Simplified for this example, a real implementation would query persistent storage).
   * @param startTime ISO 8601 string for the start of the reporting period.
   * @param endTime ISO 8601 string for the end of the reporting period.
   * @returns A summary string or object with key performance indicators.
   */
  public generateOperationalReport(startTime: string, endTime: string): string {
    const relevantTelemetry = this.telemetryBuffer.filter(t => t.timestamp >= startTime && t.timestamp <= endTime);
    const relevantTraces = this.taskTraces.filter(t => t.startTime >= startTime && (t.endTime ? t.endTime <= endTime : true));

    const uniqueAgents = new Set(relevantTelemetry.map(t => t.agentId));
    const totalTokenConsumption = relevantTelemetry.reduce((acc, curr) => acc + curr.tokenConsumptionUnits, 0);
    const successfulTasks = relevantTraces.filter(t => t.status === 'success').length;
    const failedTasks = relevantTraces.filter(t => t.status === 'failure').length;

    return `--- PulseForge Operational Report (${startTime} to ${endTime}) ---\n` +
           `Forge Uptime Status: Optimal (simulated)\n` +
           `Agents Monitored: ${uniqueAgents.size} (${Array.from(uniqueAgents).join(', ')})\n` +
           `Total Token Consumption: ${totalTokenConsumption.toFixed(2)} units\n` +
           `Tasks Executed (Total/Success/Failed): ${relevantTraces.length} / ${successfulTasks} / ${failedTasks}\n` +
           `Avg. Agent CPU Load (last hour): ${relevantTelemetry.length > 0 ? (relevantTelemetry.reduce((sum, t) => sum + t.cpuLoadPercentage, 0) / relevantTelemetry.length).toFixed(2) : 'N/A'}%\n` +
           `--- End Report ---\n`;
  }

  /**
   * Placeholder for updating the React Three Fiber / SVG visualization
   * within the Swarm Reactor based on incoming telemetry data.
   * This function would dispatch events or directly manipulate the WebGL/SVG scene.
   * @param telemetry The agent's latest telemetry to visualize.
   */
  private updateSwarmReactorDisplay(telemetry: AgentTelemetry): void {
    // This is where the Neobrutalist aesthetic comes alive:
    // - Animate connection lines between agents based on 'dependencies'.
    // - Change color/intensity of agent nodes based on 'cpuLoadPercentage' or 'status'.
    // - Display critical 'logEntries' as scrolling text overlays on agent components.
    // - Visualize data flow (token consumption, data processed) as pulsating energy lines.
    // console.log(`[PulseForge::Display] Updating Swarm Reactor for ${telemetry.agentId}, status: ${telemetry.status}, load: ${telemetry.cpuLoadPercentage}%`);
  }

  /**
   * Lifecycle method: Cleans up resources, flushes any remaining in-memory data
   * to persistent storage if necessary before shutdown.
   */
  public shutdown(): void {
    console.log("[PulseForge] Shutting down Crucible's Observability Engine. Flushing remaining data...");
    // In a production system, this would ensure all collected data is persisted
    // (e.g., to Supabase for long-term analytics and vector embedding).
    this.telemetryBuffer = [];
    this.taskTraces = [];
    console.log("[PulseForge] Engine offline.");
  }
}
