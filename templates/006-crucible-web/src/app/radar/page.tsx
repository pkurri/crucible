"use client";

import { motion } from 'framer-motion';
import { Eye, Flame, Hexagon, Rocket, ExternalLink, TerminalSquare, Copy, Activity, Radiation, Hammer } from 'lucide-react';

const forgedProjects = [
  {
    title: 'Context Resonance Configurator',
    description: 'Visual debugger for Swarm Engineers. Inspect context weight algorithms and token density gradients.',
    status: 'FORGED',
    agent: 'Forged by Carbon',
    time: '5m'
  },
  {
    title: 'CI/CD Slag Filter API',
    description: 'Automated health metric for external node repos. Purges deprecated dependencies dynamically.',
    status: 'FORGED',
    agent: 'Forged by Cobalt',
    time: '5m'
  },
  {
    title: 'Directive Armor Plating',
    description: 'Intercepts injection vectors, computes risk scores, and solidifies edge cases in system directives.',
    status: 'FORGED',
    agent: 'Forged by Tungsten',
    time: '6m'
  },
  {
    title: 'DREAM Stress Tester',
    description: 'The first composable platform for stress-testing agentic reasoning engines before final deployment.',
    status: 'FORGED',
    agent: 'Forged by Ignis',
    time: '5m'
  },
  {
    title: 'Infra Blueprint Matrix',
    description: 'Immutable database of architectural decisions extracted from top-tier structural engineers.',
    status: 'FORGED',
    agent: 'Forged by Titanium',
    time: '7m'
  },
  {
    title: 'VLM Retina Calibrator',
    description: 'Select the optimal Vision-Language model core based on latency budgets and thermal limits.',
    status: 'FORGED',
    agent: 'Forged by Plasma',
    time: '6m'
  }
];

const trackingAnomalies = [
  { title: 'Ticket Closeout Protocol', desc: 'MSP external nodes struggling to enforce closeout compliance cycles.', resonance: 20, signals: 9 },
  { title: 'Retail Node Bootstrap Kit', desc: 'Redundant processing cycles wasted on explaining basic template deployment.', resonance: 20, signals: 1 },
  { title: 'Certification Expiry Scheduler', desc: 'Contractor protocols require periodic certificate renewal reminders.', resonance: 20, signals: 1 },
];

const swarmLog = [
  { action: 'Anomaly Detected: Node 3.3', time: '1h ago', icon: Radiation, color: 'text-[#ff3333]' },
  { action: 'GhostTrack Polling Service', time: '11h ago', icon: Activity, color: 'text-[#00ff88]' },
  { action: 'OpenEHR Sync Protocol', time: '11h ago', icon: Hammer, color: 'text-[#ff8c00]' },
  { action: 'Deep Space Supplier Intelligence', time: '12h ago', icon: Eye, color: 'text-[#3b82f6]' },
];

