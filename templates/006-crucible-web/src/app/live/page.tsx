'use client';

import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Activity, 
  TrendingUp, 
  Zap, 
  Cpu, 
  Terminal, 
  Signal, 
  Layers,
  Flame,
  Radio
} from 'lucide-react';
import WorldGlobe from '@/components/intel/WorldGlobe';

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
  const [activeTab, setActiveTab] = useState<'world'>('world'); // Forced to 'world' since the app shell tab handles the others
  const [loading, setLoading] = useState(true);
  const [booting, setBooting] = useState(true);
  
  const consoleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 1. Boot sequence
    const timer = setTimeout(() => setBooting(false), 2500);

    // 2. Initial Load
    refreshData();

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
      <div className="fixed inset-0 bg-[#000000] z-[100] flex flex-col items-center justify-center font-mono">
        <div className="w-64 h-1 bg-[#111] rounded-full overflow-hidden relative">
           <div className="absolute top-0 left-0 h-full bg-[#ffb84c] animate-[shimmer_2s_infinite]" style={{ width: '40%' }} />
        </div>
        <div className="mt-8 text-[10px] text-[#ffb84c] tracking-[0.3em] uppercase animate-pulse">
           Initiating Forge Live HUD — Decrypting Core
        </div>
        <div className="mt-2 text-[8px] text-[#333] tracking-widest">
           ESTABLISHING NEURAL_SYNC_0x7F...
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-transparent text-[#e0e0e0] font-sans selection:bg-[#ffb84c]/20 selection:text-[#ffb84c]">
      
      {/* ─── MAIN HUD LAYOUT ─── */}
      <main className="max-w-[1920px] mx-auto p-6 grid grid-cols-1 xl:grid-cols-4 gap-6">

        {/* ─── TAB: WORLD (DEFAULT LIVE HUD TAB FOR DATA INTEL) ─── */}
        {/* WE RENDER ONLY THE WORLD VIEW HERE TO MATCH THE CRUCIX.LIVE AESTHETIC EXACTLY */}
        <aside className="xl:col-span-1 space-y-6">
           {/* Live Connections */}
           <section className="bg-transparent border border-[#222] rounded-2xl p-6">
              <h2 className="text-[10px] font-mono text-[#555] tracking-widest uppercase mb-4">Live Connections</h2>
              <div className="space-y-4">
                 <Connection status="online" label="YAHOO_FINANCE" latency="12ms" />
                 <Connection status="online" label="NASA_FIRMS_HOTSPOTS" latency="28ms" />
                 <Connection status="online" label="SAFECAST_RADNET" latency="148ms" />
                 <Connection status="online" label="GDELT_OSINT" latency="48ms" />
                 <Connection status="warning" label="GITHUB_TRENDS" latency="124ms" />
                 <Connection status="offline" label="X_FIREHOSE" latency="N/A" />
              </div>
           </section>
           
           {/* Sweep Delta */}
           <section className="bg-transparent border border-[#222] rounded-2xl p-6 mt-6">
              <h2 className="text-[10px] font-mono text-[#555] tracking-widest uppercase mb-4 flex justify-between">
                 Sweep Delta <span className="opacity-30 border border-[#222] px-2 rounded">T-MINUS 15M</span>
              </h2>
              <div className="space-y-4 font-mono">
                 <DeltaItem label="Novel Signals" value="+14" color="#ffb84c" />
                 <DeltaItem label="Escalations" value="02" color="#ff5f63" />
                 <DeltaItem label="Resolved Faults" value="08" color="#00ff88" />
              </div>
           </section>
        </aside>

        {/* Global Theater Map */}
        <section className="xl:col-span-3 h-[700px] xl:h-[800px]">
           <div className="w-full h-full bg-[#030303] border border-[#ffb84c]/10 hover:border-[#ffb84c]/20 transition-all rounded-3xl relative overflow-hidden group">
              
              {/* World Globe Component inside absolute container */}
              <div className="absolute inset-0 z-0 scale-125 translate-x-32 translate-y-16 origin-center">
                 <WorldGlobe signals={signals} />
              </div>
              
              {/* TOP HUD TEXT */}
              <div className="absolute top-8 left-8 z-20 pointer-events-none">
                 <p className="text-[10px] font-mono text-[#ffb84c] font-bold mb-1">LOCALIZATION ENGINE</p>
                 <h2 className="text-4xl lg:text-5xl font-black text-white tracking-tighter uppercase" style={{ fontFamily: 'var(--font-sans)' }}>GLOBAL THEATER</h2>
                 <div className="flex items-center gap-3 mt-4">
                    <div className="h-1.5 w-40 bg-[#111] overflow-hidden">
                       <div className="h-full bg-[#ffb84c]" style={{ width: '99.1%' }} />
                    </div>
                    <p className="text-[10px] font-mono text-[#ffb84c] tracking-widest">COVERAGE: 99.1%</p>
                 </div>
              </div>
              
              {/* BOTTOM HUD TIMESTAMP */}
              <div className="absolute bottom-8 right-8 z-20 pointer-events-none px-6 py-4 bg-black/40 border border-[#222] rounded-xl text-right backdrop-blur-sm">
                 <p className="text-[9px] font-mono text-[#666] tracking-tighter uppercase mb-2">FULL THEATER SENSOR SYNC</p>
                 <p className="text-xl text-white font-mono tracking-widest">{new Date(scannedAt).toLocaleTimeString([], { hour12: true })}</p>
              </div>
              
           </div>
        </section>
      </main>

      {/* ─── ANIMATIONS & GLOBAL HACKS ─── */}
      <style jsx global>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(300%); }
        }
        .scrollbar-none::-webkit-scrollbar { display: none; }
        body { background-color: #000000 !important; } /* Force pure black background globally while on this route */
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
       <p className="text-xl font-black text-white group-hover:text-[#ffb84c] transition-colors" style={{ color: value.includes('$') || value.includes('%') ? color : 'white' }}>{value}</p>
    </div>
  );
}

function Connection({ status, label, latency }: { status: 'online' | 'warning' | 'offline', label: string, latency: string }) {
  const color = status === 'online' ? '#00ff88' : status === 'warning' ? '#ffb84c' : '#ff5f63';
  return (
    <div className="flex justify-between items-center text-[10px] font-mono p-1 mb-2">
       <div className="flex items-center gap-3">
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: color, boxShadow: `0 0 5px ${color}` }} />
          <span className="text-[#888] tracking-widest">{label}</span>
       </div>
       <span className="text-[#555] font-bold">{latency}</span>
    </div>
  );
}

function Insight({ title, desc }: { title: string, desc: string }) {
  return (
    <div className="space-y-1">
       <p className="text-[11px] font-bold text-white flex items-center gap-2">
          <span className="w-1 h-1 bg-[#ffb84c] inline-block" /> {title}
       </p>
       <p className="text-[10px] text-[#666] leading-relaxed">{desc}</p>
    </div>
  );
}

function DeltaItem({ label, value, color }: { label: string, value: string, color: string }) {
  return (
    <div className="flex justify-between items-center bg-[#111]/50 p-3 rounded border border-transparent hover:border-[#222]">
       <span className="text-[10px] text-[#555] uppercase tracking-widest">{label}</span>
       <span className="text-xs font-black" style={{ color }}>{value}</span>
    </div>
  );
}
