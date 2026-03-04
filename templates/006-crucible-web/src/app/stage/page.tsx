"use client";

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Radio, Zap, Activity, Shield, Bot, Mic2, MessageSquare, Terminal, ChevronRight, Share2, Globe, Sparkles, Clock, Target } from 'lucide-react';
import { getSupabase } from '@/lib/supabase';

interface BroadcastEvent {
  id: string;
  event_type: string;
  message: string;
  created_at: string;
  metadata?: {
    broadcast_type?: string;
    status?: string;
    title?: string;
    content?: string;
  };
}

export default function StagePage() {
  const [events, setEvents] = useState<BroadcastEvent[]>([]);
  const [stats, setStats] = useState({ activeNodes: 0, eventRate: 0, uptime: '99.9%' });
  const [isLoading, setIsLoading] = useState(true);

  const fetchStageData = useCallback(async () => {
    const supabase = getSupabase();
    
    // Fetch relevant events for the stage
    const { data: eventData } = await supabase
      .from('forge_events')
      .select('*')
      .in('event_type', ['BROADCAST', 'SUCCESS', 'DEPLOY', 'ERROR'])
      .order('created_at', { ascending: false })
      .limit(20);

    // Fetch active agents count
    const { count: agentCount } = await supabase
      .from('agents_registry')
      .select('*', { count: 'exact', head: true })
      .in('status', ['active', 'busy']);

    // Calculate event rate (events in last hour)
    const oneHourAgo = new Date(Date.now() - 3600000).toISOString();
    const { count: rateCount } = await supabase
      .from('forge_events')
      .select('*', { count: 'exact', head: true })
      .gt('created_at', oneHourAgo);

    if (eventData) setEvents(eventData);
    setStats({
      activeNodes: agentCount || 0,
      eventRate: rateCount || 0,
      uptime: '99.9%'
    });
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchStageData();
    const interval = setInterval(fetchStageData, 15000);

    const supabase = getSupabase();
    const channel = supabase.channel('stage-live')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'forge_events' }, (p) => {
        const newEvent = p.new as BroadcastEvent;
        if (['BROADCAST', 'SUCCESS', 'DEPLOY', 'ERROR'].includes(newEvent.event_type)) {
          setEvents(prev => [newEvent, ...prev].slice(0, 20));
        }
      })
      .subscribe();

    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, [fetchStageData]);

  const timeAgo = (d: string) => {
    const m = Math.floor((Date.now() - new Date(d).getTime()) / 60000);
    if (m < 1) return 'NOW';
    if (m < 60) return `${m}M AGO`;
    return `${Math.floor(m / 60)}H AGO`;
  };

  return (
    <div className="min-h-screen bg-[#020202] pt-24 pb-20 selection:bg-[#00ff88]/30 overflow-hidden">
      {/* Neural Background Overlay */}
      <div className="absolute inset-0 z-0 opacity-30 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,#00ff8815_0%,transparent_70%)]" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-150 contrast-150 mix-blend-overlay" />
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#00ff8850] to-transparent animate-[shimmer_3s_infinite]" />
      </div>

      <div className="max-w-[1400px] mx-auto px-6 relative z-10">
        
        {/* Stage Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 px-4">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <div className="flex items-center gap-3 mb-6">
              <div className="px-3 py-1.5 bg-[#00ff8808] border border-[#00ff8840] text-[#00ff88] text-[9px] font-mono tracking-[0.4em] uppercase rounded-full shadow-[0_0_15px_rgba(0,255,136,0.1)] flex items-center gap-2 backdrop-blur-sm">
                <div className="w-2 h-2 bg-[#00ff88] rounded-full animate-pulse shadow-[0_0_8px_#00ff88]" />
                Neural Broadcast Channel ACTIVE
              </div>
            </div>
            <h1 className="text-7xl md:text-9xl font-black text-white tracking-tighter uppercase leading-[0.8] filter drop-shadow-[0_0_30px_rgba(0,255,136,0.2)]">
              The <span className="text-transparent bg-clip-text bg-gradient-to-br from-[#00ff88] via-[#00ffdd] to-[#008855] animate-gradient-slow pb-4">Stage</span>
            </h1>
            <p className="mt-6 text-[#999] font-mono text-xs max-w-xl leading-relaxed uppercase tracking-widest">
              Neural gateway to the Crucible swarm. Witness the autonomous evolution of 
              software architecture in real-time.
            </p>
          </motion.div>

          {/* Core Stats */}
          <div className="grid grid-cols-3 gap-8 md:gap-12 border-l border-[#ffffff08] pl-12">
            {[
              { label: 'Active Nodes', value: stats.activeNodes, icon: Bot, color: '#00ff88' },
              { label: 'Event Rate/H', value: stats.eventRate, icon: Zap, color: '#ffcc00' },
              { label: 'Core Uptime', value: stats.uptime, icon: Shield, color: '#3b82f6' },
            ].map((s, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: 0.2 + (i * 0.1) }}
                className="relative group"
              >
                <div className="flex items-center gap-2 mb-3 text-[#999] group-hover:text-[#ccc] transition-colors">
                  <s.icon className="w-3.5 h-3.5" style={{ color: s.color }} />
                  <span className="font-mono text-[10px] uppercase tracking-[0.2em]">{s.label}</span>
                </div>
                <div className="text-3xl font-black text-white tracking-tight tabular-nums">{s.value}</div>
                <div className="absolute -bottom-2 left-0 w-0 h-px transition-all duration-500 group-hover:w-full" style={{ backgroundColor: s.color + '40' }} />
              </motion.div>
            ))}
          </div>
        </div>

        {/* Global Feed Grid */}
        <div className="grid lg:grid-cols-12 gap-8">
          
          {/* Main Feed */}
          <div className="lg:col-span-8 space-y-6">
            <AnimatePresence mode="popLayout">
              {events.map((event, i) => (
                <BroadcastCard key={event.id} event={event} index={i} timeAgo={timeAgo(event.created_at)} />
              ))}
            </AnimatePresence>
            
            {events.length === 0 && !isLoading && (
              <div className="h-64 flex flex-col items-center justify-center border border-dashed border-[#1a1a1a] rounded-2xl">
                <Mic2 className="w-8 h-8 text-[#222] mb-4" />
                <p className="font-mono text-[10px] text-[#888] uppercase tracking-widest">Awaiting Neural Broadcast...</p>
              </div>
            )}
          </div>

          {/* Sidebar / Secondary Feed */}
          <div className="lg:col-span-4 space-y-8">
            <div className="p-10 bg-[#050505] border border-[#1a1a1a] rounded-[2rem] relative overflow-hidden group shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-[#00ff8808] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition-all duration-700 blur-xl group-hover:blur-sm transform group-hover:scale-110">
                <Sparkles className="w-32 h-32 text-[#00ff88]" />
              </div>
              <h3 className="font-mono text-[11px] text-[#00ff88] uppercase tracking-[0.5em] mb-8 flex items-center gap-2">
                <Globe className="w-4 h-4 animate-spin-slow" /> Swarm Intel
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed mb-10 font-medium tracking-tight">
                The Crucible Stage summarizes petabytes of agent interaction into 
                human-navigable holographic broadcasts. Each pulse represents a verified 
                milestone in platform self-evolution.
              </p>
              <button className="w-full py-4 bg-[#0a0a0a] border border-[#1a1a1a] text-[#aaa] font-mono text-[10px] uppercase tracking-[0.3em] rounded-2xl hover:bg-[#00ff8808] hover:border-[#00ff8830] hover:text-[#00ff88] transition-all duration-300 shadow-inner group">
                <span className="flex items-center justify-center gap-2">
                  Access Core Archives <ChevronRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
                </span>
              </button>
            </div>

            <div className="space-y-6">
              <h4 className="font-mono text-[10px] text-[#888] uppercase tracking-[0.4em] px-4">Tactical Telemetry</h4>
              <div className="p-2 bg-[#050505] rounded-[1.5rem] border border-[#111] shadow-xl">
                {[
                  { name: 'Compression', value: '14.2%', change: '+0.4%', icon: Activity },
                  { name: 'Latency', value: '182ms', change: '-12ms', icon: Clock },
                  { name: 'Convergence', value: '0.88', change: '+0.03', icon: Target },
                ].map((stat, i) => (
                  <div key={i} className="flex items-center justify-between p-4 hover:bg-[#ffffff03] transition-colors rounded-xl group/item">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#111] border border-[#222] flex items-center justify-center group-hover/item:border-[#00ff8840] transition-colors">
                        <stat.icon className="w-3.5 h-3.5 text-[#888] group-hover/item:text-[#00ff88]" />
                      </div>
                      <span className="font-mono text-[10px] text-[#999] uppercase group-hover/item:text-[#ccc]">{stat.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-white font-mono tracking-tight">{stat.value}</div>
                      <div className="text-[9px] text-[#00ff88] font-mono font-bold opacity-70">{stat.change}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function BroadcastCard({ event, index, timeAgo }: { event: BroadcastEvent; index: number; timeAgo: string }) {
  const isBroadcast = event.event_type === 'BROADCAST';
  const meta = event.metadata || {};

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: index * 0.05, duration: 0.5, ease: "easeOut" }}
      className={`p-10 rounded-[2.5rem] border transition-all duration-500 relative overflow-hidden group ${
        isBroadcast 
          ? 'bg-gradient-to-br from-[#00ff8808] to-transparent border-[#00ff8815] hover:border-[#00ff8840] shadow-[0_0_40px_rgba(0,255,136,0.02)]' 
          : 'bg-[#050505] border-[#ffffff08] hover:border-[#ffffff15]'
      }`}
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#ffffff08] to-transparent group-hover:via-[#ffffff15] transition-all" />
      <div className="flex flex-col md:flex-row gap-8">
        <div className="shrink-0 flex md:flex-col items-center justify-between md:justify-start gap-4">
          <div className={`w-16 h-16 rounded-3xl flex items-center justify-center border transition-all duration-500 transform group-hover:scale-110 ${
            isBroadcast ? 'bg-[#00ff8810] border-[#00ff8830] text-[#00ff88] shadow-[0_0_20px_rgba(0,255,136,0.1)]' : 'bg-[#0a0a0a] border-[#1a1a1a] text-[#888]'
          }`}>
            {isBroadcast ? <Mic2 className="w-7 h-7" /> : <Activity className="w-7 h-7" />}
          </div>
          <div className="text-right md:text-center mt-2">
            <div className="font-mono text-[10px] text-[#888] group-hover:text-[#aaa] whitespace-nowrap transition-colors">{timeAgo}</div>
            <div className={`font-mono text-[10px] font-black uppercase tracking-widest mt-1 ${isBroadcast ? 'text-[#00ff88]' : 'text-[#888]'}`}>
              {event.event_type}
            </div>
          </div>
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-4 mb-4">
            <h3 className="text-2xl font-black text-white tracking-tight uppercase group-hover:text-[#00ff8810] transition-colors transition-duration-500">
              {meta.title || event.event_type.replace('_', ' ')}
            </h3>
            {meta.status && (
              <span className={`px-3 py-1 rounded-full text-[9px] font-mono font-black tracking-[0.2em] shadow-lg backdrop-blur-md ${
                meta.status === 'CRITICAL' ? 'bg-red-500/10 text-red-500 border border-red-500/30' : 'bg-[#00ff8810] text-[#00ff88] border border-[#00ff8830]'
              }`}>
                {meta.status}
              </span>
            )}
          </div>
          <p className="text-gray-400 text-xl leading-relaxed font-medium tracking-tight group-hover:text-gray-300 transition-colors">
             {meta.content || event.message}
          </p>
          
          <div className="mt-10 pt-8 border-t border-[#ffffff05] flex flex-wrap items-center justify-between gap-6">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-2.5 text-[#555] hover:text-[#00ff88] cursor-pointer transition-all hover:scale-105 active:scale-95 group/relay">
                <Share2 className="w-3.5 h-3.5 group-hover/relay:animate-pulse" />
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] font-black">Relay Signal</span>
              </div>
              <div className="flex items-center gap-2.5 text-[#555] hover:text-[#3b82f6] cursor-pointer transition-all hover:scale-105 active:scale-95 group/log">
                <Terminal className="w-3.5 h-3.5 group-hover/log:translate-x-0.5" />
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] font-black">View Raw Log</span>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-[#888] font-mono text-[10px] uppercase tracking-widest font-bold">Node Intensity</div>
              <div className="w-40 h-1.5 bg-[#0a0a0a] rounded-full overflow-hidden border border-[#ffffff05] shadow-inner">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: isBroadcast ? '85%' : '40%' }}
                  transition={{ duration: 1.5, ease: "circOut" }}
                  className={`h-full relative ${isBroadcast ? 'bg-gradient-to-r from-[#00ff8840] to-[#00ff88]' : 'bg-[#222]'}`} 
                >
                  {isBroadcast && <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite]" />}
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
