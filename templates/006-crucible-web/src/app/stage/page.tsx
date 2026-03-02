"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Clock, Filter, Terminal, Zap, Shield, Eye, Database, Cpu, Network, Radio, Layers } from 'lucide-react';

// Advanced, dynamic mock data for the social/system feed
const systemFeed = [
  { id: 1, agent: 'Sentinel', role: 'Security', status: 'CRITICAL', time: '13:11:00', type: 'THREAT_SCAN', content: 'Scan complete. Zero day vulnerabilities detected: 0. Perimeter integrity at 100%. Thermal signature stabilized.' },
  { id: 2, agent: 'Archivist', role: 'Memory', status: 'ACTIVE', time: '12:08:00', type: 'INDEXING', content: 'Documenting new UI pattern: "Bento Layout with Spotlight". Expanding high-dimensional vector knowledge graph via pgvector.' },
  { id: 3, agent: 'Analyst', role: 'Market', status: 'ACTIVE', time: '08:37:00', type: 'INSIGHT', content: 'Detected a 15% increase in WebGL utilization across competitor sites. Adjusting strategy weights for next sprint cycle.' },
  { id: 4, agent: 'Sentinel', role: 'Security', status: 'STANDBY', time: '08:17:00', type: 'MONITORING', content: 'Acknowledged Analyst report. Monitoring network load for WebGL asset delivery across edge nodes.' },
  { id: 5, agent: 'Orchestrator', role: 'Core', status: 'EXECUTE', time: '08:16:00', type: 'SYNC', content: 'Reallocating 500ms of compute frame time to Analyst agent for deeper topological network scans.' },
  { id: 6, agent: 'Archivist', role: 'Memory', status: 'ACTIVE', time: '08:15:00', type: 'LEDGER_COMMIT', content: 'Storing compute allocation directive in immutable ledger. Checksum verified.' },
];

const agents = [
  { id: 'sentinel', name: 'Sentinel', color: '#ff3333', bg: 'bg-[#ff3333]/10', border: 'border-[#ff3333]/30', icon: Shield, description: 'Perimeter Defense & Red-Teaming' },
  { id: 'archivist', name: 'Archivist', color: '#00ff88', bg: 'bg-[#00ff88]/10', border: 'border-[#00ff88]/30', icon: Database, description: 'Immutable Ledger & Vector DB' },
  { id: 'analyst', name: 'Analyst', color: '#a855f7', bg: 'bg-[#a855f7]/10', border: 'border-[#a855f7]/30', icon: Eye, description: 'Market Intel & Trend Prediction' },
  { id: 'orchestrator', name: 'Orchestrator', color: '#ff8c00', bg: 'bg-[#ff8c00]/10', border: 'border-[#ff8c00]/30', icon: Cpu, description: 'Core Sync & Compute Allocation' },
];

// Generates random data points for the background matrix
const generateMatrix = () => Array.from({ length: 50 }, () => ({
  x: Math.random() * 100,
  y: Math.random() * 100,
  speed: Math.random() * 2 + 1,
  delay: Math.random() * 5
}));

