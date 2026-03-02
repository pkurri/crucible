/**
 * @file AgentActivityMonitor.ts
 * @description Master Control Program (MCP) tool for granular observation and tracing of Crucible Agent Personas' activities.
 *              Inspired by Vercel's "Trace every step" for deep operational insight into the Swarm Reactor's operations.
 * @version 1.0.0
 * @aesthetic Neobrutalism / Sci-Fi / Industrial Forge
 */

// --- Simplified Core Types (assumed to be from '../../core/types' in a full project) ---
interface AgentPersona {
  id: string;
  name: 'Tungsten' | 'Cobalt' | 'Plasma' | 'Carbon' | 'Titanium' | 'Ignis';
  description: string;
}

interface AgentStatus {
  id: string;
  persona: AgentPersona['name'];
  health: 'optimal' | 'degraded' | 'critical' | 'offline';
  load: number; // Percentage
  lastActive: string; // ISO 8601 timestamp
  currentTask: string;
}
// --- End Simplified Core Types ---

interface AgentTraceEvent {
  timestamp: string; // ISO 8601
  agentId: AgentPersona['id'];
  persona: AgentPersona['name'];
  eventType: 'task_start' | 'task_end' | 'message_send' | 'message_receive' | 'resource_utilization' | 'error' | 'lifecycle';
  payload: Record<string, any>; // Dynamic payload based on eventType
}

export class AgentActivityMonitor {
  private historicalLogs: AgentTraceEvent[] = [];
  private logCapacity: number = 1000; // Max events to keep in memory for immediate access

  constructor() {
    this.initActivityStream();
    console.log('[MCP::AgentActivityMonitor] Initialized. Swarm Reactor activity monitoring active.');
  }

  /**
   * Initializes a simulated real-time stream of agent activity.
   * In a production environment, this would connect to a persistent backend
   * like Supabase Realtime or a dedicated WebSocket server.
   */
  private initActivityStream() {
    let eventCounter = 0;
    const agents: AgentPersona['name'][] = ['Tungsten', 'Cobalt', 'Plasma', 'Carbon', 'Titanium', 'Ignis'];
    const eventTypes: AgentTraceEvent['eventType'][] = ['task_start', 'message_send', 'resource_utilization', 'task_end', 'error', 'lifecycle'];

    setInterval(() => {
      eventCounter++;
      const randomAgent = agents[Math.floor(Math.random() * agents.length)];
      const randomEventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
      const agentId = `agent-${randomAgent.toLowerCase()}-001`;

      const event: AgentTraceEvent = {
        timestamp: new Date().toISOString(),
        agentId: agentId,
        persona: randomAgent,
        eventType: randomEventType,
        payload: this.generateRandomPayload(randomEventType, eventCounter, randomAgent),
      };
      this.addTraceEvent(event);
    }, 500); // Generate a new event every 500ms
  }

  private generateRandomPayload(eventType: AgentTraceEvent['eventType'], counter: number, persona: AgentPersona['name']): Record<string, any> {
    switch (eventType) {
      case 'task_start':
        return {
          taskId: `task-${counter}-${Math.random().toString(36).substring(7)}`,
          taskName: `Forge_Process_${persona}_${counter}`,
          inputDataSizeKB: Math.floor(Math.random() * 1024),
          priority: Math.random() > 0.8 ? 'high' : 'normal',
        };
      case 'task_end':
        return {
          taskId: `task-${counter - 1}-${Math.random().toString(36).substring(7)}`, // Referencing a previous task for realism
          status: Math.random() > 0.1 ? 'completed' : 'failed',
          durationMs: Math.floor(Math.random() * 5000),
          outputDataSizeKB: Math.floor(Math.random() * 2048),
        };
      case 'message_send':
        const recipientSend = persona === 'Tungsten' ? 'Carbon' : 'Tungsten'; // Simple recipient logic
        return {
          messageId: `msg-${counter}-${Math.random().toString(36).substring(7)}`,
          recipientAgentId: `agent-${recipientSend.toLowerCase()}-001`,
          messageType: 'data_chunk',
          messageSizeB: Math.floor(Math.random() * 2048),
        };
      case 'message_receive':
        const senderReceive = persona === 'Carbon' ? 'Tungsten' : 'Plasma'; // Simple sender logic
        return {
          messageId: `msg-${counter}-${Math.random().toString(36).substring(7)}`,
          senderAgentId: `agent-${senderReceive.toLowerCase()}-001`,
          messageType: 'acknowledgment',
          processingTimeMs: Math.floor(Math.random() * 500),
        };
      case 'resource_utilization':
        return {
          cpuLoadPercent: parseFloat((Math.random() * 100).toFixed(2)),
          memoryUsageMB: parseFloat((Math.random() * 2048).toFixed(2)),
          tokenCostEstimateUSD: parseFloat((Math.random() * 0.05).toFixed(4)),
        };
      case 'error':
        return {
          errorCode: `ERR_${Math.floor(1000 + Math.random() * 9000)}`,
          errorMessage: 'Failed to process input data due to an unexpected schema mismatch.',
          severity: 'critical',
          source: 'internal_computation',
        };
      case 'lifecycle':
        return {
          status: Math.random() > 0.9 ? 'restarting' : 'online',
          reason: Math.random() > 0.5 ? 'scheduled_maintenance' : 'unresponsive_detection',
        };
      default:
        return { detail: `Generic event payload ${counter}` };
    }
  }