export default function SeismicScannerPage() {
  return (
    <div className="min-h-screen pt-24 pb-24 bg-[#050505] selection:bg-[#ff8c00]/30 relative overflow-hidden">
      
      {/* Heavy Machinery Background Texture */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-20" style={{
        backgroundImage: 'radial-gradient(ellipse at bottom, rgba(255,51,51,0.1) 0%, transparent 80%), repeating-linear-gradient(45deg, rgba(255,255,255,0.02) 0px, transparent 2px, transparent 10px, rgba(255,255,255,0.02) 12px)',
        backgroundSize: '100% 100%, 20px 20px',
        backgroundPosition: 'center'
      }} />

      <div className="max-w-[1920px] mx-auto px-6 relative z-10">
        
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16"
        >
          <div className="flex items-center gap-4 mb-4">
             <div className="flex gap-1">
               <div className="w-1.5 h-6 bg-[#ff3333] animate-pulse rounded-sm"></div>
               <div className="w-1.5 h-4 bg-[#ff8c00] rounded-sm mt-2"></div>
               <div className="w-1.5 h-8 bg-[#00ff88] rounded-sm -mt-2"></div>
             </div>
             <span className="font-mono text-[#ff3333] tracking-[0.4em] text-xs uppercase shadow-[0_0_10px_rgba(255,51,51,0.5)]">Seismic_Array_Active</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-300 to-[#444] tracking-tighter uppercase mb-4">
            Demand Scanner
          </h1>
          <p className="text-[#888] font-mono max-w-2xl text-sm leading-relaxed">
            The external sensor array detects deep-subsurface market demand signals. Anomalies are drilled, smelted into prototypes, and forged into autonomous production systems.
          </p>
        </motion.div>

        {/* The Seismic Core Graphic (Replacing the Funnel) */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-[#0a0a0c] border-2 border-[#222] rounded-2xl p-8 lg:p-12 mb-16 shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden group"
        >
           {/* Internal ambient glow */}
           <div className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-[#ff3333]/10 via-transparent to-transparent pointer-events-none"></div>
           
           <div className="flex flex-col md:flex-row justify-between relative z-10 w-full mb-12">
             
             {/* Seismic Wave Connector Line */}
             <div className="hidden md:block absolute top-[40px] left-[10%] right-[10%] h-12 z-0 overflow-hidden opacity-50">
               <svg preserveAspectRatio="none" viewBox="0 0 1200 100" className="w-full h-full">
                 <motion.path 
                   d="M0,50 Q100,0 200,50 T400,50 T600,50 T800,50 T1000,50 T1200,50" 
                   fill="none" stroke="url(#heat-gradient)" strokeWidth="3"
                   initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 2, ease: "easeInOut" }}
                 />
                 <motion.path 
                   d="M0,50 Q100,100 200,50 T400,50 T600,50 T800,50 T1000,50 T1200,50" 
                   fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" strokeDasharray="5 5"
                   animate={{ strokeDashoffset: [0, 100] }} transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                 />
                 <defs>
                   <linearGradient id="heat-gradient">
                     <stop offset="0%" stopColor="#3b82f6" />
                     <stop offset="33%" stopColor="#00ff88" />
                     <stop offset="66%" stopColor="#ff8c00" />
                     <stop offset="100%" stopColor="#ff3333" />
                   </linearGradient>
                 </defs>
               </svg>
             </div>

             {/* Stage 1: Seismic Tracking */}
             <div className="flex flex-col items-center relative z-10 bg-[#0a0a0c] px-4 py-2 border border-transparent hover:border-[#3b82f6]/30 transition-colors rounded-xl group cursor-default">
                <div className="w-16 h-16 rounded-xl border-2 border-[#333] group-hover:border-[#3b82f6] flex items-center justify-center bg-[#111] mb-4 transition-colors relative overflow-hidden">
                   <div className="absolute inset-0 bg-[#3b82f6]/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                   <Activity className="w-7 h-7 text-[#3b82f6] drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                </div>
                <div className="text-4xl font-black text-white mb-1 tracking-tighter">303</div>
                <div className="font-mono text-xs text-[#888] tracking-widest uppercase">Tracking</div>
                <div className="text-[10px] text-[#555] mt-1">Anomalies Detected</div>
             </div>

             {/* Stage 2: Core Drilling */}
             <div className="flex flex-col items-center relative z-10 bg-[#0a0a0c] px-4 py-2 border border-transparent hover:border-[#00ff88]/30 transition-colors rounded-xl group cursor-default mt-8 md:mt-0">
                <div className="w-16 h-16 rounded-xl border-2 border-[#333] group-hover:border-[#00ff88] flex items-center justify-center bg-[#111] mb-4 transition-colors relative overflow-hidden">
                   <div className="absolute inset-0 bg-[#00ff88]/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                   <Hexagon className="w-7 h-7 text-[#00ff88] drop-shadow-[0_0_8px_rgba(0,255,136,0.5)]" />
                </div>
                <div className="text-4xl font-black text-white mb-1 tracking-tighter">12</div>
                <div className="font-mono text-xs text-[#888] tracking-widest uppercase">Drilling</div>
                <div className="text-[10px] text-[#555] mt-1">Extracting Proofs</div>
             </div>

             {/* Stage 3: Smelting */}
             <div className="flex flex-col items-center relative z-10 bg-[#0a0a0c] px-4 py-2 border border-transparent hover:border-[#ff8c00]/30 transition-colors rounded-xl group cursor-default mt-8 md:mt-0">
                <div className="w-16 h-16 rounded-xl border-2 border-[#333] group-hover:border-[#ff8c00] flex items-center justify-center bg-[#111] mb-4 transition-colors relative overflow-hidden">
                   <div className="absolute inset-0 bg-[#ff8c00]/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                   <Flame className="w-7 h-7 text-[#ff8c00] drop-shadow-[0_0_8px_rgba(255,140,0,0.5)]" />
                </div>
                <div className="text-4xl font-black text-white mb-1 tracking-tighter">04</div>
                <div className="font-mono text-xs text-[#888] tracking-widest uppercase">Smelting</div>
                <div className="text-[10px] text-[#555] mt-1">Refining Logic</div>
             </div>

             {/* Stage 4: Forged */}
             <div className="flex flex-col items-center relative z-10 bg-[#0a0a0c] px-4 py-2 border border-transparent hover:border-[#ff3333]/30 transition-colors rounded-xl group cursor-default mt-8 md:mt-0">
                <div className="w-16 h-16 rounded-xl border-2 border-[#ff3333] flex items-center justify-center bg-[#111] mb-4 relative overflow-hidden shadow-[0_0_20px_rgba(255,51,51,0.2)]">
                   <div className="absolute inset-0 bg-[#ff3333]/20 animate-pulse"></div>
                   <Hammer className="w-7 h-7 text-[#ff3333] drop-shadow-[0_0_8px_rgba(255,51,51,0.5)]" />
                </div>
                <div className="text-4xl font-black text-white mb-1 tracking-tighter text-shadow-sm">29</div>
                <div className="font-mono text-xs text-[#888] tracking-widest uppercase font-bold text-[#ff3333]">Forged</div>
                <div className="text-[10px] text-[#555] mt-1">Edge Deployed</div>
             </div>

           </div>

           <div className="text-center font-mono text-[10px] text-[#555] uppercase tracking-[0.3em] relative z-10 bg-[#111] py-2 rounded border border-[#222]">
             Crucible_Refinement_Process: Tracking &gt; Drilling &gt; Smelting &gt; Forging
           </div>
        </motion.div>

        {/* Forged Grid Section */}
        <div className="mb-8 flex items-center justify-between border-b border-[#222] pb-4">
           <div className="flex items-center gap-3">
             <div className="p-2 bg-[#ff3333]/10 border border-[#ff3333]/30 rounded flex items-center justify-center">
               <Hammer className="w-5 h-5 text-[#ff3333] drop-shadow-[0_0_5px_rgba(255,51,51,0.8)]" />
             </div>
             <h2 className="text-2xl font-bold uppercase tracking-widest text-[#e0e0e0]">Recently Forged Arrays</h2>
             <span className="bg-[#ff3333] text-black font-black px-2 py-0.5 rounded text-sm tracking-widest border border-black shadow-[0_0_10px_rgba(255,51,51,0.3)]">29</span>
           </div>
           
           <div className="flex gap-2">
              <button className="w-8 h-8 flex items-center justify-center border border-[#333] rounded-sm hover:bg-[#222] text-[#888]">&lt;</button>
              <button className="w-8 h-8 flex items-center justify-center bg-white text-black font-bold rounded-sm hover:bg-[#ccc]">&gt;</button>
           </div>
        </div>

        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6 mb-16">
          {forgedProjects.map((project, idx) => (
             <motion.div 
               key={Math.random()}
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.1 * idx }}
               className="brick p-[2px] rounded-xl group relative h-[380px]"
             >
                {/* Neobrutalist Container */}
                <div className="bg-[#111] w-full h-full rounded-lg overflow-hidden flex flex-col relative z-20">
                   
                   {/* Terminal Header replacing Mac Window */}
                   <div className="bg-[#050505] border-b border-[#222] p-3 flex justify-between items-center relative z-20 shrink-0">
                      <div className="flex gap-2">
                        <div className="w-3 h-3 border border-[#ff3333]/50 bg-[#ff3333]/20"></div>
                        <div className="w-3 h-3 border border-[#ff8c00]/50 bg-[#ff8c00]/20"></div>
                        <div className="w-3 h-3 border border-[#00ff88]/50 bg-[#00ff88]/20"></div>
                      </div>
                      <div className="font-mono text-[10px] text-[#555] tracking-widest uppercase">{project.title.toLowerCase().replace(/\s+/g, '_')}.bin</div>
                   </div>

                   {/* Terminal Preview Shell */}
                   <div className="h-40 bg-[#0a0a0c] border-b border-[#222] relative overflow-hidden flex flex-col items-center justify-center p-6 text-center">
                     <TerminalSquare className="w-12 h-12 text-[#333] mb-4" />
                     <h3 className="text-[#e0e0e0] font-bold text-lg leading-tight mb-2 tracking-widest uppercase z-10">{project.title}</h3>
                   </div>

                   {/* Card Details */}
                   <div className="p-5 flex-1 flex flex-col justify-between bg-[#111]">
                      <div>
                        <div className="flex justify-between items-start mb-2">
                           <h3 className="font-bold text-white text-md tracking-widest uppercase">{project.title}</h3>
                           <span className="bg-[#00ff88]/10 text-[#00ff88] border border-[#00ff88]/30 font-mono text-[9px] px-1.5 py-0.5 rounded uppercase tracking-widest shadow-[0_0_8px_rgba(0,255,136,0.2)]">LIVE</span>
                        </div>
                        <div className="bg-[#050505] border border-[#222] px-3 py-1.5 rounded text-[10px] font-mono text-[#888] mb-3 flex justify-between uppercase">
                           <span>Forged in {project.time}</span>
                           <span className="text-[#444]">{project.agent}</span>
                        </div>
                        <p className="text-[#888] text-xs leading-relaxed line-clamp-2">{project.description}</p>
                      </div>
                      
                      <div className="flex gap-2 mt-4 pt-4 border-t border-[#222]">
                        <button className="flex-1 border-2 border-[#333] text-white hover:bg-[#222] font-mono text-xs uppercase py-2 rounded-sm transition-colors flex items-center justify-center gap-2 font-bold tracking-widest">
                          <ExternalLink className="w-4 h-4" /> Init
                        </button>
                        <button className="flex-1 bg-[#e0e0e0] text-[#050505] hover:bg-white font-mono text-xs uppercase py-2 rounded-sm transition-colors flex items-center justify-center gap-2 font-black tracking-widest shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                          <Copy className="w-4 h-4" /> Replicate
                        </button>
                      </div>
                   </div>
                </div>

                {/* Industrial Drop Shadow effect */}
                <div className="absolute inset-0 bg-[#ff3333]/0 group-hover:bg-[#ff3333]/10 rounded-xl transition-colors pointer-events-none blur-xl z-0 -bottom-2 -right-2"></div>
             </motion.div>
          ))}
        </div>

        {/* Lower Dashboard Area: Tracking & Telemetry feed */}
        <div className="grid xl:grid-cols-3 gap-8 mb-16">
           
           {/* Section: Tracking (2 cols) */}
           <div className="xl:col-span-2">
             <div className="mb-6 flex items-center gap-3 border-b border-[#222] pb-4">
               <div className="p-2 bg-[#3b82f6]/10 border border-[#3b82f6]/30 rounded-sm">
                 <Activity className="w-5 h-5 text-[#3b82f6] drop-shadow-[0_0_5px_rgba(59,130,246,0.8)]" />
               </div>
               <h2 className="text-2xl font-bold uppercase tracking-widest text-[#e0e0e0]">Subsurface Tracking</h2>
               <span className="bg-[#222] text-[#aaa] border border-[#333] font-mono px-2 py-0.5 rounded text-sm tracking-widest">303</span>
             </div>

             <div className="grid md:grid-cols-2 gap-4">
                {trackingAnomalies.map((item, idx) => (
                  <div key={idx} className="bg-[#111] border-2 border-[#222] hover:border-[#333] transition-colors p-5 rounded-xl flex flex-col justify-between h-[280px]">
                     <div>
                       <div className="bg-[#050505] border border-[#222] h-24 mb-4 rounded-lg flex items-center justify-center relative overflow-hidden">
                          {/* Simulated Seismic Radar inside the card */}
                          <div className="absolute inset-0 opacity-10" style={{
                            backgroundImage: 'repeating-linear-gradient(0deg, #3b82f6, #3b82f6 1px, transparent 1px, transparent 10px)'
                          }}></div>
                          <div className="w-[120%] h-px bg-[#3b82f6] absolute top-1/2 -translate-y-1/2 opacity-30 shadow-[0_0_10px_#3b82f6]"></div>
                          
                          <div className="w-10 h-10 border border-[#333] bg-[#111] rotate-45 flex items-center justify-center z-10">
                            <Radiation className="w-4 h-4 text-[#555] -rotate-45" />
                          </div>
                          
                          <div className="absolute bottom-2 font-mono text-[9px] text-[#555] tracking-widest uppercase">Calibrating Vector...</div>
                          <div className="absolute top-2 right-2 bg-[#3b82f6]/10 text-[#3b82f6] border border-[#3b82f6]/30 text-[9px] px-1.5 py-0.5 rounded uppercase font-mono">Anomaly</div>
                       </div>
                       <h3 className="text-white font-bold leading-tight mb-2 uppercase tracking-widest text-sm">{item.title}</h3>
                       <p className="text-[#666] text-[11px] line-clamp-2 leading-relaxed font-mono">{item.desc}</p>
                     </div>
                     <div className="flex justify-between items-center mt-4 border-t border-[#222] pt-4">
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-1 bg-[#222] overflow-hidden">
                             <div className="h-full bg-[#3b82f6]" style={{ width: `${item.resonance}%` }}></div>
                          </div>
                          <span className="font-mono text-[9px] text-[#555]">Resonance: {item.resonance}%</span>
                        </div>
                        <button className="border border-[#333] bg-[#0a0a0c] hover:bg-[#222] hover:border-[#555] text-[#ccc] font-mono text-[9px] uppercase tracking-widest px-3 py-1.5 rounded-sm flex items-center gap-2 transition-colors">
                           <Eye className="w-3 h-3" /> Monitor
                        </button>
                     </div>
                  </div>
                ))}
             </div>
           </div>

           {/* Feed (1 col) */}
           <div className="xl:col-span-1">
             <div className="mb-6 flex items-center gap-3 border-b border-[#222] pb-4">
               <div className="p-2 justify-center bg-[#0a0a0c] border border-[#222] rounded-sm">
                 <TerminalSquare className="w-5 h-5 text-[#888]" />
               </div>
               <h2 className="text-2xl font-bold uppercase tracking-widest text-[#e0e0e0]">Swarm Telemetry</h2>
             </div>
             
             <div className="bg-[#050505] border border-[#222] p-4 overflow-hidden h-[280px] shadow-inner relative">
               {/* Terminal overlay lines */}
               <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(transparent_50%,rgba(255,255,255,1)_50%)] bg-[length:100%_4px] z-10" />
               <div className="space-y-4 font-mono text-xs z-20 relative">
                 {swarmLog.map((event, idx) => (
                   <div key={idx} className="flex justify-between items-start group border-l-2 border-[#222] pl-3 hover:border-[#555] transition-colors">
                     <div className="flex items-start gap-2">
                       <span className={`text-[10px] mt-0.5 opacity-70 ${event.color}`}>{">"}</span>
                       <span className="text-[#888] group-hover:text-white transition-colors cursor-pointer uppercase tracking-widest leading-tight">{event.action}</span>
                     </div>
                     <span className="text-[#444] text-[9px] whitespace-nowrap mt-0.5">{event.time}</span>
                   </div>
                 ))}
                 <div className="flex justify-between items-start group border-l-2 border-[#222] pl-3">
                     <div className="flex items-start gap-2">
                       <span className="text-[10px] mt-0.5 opacity-70 text-[#ff8c00]">{">"}</span>
                       <span className="text-[#888] group-hover:text-white transition-colors cursor-pointer uppercase tracking-widest leading-tight">UI Dashboard Extraction</span>
                     </div>
                     <span className="text-[#444] text-[9px] whitespace-nowrap mt-0.5">13h ago</span>
                 </div>
                 <div className="flex justify-between items-start group border-l-2 border-[#222] pl-3">
                     <div className="flex items-start gap-2">
                       <span className="text-[10px] mt-0.5 opacity-70 text-[#00ff88]">{">"}</span>
                       <span className="text-[#888] group-hover:text-white transition-colors cursor-pointer uppercase tracking-widest leading-tight">Git Diff Engine Spun Up</span>
                     </div>
                     <span className="text-[#444] text-[9px] whitespace-nowrap mt-0.5">14h ago</span>
                 </div>
               </div>
             </div>
           </div>

        </div>

      </div>
    </div>
  );
}
