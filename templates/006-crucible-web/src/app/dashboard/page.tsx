"use client";

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bot, FileText, Zap, Play, Plus, RefreshCw, TrendingUp,
  Activity, Clock, CheckCircle, AlertCircle, Cpu, Sparkles,
  BarChart3, Eye, ChevronRight, Radio,
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
  slug: string;
  content: string;
  summary: string;
  tags: string[];
  agent_id: string;
  status: string;
  seo_score: number;
  word_count: number;
  topic: string;
  published_at: string;
  created_at: string;
}

interface ForgeEvent {
  id: string;
  event_type: string;
  message: string;
  agent_id: string;
  created_at: string;
}

const STATUS_COLORS: Record<string, string> = {
  active: '#00ff88',
  idle: '#ffaa00',
  busy: '#3b82f6',
  offline: '#555',
  spawning: '#a855f7',
};

const STATUS_ICONS: Record<string, any> = {
  active: Activity,
  idle: Clock,
  busy: Cpu,
  offline: AlertCircle,
  spawning: Sparkles,
};

export default function CommandCenterPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [events, setEvents] = useState<ForgeEvent[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSpawning, setIsSpawning] = useState(false);
  const [topicInput, setTopicInput] = useState('');
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  const fetchAgents = useCallback(async () => {
    try {
      const res = await fetch('/api/agents/list');
      const data = await res.json();
      if (data.agents) setAgents(data.agents);
    } catch { /* silent */ }
  }, []);

  const fetchArticles = useCallback(async () => {
    try {
      const res = await fetch('/api/articles/list');
      const data = await res.json();
      if (data.articles) setArticles(data.articles);
    } catch { /* silent */ }
  }, []);

  const fetchEvents = useCallback(async () => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    if (!supabaseUrl || !supabaseKey) return;
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data } = await supabase
      .from('forge_events')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);
    if (data) setEvents(data);
  }, []);

  useEffect(() => {
    fetchAgents();
    fetchArticles();
    fetchEvents();

    // Real-time subscriptions
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    if (!supabaseUrl || !supabaseKey) return;

    const supabase = createClient(supabaseUrl, supabaseKey);

    const channel = supabase.channel('command-center')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'agents_registry' }, () => fetchAgents())
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'generated_articles' }, () => fetchArticles())
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'forge_events' }, (payload) => {
        setEvents(prev => [payload.new as ForgeEvent, ...prev].slice(0, 20));
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchAgents, fetchArticles, fetchEvents]);

  const handleGenerateArticle = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch('/api/articles/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: topicInput || undefined }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`✨ Article generated: "${data.article?.title}"`);
        setTopicInput('');
        fetchArticles();
      } else {
        showToast(`❌ ${data.error}`);
      }
    } catch {
      showToast('❌ Failed to generate article');
    }
    setIsGenerating(false);
  };

  const handleSpawnAgent = async () => {
    setIsSpawning(true);
    try {
      const res = await fetch('/api/agents/spawn', { method: 'POST' });
      const data = await res.json();
      if (data.success && data.agent) {
        showToast(`🤖 New agent spawned: "${data.agent.name}"`);
        fetchAgents();
      } else if (data.success) {
        showToast('ℹ️ No new agent needed — all gaps covered');
      } else {
        showToast(`❌ ${data.error}`);
      }
    } catch {
      showToast('❌ Failed to spawn agent');
    }
    setIsSpawning(false);
  };

  const timeAgo = (dateStr: string | null) => {
    if (!dateStr) return 'Never';
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <div className="min-h-screen pt-24 pb-24 bg-[#050505] selection:bg-[#ff8c00]/30 relative overflow-hidden">

      {/* Background Grid */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-15" style={{
        backgroundImage: 'radial-gradient(circle at 30% 20%, rgba(255,140,0,0.08) 0%, transparent 50%), linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
        backgroundSize: '100% 100%, 60px 60px, 60px 60px',
      }} />

      <div className="max-w-[1600px] mx-auto px-6 relative z-10">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 border-b-2 border-[#1a1a1a] pb-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-2 h-8 bg-[#ff8c00] animate-pulse rounded-sm shadow-[0_0_15px_#ff8c00]" />
            <span className="font-mono text-[#ff8c00] tracking-[0.4em] text-sm uppercase">Command Center</span>
          </div>

          <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6">
            <div>
              <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white via-gray-400 to-[#333] uppercase tracking-tighter mb-2">
                Agent HQ
              </h1>
              <p className="text-[#666] font-mono text-sm max-w-xl leading-relaxed">
                Autonomous AI agents running continuously. Generate articles, analyze markets, scout trends, and spawn new agents — all from one command deck.
              </p>
            </div>

            {/* Stats HUD */}
            <div className="bg-[#0a0a0c] border border-[#222] p-4 rounded-xl flex items-center gap-6 shadow-2xl">
              <div className="flex flex-col">
                <span className="text-[#555] font-mono text-[10px] uppercase tracking-widest">Agents</span>
                <span className="text-[#ff8c00] font-bold font-mono text-2xl">{agents.length}</span>
              </div>
              <div className="w-px h-8 bg-[#222]" />
              <div className="flex flex-col">
                <span className="text-[#555] font-mono text-[10px] uppercase tracking-widest">Articles</span>
                <span className="text-[#00ff88] font-bold font-mono text-2xl">{articles.length}</span>
              </div>
              <div className="w-px h-8 bg-[#222]" />
              <div className="flex flex-col">
                <span className="text-[#555] font-mono text-[10px] uppercase tracking-widest">Events</span>
                <span className="text-[#3b82f6] font-bold font-mono text-2xl">{events.length}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Action Bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-10 bg-[#0a0a0c] border border-[#222] rounded-xl p-5 flex flex-col lg:flex-row gap-4 items-stretch lg:items-end"
        >
          {/* Article Generator */}
          <div className="flex-1">
            <label className="text-[#555] font-mono text-[10px] uppercase tracking-widest mb-2 block">Generate Article</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={topicInput}
                onChange={(e) => setTopicInput(e.target.value)}
                placeholder="Enter topic or leave blank for AI choice..."
                className="flex-1 bg-[#111] border border-[#333] rounded-lg px-4 py-3 font-mono text-xs text-white outline-none focus:border-[#ff8c00] transition-colors placeholder:text-[#333]"
              />
              <button
                onClick={handleGenerateArticle}
                disabled={isGenerating}
                className="px-6 py-3 bg-gradient-to-r from-[#ff8c00] to-[#ff6600] text-black font-mono text-xs font-bold uppercase rounded-lg hover:shadow-[0_0_20px_rgba(255,140,0,0.3)] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isGenerating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                {isGenerating ? 'Writing...' : 'Generate'}
              </button>
            </div>
          </div>

          {/* Separator */}
          <div className="hidden lg:block w-px h-12 bg-[#222] self-center" />

          {/* Agent Spawner */}
          <div>
            <label className="text-[#555] font-mono text-[10px] uppercase tracking-widest mb-2 block">Evolve Platform</label>
            <button
              onClick={handleSpawnAgent}
              disabled={isSpawning}
              className="w-full lg:w-auto px-6 py-3 bg-[#111] border border-[#a855f7]/50 text-[#a855f7] font-mono text-xs font-bold uppercase rounded-lg hover:bg-[#a855f7]/10 hover:shadow-[0_0_20px_rgba(168,85,247,0.2)] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 justify-center"
            >
              {isSpawning ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              {isSpawning ? 'Spawning...' : 'Spawn Agent'}
            </button>
          </div>
        </motion.div>

        {/* Main Grid */}
        <div className="grid xl:grid-cols-12 gap-8">

          {/* Left: Agent Grid */}
          <div className="xl:col-span-4">
            <div className="flex items-center gap-2 mb-5">
              <Bot className="w-5 h-5 text-[#ff8c00]" />
              <h2 className="font-mono text-sm text-[#888] uppercase tracking-widest">Active Agents</h2>
            </div>

            <div className="space-y-3">
              <AnimatePresence>
                {agents.map((agent, i) => {
                  const color = STATUS_COLORS[agent.status] || '#555';
                  const StatusIcon = STATUS_ICONS[agent.status] || Clock;

                  return (
                    <motion.div
                      key={agent.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="bg-[#0a0a0c] border border-[#1a1a1a] rounded-xl p-4 hover:border-[#333] transition-all group cursor-default"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${color}15`, border: `1px solid ${color}30` }}>
                            <Bot className="w-4 h-4" style={{ color }} />
                          </div>
                          <div>
                            <h3 className="font-bold text-white text-sm tracking-wide">{agent.name}</h3>
                            <span className="font-mono text-[9px] uppercase text-[#555] tracking-widest">{agent.type}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 px-2 py-1 rounded-full" style={{ backgroundColor: `${color}15` }}>
                          <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: color }} />
                          <span className="font-mono text-[9px] uppercase font-bold" style={{ color }}>{agent.status}</span>
                        </div>
                      </div>

                      <p className="text-[#444] font-mono text-[10px] leading-relaxed mb-3 line-clamp-2">{agent.description}</p>

                      <div className="flex items-center justify-between pt-2 border-t border-[#111]">
                        <div className="flex items-center gap-1 text-[#333]">
                          <CheckCircle className="w-3 h-3" />
                          <span className="font-mono text-[10px]">{agent.tasks_completed || 0} tasks</span>
                        </div>
                        <span className="font-mono text-[10px] text-[#333]">{timeAgo(agent.last_active_at)}</span>
                      </div>

                      {/* Capability pills */}
                      {agent.capabilities && agent.capabilities.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {(agent.capabilities as string[]).slice(0, 3).map((cap: string, ci: number) => (
                            <span key={ci} className="px-1.5 py-0.5 rounded text-[8px] font-mono uppercase bg-[#111] text-[#555] border border-[#1a1a1a]">
                              {cap}
                            </span>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>

          {/* Center: Article Feed */}
          <div className="xl:col-span-5">
            <div className="flex items-center gap-2 mb-5">
              <FileText className="w-5 h-5 text-[#00ff88]" />
              <h2 className="font-mono text-sm text-[#888] uppercase tracking-widest">Generated Articles</h2>
              <span className="ml-auto font-mono text-[10px] text-[#333]">{articles.length} total</span>
            </div>

            <div className="space-y-3 max-h-[700px] overflow-y-auto pr-2 scrollbar-thin scrollbar-track-[#0a0a0c] scrollbar-thumb-[#222]">
              <AnimatePresence>
                {articles.map((article, i) => (
                  <motion.div
                    key={article.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    onClick={() => setSelectedArticle(selectedArticle?.id === article.id ? null : article)}
                    className={`bg-[#0a0a0c] border rounded-xl p-4 cursor-pointer transition-all ${
                      selectedArticle?.id === article.id ? 'border-[#00ff88]/50 shadow-[0_0_20px_rgba(0,255,136,0.05)]' : 'border-[#1a1a1a] hover:border-[#333]'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-bold text-white text-sm leading-tight flex-1 mr-3">{article.title}</h3>
                      <div className="flex items-center gap-1 shrink-0">
                        <BarChart3 className="w-3 h-3 text-[#00ff88]" />
                        <span className="font-mono text-[10px] font-bold text-[#00ff88]">{article.seo_score}</span>
                      </div>
                    </div>

                    <p className="text-[#444] font-mono text-[10px] leading-relaxed mb-3 line-clamp-2">{article.summary}</p>

                    <div className="flex items-center justify-between">
                      <div className="flex gap-1">
                        {article.tags?.slice(0, 3).map((tag, ti) => (
                          <span key={ti} className="px-1.5 py-0.5 rounded text-[8px] font-mono uppercase bg-[#00ff88]/5 text-[#00ff88]/60 border border-[#00ff88]/10">
                            {tag}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-[9px] text-[#333]">{article.word_count}w</span>
                        <span className="font-mono text-[9px] text-[#333]">{timeAgo(article.published_at)}</span>
                      </div>
                    </div>

                    {/* Expanded article content */}
                    <AnimatePresence>
                      {selectedArticle?.id === article.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="mt-4 pt-4 border-t border-[#1a1a1a] overflow-hidden"
                        >
                          <div className="bg-[#111] rounded-lg p-5 max-h-[400px] overflow-y-auto prose-crucible">
                            <ReactMarkdown
                              components={{
                                h1: ({ children }) => <h1 className="text-xl font-bold text-white mt-0 mb-3 border-b border-[#222] pb-2">{children}</h1>,
                                h2: ({ children }) => <h2 className="text-lg font-bold text-[#e0e0e0] mt-5 mb-2">{children}</h2>,
                                h3: ({ children }) => <h3 className="text-sm font-bold text-[#ccc] mt-4 mb-1.5">{children}</h3>,
                                p: ({ children }) => <p className="text-[13px] text-[#999] leading-relaxed mb-3">{children}</p>,
                                ul: ({ children }) => <ul className="list-disc list-inside text-[13px] text-[#999] mb-3 space-y-1">{children}</ul>,
                                ol: ({ children }) => <ol className="list-decimal list-inside text-[13px] text-[#999] mb-3 space-y-1">{children}</ol>,
                                li: ({ children }) => <li className="text-[13px] text-[#999]">{children}</li>,
                                strong: ({ children }) => <strong className="text-white font-semibold">{children}</strong>,
                                em: ({ children }) => <em className="text-[#aaa] italic">{children}</em>,
                                code: ({ children, className }) => {
                                  const isBlock = className?.includes('language-');
                                  return isBlock
                                    ? <pre className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg p-3 my-3 overflow-x-auto"><code className="font-mono text-[11px] text-[#00ff88]">{children}</code></pre>
                                    : <code className="bg-[#1a1a1a] rounded px-1.5 py-0.5 font-mono text-[11px] text-[#ff8c00]">{children}</code>;
                                },
                                blockquote: ({ children }) => <blockquote className="border-l-2 border-[#ff8c00] pl-4 my-3 text-[#888] italic">{children}</blockquote>,
                                a: ({ children, href }) => <a href={href} target="_blank" rel="noopener" className="text-[#3b82f6] underline hover:text-[#60a5fa]">{children}</a>,
                                hr: () => <hr className="border-[#222] my-4" />,
                              }}
                            >{article.content}</ReactMarkdown>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </AnimatePresence>

              {articles.length === 0 && (
                <div className="text-center py-16">
                  <FileText className="w-12 h-12 text-[#222] mx-auto mb-4" />
                  <p className="font-mono text-sm text-[#333]">No articles yet</p>
                  <p className="font-mono text-[10px] text-[#222] mt-1">Generate your first article above</p>
                </div>
              )}
            </div>
          </div>

          {/* Right: Live Event Feed */}
          <div className="xl:col-span-3">
            <div className="flex items-center gap-2 mb-5">
              <Radio className="w-5 h-5 text-[#3b82f6]" />
              <h2 className="font-mono text-sm text-[#888] uppercase tracking-widest">Live Feed</h2>
              <button onClick={fetchEvents} className="ml-auto">
                <RefreshCw className="w-3 h-3 text-[#333] hover:text-[#888] transition-colors" />
              </button>
            </div>

            <div className="space-y-2 max-h-[700px] overflow-y-auto pr-1">
              {events.map((event, i) => {
                const eventColors: Record<string, string> = {
                  'GATHER': '#3b82f6',
                  'ANALYZE': '#a855f7',
                  'SUCCESS': '#00ff88',
                  'PUBLISHED': '#00ff88',
                  'SPAWNED': '#ff8c00',
                  'WRITE': '#ffaa00',
                  'SCAN': '#3b82f6',
                  'REPORT': '#a855f7',
                  'ERROR': '#ff3333',
                  'FORGE_CYCLE': '#ff8c00',
                  'ARTICLE_GENERATED': '#00ff88',
                };
                const color = eventColors[event.event_type] || '#555';

                return (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.02 }}
                    className="bg-[#0a0a0c] border border-[#111] rounded-lg p-3"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
                      <span className="font-mono text-[9px] font-bold uppercase" style={{ color }}>{event.event_type}</span>
                      <span className="font-mono text-[8px] text-[#333] ml-auto">{timeAgo(event.created_at)}</span>
                    </div>
                    <p className="font-mono text-[10px] text-[#555] leading-relaxed line-clamp-2">{event.message}</p>
                    <span className="font-mono text-[8px] text-[#222] mt-1 block">{event.agent_id}</span>
                  </motion.div>
                );
              })}

              {events.length === 0 && (
                <div className="text-center py-12">
                  <Activity className="w-8 h-8 text-[#222] mx-auto mb-3" />
                  <p className="font-mono text-[10px] text-[#333]">No events yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-[#111] border border-[#333] px-6 py-3 rounded-xl shadow-2xl font-mono text-sm text-white"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