  /**
   * Adds a new trace event to the in-memory log.
   * Manages capacity by removing older events if the limit is exceeded.
   * In a real-world scenario, this would also persist to Supabase or similar.
   */
  private addTraceEvent(event: AgentTraceEvent) {
    this.historicalLogs.push(event);
    if (this.historicalLogs.length > this.logCapacity) {
      this.historicalLogs.shift(); // Remove the oldest event
    }
    // For real-time console feedback (can be toggled for performance)
    // console.log(`[TRACE] ${event.timestamp.slice(11, 19)} - ${event.persona}: ${event.eventType}`);
  }

  /**
   * Retrieves a snapshot of the most recent agent activity traces.
   * @param limit The maximum number of traces to retrieve. Defaults to 20.
   * @returns An array of AgentTraceEvent objects, ordered from newest to oldest.
   */
  public getRecentTraces(limit: number = 20): AgentTraceEvent[] {
    return [...this.historicalLogs].reverse().slice(0, limit);
  }

  /**
   * Queries historical traces based on specified filters.
   * This method simulates querying a persistent store (e.g., Supabase database).
   * @param filters Optional object to filter traces by agent ID, persona, event type, or time range.
   * @returns A promise resolving to an array of AgentTraceEvent objects, ordered from newest to oldest.
   */
  public async queryHistoricalTraces(filters?: { agentId?: string; persona?: AgentPersona['name']; eventType?: AgentTraceEvent['eventType']; from?: string; to?: string }): Promise<AgentTraceEvent[]> {
    console.log(`[MCP::AgentActivityMonitor] Querying historical traces for Swarm Reactor with filters:`, filters);
    await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 700)); // Simulate network latency

    let filteredLogs = [...this.historicalLogs]; // Work with a copy

    if (filters?.agentId) {
      filteredLogs = filteredLogs.filter(log => log.agentId === filters.agentId);
    }
    if (filters?.persona) {
      filteredLogs = filteredLogs.filter(log => log.persona === filters.persona);
    }
    if (filters?.eventType) {
      filteredLogs = filteredLogs.filter(log => log.eventType === filters.eventType);
    }
    if (filters?.from) {
      const fromDate = new Date(filters.from);
      filteredLogs = filteredLogs.filter(log => new Date(log.timestamp) >= fromDate);
    }
    if (filters?.to) {
      const toDate = new Date(filters.to);
      filteredLogs = filteredLogs.filter(log => new Date(log.timestamp) <= toDate);
    }

    return filteredLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()); // Newest first
  }

  /**
   * Provides a summary of the current operational status for all active Crucible Agent Personas.
   * @returns A promise resolving to a record mapping agent ID to its simplified status.
   */
  public async getAgentStatusSummary(): Promise<Record<AgentPersona['id'], AgentStatus>> {
    console.log('[MCP::AgentActivityMonitor] Generating Swarm Reactor Agent Status Summary...');
    await new Promise(resolve => setTimeout(resolve, 200 + Math.random() * 300)); // Simulate async fetch

    const agentNames: AgentPersona['name'][] = ['Tungsten', 'Cobalt', 'Plasma', 'Carbon', 'Titanium', 'Ignis'];
    const statusMap: Record<AgentPersona['id'], AgentStatus> = {};

    agentNames.forEach(personaName => {
      const agentId = `agent-${personaName.toLowerCase()}-001`;
      const recentActivities = this.historicalLogs
        .filter(log => log.agentId === agentId)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()); // Newest first

      const lastActiveEvent = recentActivities[0];
      const currentTaskEvent = recentActivities.find(
        log => log.eventType === 'task_start' || log.eventType === 'message_send' || log.eventType === 'resource_utilization'
      );

      statusMap[agentId] = {
        persona: personaName,
        id: agentId,
        health: Math.random() > 0.05 ? 'optimal' : (Math.random() > 0.5 ? 'degraded' : 'critical'), // Simulate health degradation
        load: parseFloat((Math.random() * 100).toFixed(2)), // Simulate load %
        lastActive: lastActiveEvent ? lastActiveEvent.timestamp : 'N/A',
        currentTask: currentTaskEvent?.payload?.taskName || currentTaskEvent?.payload?.messageType || 'Idle / Monitoring',
      };
    });

    return statusMap;
  }

  // Future expansion: Real-time subscriptions via callbacks or RxJS Observables
  // public subscribeToRealtimeTraces(callback: (event: AgentTraceEvent) => void): () => void {
  //   // Return an unsubscribe function
  //   // This would leverage actual real-time tech (WebSockets, Supabase Realtime)
  //   console.warn('[MCP::AgentActivityMonitor] Real-time subscription is a placeholder. Implement with actual WebSocket/Supabase Realtime.');
  //   return () => console.log('Unsubscribed from placeholder stream.');
  // }
}
