"use client";

import { useState, useEffect, useCallback } from 'react';
import { getSupabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bot, Cpu, Activity, Zap, Plus, RefreshCw, Play, Pause, Settings,
  FileText, TrendingUp, Radio, CheckCircle, AlertCircle, Clock,
  Hammer, Gauge, Layers, Flame, Shield, BarChart3, Sparkles,
  ChevronDown, ChevronRight, Power, Terminal, Database, Eye,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';

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

interface Article {
  id: string;
  title: string;
  content: string;
  summary: string;
  tags: string[];
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
  totalArticles: number;
  totalTopics: number;
  totalTasks: number;
  avgSeoScore: number;
  totalWords: number;
}

const STATUS_CONFIG: Record<string, { color: string; bg: string; icon: any }> = {
  active: { color: '#00ff88', bg: '#00ff8810', icon: Activity },
  idle: { color: '#ffaa00', bg: '#ffaa0010', icon: Clock },
  busy: { color: '#3b82f6', bg: '#3b82f610', icon: Cpu },
  offline: { color: '#555', bg: '#55555510', icon: AlertCircle },
  spawning: { color: '#a855f7', bg: '#a855f710', icon: Sparkles },
};

export default function ArticleCorePage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [events, setEvents] = useState<ForgeEvent[]>([]);
  const [topics, setTopics] = useState<DomainTopic[]>([]);
  const [stats, setStats] = useState<PlatformStats>({ totalAgents: 0, activeAgents: 0, totalArticles: 0, totalTopics: 0, totalTasks: 0, avgSeoScore: 0, totalWords: 0 });
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSpawning, setIsSpawning] = useState(false);
  const [isBatchRunning, setIsBatchRunning] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'agents' | 'topics' | 'articles'>('agents');
  const [expandedAgent, setExpandedAgent] = useState<string | null>(null);
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  const fetchAll = useCallback(async () => {
    const supabase = getSupabase();

    const [agentsRes, articlesRes, eventsRes, topicsRes] = await Promise.all([
      supabase.from('agents_registry').select('*').order('created_at'),
      supabase.from('generated_articles').select('*').order('created_at', { ascending: false }).limit(30),
      supabase.from('forge_events').select('*').order('created_at', { ascending: false }).limit(25),
      supabase.from('ai_domain_topics').select('*').order('domain'),
    ]);

    const a = agentsRes.data || [];
    const art = articlesRes.data || [];
    const t = topicsRes.data || [];

    setAgents(a);
    setArticles(art);
    setEvents(eventsRes.data || []);
    setTopics(t);

    setStats({
      totalAgents: a.length,
      activeAgents: a.filter(x => x.status === 'active' || x.status === 'busy').length,
      totalArticles: art.length,
      totalTopics: t.length,
      totalTasks: a.reduce((sum, x) => sum + (x.tasks_completed || 0), 0),
      avgSeoScore: art.length ? Math.round(art.reduce((sum, x) => sum + (x.seo_score || 0), 0) / art.length) : 0,
      totalWords: art.reduce((sum, x) => sum + (x.word_count || 0), 0),
    });
  }, []);

  useEffect(() => {
    fetchAll();
    const interval = setInterval(fetchAll, 10000);

    // Real-time
    const supabase = getSupabase();
    const channel = supabase.channel('article-core')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'agents_registry' }, () => fetchAll())
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'generated_articles' }, () => fetchAll())
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'forge_events' }, (p) => {
        setEvents(prev => [p.new as ForgeEvent, ...prev].slice(0, 25));
      })
      .subscribe();
    return () => { clearInterval(interval); supabase.removeChannel(channel); };
  }, [fetchAll]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch('/api/articles/generate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
      const data = await res.json();
      if (data.success) { showToast(`✨ ${data.article?.title}`); fetchAll(); }
      else showToast(`❌ ${data.error}`);
    } catch { showToast('❌ Generation failed'); }
    setIsGenerating(false);
  };

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

  const handleBatch = async () => {
    setIsBatchRunning(true);
    showToast('🔥 Batch generation started — 10 articles across AI domains...');
    try {
      const res = await fetch('/api/articles/generate-batch');
      const data = await res.json();
      if (data.success) showToast(`✅ Batch complete: ${data.generated} articles generated`);
      else showToast(`❌ ${data.error}`);
      fetchAll();
    } catch { showToast('❌ Batch failed'); }
    setIsBatchRunning(false);
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

  const domainGroups = topics.reduce<Record<string, DomainTopic[]>>((acc, t) => {
    (acc[t.domain] = acc[t.domain] || []).push(t);
    return acc;
  }, {});

  return (
    <div className="min-h-screen pt-24 pb-24 bg-[#030303] selection:bg-[#ff8c00]/30 relative overflow-hidden">
      {/* Subtle background */}
      <div className="absolute inset-0 z-0 pointer-events-none" style={{
        backgroundImage: 'radial-gradient(circle at 50% 0%, rgba(255,140,0,0.04) 0%, transparent 60%), radial-gradient(circle at 80% 80%, rgba(0,255,136,0.02) 0%, transparent 40%)',
      }} />

      <div className="max-w-[1800px] mx-auto px-6 relative z-10">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-10 px-2 lg:px-4">
          <div className="flex items-center gap-3 mb-4">
            <Flame className="w-5 h-5 text-[#ff8c00]" />
            <span className="font-mono text-[#ff8c00] tracking-[0.4em] text-[10px] uppercase">The Article Core</span>
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white via-gray-400 to-[#333] uppercase tracking-tighter leading-[0.9]">
            Content Nerve Center
          </h1>
          <p className="text-[#555] font-mono text-xs mt-4 max-w-2xl leading-relaxed uppercase tracking-wider">
            Legacy content generation operations dashboard.
          </p>
        </motion.div>

        {/* Stats Bar */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-px bg-[#111] rounded-xl overflow-hidden mb-10 border border-[#1a1a1a] shadow-2xl relative z-10">
          {[
            { label: 'Agents', value: stats.totalAgents, icon: Bot, color: '#ff8c00' },
            { label: 'Active', value: stats.activeAgents, icon: Activity, color: '#00ff88' },
            { label: 'Articles', value: stats.totalArticles, icon: FileText, color: '#3b82f6' },
            { label: 'Topics', value: stats.totalTopics, icon: Database, color: '#a855f7' },
            { label: 'Tasks Done', value: stats.totalTasks, icon: CheckCircle, color: '#00ff88' },
            { label: 'Avg SEO', value: stats.avgSeoScore, icon: Gauge, color: '#ff8c00' },
            { label: 'Total Words', value: stats.totalWords.toLocaleString(), icon: Layers, color: '#3b82f6' },
          ].map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={i} className="bg-[#050505] p-4 flex flex-col items-center gap-1">
                <Icon className="w-4 h-4" style={{ color: s.color }} />
                <span className="font-mono text-lg font-bold text-white">{s.value}</span>
                <span className="font-mono text-[8px] text-[#444] uppercase tracking-widest">{s.label}</span>
              </div>
            );
          })}
        </motion.div>

        {/* Control Bar */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
          className="flex flex-wrap gap-3 mb-8">
          <button onClick={handleGenerate} disabled={isGenerating}
            className="px-5 py-2.5 bg-gradient-to-r from-[#ff8c00] to-[#ff6600] text-black font-mono text-xs font-bold uppercase rounded-lg hover:shadow-[0_0_20px_rgba(255,140,0,0.3)] disabled:opacity-50 flex items-center gap-2 transition-all">
            {isGenerating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <FileText className="w-3.5 h-3.5" />}
            {isGenerating ? 'Writing...' : 'Generate Article'}
          </button>
          <button onClick={handleBatch} disabled={isBatchRunning}
            className="px-5 py-2.5 bg-[#111] border border-[#00ff88]/30 text-[#00ff88] font-mono text-xs font-bold uppercase rounded-lg hover:bg-[#00ff88]/10 disabled:opacity-50 flex items-center gap-2 transition-all">
            {isBatchRunning ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
            {isBatchRunning ? 'Generating 10...' : 'Batch Generate (10)'}
          </button>
          <button onClick={handleSpawn} disabled={isSpawning}
            className="px-5 py-2.5 bg-[#111] border border-[#a855f7]/30 text-[#a855f7] font-mono text-xs font-bold uppercase rounded-lg hover:bg-[#a855f7]/10 disabled:opacity-50 flex items-center gap-2 transition-all">
            {isSpawning ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
            {isSpawning ? 'Spawning...' : 'Spawn Agent'}
          </button>
          <button onClick={fetchAll}
            className="px-4 py-2.5 bg-[#111] border border-[#333] text-[#666] font-mono text-xs rounded-lg hover:text-white transition-colors flex items-center gap-2">
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
        </motion.div>

        {/* Tabs */}
        <div className="flex overflow-x-auto no-scrollbar gap-1 mb-8 border-b border-[#1a1a1a] pb-px">
          {(['agents', 'topics', 'articles'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-5 py-3 font-mono text-[10px] md:text-xs uppercase tracking-wider transition-all border-b-2 whitespace-nowrap ${
                activeTab === tab ? 'text-[#ff8c00] border-[#ff8c00]' : 'text-[#555] border-transparent hover:text-[#888]'
              }`}>
              {tab === 'agents' && <Bot className="w-3.5 h-3.5 inline mr-2" />}
              {tab === 'topics' && <Database className="w-3.5 h-3.5 inline mr-2" />}
              {tab === 'articles' && <FileText className="w-3.5 h-3.5 inline mr-2" />}
              {tab} ({tab === 'agents' ? agents.length : tab === 'topics' ? topics.length : articles.length})
            </button>
          ))}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
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
                              <span className="font-mono text-[9px] text-[#444] uppercase tracking-widest">{agent.type}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="hidden sm:flex items-center gap-6 mr-4">
                              <div className="text-center">
                                <div className="font-mono text-sm font-bold text-white">{agent.tasks_completed || 0}</div>
                                <div className="font-mono text-[8px] text-[#333] uppercase">Tasks</div>
                              </div>
                              <div className="text-center">
                                <div className="font-mono text-sm font-bold text-[#666]">{timeAgo(agent.last_active_at)}</div>
                                <div className="font-mono text-[8px] text-[#333] uppercase">Last Active</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full" style={{ backgroundColor: cfg.bg }}>
                              <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: cfg.color }} />
                              <span className="font-mono text-[9px] uppercase font-bold" style={{ color: cfg.color }}>{agent.status}</span>
                            </div>
                            {isExpanded ? <ChevronDown className="w-4 h-4 text-[#444]" /> : <ChevronRight className="w-4 h-4 text-[#333]" />}
                          </div>
                        </div>
                      </div>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                            <div className="px-5 pb-5 pt-0 border-t border-[#111]">
                              <p className="text-[#555] font-mono text-[11px] leading-relaxed mt-4 mb-3">{agent.description}</p>
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

            {/* Topics Tab */}
            {activeTab === 'topics' && (
              <div className="space-y-4">
                {Object.entries(domainGroups).map(([domain, domainTopics]) => (
                  <div key={domain} className="bg-[#080808] border border-[#1a1a1a] rounded-xl p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <Shield className="w-4 h-4 text-[#ff8c00]" />
                      <h3 className="font-bold text-white text-sm">{domain}</h3>
                      <span className="font-mono text-[9px] text-[#444] bg-[#111] px-2 py-0.5 rounded">{domainTopics.length} topics</span>
                    </div>
                    <div className="space-y-1.5">
                      {domainTopics.map(t => (
                        <div key={t.id} className="flex items-center justify-between py-1.5 px-3 rounded-lg hover:bg-[#111] transition-colors">
                          <span className="font-mono text-[11px] text-[#777] flex-1">{t.topic}</span>
                          <div className="flex items-center gap-3 shrink-0 ml-4">
                            <span className="font-mono text-[9px] text-[#333]">Used: {t.times_used}x</span>
                            <div className={`w-2 h-2 rounded-full ${t.is_active ? 'bg-[#00ff88]' : 'bg-[#333]'}`} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Articles Tab */}
            {activeTab === 'articles' && (
              <div className="space-y-2">
                {articles.map((a, i) => {
                  const isExpanded = selectedArticleId === a.id;
                  return (
                    <motion.div key={a.id}
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                      className={`bg-[#080808] border rounded-xl overflow-hidden transition-all duration-300 ${
                        isExpanded ? 'border-[#3b82f6]/50 shadow-[0_0_30px_rgba(59,130,246,0.05)]' : 'border-[#1a1a1a] hover:border-[#252525]'
                      }`}>
                      
                      <div className="p-4 flex items-center justify-between cursor-pointer" onClick={() => setSelectedArticleId(isExpanded ? null : a.id)}>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-white text-sm truncate uppercase tracking-tight">{a.title}</h3>
                          <span className="font-mono text-[9px] text-[#444] uppercase tracking-widest">{a.topic}</span>
                        </div>
                        <div className="flex items-center gap-5 shrink-0 ml-4">
                          <div className="text-center hidden sm:block">
                            <span className="font-mono text-xs font-bold text-[#3b82f6]">{a.word_count}</span>
                            <div className="font-mono text-[7px] text-[#333] uppercase">Words</div>
                          </div>
                          <div className="text-center">
                            <span className="font-mono text-xs font-bold text-[#00ff88]">{a.seo_score}</span>
                            <div className="font-mono text-[7px] text-[#333] uppercase">SEO</div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-mono text-[9px] text-[#333] uppercase">{timeAgo(a.created_at)}</span>
                            {isExpanded ? <ChevronDown className="w-4 h-4 text-[#3b82f6]" /> : <Eye className="w-4 h-4 text-[#222]" />}
                          </div>
                        </div>
                      </div>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="border-t border-[#111]"
                          >
                            <div className="p-6 sm:p-8 bg-[#050505] relative overflow-hidden">
                              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(59,130,246,0.03)_0%,transparent_70%)] pointer-events-none" />
                              <div className="relative z-10">
                                <p className="text-[#666] font-mono text-xs mb-8 italic border-l-2 border-[#3b82f6] pl-4 py-1 uppercase tracking-wider">
                                  {a.summary || "No summary available for this intelligence node."}
                                </p>
                                <div className="prose-crucible max-h-[500px] overflow-y-auto pr-4 scrollbar-thin scrollbar-track-[#0a0a0c] scrollbar-thumb-[#222]">
                                  <ReactMarkdown>{a.content}</ReactMarkdown>
                                </div>
                                <div className="mt-8 flex flex-wrap gap-2">
                                  {(a.tags || []).map((tag, ti) => (
                                    <span key={ti} className="px-2 py-1 rounded text-[8px] font-mono uppercase bg-[#111] text-[#444] border border-[#222]">
                                      #{tag}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
                {articles.length === 0 && (
                  <div className="text-center py-16">
                    <FileText className="w-10 h-10 text-[#1a1a1a] mx-auto mb-3" />
                    <p className="font-mono text-xs text-[#333]">No articles generated yet</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right: Live Feed */}
          <div className="xl:col-span-3">
            <div className="flex items-center gap-2 mb-4">
              <Radio className="w-4 h-4 text-[#3b82f6]" />
              <h2 className="font-mono text-[10px] text-[#555] uppercase tracking-widest">Forge Events</h2>
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
                      <span className="font-mono text-[7px] text-[#222] ml-auto">{timeAgo(e.created_at)}</span>
                    </div>
                    <p className="font-mono text-[9px] text-[#444] line-clamp-2 leading-relaxed">{e.message}</p>
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
