"use client";

import { useState, useEffect, useCallback } from 'react';
import { getSupabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bot, Cpu, Activity, Zap, Plus, RefreshCw, Play, Pause, Settings,
  FileText, TrendingUp, Radio, CheckCircle, AlertCircle, Clock,
  Hammer, Gauge, Layers, Flame, Shield, BarChart3, Sparkles,
  ChevronDown, ChevronRight, Power, Terminal, Database,
} from 'lucide-react';

interface Agent {
  id: string;
  name: string;
  type: string;
  description: string;
  status: string;
  capabilities: string[];
  tasks_completed: number;
  last_active_at: string | null;
  created_at: string;
}

interface Blueprint {
  id: string;
  name: string;
  template_id: string;
  status: string;
  created_at: string;
}

interface Article {
  id: string;
  title: string;
  word_count: number;
  seo_score: number;
  topic: string;
  created_at: string;
}

interface ForgeEvent {
  id: string;
  event_type: string;
  message: string;
  agent_id: string;
  created_at: string;
}

interface DomainTopic {
  id: string;
  domain: string;
  topic: string;
  is_active: boolean;
  times_used: number;
}

interface PlatformStats {
  totalAgents: number;
  activeAgents: number;
  totalBlueprints: number;
  totalTasks: number;
}

const STATUS_CONFIG: Record<string, { color: string; bg: string; icon: any }> = {
  active: { color: '#00ff88', bg: '#00ff8810', icon: Activity },
  idle: { color: '#ffaa00', bg: '#ffaa0010', icon: Clock },
  busy: { color: '#3b82f6', bg: '#3b82f610', icon: Cpu },
  offline: { color: '#555', bg: '#55555510', icon: AlertCircle },
  spawning: { color: '#a855f7', bg: '#a855f710', icon: Sparkles },
};

