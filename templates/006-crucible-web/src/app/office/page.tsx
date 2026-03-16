"use client";

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getSupabase } from '@/lib/supabase';
import { 
  Terminal, Users, Cpu, Zap, Activity, Coffee, Monitor, Shield, Box, Code, 
  Search, Globe, Layout, Briefcase, TrendingUp, AlertTriangle, MessageSquare, 
  Microscope, Rocket, Database, Filter, Layers, Server, Map as MapIcon, ChevronRight
} from 'lucide-react';

interface Agent {
  id: string;
  name: string;
  role: string;
  type: string;
  color: string;
  icon: any;
  status: string;
  office_x: number;
  office_y: number;
  target_x?: number;
  target_y?: number;
  rotation: number;
  state: 'working' | 'idle' | 'walking' | 'meeting' | 'coffee';
  last_action: string;
  tasks_completed?: number;
  bubble_text?: string;
}

interface Infographic {
  id: string;
  title: string;
  content: string;
  domain: string;
  created_at: string;
}

const SECTORS = [
  { name: 'THE FOUNDRY', x: 25, y: 35, w: 40, h: 40, color: 'rgba(255,140,0,0.1)' },
  { name: 'THE DATA VAULT', x: 75, y: 35, w: 30, h: 40, color: 'rgba(51,204,255,0.1)' },
  { name: 'BUREAU LOUNGE', x: 50, y: 75, w: 60, h: 25, color: 'rgba(0,255,136,0.1)' },
];

const AGENTS_ROSTER: any[] = [
  { name: 'Market Analyst', type: 'analyst', color: '#ff8c00', icon: TrendingUp },
  { name: 'Content Writer', type: 'writer', color: '#3b82f6', icon: MessageSquare },
  { name: 'Trend Scout', type: 'scout', color: '#a855f7', icon: Search },
  { name: 'Agent Spawner', type: 'spawner', color: '#00ff88', icon: Rocket },
  { name: 'Builder Agent', type: 'builder', color: '#94a3b8', icon: Box },
  { name: 'Template Architect', type: 'architect', color: '#ef4444', icon: Layout },
  { name: 'Intel Manager', type: 'intel_manager', color: '#f59e0b', icon: Microscope },
  { name: 'Forge Overseer', type: 'overseer', color: '#10b981', icon: Shield },
  { name: 'Stage Manager', type: 'stage_manager', color: '#8b5cf6', icon: Globe },
  { name: 'Skill Harvester', type: 'harvester', color: '#ec4899', icon: Cpu },
  { name: 'Market Reporter', type: 'reporter', color: '#6366f1', icon: Terminal },
  { name: 'Revenue Optimizer', type: 'revenue-optimizer', color: '#fbbf24', icon: Activity },
  { name: 'Growth Marketeer', type: 'marketeer', color: '#8b5cf6', icon: Zap },
  { name: 'PIXEL', type: 'engineer', color: '#00cc66', icon: Code },
  { name: 'GLITCH', type: 'qa', color: '#ff9900', icon: AlertTriangle },
  { name: 'MAINFRAME', type: 'orchestrator', color: '#ffffff', icon: Cpu },
];

