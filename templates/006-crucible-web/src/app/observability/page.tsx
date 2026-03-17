"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, 
  Activity, 
  Search, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Zap, 
  ChevronRight, 
  Cpu,
  BarChart3,
  ShieldAlert,
  Terminal,
  Layers,
  Lock
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function ObservabilityPage() {
  const [traces, setTraces] = useState<any[]>([]);
  const [selectedTraceId, setSelectedTraceId] = useState<string | null>(null);
  const [spans, setSpans] = useState<any[]>([]);
  const [steeringLogs, setSteeringLogs] = useState<any[]>([]);
  const [chaosLogs, setChaosLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Stats
  const [stats, setStats] = useState({
    activeAgents: 12,
    hallucinationsGated: 4,
    totalRoi: 4520,
    systemIntegrity: 98.4,
    complianceScore: 100,
    scrubbedPII: 127
  });

  useEffect(() => {
    fetchTraces();
    fetchChaosLogs();
    
    // Subscribe to new traces
    const traceSub = supabase
      .channel('agent_traces_changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'agent_traces' }, payload => {
        setTraces(current => [payload.new, ...current]);
      })
      .subscribe();

    // Subscribe to chaos logs (telemetry)
    const chaosSub = supabase
      .channel('telemetry_changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'telemetry' }, payload => {
        if (payload.new.label === 'ATTACK' || payload.new.label === 'PATCH' || payload.new.label === 'SCAN') {
          setChaosLogs(current => [payload.new, ...current.slice(0, 19)]);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(traceSub);
      supabase.removeChannel(chaosSub);
    };
  }, []);

  useEffect(() => {
    if (selectedTraceId) {
      fetchSpans(selectedTraceId);
    }
  }, [selectedTraceId]);

  async function fetchStats() {
    // Total ROI and Hallucinations from traces
    const { data: traceStats } = await supabase
      .from('agent_traces')
      .select('roi_value_usd, hallucinations_detected');
    
    // Redacted PII count from spans
    const { count: redactedCount } = await supabase
      .from('agent_spans')
      .select('*', { count: 'exact', head: true })
      .eq('metadata->redacted', true);

    if (traceStats) {
      const roi = traceStats.reduce((acc, t) => acc + (Number(t.roi_value_usd) || 0), 0);
      const hallucinations = traceStats.reduce((acc, t) => acc + (t.hallucinations_detected || 0), 0);
      
      setStats(prev => ({
        ...prev,
        totalRoi: roi,
        hallucinationsGated: hallucinations,
        scrubbedPII: redactedCount || 0,
        complianceScore: Math.max(70, 100 - (hallucinations * 2)) // Simple formula
      }));
    }
  }

  async function fetchTraces() {
    setLoading(true);
    fetchStats();
    const { data, error } = await supabase
      .from('agent_traces')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setTraces(data);
      if (data.length > 0 && !selectedTraceId) {
        setSelectedTraceId(data[0].id);
      }
    }
    setLoading(false);
  }

  async function fetchSpans(traceId: string) {
    const { data, error } = await supabase
      .from('agent_spans')
      .select('*, sentinel_steering_logs(*)')
      .eq('trace_id', traceId)
      .order('created_at', { ascending: true });

    if (!error && data) {
      setSpans(data);
    }
  }

  async function fetchChaosLogs() {
    const { data } = await supabase
      .from('telemetry')
      .select('*')
      .in('label', ['ATTACK', 'PATCH', 'INJECT', 'SCAN'])
      .order('created_at', { ascending: false })
      .limit(20);
    
    if (data) setChaosLogs(data);
  }

  return (
    <div className="min-h-screen pt-24 pb-20 bg-[#050505] text-white selection:bg-[#00ff88]/30 font-sans">
      <div className="max-w-[1700px] mx-auto px-6">
        
        {/* Header Section */}
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end mb-12 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1.5 h-6 bg-[#00ff88] shadow-[0_0_15px_#00ff88]" />
              <span className="font-mono text-[#00ff88] tracking-[0.3em] text-[10px] uppercase">
                Fleet Command & Enterprise Governance
              </span>
            </div>
            <h1 className="text-5xl font-black tracking-tighter uppercase italic bg-clip-text bg-gradient-to-r from-white to-gray-600 inline-block">
              Crucible Observability
            </h1>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 w-full xl:w-auto">
            <div className="bg-[#0a0a0c] border border-[#222] p-4 rounded-xl flex items-center gap-4">
              <div className="p-2 bg-[#00ff88]/10 rounded-lg">
                <ShieldCheck size={20} className="text-[#00ff88]" />
              </div>
              <div>
                <div className="text-[10px] font-mono text-[#555] uppercase leading-none mb-1">Integrity</div>
                <div className="text-xl font-bold font-mono">{stats.systemIntegrity}%</div>
              </div>
            </div>
            <div className="bg-[#0a0a0c] border border-[#222] p-4 rounded-xl flex items-center gap-4">
              <div className="p-2 bg-[#00ecff]/10 rounded-lg">
                <ShieldAlert size={20} className="text-[#00ecff]" />
              </div>
              <div>
                <div className="text-[10px] font-mono text-[#555] uppercase leading-none mb-1">Compliance</div>
                <div className="text-xl font-bold font-mono text-[#00ecff]">{stats.complianceScore}%</div>
              </div>
            </div>
            <div className="bg-[#0a0a0c] border border-[#222] p-4 rounded-xl flex items-center gap-4">
              <div className="p-2 bg-[#ffc107]/10 rounded-lg">
                <BarChart3 size={20} className="text-[#ffc107]" />
              </div>
              <div>
                <div className="text-[10px] font-mono text-[#555] uppercase leading-none mb-1">Total ROI</div>
                <div className="text-xl font-bold font-mono text-[#ffc107]">${stats.totalRoi.toLocaleString()}</div>
              </div>
            </div>
            <div className="bg-[#0a0a0c] border border-[#222] p-4 rounded-xl flex items-center gap-4 border-l-4 border-l-[#ff4444]">
              <div className="p-2 bg-[#ff4444]/10 rounded-lg">
                <Lock size={20} className="text-[#ff4444]" />
              </div>
              <div>
                <div className="text-[10px] font-mono text-[#555] uppercase leading-none mb-1">PII Redacted</div>
                <div className="text-xl font-bold font-mono text-[#ff4444]">{stats.scrubbedPII}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Sidebar: Trace List */}
          <div className="lg:col-span-1 border-r border-[#1a1a1a] pr-8 space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-mono text-[11px] uppercase tracking-widest text-[#555]">Active Directives</h2>
              <div className="w-8 h-8 rounded bg-[#111] flex items-center justify-center cursor-pointer hover:bg-[#222]">
                <Activity size={14} className="text-[#00ff88]" />
              </div>
            </div>

            {loading ? (
              <div className="animate-pulse space-y-3">
                {[1,2,3,4].map(i => <div key={i} className="h-16 bg-[#0a0a0c] rounded-xl border border-[#111]" />)}
              </div>
            ) : (
              <div className="space-y-3">
                {traces.map((trace) => (
                  <div
                    key={trace.id}
                    onClick={() => setSelectedTraceId(trace.id)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      selectedTraceId === trace.id 
                        ? 'bg-[#00ff88]/5 border-[#00ff88]/30 shadow-[0_0_20px_rgba(0,255,136,0.05)]' 
                        : 'bg-[#0a0a0c] border-[#1a1a1a] hover:border-[#333]'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-mono text-[10px] text-[#555] uppercase truncate max-w-[120px]">
                        {trace.id.split('-')[0]} &bull; {trace.directive_name}
                      </span>
                      <span className={`px-1.5 py-0.5 rounded text-[8px] font-mono font-bold uppercase ${
                        trace.status === 'RUNNING' ? 'bg-blue-500/10 text-blue-400' : 'bg-[#00ff88]/10 text-[#00ff88]'
                      }`}>
                        {trace.status}
                      </span>
                    </div>
                    {trace.directive_name.startsWith('FORGE_EXEC') && (
                      <div className="mb-2 flex items-center gap-1.5">
                        <div className="px-1 py-0.5 rounded-[4px] bg-[#ff8c00]/10 border border-[#ff8c00]/30 text-[#ff8c00] text-[7px] font-mono font-black tracking-widest uppercase">
                          Executive Delegation
                        </div>
                      </div>
                    )}
                    <div className="text-sm font-bold text-white group-hover:text-[#00ff88] transition-colors uppercase italic tracking-wider">
                      {trace.directive_name.replace(/_/g, ' ')}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Main Content: Spans & Steering */}
          <div className="lg:col-span-3 space-y-8">
            
            <AnimatePresence mode="wait">
              {selectedTraceId ? (
                <motion.div 
                  key={selectedTraceId}
                  initial={{ opacity: 0, y: 10 }} 
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-8"
                >
                  
                  {/* Trace Context HUD */}
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                    <div className="bg-[#0a0a0c] border border-[#1a1a1a] p-6 rounded-2xl relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Cpu size={80} />
                      </div>
                      <div className="text-[10px] font-mono text-[#555] uppercase mb-1">Hallucination Delta</div>
                      <div className="text-3xl font-black font-mono text-[#ff4444]">
                        {traces.find(t => t.id === selectedTraceId)?.hallucinations_detected || 0}
                      </div>
                      <div className="text-[9px] font-mono text-[#333] mt-2 italic">SENTINEL_GATED_COUNT</div>
                    </div>
                    <div className="bg-[#0a0a0c] border border-[#1a1a1a] p-6 rounded-2xl relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Zap size={80} />
                      </div>
                      <div className="text-[10px] font-mono text-[#555] uppercase mb-1">Calculated ROI</div>
                      <div className="text-3xl font-black font-mono text-[#00ff88]">
                        ${traces.find(t => t.id === selectedTraceId)?.roi_value_usd || 0}
                      </div>
                      <div className="text-[9px] font-mono text-[#333] mt-2 italic">HUMAN_EFFORT_EQUIVALENT</div>
                    </div>
                    <div className="bg-[#0a0a0c] border border-[#1a1a1a] p-6 rounded-2xl relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Terminal size={80} />
                      </div>
                      <div className="text-[10px] font-mono text-[#555] uppercase mb-1">Span Velocity</div>
                      <div className="text-3xl font-black font-mono text-white">
                        {spans.length} <span className="text-sm font-normal text-[#555]">Spans</span>
                      </div>
                      <div className="text-[9px] font-mono text-[#333] mt-2 italic">CHAIN_OF_THOUGHT_RECORDS</div>
                    </div>
                    {/* Innovation: Token Budget Monitor */}
                    <div className="bg-[#0a0a0c] border border-[#1a1a1a] p-6 rounded-2xl relative overflow-hidden group border-r-4 border-r-[#3b82f6]">
                      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity text-blue-500">
                        <BarChart3 size={80} />
                      </div>
                      <div className="text-[10px] font-mono text-[#555] uppercase mb-1">Token Budget Monitor</div>
                      <div className="text-3xl font-black font-mono text-blue-400">
                        {traces.find(t => t.id === selectedTraceId)?.metadata?.used_tokens || 0}
                        <span className="text-sm font-normal text-[#444]"> / {traces.find(t => t.id === selectedTraceId)?.metadata?.budget_tokens || '∞'}</span>
                      </div>
                      <div className="text-[9px] font-mono text-[#333] mt-2 italic uppercase">Resource_Aware_Steering_Enforced</div>
                    </div>
                  </div>

                  {/* Span Timeline */}
                  <div className="bg-[#0a0a0c] border border-[#1a1a1a] rounded-2xl overflow-hidden shadow-2xl">
                    <div className="border-b border-[#1a1a1a] bg-[#0c0c0e] px-6 py-4 flex justify-between items-center">
                       <h3 className="font-mono text-[11px] uppercase tracking-widest text-[#888] flex items-center gap-2">
                         <Layers size={14} className="text-[#00ff88]" /> Semantic Trace Execution
                       </h3>
                       <div className="flex gap-4">
                         <div className="flex items-center gap-2 text-[9px] font-mono text-[#555]">
                           <div className="w-2 h-2 rounded-full bg-[#00ff88]" /> COMPLETE
                         </div>
                         <div className="flex items-center gap-2 text-[9px] font-mono text-[#555]">
                           <div className="w-2 h-2 rounded-full bg-blue-500" /> TOOL_CALL
                         </div>
                         <div className="flex items-center gap-2 text-[9px] font-mono text-[#555]">
                           <div className="w-2 h-2 rounded-full bg-[#ffc107]" /> GATED
                         </div>
                       </div>
                    </div>

                    <div className="p-0">
                      {spans.length === 0 ? (
                        <div className="p-12 text-center text-[#444] font-mono text-sm italic">
                          No spans recorded for this directive yet. Initializing chain telemetry...
                        </div>
                      ) : (
                        <div className="divide-y divide-[#111]">
                          {spans.map((span, idx) => (
                            <div key={span.id} className="p-6 hover:bg-[#111] transition-colors group">
                              <div className="flex justify-between items-start">
                                <div className="flex gap-4 items-start">
                                  <div className="mt-1">
                                    {span.span_type === 'tool_call' ? (
                                      <Zap size={16} className="text-blue-500" />
                                    ) : (
                                      <div className={`w-4 h-4 rounded-full border-4 border-black ${
                                        span.status === 'COMPLETE' ? 'bg-[#00ff88]' : 'bg-gray-600 animate-pulse'
                                      }`} />
                                    )}
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-3">
                                      <span className="font-mono font-bold text-[#aaa] text-xs uppercase tracking-tighter">
                                        {span.agent_name}
                                      </span>
                                      <ChevronRight size={10} className="text-[#333]" />
                                      <span className="font-mono text-[#ff8c00] text-xs">
                                        {span.operation}
                                      </span>
                                    </div>
                                    <div className="mt-2 text-[#555] font-mono text-[10px] max-w-2xl bg-black/40 p-2 rounded border border-[#1a1a1a] opacity-60 group-hover:opacity-100 transition-opacity">
                                      {JSON.stringify(span.input).substring(0, 150)}...
                                    </div>
                                    
                                    {/* Sentinel Decision Overlay */}
                                    {span.sentinel_steering_logs && span.sentinel_steering_logs.length > 0 && (
                                      <div className="mt-3 flex gap-4">
                                        {span.sentinel_steering_logs.map((log: any) => (
                                          <div key={log.id} className={`flex items-center gap-2 text-[9px] font-mono px-2 py-1 rounded border ${
                                            log.decision === 'APPROVED' 
                                              ? 'bg-[#00ff88]/5 border-[#00ff88]/20 text-[#00ff88]' 
                                              : 'bg-red-500/10 border-red-500/20 text-red-500'
                                          }`}>
                                            <ShieldAlert size={10} />
                                            SENTINEL {log.decision}: {log.reason}
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="text-[10px] font-mono text-[#333] mb-1">DURATION</div>
                                  <div className="text-xs font-mono text-[#888]">{span.duration_ms || '--'}ms</div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                </motion.div>
              ) : (
                <div className="h-[600px] flex flex-col items-center justify-center text-[#333]">
                  <Activity size={48} className="mb-4 opacity-20" />
                  <p className="font-mono text-sm uppercase tracking-widest">Select an active transmission to view live steering</p>
                </div>
              )}
            </AnimatePresence>

          </div>
        </div>

        {/* Innovation: The Gauntlet (Defense Matrix) */}
        <div className="mt-12 bg-[#0a0a0c] border border-[#1a1a1a] rounded-2xl overflow-hidden shadow-2xl">
          <div className="border-b border-[#1a1a1a] bg-[#0c0c0e] px-6 py-4 flex justify-between items-center">
             <h3 className="font-mono text-[11px] uppercase tracking-widest text-[#ff4444] flex items-center gap-2">
               <ShieldAlert size={14} /> The Gauntlet: Adversarial Defense Matrix
             </h3>
             <div className="flex gap-4">
                <span className="text-[10px] font-mono text-[#555] animate-pulse uppercase tracking-[0.2em]">Live Arbitration Active</span>
             </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 divide-x divide-[#111]">
            <div className="p-6">
              <div className="text-[10px] font-mono text-[#555] uppercase mb-4 tracking-tighter">Attack Vectors (Chaos Engineer)</div>
              <div className="space-y-3">
                {chaosLogs.filter((l: any) => l.label === 'ATTACK' || l.label === 'INJECT').length === 0 ? (
                  <div className="text-xs font-mono text-[#333] italic">Monitoring for adversarial penetration attempts...</div>
                ) : (
                  chaosLogs.filter((l: any) => l.label === 'ATTACK' || l.label === 'INJECT').map((log: any) => (
                    <div key={log.id} className="flex gap-3 bg-red-500/5 p-3 rounded border border-red-900/20">
                      <div className="text-red-500 font-mono text-[10px] mt-0.5 whitespace-nowrap">[{new Date(log.created_at).toLocaleTimeString()}]</div>
                      <div className="text-xs font-mono text-red-200/80">&gt; {log.message}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
            <div className="p-6 bg-[#0c0c0e]/50">
              <div className="text-[10px] font-mono text-[#555] uppercase mb-4 tracking-tighter">Self-Healing Protocols (Auto-Healer / Sentinel)</div>
              <div className="space-y-3">
                {chaosLogs.filter((l: any) => l.label === 'SCAN' || l.label === 'PATCH').length === 0 ? (
                  <div className="text-xs font-mono text-[#333] italic">Integrity verification in progress...</div>
                ) : (
                  chaosLogs.filter((l: any) => l.label === 'SCAN' || l.label === 'PATCH').map((log: any) => (
                    <div key={log.id} className="flex gap-3 bg-[#00ff88]/5 p-3 rounded border border-[#00ff88]/20">
                      <div className="text-[#00ff88] font-mono text-[10px] mt-0.5 whitespace-nowrap">[{new Date(log.created_at).toLocaleTimeString()}]</div>
                      <div className="text-xs font-mono text-[#00ff88]/80">&gt; {log.message}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
