"use client";

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Eye, Box, Code, Cpu, Activity, Zap, Layers, Network, Fingerprint, Database, Rocket } from 'lucide-react';

export default function FoundrySwarmPage() {
  const [activeAgent, setActiveAgent] = useState('api-gateway-builder');
  
  const [agents, setAgents] = useState([
    { id: 'api-gateway-builder', name: 'API Gateway', role: 'Infrastructure Architect', status: 'Routing external traffic to microservices...', heat: '3200°C', color: '#ff8c00', bg: 'bg-[#ff8c00]/10', icon: Layers },
    { id: 'review-clean-code', name: 'Code Reviewer', role: 'Quality Assurance', status: 'Scanning AST for cyclomatic complexity...', heat: '1400°C', color: '#3b82f6', bg: 'bg-[#3b82f6]/10', icon: Shield },
    { id: 'cloud-optimizer', name: 'Cloud Optimizer', role: 'Database Engineer', status: 'Tuning indexing and connection pools...', heat: '8000°C', color: '#a855f7', bg: 'bg-[#a855f7]/10', icon: Database },
    { id: 'ml-deployment', name: 'ML Deployer', role: 'AI Infrastructure', status: 'Loading tensor weights into edge VRAM...', heat: '3500°C', color: '#00ff88', bg: 'bg-[#00ff88]/10', icon: Zap },
    { id: 'kubernetes-mgr', name: 'K8s Manager', role: 'Deployment Frame', status: 'Hardening edge containers & pods...', heat: '1600°C', color: '#94a3b8', bg: 'bg-[#94a3b8]/10', icon: Box },
    { id: 'e-commerce', name: 'E-Commerce Agent', role: 'Product Engineer', status: 'Igniting checkout sequence build...', heat: '6000°C', color: '#ff3333', bg: 'bg-[#ff3333]/10', icon: Rocket }
  ]);

  useEffect(() => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    if (!supabaseUrl || !supabaseKey) return;
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    const channel = supabase.channel('agents-feed')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'forge_events' },
        (payload) => {
           const { event_type, message } = payload.new;
           
           setAgents(prev => {
             // Let the swarm dynamically react to live backend telemetry
             const randomIndex = Math.floor(Math.random() * prev.length);
             const targetId = prev[randomIndex].id;
             setActiveAgent(targetId);
             
             return prev.map(agent => {
               if (agent.id === targetId) {
                 return {
                   ...agent,
                   status: `[${event_type}] ${message.substring(0, 50)}...`,
                   heat: `${Math.floor(Math.random() * 6000 + 4000)}°C`
                 };
               }
               return agent;
             });
           });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="min-h-screen pt-24 pb-24 bg-[#050505] selection:bg-[#ff8c00]/30 relative overflow-hidden flex justify-center">
      
      {/* Industrial Grid & Vignette Background */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-20" style={{
        backgroundImage: 'radial-gradient(circle at center, rgba(255,140,0,0.05) 0%, #000 80%), linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
        backgroundSize: '100% 100%, 50px 50px, 50px 50px',
        backgroundPosition: 'center'
      }} />

      <div className="max-w-[1600px] w-full px-6 relative z-10">
        
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16 border-b-2 border-[#222] pb-10"
        >
          <div className="flex items-center gap-3 mb-6">
             <div className="w-2 h-8 bg-[#ff8c00] animate-pulse rounded-sm shadow-[0_0_15px_#ff8c00]"></div>
             <span className="font-mono text-[#ff8c00] tracking-[0.4em] text-sm uppercase">The Foundry Core</span>
          </div>
          
          <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-8">
            <div>
              <h1 className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white via-gray-400 to-[#222] uppercase tracking-tighter mb-4">
                Swarm Reactor
              </h1>
              <p className="text-[#888] font-mono text-sm max-w-2xl leading-relaxed">
                A massive, synchronized orbital intelligence array. Six specialized sub-routines orbiting the central Crucible, drawing telemetry and injecting raw utility directly into the product core.
              </p>
            </div>
            
            {/* Live Core Telemetry HUD */}
            <div className="bg-[#111] border border-[#333] p-4 rounded-xl flex items-center gap-8 shadow-2xl backdrop-blur">
               <div className="flex flex-col">
                  <span className="text-[#555] font-mono text-[10px] uppercase tracking-widest">Main Engine</span>
                  <span className="text-[#00ff88] font-bold font-mono text-lg flex items-center gap-2">
                    <Activity className="w-4 h-4"/> NOMINAL
                  </span>
               </div>
               <div className="w-px h-8 bg-[#333]"></div>
               <div className="flex flex-col">
                  <span className="text-[#555] font-mono text-[10px] uppercase tracking-widest">Net Heat</span>
                  <span className="text-[#ff3333] font-bold font-mono text-lg flex items-center gap-2">
                    <Zap className="w-4 h-4"/> 4200°C
                  </span>
               </div>
               <div className="w-px h-8 bg-[#333]"></div>
               <div className="flex flex-col">
                  <span className="text-[#555] font-mono text-[10px] uppercase tracking-widest">Load Cycles</span>
                  <span className="text-white font-bold font-mono text-lg">9.4M</span>
               </div>
            </div>
          </div>
        </motion.div>

        {/* Completely Original UI Layout: The Reactor Orbit */}
        <div className="grid xl:grid-cols-12 gap-12 items-center">
           
           {/* Left/Center: The Concentric Orbit Visualizer */}
           <div className="xl:col-span-8 relative h-[700px] flex items-center justify-center">
             
              {/* Backglow */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#ff8c00]/10 rounded-full blur-[80px] pointer-events-none"></div>

              {/* Central Crucible Core */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center justify-center">
                 <motion.div 
                   animate={{ rotate: -360 }} transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                   className="w-48 h-48 rounded-full border-4 border-dashed border-[#ff8c00]/40 flex items-center justify-center absolute"
                 />
                 <div className="w-32 h-32 bg-gradient-to-b from-[#ff8c00] to-[#aa3300] rounded-full shadow-[0_0_80px_#ff8c00] border-4 border-[#ffb86c] flex items-center justify-center animate-pulse">
                    <Fingerprint className="w-12 h-12 text-white/80" />
                 </div>
                 <div className="mt-28 bg-[#0a0a0c] border border-[#ff8c00]/50 px-4 py-1.5 rounded-full z-30 shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
                    <span className="font-mono text-[#ff8c00] text-xs font-bold tracking-[0.3em]">CRUCIBLE_NEXUS</span>
                 </div>
              </div>

              {/* Orbital Rings */}
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 120, repeat: Infinity, ease: "linear" }} className="absolute w-[450px] h-[450px] rounded-full border border-[#333]" />
              <motion.div animate={{ rotate: -360 }} transition={{ duration: 180, repeat: Infinity, ease: "linear" }} className="absolute w-[600px] h-[600px] rounded-full border border-[#222]" />

              {/* Rendering Agents around the core using math to position them in a circle */}
              {agents.map((agent, index) => {
                 const radius = 280; // Distance from center
                 const angle = (Math.PI * 2 * index) / agents.length - Math.PI / 2; // Start from top
                 
                 const x = Math.cos(angle) * radius;
                 const y = Math.sin(angle) * radius;

                 const isActive = activeAgent === agent.id;

                 return (
                   <div 
                     key={agent.id}
                     className="absolute top-1/2 left-1/2 z-30"
                     style={{ 
                       transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`
                     }}
                   >
                     {/* Connecting beam to core if active */}
                     {isActive && (
                       <svg className="absolute top-1/2 left-1/2 w-[300px] h-[300px] pointer-events-none -z-10" style={{ transform: `translate(-50%, -50%) rotate(${angle}rad)`, transformOrigin: 'center' }}>
                         <motion.line 
                           x1="50%" y1="50%" x2="0%" y2="50%" 
                           stroke={agent.color} strokeWidth="2" strokeDasharray="5 5"
                           initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5 }}
                           style={{ filter: `drop-shadow(0 0 8px ${agent.color})` }}
                         />
                       </svg>
                     )}

                     <motion.div 
                       initial={{ opacity: 0, scale: 0 }}
                       animate={{ opacity: 1, scale: isActive ? 1.1 : 1 }}
                       whileHover={{ scale: 1.15 }}
                       onClick={() => setActiveAgent(agent.id)}
                       className={`relative group cursor-pointer w-44 h-auto bg-[#0a0a0c] border-2 rounded-xl p-4 transition-all duration-300 shadow-2xl ${isActive ? 'z-50' : 'z-10 grayscale-[50%] opacity-70 hover:grayscale-0 hover:opacity-100'}`}
                       style={{ 
                          borderColor: isActive ? agent.color : '#333',
                          boxShadow: isActive ? `0 0 30px ${agent.color}30, inset 0 0 20px ${agent.color}10` : '0 10px 30px rgba(0,0,0,0.5)'
                       }}
                     >
                        <div className="flex items-center gap-3 mb-3 border-b border-[#222] pb-3">
                           <div className="w-10 h-10 rounded-lg flex items-center justify-center shadow-inner" style={{ backgroundColor: '#111', border: `1px solid ${agent.color}50` }}>
                             <agent.icon className="w-5 h-5" style={{ color: agent.color }} />
                           </div>
                           <div>
                             <h3 className="font-bold text-white tracking-widest uppercase text-sm leading-tight">{agent.name}</h3>
                             <span className="text-[9px] uppercase font-mono text-[#888]">{agent.role}</span>
                           </div>
                        </div>
                        <div className="font-mono text-[9px] text-[#555] h-8 leading-tight">
                          {agent.status}
                        </div>
                        <div className="mt-2 pt-2 border-t border-[#222] flex justify-between items-center">
                           <span className="font-mono text-[9px] uppercase text-[#666]">Core Temp:</span>
                           <span className="font-mono text-[10px] font-bold" style={{ color: agent.color }}>{agent.heat}</span>
                        </div>
                     </motion.div>
                   </div>
                 );
              })}
           </div>

           {/* Right Column: Detailed Telemetry Panel */}
           <div className="xl:col-span-4 h-full flex flex-col">
              
              <AnimatePresence mode="wait">
                 {agents.map((agent) => (
                    activeAgent === agent.id && (
                       <motion.div 
                         key={agent.id}
                         initial={{ opacity: 0, x: 20 }}
                         animate={{ opacity: 1, x: 0 }}
                         exit={{ opacity: 0, x: -20 }}
                         transition={{ duration: 0.3 }}
                         className="flex-1 bg-[#0a0a0c] border-2 rounded-2xl p-8 shadow-2xl relative overflow-hidden flex flex-col"
                         style={{ borderColor: agent.color }}
                       >
                          {/* Inner Ambient Glow */}
                          <div className="absolute top-0 right-0 w-64 h-64 blur-[100px] pointer-events-none opacity-20" style={{ backgroundColor: agent.color }}></div>
                          
                          {/* Panel Header */}
                          <div className="flex justify-between items-start mb-8 relative z-10">
                             <div>
                               <div className="flex items-center gap-2 mb-2">
                                  <agent.icon className="w-8 h-8" style={{ color: agent.color }} />
                                  <h2 className="text-4xl font-black text-white uppercase tracking-tighter">{agent.name}</h2>
                               </div>
                               <span className="font-mono text-xs uppercase tracking-[0.2em] text-[#888]">{agent.role}</span>
                             </div>
                             <div className="px-3 py-1 font-mono text-xs font-bold rounded" style={{ backgroundColor: `${agent.color}20`, color: agent.color, border: `1px solid ${agent.color}50` }}>
                                SYNCED
                             </div>
                          </div>

                          {/* Data Matrix */}
                          <div className="grid grid-cols-2 gap-4 mb-8 relative z-10">
                             <div className="bg-[#111] border border-[#222] p-4 rounded-xl">
                                <Activity className="w-5 h-5 text-[#555] mb-2" />
                                <div className="text-[#888] font-mono text-[10px] uppercase tracking-widest mb-1">Compute Load</div>
                                <div className="text-2xl font-bold text-white tracking-tighter">84.2%</div>
                             </div>
                             <div className="bg-[#111] border border-[#222] p-4 rounded-xl">
                                <Network className="w-5 h-5 text-[#555] mb-2" />
                                <div className="text-[#888] font-mono text-[10px] uppercase tracking-widest mb-1">Peers Active</div>
                                <div className="text-2xl font-bold text-white tracking-tighter">5/5</div>
                             </div>
                             <div className="col-span-2 bg-[#111] border border-[#222] p-4 rounded-xl">
                                <div className="text-[#888] font-mono text-[10px] uppercase tracking-widest mb-2">Current Directives</div>
                                <div className="font-mono text-xs text-[#00ff88] leading-relaxed bg-[#050505] p-3 rounded border border-[#222]">
                                   {'>'} Executing neural pass #4992<br/>
                                   {`> ${agent.status}`}<br/>
                                   {'>'} Synchronizing state vector to central crucible...
                                </div>
                             </div>
                          </div>

                          {/* Command Input */}
                          <div className="mt-auto relative z-10">
                             <div className="text-[#888] font-mono text-[10px] uppercase tracking-widest mb-2">Manual Override</div>
                             <div className="flex gap-2">
                                <input disabled type="text" placeholder="Awaiting admin token..." className="w-full bg-[#111] border border-[#333] rounded px-4 py-3 font-mono text-xs text-white outline-none focus:border-[#ff8c00] transition-colors" />
                                <button className="px-6 bg-[#222] text-[#888] font-mono text-xs uppercase font-bold rounded hover:bg-[#333] transition-colors border border-[#444]">
                                   Send
                                </button>
                             </div>
                          </div>
                          
                       </motion.div>
                    )
                 ))}
              </AnimatePresence>
           </div>
        </div>

      </div>
    </div>
  );
}