export default function AgentOfficePage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [infographics, setInfographics] = useState<Infographic[]>([]);
  const [showGallery, setShowGallery] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [totalROI, setTotalROI] = useState<number>(0);
  const officeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const supabase = getSupabase();

    const loadInitialData = async () => {
      const { data: registryData } = await supabase.from('agents_registry').select('*');
      
      const initialAgents = AGENTS_ROSTER.map((a, i) => {
        const registryAgent = registryData?.find(r => r.type === a.type);
        return {
          ...a,
          id: `agent-${i}`,
          office_x: 20 + Math.random() * 60,
          office_y: 20 + Math.random() * 60,
          rotation: 0,
          state: registryAgent?.status === 'busy' ? 'working' : 'idle',
          status: registryAgent?.description || 'Awaiting task...',
          last_action: 'Nexus Link Established.',
          tasks_completed: registryAgent?.tasks_completed || 0,
          bubble_text: ''
        };
      });
      setAgents(initialAgents);

      const { data: traces } = await supabase.from('agent_traces').select('roi_value_usd');
      setTotalROI(traces?.reduce((acc, curr) => acc + (curr.roi_value_usd || 0), 0) || 0);

      const { data: infoData } = await supabase
        .from('forge_infographics')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
      if (infoData) setInfographics(infoData);
    };

    loadInitialData();

    // REAL-TIME SYNC
    const channel = supabase.channel('bureau-live')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'forge_events' 
      }, (p: any) => {
         const { message, agent_id } = p.new;
         setLogs(prev => [`[EVENT] ${message}`, ...prev].slice(0, 15));
         setAgents(prev => prev.map(a => a.type === agent_id ? { ...a, state: 'working', status: message, bubble_text: 'Processing...' } : a));
         setTimeout(() => setAgents(prev => prev.map(a => a.type === agent_id ? { ...a, bubble_text: '' } : a)), 3000);
      })
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'agent_traces' 
      }, (p: any) => {
         setTotalROI(prev => prev + (p.new.roi_value_usd || 0));
      })
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'forge_infographics'
      }, (p: any) => {
        setInfographics(prev => [p.new as Infographic, ...prev].slice(0, 10));
        setLogs(prev => [`[NEW_INTEL] ${p.new.title} published.`, ...prev].slice(0, 15));
      })
      .subscribe();

    // ADVANCED MOVEMENT ENGINE
    const interval = setInterval(() => {
      setAgents(prev => prev.map(agent => {
        if (agent.state === 'working') return agent;

        const behavior = Math.random();
        let nextX = agent.office_x;
        let nextY = agent.office_y;
        let nextState = agent.state;
        let nextBubble = agent.bubble_text;

        // Intentional pathfinding to Sectors
        if (behavior < 0.03) { // Move to Lounge
          nextState = 'walking';
          nextX = 45 + Math.random() * 10;
          nextY = 75 + Math.random() * 10;
          nextBubble = "Time for caffeine.";
        } else if (behavior < 0.05) { // Move to Data Vault
          nextState = 'walking';
          nextX = 75 + Math.random() * 10;
          nextY = 35 + Math.random() * 10;
          nextBubble = "Syncing with Mainframe.";
        } else if (behavior < 0.1) { // Random stroll
          nextState = 'walking';
          nextX = Math.max(10, Math.min(90, agent.office_x + (Math.random() - 0.5) * 20));
          nextY = Math.max(10, Math.min(90, agent.office_y + (Math.random() - 0.5) * 20));
        } else if (behavior < 0.15) {
          nextState = 'idle';
          nextBubble = "";
        }

        return { ...agent, office_x: nextX, office_y: nextY, state: nextState as any, bubble_text: nextBubble };
      }));
    }, 5000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#050507] pt-20 flex flex-col items-center font-pixel text-white overflow-hidden">
      
      {/* HEADER HUD */}
      <div className="w-full max-w-[1400px] px-8 py-6 flex justify-between items-end z-50 border-b border-white/10 bg-black/60 backdrop-blur-xl mb-6">
        <div className="flex gap-6 items-end">
          <div className="w-20 h-20 bg-[#ff8c00] pixel-border flex items-center justify-center shadow-[0_0_30px_rgba(255,140,0,0.2)]">
             <Briefcase size={40} className="text-black" />
          </div>
          <div>
            <h1 className="text-5xl font-black uppercase tracking-tighter leading-none mb-2">BUREAU_LEVEL_01</h1>
            <div className="text-xs tracking-[0.3em] text-[#ff8c00] flex gap-4">
               <span>STATUS: SYNCHRONIZED</span>
               <span className="text-white/40">COORD: 40.7128° N, 74.0060° W</span>
            </div>
          </div>
        </div>
        <div className="flex gap-3 h-10">
           <div className="px-4 py-2 bg-[#111] border border-white/10 text-[10px] flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#00ff88] animate-pulse"></div>
              NETWORK_LOAD: 12%
           </div>
           <div className="px-4 py-2 bg-[#ff8c00] text-black text-[10px] font-bold flex items-center gap-2">
              FORCE_OVERRIDE: OFF
           </div>
        </div>
      </div>

      <div className="flex-1 w-full max-w-[1400px] grid grid-cols-12 gap-8 px-8 pb-8 h-full">
        
        {/* LEFT: FINANCIALS & LOGS */}
        <div className="col-span-3 flex flex-col gap-6 h-full">
           
           {/* ROI HUD */}
           <div className="p-6 bg-gradient-to-br from-[#111] to-[#050505] border-2 border-white/5 pixel-border relative group">
              <div className="absolute top-2 right-2 opacity-10"><TrendingUp size={60} /></div>
              <div className="text-[10px] text-[#ff8c00] uppercase tracking-[0.2em] mb-4 flex justify-between">
                 Aggregate ROI Flow
                 <Activity size={10} className="animate-pulse" />
              </div>
              <div className="text-4xl font-bold tracking-tighter text-[#00ff88] mb-2 font-mono">
                 ${totalROI.toLocaleString()}
              </div>
              <p className="text-[9px] text-white/30 uppercase leading-relaxed">
                 Aggregate value extraction from trace-to-market deployments. Calculated via autonomous profit-loop telemetry.
              </p>
           </div>

           {/* LOG FEED */}
           <div className="flex-1 bg-black/80 border-2 border-[#151515] p-4 font-mono text-[10px] overflow-hidden flex flex-col">
              <div className="text-white/40 mb-3 border-b border-white/10 pb-2 flex items-center justify-between uppercase tracking-widest">
                 <span>System_Log</span>
                 <Terminal size={12} />
              </div>
              <div className="flex-1 overflow-y-auto space-y-2 text-[#666] custom-scrollbar">
                {logs.map((log, i) => <div key={i} className="leading-tight"><span className="text-[#33ccff] pr-2">INF:</span>{log}</div>)}
              </div>
           </div>
        </div>

        {/* CENTER: ADVANCED OFFICE MAP */}
        <div className="col-span-6 relative border-4 border-black shadow-2xl overflow-hidden cursor-crosshair group h-full bg-[#111]" ref={officeRef}>
           
           {/* THE PIXEL MAP BACKGROUND */}
           <div className="absolute inset-0 opacity-80" style={{
              backgroundImage: 'url("/pixel-office-map.png")', // Reference to the high-fidelity map
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              imageRendering: 'pixelated'
           }} />

           {/* SECTOR OVERLAYS (Visible on Hover) */}
           {SECTORS.map(s => (
             <div key={s.name} className="absolute border border-white/5 pointer-events-none transition-opacity duration-500 opacity-20 group-hover:opacity-100" style={{
                left: `${s.x - s.w/2}%`, top: `${s.y - s.h/2}%`, width: `${s.w}%`, height: `${s.h}%`,
                backgroundColor: s.color
             }}>
                <span className="absolute top-2 left-2 text-[8px] tracking-[0.3em] font-black text-white/40 uppercase">{s.name}</span>
             </div>
           ))}

           {/* AGENTS RENDERING */}
           {agents.map((agent) => (
             <motion.div
               key={agent.id}
               className="absolute z-20"
               animate={{ left: `${agent.office_x}%`, top: `${agent.office_y}%` }}
               transition={{ duration: 5, ease: "easeInOut" }}
               onClick={() => setSelectedAgent(agent)}
             >
                <div className="relative group cursor-pointer flex flex-col items-center">
                  
                  {/* RAZOR-SHARP COMMAND SPEECH BUBBLE */}
                  <AnimatePresence>
                    {agent.bubble_text && (
                       <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: -54 }}
                        exit={{ opacity: 0 }}
                        className="absolute -top-16 px-3 py-1 bg-black border-2 border-white text-white text-[13px] font-mono font-bold rounded-none whitespace-nowrap z-50 uppercase tracking-tight shadow-[4px_4px_0px_rgba(0,0,0,1)] antialiased select-none"
                        style={{ transform: 'translateZ(0)' }} // Hardware acceleration to force sharp layer
                       >
                          <span className="text-[#00ff88] mr-2">█</span>
                          {agent.bubble_text}
                       </motion.div>
                    )}
                  </AnimatePresence>
                  
                  {/* 3D-STYLE ROBOT AVATAR */}
                  <div className="relative group cursor-pointer">
                    <motion.div 
                      animate={{ 
                        y: [0, -6, 0],
                        rotate: agent.state === 'walking' ? [0, 4, -4, 0] : 0
                      }}
                      transition={{ 
                        y: { duration: 3, repeat: Infinity, ease: "easeInOut" },
                        rotate: { duration: 0.5, repeat: Infinity }
                      }}
                      className="w-14 h-14 relative flex items-center justify-center"
                    >
                      {/* 3D Sphere Body */}
                      <div 
                        className="w-10 h-10 rounded-full relative shadow-[0_8px_16px_rgba(0,0,0,0.6)] border-2 border-black/20"
                        style={{ 
                          background: `radial-gradient(circle at 30% 30%, ${agent.color}, ${agent.color}dd 40%, #000 100%)`,
                        }}
                      >
                         {/* High-Tech Visor */}
                         <div className="absolute top-3 left-0 right-0 h-2 bg-black flex items-center justify-center overflow-hidden">
                            <motion.div 
                               animate={{ x: [-20, 20, -20] }}
                               transition={{ duration: 2, repeat: Infinity }}
                               className="w-4 h-full bg-white opacity-40 blur-[1px]"
                            />
                         </div>

                         {/* Status LED */}
                         <div className={`absolute top-1 right-3 w-1.5 h-1.5 rounded-full ${agent.state === 'working' ? 'bg-[#ff0000] animate-pulse' : 'bg-[#00ff88]'}`}></div>
                         
                         {/* Centered Role Icon */}
                         <div className="absolute inset-0 flex items-center justify-center opacity-40 pointer-events-none">
                            <agent.icon size={14} className="text-white" />
                         </div>
                      </div>

                      {/* Floating Engine Glow */}
                      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-6 h-2 bg-blue-500/30 blur-md rounded-full"></div>
                    </motion.div>

                    {/* RAZOR-SHARP IDENTIFICATION TAG */}
                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none z-50">
                       <div className="px-3 py-1 bg-white text-black text-[11px] font-mono font-bold uppercase tracking-widest border-2 border-black whitespace-nowrap shadow-[4px_4px_0px_rgba(0,0,0,1)] antialiased">
                          {agent.name}
                       </div>
                    </div>
                  </div>

                  {/* STATUS INDICATORS */}
                  <div className="absolute -right-6 top-2">
                    {agent.state === 'working' && (
                       <div className="flex flex-col gap-0.5">
                          {[...Array(3)].map((_, i) => (
                             <motion.div 
                                key={i}
                                animate={{ opacity: [0.2, 1, 0.2] }}
                                transition={{ delay: i * 0.2, duration: 0.6, repeat: Infinity }}
                                className="w-1.5 h-0.5 bg-red-500"
                             />
                          ))}
                       </div>
                    )}
                  </div>
                </div>
             </motion.div>
           ))}

           {/* SCANLINES OVERLAY */}
           <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{
              backgroundImage: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))',
              backgroundSize: '100% 2px, 3px 100%'
           }} />
        </div>

        {/* RIGHT: AGENT DETAIL TERMINAL */}
        <div className="col-span-3 flex flex-col h-full bg-[#050507]">
           <AnimatePresence mode="wait">
             {selectedAgent ? (
               <motion.div 
                 key={selectedAgent.id}
                 initial={{ opacity: 0, scale: 0.98 }} 
                 animate={{ opacity: 1, scale: 1 }} 
                 exit={{ opacity: 0, scale: 0.98 }}
                 className="flex-1 border-2 border-[#1a1a1c] p-8 flex flex-col relative overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.4)]"
                 style={{ borderTop: `4px solid ${selectedAgent.color}` }}
               >
                  <div className="absolute top-0 right-0 w-32 h-32 opacity-[0.03] transform rotate-45 pointer-events-none text-white">
                     <selectedAgent.icon size={128} />
                  </div>

                  <div className="flex items-center gap-5 mb-10">
                     <div className="w-16 h-16 bg-white flex items-center justify-center shadow-xl" style={{ backgroundColor: selectedAgent.color, clipPath: 'polygon(15% 0%, 100% 0%, 100% 85%, 85% 100%, 0% 100%, 0% 15%)' }}>
                        <selectedAgent.icon size={32} className="text-black" />
                     </div>
                     <div>
                        <h2 className="text-3xl font-bold uppercase tracking-tighter leading-none mb-1 text-white">{selectedAgent.name}</h2>
                        <span className="text-[10px] text-[#ff8c00] tracking-[0.3em] font-mono font-bold uppercase">{selectedAgent.type}</span>
                     </div>
                  </div>

                  <div className="space-y-8 flex-1">
                     <div className="bg-[#0a0a0c] p-5 border border-white/5 border-l-4" style={{ borderColor: selectedAgent.color }}>
                        <label className="text-[9px] text-white/30 tracking-[0.2em] block mb-3 font-bold uppercase">Active_Directive</label>
                        <p className="text-sm text-[#00ff88] font-mono leading-relaxed">{selectedAgent.status.toUpperCase()}</p>
                     </div>

                     <div className="grid grid-cols-2 gap-4">
                        <div className="bg-[#0c0c0e] p-4 border border-white/5">
                           <span className="text-[9px] text-white/20 block mb-2 uppercase font-bold tracking-widest">Efficiency</span>
                           <span className="text-2xl font-bold text-white">{(85 + Math.random() * 15).toFixed(1)}%</span>
                        </div>
                        <div className="bg-[#0c0c0e] p-4 border border-white/5">
                           <span className="text-[9px] text-white/20 block mb-2 uppercase font-bold tracking-widest">Completed</span>
                           <span className="text-2xl font-bold text-white">{selectedAgent.tasks_completed}</span>
                        </div>
                     </div>

                     <div className="space-y-3">
                        <label className="text-[9px] text-white/20 block font-bold uppercase tracking-widest">Hardware_Capabilities</label>
                        <div className="flex flex-wrap gap-2">
                           {['VECTOR_IO', 'TRACE_LINK', 'NEURAL_SYNC'].map(f => (
                              <span key={f} className="px-3 py-1 bg-white/5 text-[9px] tracking-widest border border-white/10 text-white/50 font-bold">{f}</span>
                           ))}
                        </div>
                     </div>
                  </div>

                  <div className="mt-auto space-y-4">
                     <button className="w-full bg-white text-black py-4 text-xs font-black uppercase tracking-widest hover:bg-[#ff8c00] transition-all" onClick={() => setSelectedAgent(null)}>
                        TERMINATE_LINK
                     </button>
                     <div className="h-1 w-full bg-white/5 overflow-hidden">
                        <motion.div 
                           animate={{ x: ['-100%', '100%'] }} 
                           transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                           className="h-full w-1/3 bg-[#ff8c00]"
                        />
                     </div>
                  </div>
               </motion.div>
             ) : (
               <div className="flex-1 bg-[#050507] border-2 border-dashed border-white/5 flex flex-col items-center justify-center p-12 text-center group">
                  <div className="relative mb-10">
                     <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center relative z-10">
                        <Monitor size={48} className="text-white/20 group-hover:text-[#ff8c00]/40 transition-colors" />
                     </div>
                     <div className="absolute inset-0 bg-[#ff8c00]/5 rounded-full blur-2xl animate-pulse"></div>
                  </div>
                  <h3 className="text-xl font-black uppercase tracking-[0.4em] mb-4 text-white/80">Awaiting Signal</h3>
                  <div className="w-16 h-0.5 bg-[#ff8c00]/20 mb-8 mx-auto"></div>
                  <p className="text-[10px] text-white/40 leading-relaxed uppercase tracking-[0.2em] max-w-[200px]">
                     Broadcast active. Select an autonomous robot from the floor to establish a neural telemetry bridge and view diagnostics.
                  </p>
                  
                  <div className="mt-12 flex flex-col gap-2 w-full max-w-[180px]">
                     {[...Array(3)].map((_, i) => (
                        <div key={i} className="h-1 bg-white/5 w-full relative overflow-hidden">
                           <motion.div 
                              animate={{ x: ['-100%', '100%'] }}
                              transition={{ duration: 2 + i, repeat: Infinity, ease: "linear" }}
                              className="h-full w-1/4 bg-white/10"
                           />
                        </div>
                     ))}
                  </div>
               </div>
             )}
           </AnimatePresence>
        </div>
      </div>

      {/* FOOTER STATS */}
      <div className="w-full bg-black py-4 px-10 flex justify-between items-center text-[9px] text-white/20 uppercase tracking-[0.4em] border-t border-white/5">
         <div className="flex gap-10">
            <span className="flex items-center gap-2 saturate-0 hover:saturate-100 transition-all cursor-default"><Server size={10}/> CLUSTER_01_RUNNING</span>
            <span className="flex items-center gap-2"><Globe size={10}/> SOCKETS: ESTABLISHED</span>
         </div>
         <div className="flex gap-8">
            <span className="text-[#ff8c00]/40">[ESC] EXIT_SIMULATION</span>
            <span className="px-3 py-1 bg-white/5 text-white/40 border border-white/10">S_LEVEL: ROOT_ADMIN</span>
         </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #222; }
      `}</style>
      {/* INTEL DASHBOARD MODAL */}
      <AnimatePresence>
        {showGallery && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-12"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="w-full max-w-6xl h-full max-h-[85vh] bg-[#0a0a0c] border border-white/10 flex flex-col relative shadow-[0_0_100px_rgba(0,0,0,1)] overflow-hidden"
            >
              <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/5">
                 <div>
                    <h2 className="text-4xl font-black uppercase tracking-tighter mb-1">Bureau_Intel_Nexus</h2>
                    <p className="text-[10px] text-white/40 tracking-[0.4em] uppercase font-bold">Synchronized Daily Intelligence Feed</p>
                 </div>
                 <button 
                  onClick={() => setShowGallery(false)}
                  className="w-12 h-12 flex items-center justify-center border border-white/10 hover:bg-white hover:text-black transition-all font-black text-xl"
                 >
                    ✕
                 </button>
              </div>

              <div className="flex-1 overflow-y-auto p-12 custom-scrollbar">
                 <div className="grid grid-cols-2 gap-10">
                    {infographics.length > 0 ? infographics.map((inf, i) => (
                       <motion.div 
                        key={inf.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="group relative bg-white/5 border border-white/5 p-8 flex flex-col gap-6 hover:border-[#ff8c00]/30 transition-all hover:bg-white/[0.07]"
                       >
                          <div className="flex justify-between items-start">
                             <span className="px-3 py-1 bg-[#ff8c00]/10 text-[#ff8c00] text-[9px] font-bold tracking-[0.2em] border border-[#ff8c00]/20 uppercase">
                               {inf.domain || 'General Intel'}
                             </span>
                             <span className="text-[9px] text-white/20 font-mono">
                               {new Date(inf.created_at).toLocaleDateString()}
                             </span>
                          </div>
                          <h3 className="text-2xl font-bold text-white group-hover:text-[#ff8c00] transition-colors uppercase tracking-tight leading-tight">
                             {inf.title}
                          </h3>
                          <div className="text-sm text-white/60 font-serif leading-relaxed line-clamp-4 italic border-l-2 border-white/10 pl-4">
                             {inf.content}
                          </div>
                          <div className="mt-auto pt-6 flex items-center justify-between">
                             <div className="flex gap-1">
                                {[...Array(5)].map((_, i) => (
                                   <div key={i} className="w-1 h-3 bg-white/10" style={{ height: 4 + Math.random() * 8 }}></div>
                                ))}
                             </div>
                             <button className="text-[9px] font-black uppercase tracking-[0.3em] flex items-center gap-2 text-[#ff8c00] hover:gap-4 transition-all">
                                Establish_Full_Neural_Link <ChevronRight size={12} />
                             </button>
                          </div>
                       </motion.div>
                    )) : (
                      <div className="col-span-2 py-32 text-center opacity-20">
                         <Search size={64} className="mx-auto mb-6" />
                         <p className="text-sm font-bold uppercase tracking-widest">No Intelligence reports found in the current epoch.</p>
                      </div>
                    )}
                 </div>
              </div>

              <div className="p-4 bg-black/40 border-t border-white/5 text-[9px] text-white/20 flex justify-between uppercase tracking-widest">
                 <span>Nexus_Core v2.4.0</span>
                 <span>Telemetry: Active // Nodes: Online // Intelligence: Synced</span>
                 <span>[ESC] TO EXIT_SIMULATION</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