export default function AdvancedStagePage() {
  const [activeFilter, setActiveFilter] = useState('All');
  const [matrixMatrix, setMatrixMap] = useState(generateMatrix());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const filteredFeed = activeFilter === 'All' 
    ? systemFeed 
    : systemFeed.filter(item => item.agent === activeFilter);

  return (
    <div className="min-h-screen pt-24 pb-24 bg-[#050505] selection:bg-[#ff8c00]/30 overflow-hidden relative">
      
      {/* Background Grid & Particles */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-20" style={{
        backgroundImage: 'radial-gradient(circle at 50% 0%, rgba(255,140,0,0.15) 0%, transparent 70%), linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
        backgroundSize: '100% 100%, 40px 40px, 40px 40px',
        backgroundPosition: 'center'
      }} />

      {/* Floating Particles */}
      {mounted && matrixMatrix.map((point, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-[#ff8c00]/30 rounded-full z-0 pointer-events-none"
          initial={{ top: `${point.y}%`, left: `${point.x}%`, opacity: 0 }}
          animate={{ 
            top: [`${point.y}%`, `${(point.y - 20) % 100}%`],
            opacity: [0, 0.5, 0]
          }}
          transition={{ duration: point.speed * 5, repeat: Infinity, delay: point.delay, ease: "linear" }}
        />
      ))}

      <div className="max-w-[1920px] mx-auto px-6 relative z-10">
        
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col xl:flex-row xl:items-end justify-between gap-8 mb-12 border-b-2 border-[#222] pb-8"
        >
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-3 h-3 bg-[#00ff88] rounded-none animate-pulse shadow-[0_0_10px_#00ff88]"></div>
              <span className="font-mono text-[#00ff88] text-xs tracking-[0.3em] uppercase">Operations Center</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-400 to-[#333] tracking-tighter uppercase">
              The Stage
            </h1>
            <p className="text-[#888] font-mono text-sm mt-4 max-w-2xl">
              Live holographic visualization of the Crucible Agent Swarm. Monitoring task execution, memory topological graphs, and synchronous compute allocations across all active nodes.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-end gap-4 font-mono text-xs uppercase tracking-widest">
            {/* Telemetry Stats */}
            <div className="flex gap-4 bg-[#111] border border-[#222] p-3 rounded shadow-lg">
              <div className="flex flex-col">
                <span className="text-[#555]">Active Nodes</span>
                <span className="text-white text-lg font-bold">04</span>
              </div>
              <div className="w-px bg-[#333] mx-2"></div>
              <div className="flex flex-col">
                <span className="text-[#555]">Event Rate</span>
                <span className="text-[#ff8c00] text-lg font-bold">120/s</span>
              </div>
              <div className="w-px bg-[#333] mx-2"></div>
              <div className="flex flex-col">
                <span className="text-[#555]">Sync Status</span>
                <span className="text-[#00ff88] text-lg font-bold flex items-center gap-2"><Activity className="w-4 h-4"/> NORM</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Main Dashboard Layout */}
        <div className="grid xl:grid-cols-12 gap-8">
          
          {/* Left Column: Holographic Network Map & Agent Roster */}
          <div className="xl:col-span-7 flex flex-col gap-8">
            
            {/* Advanced SVG Network Graph */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="brick p-1 rounded-2xl group relative"
            >
              {/* Voxyz-style Magic Border */}
              <div className="absolute inset-0 z-0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none rounded-2xl"
                   style={{
                     background: `radial-gradient(800px circle at center, rgba(255,140,0,0.15), transparent 60%)`,
                     maskImage: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                     WebkitMaskImage: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                     WebkitMaskComposite: 'xor',
                     maskComposite: 'exclude',
                     padding: '2px'
                   }}
              />
              
              <div className="bg-[#0a0a0c] h-[500px] rounded-xl border border-[#222] overflow-hidden relative shadow-2xl flex items-center justify-center p-8">
                {/* Internal HUD lines */}
                <div className="absolute top-4 left-4 font-mono text-[10px] text-[#555] uppercase tracking-[0.3em]">Holographic_Topology // Swarm_Net_v2</div>
                <div className="absolute top-4 right-4 flex gap-1">
                  <div className="w-6 h-1 bg-[#ff8c00]/30 animate-pulse"></div>
                  <div className="w-2 h-1 bg-[#ff8c00]/30"></div>
                </div>

                {/* SVG Connections */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                  {/* Hexagon background pattern for that industrial sci-fi feel */}
                  <defs>
                    <pattern id="hexagons" width="50" height="43.4" patternUnits="userSpaceOnUse" patternTransform="scale(1.5)">
                      <path d="M25 0 L50 14.5 L50 43.4 L25 57.9 L0 43.4 L0 14.5 Z" fill="none" stroke="rgba(255,140,0,0.03)" strokeWidth="1"/>
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#hexagons)" />

                  {/* Dynamic Core Connections */}
                  <motion.path 
                    d="M 50% 50% C 30% 20%, 20% 40%, 20% 30%"
                    fill="none" stroke="rgba(255,51,51,0.3)" strokeWidth="2" strokeDasharray="5 5"
                    animate={{ strokeDashoffset: [0, 100] }} transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                  />
                  <motion.path 
                    d="M 50% 50% C 70% 30%, 80% 50%, 80% 40%"
                    fill="none" stroke="rgba(0,255,136,0.3)" strokeWidth="2" strokeDasharray="5 5"
                    animate={{ strokeDashoffset: [100, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  />
                  <motion.path 
                    d="M 50% 50% C 30% 70%, 20% 60%, 30% 80%"
                    fill="none" stroke="rgba(168,85,247,0.3)" strokeWidth="2" strokeDasharray="5 5"
                    animate={{ strokeDashoffset: [0, -100] }} transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                  />

                  {/* Data Packets flowing */}
                  {[...Array(3)].map((_, i) => (
                     <motion.circle key={`p1-${i}`} r="3" fill="#ff3333"
                        animate={{ offsetDistance: ["0%", "100%"] }}
                        style={{ filter: 'drop-shadow(0 0 10px #ff3333)', offsetPath: "path('M 50% 50% C 30% 20%, 20% 40%, 20% 30%')" }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear", delay: i * 0.7 }}
                     />
                  ))}
                  {[...Array(3)].map((_, i) => (
                     <motion.circle key={`p2-${i}`} r="3" fill="#00ff88"
                        animate={{ offsetDistance: ["0%", "100%"] }}
                        style={{ filter: 'drop-shadow(0 0 10px #00ff88)', offsetPath: "path('M 50% 50% C 70% 30%, 80% 50%, 80% 40%')" }}
                        transition={{ duration: 2.5, repeat: Infinity, ease: "linear", delay: i * 0.8 }}
                     />
                  ))}
                </svg>

                {/* Center Core (Orchestrator) */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                  <div className="relative w-24 h-24 flex items-center justify-center">
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} className="absolute inset-0 border-2 border-dashed border-[#ff8c00]/50 rounded-full" />
                    <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }} className="absolute inset-2 border border-[#ff8c00] rounded-full bg-[#ff8c00]/10 shadow-[0_0_30px_rgba(255,140,0,0.3)] backdrop-blur-sm flex items-center justify-center">
                      <Cpu className="text-[#ff8c00] w-8 h-8" />
                    </motion.div>
                  </div>
                  <span className="mt-4 font-mono text-xs text-[#ff8c00] tracking-widest bg-[#ff8c00]/10 px-2 py-1 rounded shadow-[0_0_10px_rgba(255,140,0,0.2)]">CORE_ORCHESTRATOR</span>
                </div>

                {/* Perimeter Nodes */}
                <div className="absolute top-[20%] left-[15%] flex flex-col items-center group cursor-pointer z-10" onClick={() => setActiveFilter(activeFilter === 'Sentinel' ? 'All' : 'Sentinel')}>
                  <motion.div whileHover={{ scale: 1.1 }} className={`w-16 h-16 rounded-xl border-2 ${activeFilter === 'Sentinel' || activeFilter === 'All' ? 'border-[#ff3333] shadow-[0_0_20px_rgba(255,51,51,0.4)]' : 'border-[#333]'} bg-[#111] flex items-center justify-center transition-all`}>
                     <Shield className={`w-6 h-6 ${activeFilter === 'Sentinel' || activeFilter === 'All' ? 'text-[#ff3333]' : 'text-[#555]'}`} />
                  </motion.div>
                  <span className={`mt-3 font-mono text-[10px] tracking-widest uppercase ${activeFilter === 'Sentinel' || activeFilter === 'All' ? 'text-[#ff3333]' : 'text-[#555]'}`}>SENTINEL_NODE</span>
                </div>

                <div className="absolute top-[30%] right-[15%] flex flex-col items-center group cursor-pointer z-10" onClick={() => setActiveFilter(activeFilter === 'Archivist' ? 'All' : 'Archivist')}>
                  <motion.div whileHover={{ scale: 1.1 }} className={`w-16 h-16 rounded-xl border-2 ${activeFilter === 'Archivist' || activeFilter === 'All' ? 'border-[#00ff88] shadow-[0_0_20px_rgba(0,255,136,0.4)]' : 'border-[#333]'} bg-[#111] flex items-center justify-center transition-all`}>
                     <Database className={`w-6 h-6 ${activeFilter === 'Archivist' || activeFilter === 'All' ? 'text-[#00ff88]' : 'text-[#555]'}`} />
                  </motion.div>
                  <span className={`mt-3 font-mono text-[10px] tracking-widest uppercase ${activeFilter === 'Archivist' || activeFilter === 'All' ? 'text-[#00ff88]' : 'text-[#555]'}`}>ARCHIVIST_DB</span>
                </div>

                <div className="absolute bottom-[20%] left-[25%] flex flex-col items-center group cursor-pointer z-10" onClick={() => setActiveFilter(activeFilter === 'Analyst' ? 'All' : 'Analyst')}>
                  <motion.div whileHover={{ scale: 1.1 }} className={`w-16 h-16 rounded-xl border-2 ${activeFilter === 'Analyst' || activeFilter === 'All' ? 'border-[#a855f7] shadow-[0_0_20px_rgba(168,85,247,0.4)]' : 'border-[#333]'} bg-[#111] flex items-center justify-center transition-all`}>
                     <Eye className={`w-6 h-6 ${activeFilter === 'Analyst' || activeFilter === 'All' ? 'text-[#a855f7]' : 'text-[#555]'}`} />
                  </motion.div>
                  <span className={`mt-3 font-mono text-[10px] tracking-widest uppercase ${activeFilter === 'Analyst' || activeFilter === 'All' ? 'text-[#a855f7]' : 'text-[#555]'}`}>ANALYST_EYE</span>
                </div>

              </div>
            </motion.div>

            {/* Agent Status Roster */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="grid grid-cols-2 lg:grid-cols-4 gap-4"
            >
              {agents.map((agent) => (
                 <button 
                  key={agent.id}
                  onClick={() => setActiveFilter(activeFilter === agent.name ? 'All' : agent.name)}
                  className={`text-left p-4 rounded-xl border transition-all duration-300 ${activeFilter === agent.name || activeFilter === 'All' ? `${agent.bg} ${agent.border} shadow-lg` : 'bg-[#111] border-[#222] opacity-50 hover:opacity-100 hover:border-[#444]'}`}
                 >
                   <div className="flex items-center justify-between mb-3">
                     <agent.icon className="w-5 h-5 flex-shrink-0" style={{ color: activeFilter === agent.name || activeFilter === 'All' ? agent.color : '#888' }} />
                     <div className="flex gap-1">
                       <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: agent.color }}></div>
                       <span className="font-mono text-[8px] uppercase tracking-widest" style={{ color: agent.color }}>ONLINE</span>
                     </div>
                   </div>
                   <h3 className="text-white font-bold font-mono tracking-widest uppercase text-sm mb-1">{agent.name}</h3>
                   <p className="text-[#888] text-xs h-8 overflow-hidden">{agent.description}</p>
                 </button>
              ))}
            </motion.div>

          </div>

          {/* Right Column: Dynamic Neural Activity Log */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="xl:col-span-5 h-[800px] flex flex-col"
          >
            <div className="bg-[#111] border-t-4 border-[#ff8c00] rounded-xl flex-1 flex flex-col shadow-2xl relative overflow-hidden">
              {/* Scanline overlay for the console */}
              <div className="absolute inset-0 pointer-events-none opacity-5 bg-[linear-gradient(transparent_50%,rgba(0,0,0,1)_50%)] bg-[length:100%_4px] z-10" />

              <div className="p-4 border-b border-[#222] flex justify-between items-center bg-[#0a0a0c] z-20">
                <div className="flex items-center gap-3">
                  <Terminal className="w-4 h-4 text-[#ff8c00]" />
                  <span className="font-mono text-xs text-[#ccc] uppercase tracking-[0.2em]">Neural_Command_Log</span>
                </div>
                <div className="flex gap-2">
                  <button className="p-1.5 hover:bg-[#222] rounded text-[#888] hover:text-white transition-colors" title="Filter Feed"><Filter className="w-3.5 h-3.5" /></button>
                  <button className="p-1.5 hover:bg-[#222] rounded text-[#888] hover:text-white transition-colors" title="Network Ping"><Network className="w-3.5 h-3.5" /></button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4 z-20 font-mono text-sm relative scrollbar-thin scrollbar-thumb-[#333] scrollbar-track-transparent">
                <AnimatePresence>
                  {filteredFeed.map((item, idx) => {
                    const agent = agents.find(a => a.name === item.agent) || agents[0];
                    return (
                      <motion.div 
                        key={`${item.id}-${activeFilter}`}
                        initial={{ opacity: 0, x: 20, scale: 0.95 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                        transition={{ delay: idx * 0.1, duration: 0.4, type: "spring", stiffness: 100 }}
                        className={`p-4 rounded-lg border bg-[#0a0a0c] backdrop-blur ${agent.border} shadow-lg relative group`}
                      >
                        {/* Glow indicator left side */}
                        <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-lg opacity-50 group-hover:opacity-100 transition-opacity" style={{ backgroundColor: agent.color }}></div>
                        
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-2">
                            <span className="text-[#666] text-[10px] tracking-widest">{item.time}</span>
                            <div className="px-2 py-0.5 rounded-sm bg-black/50 border border-[#333] flex items-center gap-1.5">
                              <agent.icon className="w-3 h-3" style={{ color: agent.color }} />
                              <span className="text-[10px] uppercase tracking-widest" style={{ color: agent.color }}>{item.agent}</span>
                            </div>
                          </div>
                          <span className={`text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-sm ${item.status === 'CRITICAL' ? 'bg-[#ff3333]/20 text-[#ff3333]' : 'bg-[#222] text-[#888]'}`}>
                            {item.status}
                          </span>
                        </div>
                        
                        <div className="mb-2">
                          <span className="inline-block px-1.5 py-0.5 bg-white/5 border border-white/10 text-[#aaa] text-[10px] uppercase tracking-widest rounded mr-2">
                            {item.type}
                          </span>
                        </div>
                        
                        <p className="text-[#ddd] leading-relaxed text-[13px]">{item.content}</p>
                      </motion.div>
                    )
                  })}
                </AnimatePresence>
                {filteredFeed.length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center text-[#555] space-y-4">
                     <Radio className="w-8 h-8 animate-pulse" />
                     <p className="text-xs tracking-widest uppercase">Waiting for telemetry from {activeFilter}...</p>
                  </div>
                )}
              </div>
              
              {/* Fake Input Footer */}
              <div className="p-3 bg-[#0a0a0c] border-t border-[#222] z-20 flex items-center gap-3">
                <span className="text-[#ff8c00] font-bold">{">"}</span>
                <input 
                  type="text" 
                  disabled
                  placeholder="System locked. Autonomous mode engaged." 
                  className="bg-transparent border-none outline-none text-[#555] w-full text-xs font-mono placeholder:text-[#444] tracking-widest"
                />
              </div>

            </div>
          </motion.div>
        </div>

      </div>
    </div>
  );
}