export default function FoundryCorePage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [blueprints, setBlueprints] = useState<Blueprint[]>([]);
  const [events, setEvents] = useState<ForgeEvent[]>([]);
  const [stats, setStats] = useState<PlatformStats>({ totalAgents: 0, activeAgents: 0, totalBlueprints: 0, totalTasks: 0 });
  const [isSpawning, setIsSpawning] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'agents' | 'blueprints'>('blueprints');
  const [expandedAgent, setExpandedAgent] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  const fetchAll = useCallback(async () => {
    const supabase = getSupabase();

    const [agentsRes, blueprintsRes, eventsRes] = await Promise.all([
      supabase.from('agents_registry').select('*').order('created_at'),
      supabase.from('forge_blueprints').select('*').order('created_at', { ascending: false }).limit(30),
      supabase.from('forge_events').select('*').order('created_at', { ascending: false }).limit(25),
    ]);

    const a = agentsRes.data || [];
    const bp = blueprintsRes.data || [];

    setAgents(a);
    setBlueprints(bp);
    setEvents(eventsRes.data || []);

    setStats({
      totalAgents: a.length,
      activeAgents: a.filter((x: any) => x.status === 'active' || x.status === 'busy').length,
      totalBlueprints: bp.length,
      totalTasks: a.reduce((sum: number, x: any) => sum + (x.tasks_completed || 0), 0),
    });
  }, []);

  useEffect(() => {
    fetchAll();
    const interval = setInterval(fetchAll, 10000);

    const supabase = getSupabase();
    const channel = supabase.channel('foundry-core')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'agents_registry' }, () => fetchAll())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'forge_blueprints' }, () => fetchAll())
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'forge_events' }, (p: any) => {
        setEvents(prev => [p.new as ForgeEvent, ...prev].slice(0, 25));
      })
      .subscribe();
    return () => { clearInterval(interval); supabase.removeChannel(channel); };
  }, [fetchAll]);

  const handleSpawn = async () => {
    setIsSpawning(true);
    try {
      const res = await fetch('/api/agents/spawn', { method: 'POST' });
      const data = await res.json();
      if (data.agent) { showToast(`🤖 Spawned: ${data.agent.name}`); fetchAll(); }
      else showToast(data.message || '❌ Spawn failed');
    } catch { showToast('❌ Spawn failed'); }
    setIsSpawning(false);
  };

  const timeAgo = (d: string | null) => {
    if (!d) return 'Never';
    const m = Math.floor((Date.now() - new Date(d).getTime()) / 60000);
    if (m < 1) return 'Now';
    if (m < 60) return `${m}m`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h`;
    return `${Math.floor(h / 24)}d`;
  };

  return (
    <div className="min-h-screen pt-24 pb-24 bg-[#030303] selection:bg-[#ff8c00]/30 relative overflow-hidden">
      {/* Subtle background */}
      <div className="absolute inset-0 z-0 pointer-events-none" style={{
        backgroundImage: 'radial-gradient(circle at 50% 0%, rgba(255,140,0,0.04) 0%, transparent 60%), radial-gradient(circle at 80% 80%, rgba(0,255,136,0.02) 0%, transparent 40%)',
      }} />

      <div className="max-w-[1800px] mx-auto px-6 relative z-10">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <Flame className="w-5 h-5 text-[#ff8c00]" />
            <span className="font-mono text-[#ff8c00] tracking-[0.4em] text-[10px] uppercase">The Foundry Core</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white via-gray-300 to-[#888] uppercase tracking-tighter">
            Operational Nerve Center
          </h1>
          <p className="text-[#999] font-mono text-xs mt-2 max-w-2xl">
            Build, monitor, and control the entire Crucible platform. Agents operate autonomously — this is your command interface.
          </p>
        </motion.div>

        {/* Stats Bar */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-[#111] rounded-xl overflow-hidden mb-8 border border-[#1a1a1a]">
          {[
            { label: 'Agents', value: stats.totalAgents, icon: Bot, color: '#ff8c00' },
            { label: 'Active', value: stats.activeAgents, icon: Activity, color: '#00ff88' },
            { label: 'Blueprints', value: stats.totalBlueprints, icon: FileText, color: '#3b82f6' },
            { label: 'Tasks Done', value: stats.totalTasks, icon: CheckCircle, color: '#00ff88' },
          ].map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={i} className="bg-[#050505] p-4 flex flex-col items-center gap-1">
                <Icon className="w-4 h-4" style={{ color: s.color }} />
                <span className="font-mono text-lg font-bold text-white">{s.value}</span>
                <span className="font-mono text-[8px] text-[#888] uppercase tracking-widest">{s.label}</span>
              </div>
            );
          })}
        </motion.div>

        {/* Control Bar */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
          className="flex flex-wrap gap-3 mb-8">
          <button onClick={handleSpawn} disabled={isSpawning}
            className="px-5 py-2.5 bg-[#111] border border-[#a855f7]/30 text-[#a855f7] font-mono text-xs font-bold uppercase rounded-lg hover:bg-[#a855f7]/10 disabled:opacity-50 flex items-center gap-2 transition-all">
            {isSpawning ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
            {isSpawning ? 'Spawning...' : 'Spawn Agent'}
          </button>
          <button onClick={fetchAll}
            className="px-4 py-2.5 bg-[#111] border border-[#333] text-[#999] font-mono text-xs rounded-lg hover:text-white transition-colors flex items-center gap-2">
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
        </motion.div>

        <div className="flex gap-1 mb-6 border-b border-[#1a1a1a] pb-px">
          {(['agents', 'blueprints'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-5 py-2.5 font-mono text-xs uppercase tracking-wider transition-all border-b-2 ${
                activeTab === tab ? 'text-[#ff8c00] border-[#ff8c00]' : 'text-[#888] border-transparent hover:text-[#bbb]'
              }`}>
              {tab === 'agents' && <Bot className="w-3.5 h-3.5 inline mr-2" />}
              {tab === 'blueprints' && <FileText className="w-3.5 h-3.5 inline mr-2" />}
              {tab} ({tab === 'agents' ? agents.length : blueprints.length})
            </button>
          ))}
        </div>

        {/* Main Content */}
        <div className="grid xl:grid-cols-12 gap-6">
          <div className="xl:col-span-9">

            {/* Agents Tab */}
            {activeTab === 'agents' && (
              <div className="space-y-3">
                {agents.map((agent, i) => {
                  const cfg = STATUS_CONFIG[agent.status] || STATUS_CONFIG.idle;
                  const Icon = cfg.icon;
                  const isExpanded = expandedAgent === agent.id;

                  return (
                    <motion.div key={agent.id}
                      initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                      className="bg-[#080808] border border-[#1a1a1a] rounded-xl overflow-hidden hover:border-[#252525] transition-colors">
                      <div className="p-5 cursor-pointer" onClick={() => setExpandedAgent(isExpanded ? null : agent.id)}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: cfg.bg, border: `1px solid ${cfg.color}30` }}>
                              <Bot className="w-5 h-5" style={{ color: cfg.color }} />
                            </div>
                            <div>
                              <h3 className="font-bold text-white text-sm">{agent.name}</h3>
                              <span className="font-mono text-[9px] text-[#888] uppercase tracking-widest">{agent.type}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="hidden sm:flex items-center gap-6 mr-4">
                              <div className="text-center">
                                <div className="font-mono text-sm font-bold text-white">{agent.tasks_completed || 0}</div>
                                <div className="font-mono text-[8px] text-[#777] uppercase">Tasks</div>
                              </div>
                              <div className="text-center">
                                <div className="font-mono text-sm font-bold text-[#aaa]">{timeAgo(agent.last_active_at)}</div>
                                <div className="font-mono text-[8px] text-[#777] uppercase">Last Active</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full" style={{ backgroundColor: cfg.bg }}>
                              <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: cfg.color }} />
                              <span className="font-mono text-[9px] uppercase font-bold" style={{ color: cfg.color }}>{agent.status}</span>
                            </div>
                            {isExpanded ? <ChevronDown className="w-4 h-4 text-[#888]" /> : <ChevronRight className="w-4 h-4 text-[#777]" />}
                          </div>
                        </div>
                      </div>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                            <div className="px-5 pb-5 pt-0 border-t border-[#111]">
                              <p className="text-[#999] font-mono text-[11px] leading-relaxed mt-4 mb-3">{agent.description}</p>
                              <div className="flex flex-wrap gap-1.5">
                                {(agent.capabilities || []).map((cap, ci) => (
                                  <span key={ci} className="px-2 py-1 rounded text-[9px] font-mono uppercase bg-[#ff8c00]/5 text-[#ff8c00]/70 border border-[#ff8c00]/10">
                                    {cap}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </div>
            )}

            {/* Blueprints Tab */}
            {activeTab === 'blueprints' && (
              <div className="space-y-3">
                {blueprints.map((bp, i) => {
                  const statusColors: Record<string, string> = {
                    queued: '#ffaa00',
                    building: '#3b82f6',
                    reviewing: '#a855f7',
                    deployed: '#00ff88',
                    failed: '#ff3333'
                  };
                  const color = statusColors[bp.status] || '#555';

                  return (
                    <motion.div key={bp.id}
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                      className="bg-[#080808] border border-[#1a1a1a] rounded-lg p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between hover:border-[#252525] transition-colors gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="font-bold text-white text-base truncate">{bp.name}</h3>
                          <span className="font-mono text-[9px] text-[#ff8c00] border border-[#ff8c00]/30 px-1.5 py-0.5 rounded tracking-widest">
                            TPL-{bp.template_id}
                          </span>
                        </div>
                        <span className="font-mono text-[10px] text-[#888]">{bp.id}</span>
                      </div>
                      <div className="flex items-center gap-6 shrink-0">
                        <div className="text-right">
                          <div className="flex items-center gap-2 mb-1">
                            <div className={`w-1.5 h-1.5 rounded-full ${bp.status === 'building' || bp.status === 'reviewing' ? 'animate-pulse' : ''}`} style={{ backgroundColor: color }} />
                            <span className="font-mono text-xs font-bold uppercase tracking-widest" style={{ color }}>{bp.status}</span>
                          </div>
                          <div className="font-mono text-[9px] text-[#888]">{timeAgo(bp.created_at)}</div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
                {blueprints.length === 0 && (
                  <div className="text-center py-16">
                    <FileText className="w-10 h-10 text-[#1a1a1a] mx-auto mb-3" />
                    <p className="font-mono text-xs text-[#888]">No blueprints queued in the Forge yet</p>
                    <p className="font-mono text-[10px] text-[#666] mt-1">Deploy a template from The Armory</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right: Live Feed */}
          <div className="xl:col-span-3">
            <div className="flex items-center gap-2 mb-4">
              <Radio className="w-4 h-4 text-[#3b82f6]" />
              <h2 className="font-mono text-[10px] text-[#999] uppercase tracking-widest">Forge Events</h2>
            </div>
            <div className="space-y-1.5 max-h-[800px] overflow-y-auto pr-1">
              {events.map((e, i) => {
                const colors: Record<string, string> = {
                  SUCCESS: '#00ff88', ARTICLE_GENERATED: '#00ff88', BATCH_COMPLETE: '#00ff88',
                  BATCH_START: '#3b82f6', GATHER: '#3b82f6', SCAN: '#3b82f6',
                  SPAWNED: '#ff8c00', FORGE_CYCLE: '#ff8c00', DEPLOY: '#ff8c00',
                  ANALYZE: '#a855f7', WRITE: '#ffaa00', REPORT: '#a855f7',
                  ERROR: '#ff3333', STANDBY: '#666',
                };
                const color = colors[e.event_type] || '#555';
                return (
                  <motion.div key={e.id} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.015 }}
                    className="bg-[#080808] border border-[#111] rounded-lg p-2.5">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
                      <span className="font-mono text-[8px] font-bold uppercase" style={{ color }}>{e.event_type}</span>
                      <span className="font-mono text-[7px] text-[#666] ml-auto">{timeAgo(e.created_at)}</span>
                    </div>
                    <p className="font-mono text-[9px] text-[#888] line-clamp-2 leading-relaxed">{e.message}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-[#111] border border-[#333] px-6 py-3 rounded-xl shadow-2xl font-mono text-sm text-white max-w-lg text-center">
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
