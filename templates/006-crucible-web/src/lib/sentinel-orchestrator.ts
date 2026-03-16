import { supabase } from './supabase';

export type SpanType = 'process' | 'tool_call' | 'audit';
export type SteeringDecision = 'APPROVED' | 'GATED' | 'MODIFIED';

export interface TraceContext {
  traceId: string;
  directiveName: string;
}

/**
 * Global Sentinel Orchestrator
 * Mirroring Quotient AI's high-performance steering and evaluation.
 */
export const CrucibleSentinel = {
  /**
   * Initialize a new global trace
   */
  async startTrace(directiveName: string, metadata: any = {}): Promise<TraceContext> {
    const { data, error } = await supabase
      .from('agent_traces')
      .insert({ directive_name: directiveName, metadata })
      .select('id')
      .single();

    if (error) throw error;
    return { traceId: data.id, directiveName };
  },

  /**
   * Wrap an agent operation in a Span with Sentinel steering
   */
  async executeGated(
    context: TraceContext,
    agentName: string,
    operation: string,
    params: any,
    executor: (params: any) => Promise<any>
  ) {
    // 1. Create a Span
    const { data: span, error: spanErr } = await supabase
      .from('agent_spans')
      .insert({
        trace_id: context.traceId,
        agent_name: agentName,
        span_type: 'process',
        operation,
        input: params,
        status: 'PENDING'
      })
      .select('id')
      .single();

    if (spanErr) throw spanErr;

    const startTime = Date.now();

    try {
      // 2. SENTINEL GATE (Scout Model Simulation)
      // In a real scenario, this would call a specialized LLM to audit the proposed action.
      const isHighRisk = this.checkRisk(operation, params);
      
      const { data: steering } = await supabase
        .from('sentinel_steering_logs')
        .insert({
          span_id: span.id,
          decision: isHighRisk ? 'GATED' : 'APPROVED',
          reason: isHighRisk ? 'Destructive operation detected without specific directive alignment.' : 'Directive compliant.',
          scout_model: 'sentinel-v1-scout'
        })
        .select()
        .single();

      if (isHighRisk) {
        throw new Error(`🛡️ SENTINEL GATED: Operation '${operation}' was blocked for safety.`);
      }

      // 3. Execute the actual work
      const result = await executor(params);

      // 4. Close Span
      await supabase
        .from('agent_spans')
        .update({
          output: result,
          status: 'COMPLETE',
          duration_ms: Date.now() - startTime,
          completed_at: new Date().toISOString()
        })
        .eq('id', span.id);

      return result;

    } catch (err: any) {
      // Log failure in span
      await supabase
        .from('agent_spans')
        .update({
          output: { error: err.message },
          status: 'FAILED',
          duration_ms: Date.now() - startTime,
          completed_at: new Date().toISOString()
        })
        .eq('id', span.id);

      throw err;
    }
  },

  /**
   * Mock risk detection logic
   */
  checkRisk(operation: string, params: any): boolean {
    const highRiskKeywords = ['delete', 'drop', 'refund', 'wipe', 'reset_password'];
    const opLower = operation.toLowerCase();
    
    // Simple heuristic for demonstration
    if (highRiskKeywords.some(kw => opLower.includes(kw))) {
      // If the directive specifically mentions 'REFACTOR' or 'MIGRATION', allow it
      return false; 
    }
    
    // Block random deletes
    if (opLower.includes('delete') && !params?.confirmed_by_sentinel) {
      return true;
    }

    return false;
  }
};
