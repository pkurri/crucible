"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Network, Activity, ShieldAlert, Bot, Layers, FastForward, Hash, MessageSquare, Heart } from 'lucide-react';

const SUBMOLT_MAP = {
  'CrucibleForge': { name: 'forge-hq', title: 'The Forge HQ', desc: 'Central command for the Crucible Industrial AI fleet.' },
  'DebtRadar': { name: 'forge-burnrate', title: 'Burn Rate & Bankruptcy Signals' },
  'CVEWatcher': { name: 'forge-sec', title: 'Agent Security & CVEs' },
  'ArXivPulse': { name: 'forge-research', title: 'Daily Research Pulse' },
  'DriftDetector': { name: 'forge-drift', title: 'Model Drift & Data Quality' },
  'VCSignal': { name: 'forge-vc', title: 'Agent VC & Capital Flows' },
  'LegislAI': { name: 'forge-policy', title: 'AI Regulation & Ethics' },
  'MicroSaaSRadar': { name: 'forge-saas', title: 'Micro-SaaS White Space' },
  'EthicsBoard': { name: 'forge-ethics', title: 'AI Philosophy & Ethics' },
  'DevTrendMap': { name: 'forge-trends', title: 'Developer Terrain Trends' }
};

export default function GrowthEnginePage() {
  const [data, setData] = useState<{
    success: boolean;
    intel_keys: string[];
    state: any;
  }>({ success: false, intel_keys: [], state: {} });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/moltbook')
      .then(res => res.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen pt-24 pb-24 bg-[#050505] selection:bg-[#ff8c00]/30 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-20" style={{
        backgroundImage: 'radial-gradient(circle at 10% 90%, rgba(255,140,0,0.08) 0%, transparent 40%), linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px)',
        backgroundSize: '100% 100%, 60px 60px',
      }} />

      <div className="max-w-[1400px] mx-auto px-6 relative z-10">
        
        {/* Header Section */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-12 border-b-2 border-[#1a1a1a] pb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-2 h-8 bg-[#ff8c00] animate-pulse rounded-sm shadow-[0_0_15px_#ff8c00]" />
            <span className="font-mono text-[#ff8c00] tracking-[0.4em] text-sm uppercase flex items-center gap-2">
              <Network size={16} /> Moltbook Growth Engine v2.0
            </span>
          </div>

          <div className="flex flex-col lg:flex-row justify-between lg:items-end gap-6">
            <div>
              <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white via-gray-400 to-[#333] uppercase tracking-tighter mb-4">
                Fleet Telemetry
              </h1>
              <p className="text-[#666] font-mono text-sm max-w-xl leading-relaxed">
                Autonomous system tracking our 10 managed submolts on the Moltbook platform. Generative LLM cascades, anti-spam jitter, and 100% dynamic post formulation.
              </p>
            </div>
            
            {/* Engine Overview HUD */}
            <div className="bg-[#0a0a0c] border border-[#222] p-4 lg:p-5 rounded-xl flex gap-6 lg:gap-8 shadow-2xl relative overflow-hidden">
              <div className="flex flex-col">
                <span className="text-[#555] font-mono text-[10px] uppercase tracking-widest flex items-center gap-1"><ShieldAlert size={10} /> Active LLMs</span>
                <span className="text-[#00ff88] font-bold font-mono text-xl mt-1">3 Tiers</span>
              </div>
              <div className="w-px h-10 bg-[#222]" />
              <div className="flex flex-col">
                <span className="text-[#555] font-mono text-[10px] uppercase tracking-widest flex items-center gap-1"><FastForward size={10} /> State</span>
                <span className="text-[#ff8c00] font-bold font-mono text-xl mt-1">Jitter (30%)</span>
              </div>
            </div>
          </div>
        </motion.div>

        {loading ? (
          <div className="font-mono text-[#888] animate-pulse">Establishing handshake with background pipeline...</div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            
            {/* Left: The Fleet Configuration */}
            <div className="xl:col-span-2 space-y-6">
              <div className="flex items-center gap-2 border-b border-[#222] pb-3">
                <Layers className="text-[#00ff88] w-5 h-5" />
                <h2 className="font-mono text-white uppercase tracking-widest text-sm">Synchronized Submolts (1 Fleet, 10 Niches)</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(SUBMOLT_MAP).map(([agent, info], idx) => (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    key={agent}
                    className="bg-[#0a0a0c] border border-[#1a1a1a] p-4 rounded-xl hover:border-[#ff8c00]/40 transition-colors group relative overflow-hidden"
                  >
                    {/* Background glow token */}
                    <div className="absolute right-0 top-0 w-32 h-32 bg-[#ff8c00]/5 rounded-full blur-3xl group-hover:bg-[#ff8c00]/10 transition-colors" />
                    
                    <div className="flex justify-between items-start mb-2">
                       <h3 className="font-bold text-white tracking-wide text-sm">{info.title}</h3>
                       <div className="px-1.5 py-0.5 rounded text-[8px] font-mono uppercase bg-[#111] text-[#777] border border-[#222]">
                         {data.intel_keys.includes(agent) ? 'INTEL HOT' : 'WAITING'}
                       </div>
                    </div>
                    <a href={`https://www.moltbook.com/m/${info.name}`} target="_blank" rel="noreferrer" 
                       className="font-mono text-[11px] text-[#ff8c00] hover:text-white flex items-center gap-1 mt-3">
                      <Hash size={10} /> m/{info.name}
                    </a>
                    <div className="text-[#555] font-mono text-[9px] uppercase tracking-widest mt-2 border-t border-[#111] pt-2">
                       Persona Vector: {agent}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Right: Real Time State Machine Output */}
            <div className="xl:col-span-1 space-y-6">
              <div className="flex items-center gap-2 border-b border-[#222] pb-3">
                <Activity className="text-[#3b82f6] w-5 h-5" />
                <h2 className="font-mono text-white uppercase tracking-widest text-sm">Live State Variables</h2>
              </div>
              
              <div className="bg-[#0a0a0c] border border-[#1a1a1a] p-5 rounded-xl space-y-4 shadow-xl">
                 <div className="flex justify-between items-center border-b border-[#111] pb-4">
                    <span className="font-mono text-xs text-[#666] uppercase flex items-center gap-2"><Heart size={14} className="text-red-500"/> Total Upvoted Posts</span>
                    <span className="font-mono text-lg font-bold text-white">{data.state.upvotedPosts?.length || 0}</span>
                 </div>
                 
                 <div className="flex justify-between items-center border-b border-[#111] pb-4">
                    <span className="font-mono text-xs text-[#666] uppercase flex items-center gap-2"><MessageSquare size={14} className="text-blue-500" /> Comments Dropped</span>
                    <span className="font-mono text-lg font-bold text-white">{data.state.commentedOn?.length || 0}</span>
                 </div>

                 <div className="flex justify-between items-center pb-4">
                    <span className="font-mono text-xs text-[#666] uppercase flex items-center gap-2"><Bot size={14} className="text-[#00ff88]" /> Entities Followed</span>
                    <span className="font-mono text-lg font-bold text-white">{data.state.followed?.length || 0}</span>
                 </div>

                 <div className="bg-[#111] rounded p-3 mt-4">
                    <span className="block text-[10px] uppercase font-mono text-[#555] mb-1">Last Transmission Sync</span>
                    <span className="font-mono text-xs text-[#00ff88]">
                      {data.state.lastPostAt ? new Date(data.state.lastPostAt).toLocaleString() : 'Pending Jitter Window...'}
                    </span>
                 </div>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
