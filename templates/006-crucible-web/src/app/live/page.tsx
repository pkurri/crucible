'use client';

import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Shield, 
  Activity, 
  Globe, 
  TrendingUp, 
  AlertCircle, 
  Zap, 
  Cpu, 
  Terminal, 
  Signal, 
  Eye, 
  Layers,
  Flame,
  Radio
} from 'lucide-react';
import WorldGlobe from '@/components/intel/WorldGlobe';

/**
 * 🛰️ CRUCIBLE LIVE (FORGE HUD)
 * A premium Jarvis-style dashboard for real-time agentic evaluation 
 * and world intelligence. Inspired by Crucix.
 */

// Simple types (inline for portability)
interface IntelSignal { 
  id: string; 
  source: string; 
  category: string; 
  title: string; 
  content: string; 
  severity: string; 
  timestamp: string; 
  metadata?: any;
}

interface ForgeEvent {
  id: string;
  event_type: string;
  message: string;
  agent_id: string;
  created_at: string;
}

export default function LiveHUD() {
  const [signals, setSignals] = useState<IntelSignal[]>([]);
  const [events, setEvents] = useState<ForgeEvent[]>([]);
  const [scannedAt, setScannedAt] = useState(new Date().toISOString());
  const [isOnline, setIsOnline] = useState(false);
  const [activeTab, setActiveTab] = useState<'intel' | 'agents' | 'world'>('intel');
  const [loading, setLoading] = useState(true);
  const [booting, setBooting] = useState(true);
  
  const consoleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 1. Boot sequence
    const timer = setTimeout(() => setBooting(false), 2500);

    // 2. Initial Load
    refreshData();
    setIsOnline(true);

    // 3. Real-time Subscription
    const channel = supabase
      .channel('live-hud-sync')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'world_events' }, payload => {
        setSignals(prev => [payload.new as IntelSignal, ...prev].slice(0, 50));
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'forge_events' }, payload => {
        setEvents(prev => [payload.new as ForgeEvent, ...prev].slice(0, 50));
        scrollToBottom();
      })
      .subscribe();

    return () => { 
      clearTimeout(timer);
      channel.unsubscribe(); 
    };
  }, []);

  const refreshData = async () => {
    try {
      const { data: s } = await supabase.from('world_events').select('*').order('created_at', { ascending: false }).limit(30);
      const { data: e } = await supabase.from('forge_events').select('*').order('created_at', { ascending: false }).limit(30);
      if (s) setSignals(s);
      if (e) setEvents(e);
      setScannedAt(new Date().toISOString());
      setLoading(false);
    } catch (err) {
      console.error('Data refresh err:', err);
    }
  };

  const scrollToBottom = () => {
    if (consoleRef.current) {
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
    }
  };

  if (booting) {
    return (
      <div className="fixed inset-0 bg-[#050505] z-[100] flex flex-col items-center justify-center font-mono">
        <div className="w-64 h-1 bg-[#111] rounded-full overflow-hidden relative">
           <div className="absolute top-0 left-0 h-full bg-[#ff8c00] animate-[shimmer_2s_infinite]" style={{ width: '40%' }} />
        </div>
        <div className="mt-8 text-[10px] text-[#ff8c00] tracking-[0.3em] uppercase animate-pulse">
           Initiating Forge Live HUD — Decrypting Core
        </div>
        <div className="mt-2 text-[8px] text-[#333] tracking-widest">
           ESTABLISHING NEURAL_SYNC_0x7F...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-[#e0e0e0] font-sans selection:bg-[#ff8c00]/30 selection:text-[#ff8c00]">
      {/* ─── SCANNING EFFECT OVERLAY ─── */}
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden opacity-5">
         <div className="scanline" />
         <div className="w-full h-full bg-[radial-gradient(rgba(255,140,0,0.1)_1px,transparent_1px)] bg-[size:30px:30px]" />
      </div>

      {/* ─── HEADER ─── */}
      <header className="border-b border-[#1a1a1a] bg-[#0a0a0a]/80 backdrop-blur-3xl sticky top-0 z-40 px-6 py-4 flex items-center justify-between hud-glow">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-[#ff8c00] flex items-center justify-center rounded-sm shadow-[0_0_20px_#ff8c00aa]">
             <Zap className="text-black w-6 h-6 fill-current" />
          </div>
          <div>
            <div className="flex items-center gap-2">
               <h1 className="text-xl font-black tracking-tighter text-white">FORGE LIVE</h1>
               <span className="text-[10px] bg-[#1a1a1a] text-[#ff8c00] px-2 py-0.5 rounded border border-[#333] font-mono">PREMIUM_HUD</span>
            </div>
            <p className="font-mono text-[9px] text-[#ff8c00] tracking-widest uppercase flex items-center gap-2 mt-1">
              <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-[#00ff88] animate-pulse shadow-[0_0_8px_#00ff88]' : 'bg-red-500'}`} />
              CORE STATUS: NOMINAL — SYSTEM DECIPHERING
            </p>
          </div>
        </div>

        <nav className="hidden lg:flex items-center gap-1 p-1 bg-[#101010]/80 backdrop-blur border border-[#222] rounded-lg">
           {(['intel', 'agents', 'world'] as const).map(tab => (
             <button 
               key={tab}
               onClick={() => setActiveTab(tab)}
               className={`px-6 py-1.5 text-[10px] font-mono tracking-widest uppercase transition-all rounded-md ${activeTab === tab ? 'bg-[#ff8c00] text-black shadow-[0_0_15px_rgba(255,140,0,0.4)]' : 'hover:bg-[#1a1a1a] text-[#666]'}`}
             >
               {tab}
             </button>
           ))}
        </nav>

        <div className="flex items-center gap-6">
           <div className="text-right hidden sm:block">
              <p className="text-[9px] font-mono text-[#555] uppercase tracking-widest">Master Clock</p>
              <p className="text-xs font-mono text-white" id="clock">{new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}</p>
           </div>
           <button onClick={refreshData} className="p-2 border border-[#333] hover:border-[#ff8c00] rounded-lg transition-all text-[#666] hover:text-[#ff8c00]">
              <Activity className="w-4 h-4" />
           </button>
        </div>
      </header>

      {/* ─── MAIN HUD LAYOUT ─── */}
      <main className="max-w-[1920px] mx-auto p-6 grid grid-cols-1 xl:grid-cols-4 gap-6">
        
        {/* ─── TAB: INTEL (DEFAULT) ─── */}
        {activeTab === 'intel' && (
          <>
            {/* ─── LEFT COLUMN: TELEMETRY ─── */}
            <aside className="xl:col-span-1 space-y-6">
              {/* Metrics Card */}
              <section className="glass border border-[#1a1a1a] rounded-2xl p-5 shadow-2xl relative overflow-hidden group hud-glow">
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#ff8c00]/10 rounded-full blur-3xl group-hover:bg-[#ff8c00]/20 transition-all" />
                <h2 className="text-[10px] font-mono text-[#555] tracking-widest uppercase mb-6 flex items-center gap-2">
                   <Cpu className="w-3 h-3 text-[#ff8c00]" /> Hardware Sync
                </h2>
                <div className="space-y-6">
                   <MetricItem label="Evaluation Velocity" value="84.2 TPS" progress={84} color="#ff8c00" />
                   <MetricItem label="Neural Load" value="12.4%" progress={12} color="#555" />
                   <MetricItem label="Memory Latency" value="0.04 ms" progress={10} color="#00ff88" />
                   <MetricItem label="Agent Fidelity" value="98.2%" progress={98} color="#00ecff" />
                </div>
              </section>

              {/* Quick Stats Grid */}
              <div className="grid grid-cols-2 gap-4">
                 <StatCard icon={<Layers className="w-4 h-4" />} label="Agents Active" value="1,242" color="#ff8c00" />
                 <StatCard icon={<Flame className="w-4 h-4" />} label="Fire Events" value="94" color="#f87171" />
                 <StatCard icon={<Radio className="w-4 h-4" />} label="Radiation Alerts" value="02" color="#00ff88" />
                 <StatCard icon={<TrendingUp className="w-4 h-4" />} label="World Fluctuations" value="+4.8%" color="#a855f7" />
              </div>

              {/* Source Feed */}
              <section className="glass border border-[#1a1a1a] rounded-2xl p-5 shadow-2xl overflow-hidden">
                 <h2 className="text-[10px] font-mono text-[#555] tracking-widest uppercase mb-4">Live Connections</h2>
                 <div className="space-y-3">
                    <Connection status="online" label="YAHOO_FINANCE" latency="12ms" />
                    <Connection status="online" label="NASA_FIRMS_HOTSPOTS" latency="28ms" />
                    <Connection status="online" label="SAFECAST_RADNET" latency="148ms" />
                    <Connection status="online" label="GDELT_OSINT" latency="48ms" />
                    <Connection status="warning" label="GITHUB_TRENDS" latency="124ms" />
                 </div>
              </section>
            </aside>

            {/* ─── CENTER: LIVE WORLD HUD ─── */}
            <section className="xl:col-span-2 space-y-6">
               {/* Visualizer Frame */}
               <div className="aspect-video bg-[#0a0a0a] border border-[#1a1a1a] rounded-3xl relative overflow-hidden group shadow-[0_0_80px_rgba(0,0,0,1)] hud-glow">
                  {/* World Globe Component */}
                  <div className="absolute inset-0 z-0">
                     <WorldGlobe signals={signals} />
                  </div>

                  {/* HUD OVERLAY */}
                  <div className="absolute top-8 left-8 p-4 bg-black/60 backdrop-blur-md border border-white/10 rounded-xl z-20 shadow-2xl">
                     <p className="text-[10px] font-mono text-[#ff8c00] mb-1">LOCALIZATION ENGINE</p>
                     <p className="text-xl font-black text-white tracking-tighter">PLANETARY SWEEP</p>
                     <div className="flex items-center gap-3 mt-3">
                        <div className="h-1 w-24 bg-[#222] rounded-full overflow-hidden">
                           <div className="h-full bg-[#ff8c00] animate-[shimmer_3s_infinite]" style={{ width: '98%' }} />
                        </div>
                        <p className="text-[9px] font-mono text-[#ff8c00]">COVERAGE: 98.4%</p>
                     </div>
                  </div>

                  <div className="absolute bottom-8 right-8 flex gap-4 z-20">
                     <div className="px-4 py-2 bg-black/60 backdrop-blur-md border border-white/10 rounded-xl text-right shadow-2xl">
                        <p className="text-[9px] font-mono text-[#666] tracking-tighter">TELEMETRY_LOCK</p>
                        <p className="text-xs font-mono text-white">{new Date(scannedAt).toLocaleTimeString()}</p>
                     </div>
                  </div>
               </div>

               {/* Content Sections */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Intelligence Feed */}
                  <div className="glass border border-[#1a1a1a] rounded-2xl p-6 h-[400px] flex flex-col group">
                     <div className="flex justify-between items-center mb-6">
                        <h2 className="text-[10px] font-mono text-[#ff8c00] tracking-widest uppercase">Intel Decryptions</h2>
                        <Zap className="w-3 h-3 text-[#ff8c00] animate-pulse" />
                     </div>
                     <div className="flex-1 overflow-y-auto space-y-4 pr-2 scrollbar-thin scrollbar-thumb-[#222] group-hover:scrollbar-thumb-[#ff8c00]/20 transition-all">
                        {signals.length > 0 ? signals.map(sig => (
                          <div key={sig.id} className="p-4 bg-white/5 hover:bg-white/[0.08] border border-white/5 rounded-xl transition-all cursor-pointer group/item relative overflow-hidden">
                             <div className="absolute top-0 left-0 w-1 h-full bg-[#ff8c00] opacity-0 group-hover/item:opacity-100 transition-all" />
                             <div className="flex justify-between mb-2">
                                <span className="text-[9px] font-mono px-2 py-0.5 bg-[#ff8c00] text-black rounded-sm uppercase tracking-tighter font-bold">{sig.category}</span>
                                <span className="text-[9px] font-mono text-[#444]">{new Date(sig.timestamp).toLocaleTimeString()}</span>
                             </div>
                             <h3 className="text-sm font-bold text-[#e0e0e0] group-hover/item:text-white transition-colors">{sig.title}</h3>
                             <p className="text-[10px] text-[#666] mt-2 line-clamp-2 leading-relaxed group-hover/item:text-[#888]">{sig.content}</p>
                          </div>
                        )) : (
                          <div className="flex flex-col items-center justify-center h-full opacity-10 filter grayscale">
                             <Signal className="w-12 h-12 mb-4 animate-pulse" />
                             <p className="font-mono text-xs uppercase tracking-widest">Awaiting Signal</p>
                          </div>
                        )}
                     </div>
                  </div>

                  {/* Agent Console */}
                  <div className="glass border border-[#1a1a1a] rounded-2xl p-6 h-[400px] flex flex-col relative overflow-hidden">
                     <div className="flex justify-between items-center mb-6">
                        <h2 className="text-[10px] font-mono text-[#555] tracking-widest uppercase">Agent Flux</h2>
                        <Terminal className="w-3 h-3 text-[#555]" />
                     </div>
                     <div ref={consoleRef} className="flex-1 overflow-y-auto space-y-2 font-mono text-[9px] text-[#888] pr-2 scrollbar-none">
                        {events.length > 0 ? events.map(evt => (
                          <div key={evt.id} className="flex gap-4 p-1 hover:bg-white/5 rounded-sm transition-colors border-l border-[#222] pl-3 border-opacity-50">
                             <span className="text-[#333] whitespace-nowrap">[{new Date(evt.created_at).toLocaleTimeString([], { hour12: false })}]</span>
                             <span className={evt.event_type.includes('START') ? 'text-[#00ecff]' : evt.event_type.includes('FAIL') ? 'text-[#f87171]' : 'text-[#ff8c00]'}>
                                {evt.event_type}
                             </span>
                             <span className="text-[#e0e0e0] leading-tight flex-1">{evt.message}</span>
                          </div>
                        )) : (
                          <p className="opacity-50 animate-pulse tracking-widest uppercase py-4 text-center">CONNECTING TO FLUX_CONTROL...</p>
                        )}
                     </div>
                     <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-[#0a0a0a] to-transparent pointer-events-none" />
                  </div>
               </div>
            </section>

            {/* ─── RIGHT COLUMN: INSIGHTS ─── */}
            <aside className="xl:col-span-1 space-y-6">
               {/* Briefing Card */}
               <section className="bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] border border-[#ff8c00]/20 rounded-2xl p-6 shadow-2xl relative hud-glow">
                  <div className="absolute top-4 right-4 animate-pulse">
                     <div className="w-2 h-2 bg-[#ff8c00] rounded-full shadow-[0_0_15px_#ff8c00]" />
                  </div>
                  <h2 className="text-[10px] font-mono text-[#ff8c00] tracking-widest uppercase mb-6">Intelligence Synthesis</h2>
                  <div className="space-y-4">
                     <Insight title="Infrastructure Shift" desc="Increased migration toward serverless GPU clusters detected in high-frequency trading." />
                     <Insight title="Agentic Convergence" desc="Correlation found between multi-agent rollouts and decreased Mean Time to Remediation (MTTR) by 42%." />
                     <Insight title="Market Volatility" desc="BTC sensitivity to tech patent filings reached 3-month high. Probability: High." />
                  </div>
                  <button className="w-full mt-8 py-3 bg-white/5 border border-white/5 hover:border-[#ff8c00] transition-all rounded-xl text-[10px] font-mono tracking-widest uppercase text-[#555] hover:text-[#ff8c00] hover:bg-[#ff8c00]/5">
                     EXPORT FIELD REPORT
                  </button>
               </section>

               {/* Delta Panel */}
               <section className="glass border border-[#1a1a1a] rounded-2xl p-6 shadow-2xl">
                  <h2 className="text-[10px] font-mono text-[#666] tracking-widest uppercase mb-4 flex justify-between">
                     Sweep Delta <span className="opacity-30 border border-white/10 px-2 rounded">t-minus 15m</span>
                  </h2>
                  <div className="space-y-4">
                     <DeltaItem label="Novel Signals" value="+14" color="#ff8c00" />
                     <DeltaItem label="Escalations" value="02" color="#f87171" />
                     <DeltaItem label="Resolved Faults" value="08" color="#00ff88" />
                     <DeltaItem label="Sentiment Shift" value="-4.2%" color="#f87171" />
                  </div>
               </section>
            </aside>
          </>
        )}

        {/* ─── TAB: AGENTS ─── */}
        {activeTab === 'agents' && (
          <>
            <section className="xl:col-span-3 space-y-6">
              <div className="glass border border-[#1a1a1a] rounded-2xl p-6 h-[800px] flex flex-col relative overflow-hidden hud-glow">
                <div className="flex justify-between items-center mb-6">
                   <div>
                     <h2 className="text-xl font-black text-white tracking-tighter uppercase">AGENT FLUX OVERDRIVE</h2>
                     <p className="text-[10px] font-mono text-[#555] tracking-widest uppercase mt-1">Global Distributed Swarm Console</p>
                   </div>
                   <Terminal className="w-6 h-6 text-[#ff8c00] animate-pulse" />
                </div>
                <div className="flex-1 overflow-y-auto space-y-3 font-mono text-[10px] text-[#888] pr-4 scrollbar-thin scrollbar-thumb-[#222]">
                   {events.length > 0 ? events.map(evt => (
                     <div key={evt.id} className="flex gap-4 p-3 bg-white/5 hover:bg-white/10 rounded-sm transition-colors border-l-2 border-[#ff8c00]">
                        <span className="text-[#666] whitespace-nowrap">[{new Date(evt.created_at).toLocaleTimeString([], { hour12: false })}]</span>
                        <span className={`w-32 ${evt.event_type.includes('START') ? 'text-[#00ecff]' : evt.event_type.includes('FAIL') ? 'text-[#f87171]' : 'text-[#ff8c00]'}`}>
                           {evt.event_type}
                        </span>
                        <span className="text-[#e0e0e0] leading-relaxed flex-1">{evt.message}</span>
                        <span className="text-[#444]">NODE: {evt.agent_id}</span>
                     </div>
                   )) : (
                     <p className="opacity-50 animate-pulse tracking-widest uppercase py-4 text-center">CONNECTING TO FLUX_CONTROL...</p>
                   )}
                </div>
              </div>
            </section>
            
            <aside className="xl:col-span-1 space-y-6">
              <section className="glass border border-[#1a1a1a] rounded-2xl p-5 shadow-2xl relative overflow-hidden group">
                 <h2 className="text-[10px] font-mono text-[#555] tracking-widest uppercase mb-6 flex items-center gap-2">
                    <Cpu className="w-3 h-3 text-[#ff8c00]" /> Swarm Utilization
                 </h2>
                 <div className="space-y-6">
                    <MetricItem label="Evaluation Velocity" value="128.4 TPS" progress={92} color="#ff8c00" />
                    <MetricItem label="Neural Load" value="48.2%" progress={48} color="#00ecff" />
                    <MetricItem label="Memory Latency" value="0.02 ms" progress={5} color="#00ff88" />
                 </div>
              </section>
              <div className="grid grid-cols-2 gap-4">
                 <StatCard icon={<Layers className="w-4 h-4" />} label="Agents Active" value="1,242" color="#ff8c00" />
                 <StatCard icon={<Zap className="w-4 h-4" />} label="Tasks Pending" value="14" color="#00ecff" />
              </div>
            </aside>
          </>
        )}

        {/* ─── TAB: WORLD ─── */}
        {activeTab === 'world' && (
          <>
            <aside className="xl:col-span-1 space-y-6">
               <section className="glass border border-[#1a1a1a] rounded-2xl p-5 shadow-2xl overflow-hidden">
                  <h2 className="text-[10px] font-mono text-[#555] tracking-widest uppercase mb-4">Live Connections</h2>
                  <div className="space-y-3">
                     <Connection status="online" label="YAHOO_FINANCE" latency="12ms" />
                     <Connection status="online" label="NASA_FIRMS_HOTSPOTS" latency="28ms" />
                     <Connection status="online" label="SAFECAST_RADNET" latency="148ms" />
                     <Connection status="online" label="GDELT_OSINT" latency="48ms" />
                     <Connection status="warning" label="GITHUB_TRENDS" latency="124ms" />
                     <Connection status="offline" label="X_FIREHOSE" latency="N/A" />
                  </div>
               </section>
               <section className="glass border border-[#1a1a1a] rounded-2xl p-6 shadow-2xl">
                  <h2 className="text-[10px] font-mono text-[#666] tracking-widest uppercase mb-4 flex justify-between">
                     Sweep Delta <span className="opacity-30 border border-white/10 px-2 rounded">t-minus 15m</span>
                  </h2>
                  <div className="space-y-4">
                     <DeltaItem label="Novel Signals" value="+14" color="#ff8c00" />
                     <DeltaItem label="Escalations" value="02" color="#f87171" />
                     <DeltaItem label="Resolved Faults" value="08" color="#00ff88" />
                  </div>
               </section>
            </aside>
            <section className="xl:col-span-3 space-y-6">
               <div className="h-[800px] w-full bg-[#0a0a0a] border border-[#1a1a1a] rounded-3xl relative overflow-hidden group shadow-[0_0_80px_rgba(0,0,0,1)] hud-glow">
                  <div className="absolute inset-0 z-0">
                     <WorldGlobe signals={signals} />
                  </div>
                  <div className="absolute top-8 left-8 p-6 bg-black/60 backdrop-blur-md border border-white/10 rounded-xl z-20 shadow-2xl">
                     <p className="text-[10px] font-mono text-[#ff8c00] mb-1">LOCALIZATION ENGINE</p>
                     <p className="text-3xl font-black text-white tracking-tighter">GLOBAL THEATER</p>
                     <div className="flex items-center gap-3 mt-4">
                        <div className="h-1 w-32 bg-[#222] rounded-full overflow-hidden">
                           <div className="h-full bg-[#ff8c00] animate-[shimmer_3s_infinite]" style={{ width: '99%' }} />
                        </div>
                        <p className="text-[9px] font-mono text-[#ff8c00]">COVERAGE: 99.1%</p>
                     </div>
                  </div>
                  <div className="absolute bottom-8 right-8 px-6 py-4 bg-black/60 backdrop-blur-md border border-white/10 rounded-xl text-right z-20 shadow-2xl">
                     <p className="text-[9px] font-mono text-[#666] tracking-tighter">FULL THEATER SENSOR SYNC</p>
                     <p className="text-xl font-mono text-white mt-1">{new Date(scannedAt).toLocaleTimeString()}</p>
                  </div>
               </div>
            </section>
          </>
        )}
      </main>

      <footer className="fixed bottom-0 left-0 right-0 py-3 px-6 bg-[#0a0a0a]/90 backdrop-blur-md border-t border-[#1a1a1a] text-[10px] font-mono text-[#555] flex justify-between items-center z-40">
         <div className="flex gap-6">
            <span>UPTIME: 99.998%</span>
            <span className="hidden sm:inline">NODES: 1,424 ACTIVE</span>
            <span className="hidden md:inline">VERSION: v3.2.0-FORGE</span>
         </div>
         <div className="flex gap-6">
            <span className="text-[#ff8c00] animate-pulse">DECRYPTING NEW TRANSMISSION...</span>
            <span className="text-white">LATENCY: 0.04ms</span>
         </div>
      </footer>

      {/* ─── ANIMATIONS ─── */}
      <style jsx global>{`
        @keyframes scanner {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100vh); }
        }
        @keyframes scanner-left-right {
          0% { left: 10%; opacity: 0; }
          50% { left: 50%; opacity: 1; }
          100% { left: 90%; opacity: 0; }
        }
        .scrollbar-none::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}

function MetricItem({ label, value, progress, color }: { label: string, value: string, progress: number, color: string }) {
  return (
    <div className="space-y-2">
       <div className="flex justify-between text-[10px] font-mono tracking-tighter">
          <span className="text-[#555] uppercase">{label}</span>
          <span className="text-white">{value}</span>
       </div>
       <div className="h-1 bg-[#111] rounded-full overflow-hidden">
          <div className="h-full transition-all duration-1000" style={{ width: `${progress}%`, backgroundColor: color, boxShadow: `0 0 10px ${color}` }} />
       </div>
    </div>
  );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode, label: string, value: string, color: string }) {
  return (
    <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl p-4 hover:border-[#333] transition-colors relative overflow-hidden group">
       <div className="text-[#444] group-hover:text-white transition-colors mb-2">{icon}</div>
       <p className="text-[10px] font-mono text-[#555] tracking-widest uppercase">{label}</p>
       <p className="text-xl font-black text-white group-hover:text-[#ff8c00] transition-colors" style={{ color: value.includes('$') || value.includes('%') ? color : 'white' }}>{value}</p>
    </div>
  );
}

function Connection({ status, label, latency }: { status: 'online' | 'warning' | 'offline', label: string, latency: string }) {
  const color = status === 'online' ? '#00ff88' : status === 'warning' ? '#ff8c00' : '#f87171';
  return (
    <div className="flex justify-between items-center text-[10px] font-mono p-1">
       <div className="flex items-center gap-2">
          <div className="w-1 h-1 rounded-full animate-pulse" style={{ background: color, boxShadow: `0 0 5px ${color}` }} />
          <span className="text-[#888]">{label}</span>
       </div>
       <span className="text-[#444]">{latency}</span>
    </div>
  );
}

function Insight({ title, desc }: { title: string, desc: string }) {
  return (
    <div className="space-y-1">
       <p className="text-[11px] font-bold text-white flex items-center gap-2">
          <div className="w-1 h-1 bg-[#ff8c00]" /> {title}
       </p>
       <p className="text-[10px] text-[#666] leading-relaxed">{desc}</p>
    </div>
  );
}

function DeltaItem({ label, value, color }: { label: string, value: string, color: string }) {
  return (
    <div className="flex justify-between items-center bg-[#0d0d0d] p-3 rounded-lg border border-[#151515] hover:border-[#222]">
       <span className="text-[10px] font-mono text-[#555] uppercase">{label}</span>
       <span className="text-xs font-black" style={{ color }}>{value}</span>
    </div>
  );
}
