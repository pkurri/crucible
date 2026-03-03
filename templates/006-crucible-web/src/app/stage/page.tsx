"use client";

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Radio, Zap, Activity, Shield, Bot, Mic2, MessageSquare, Terminal, ChevronRight, Share2, Globe, Sparkles } from 'lucide-react';
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
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,#00ff8810_0%,transparent_70%)]" />
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#00ff8830] to-transparent animate-pulse" />
      </div>

      <div className="max-w-[1400px] mx-auto px-6 relative z-10">
        
        {/* Stage Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 px-4">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="px-2 py-1 bg-[#00ff8810] border border-[#00ff8830] text-[#00ff88] text-[10px] font-mono tracking-[0.3em] uppercase rounded flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-[#00ff88] rounded-full animate-pulse" />
                Live Broadcast Channel
              </div>
            </div>
            <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter uppercase leading-[0.85]">
              The <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00ff88] to-[#00aa66]">Stage</span>
            </h1>
            <p className="mt-6 text-[#555] font-mono text-xs max-w-xl leading-relaxed uppercase tracking-widest">
              Neural gateway to the Crucible swarm. Witness the autonomous evolution of 
              software architecture in real-time.
            </p>
          </motion.div>

          {/* Core Stats */}
          <div className="flex gap-12 border-l border-[#1a1a1a] pl-12">
            {[
              { label: 'Active Nodes', value: stats.activeNodes, icon: Bot, color: '#00ff88' },
              { label: 'Event Rate/H', value: stats.eventRate, icon: Zap, color: '#ffcc00' },
              { label: 'Core Uptime', value: stats.uptime, icon: Shield, color: '#3b82f6' },
            ].map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                <div className="flex items-center gap-2 mb-2 text-[#444]">
                  <s.icon className="w-3.5 h-3.5" />
                  <span className="font-mono text-[9px] uppercase tracking-widest">{s.label}</span>
                </div>
                <div className="text-2xl font-black text-white tracking-tight">{s.value}</div>
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
                <p className="font-mono text-[10px] text-[#444] uppercase tracking-widest">Awaiting Neural Broadcast...</p>
              </div>
            )}
          </div>

          {/* Sidebar / Secondary Feed */}
          <div className="lg:col-span-4 space-y-8">
            <div className="p-8 bg-[#050505] border border-[#111] rounded-3xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-30 transition-opacity">
                <Sparkles className="w-24 h-24 text-[#00ff88]" />
              </div>
              <h3 className="font-mono text-[11px] text-[#00ff88] uppercase tracking-[0.4em] mb-6 flex items-center gap-2">
                <Globe className="w-4 h-4" /> Swarm Intelligence
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed mb-8">
                The Crucible Stage summarizes petabytes of agent interaction into 
                human-navigable holographic broadcasts. Each pulse represents a verified 
                milestone in platform self-evolution.
              </p>
              <button className="w-full py-4 bg-[#111] border border-[#222] text-white font-mono text-[10px] uppercase tracking-widest rounded-xl hover:bg-[#1a1a1a] transition-all">
                Access Core Archives
              </button>
            </div>

            <div className="space-y-4">
              <h4 className="font-mono text-[9px] text-[#333] uppercase tracking-[0.3em] px-4">System Telemetry</h4>
              <div className="p-1 bg-[#111]/30 rounded-2xl border border-[#1a1a1a]">
                {[
                  { name: 'Memory Compression', value: '14.2%', change: '+0.4%' },
                  { name: 'Inference Latency', value: '182ms', change: '-12ms' },
                  { name: 'Agent Convergence', value: '0.88', change: '+0.03' },
                ].map((stat, i) => (
                  <div key={i} className="flex items-center justify-between p-4 hover:bg-white/[0.02] transition-colors rounded-xl">
                    <span className="font-mono text-[10px] text-[#666] uppercase">{stat.name}</span>
                    <div className="text-right">
                      <div className="text-sm font-bold text-white font-mono">{stat.value}</div>
                      <div className="text-[9px] text-[#00ff88] font-mono">{stat.change}</div>
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
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`p-8 rounded-3xl border transition-all hover:bg-white/[0.02] ${
        isBroadcast 
          ? 'bg-[#00ff8808] border-[#00ff8815] hover:border-[#00ff8830]' 
          : 'bg-[#050505] border-[#111] hover:border-[#222]'
      }`}
    >
      <div className="flex flex-col md:flex-row gap-8">
        <div className="shrink-0 flex md:flex-col items-center justify-between md:justify-start gap-4">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border ${
            isBroadcast ? 'bg-[#00ff8810] border-[#00ff8820] text-[#00ff88]' : 'bg-[#111] border-[#222] text-[#444]'
          }`}>
            {isBroadcast ? <Mic2 className="w-6 h-6" /> : <Activity className="w-6 h-6" />}
          </div>
          <div className="text-right md:text-center">
            <div className="font-mono text-[9px] text-[#333] whitespace-nowrap">{timeAgo}</div>
            <div className={`font-mono text-[9px] font-bold ${isBroadcast ? 'text-[#00ff88]' : 'text-[#444]'}`}>
              {event.event_type}
            </div>
          </div>
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <h3 className="text-xl font-bold text-white tracking-tight uppercase">
              {meta.title || event.event_type.replace('_', ' ')}
            </h3>
            {meta.status && (
              <span className={`px-2 py-0.5 rounded text-[8px] font-mono font-black tracking-widest ${
                meta.status === 'CRITICAL' ? 'bg-red-500/20 text-red-500' : 'bg-[#00ff8820] text-[#00ff88]'
              }`}>
                {meta.status}
              </span>
            )}
          </div>
          <p className="text-gray-400 text-lg leading-relaxed font-medium">
             {meta.content || event.message}
          </p>
          
          <div className="mt-8 pt-6 border-t border-[#1a1a1a] flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-[#444] hover:text-[#00ff88] cursor-pointer transition-colors">
                <Share2 className="w-3.5 h-3.5" />
                <span className="font-mono text-[9px] uppercase tracking-widest font-bold">Relay Signal</span>
              </div>
              <div className="flex items-center gap-2 text-[#444] hover:text-[#3b82f6] cursor-pointer transition-colors">
                <Terminal className="w-3.5 h-3.5" />
                <span className="font-mono text-[9px] uppercase tracking-widest font-bold">View Raw Log</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="text-[#333] font-mono text-[9px] uppercase">Node Intensity:</div>
              <div className="w-32 h-1.5 bg-[#111] rounded-full overflow-hidden">
                <div className={`h-full ${isBroadcast ? 'bg-[#00ff88]' : 'bg-[#222]'}`} style={{ width: isBroadcast ? '85%' : '40%' }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
