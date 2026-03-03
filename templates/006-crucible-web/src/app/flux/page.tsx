'use client';

import { useEffect, useState, useRef } from 'react';
import { getSupabase } from '@/lib/supabase';
import { motion } from 'framer-motion';
import { Activity, Radio, ExternalLink, Zap } from 'lucide-react';
import dynamic from 'next/dynamic';

const Core3DVisualizer = dynamic(
  () => import('@/components/ui/Core3DVisualizer').then((mod) => mod.Core3DVisualizer),
  { ssr: false }
);

// Modern Voxyz-style Core Node Visualizer
const CoreVisualizer = () => {
  return (
    <div className="relative w-full h-[600px] bg-[#050505] rounded-xl border border-[#2a2a2a] overflow-hidden flex items-center justify-center p-8 group">
      {/* Background Grid */}
      <div className="absolute inset-0" style={{
        backgroundImage: 'radial-gradient(circle at center, rgba(255,140,0,0.1) 0%, transparent 60%), linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
        backgroundSize: '100% 100%, 30px 30px, 30px 30px',
        backgroundPosition: 'center, top, top'
      }} />

      {/* Connection Lines (SVG) */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ filter: 'drop-shadow(0 0 8px rgba(255,140,0,0.5))' }}>
        <motion.path 
          d="M 50% 50% L 20% 20%" 
          stroke="rgba(255,140,0,0.4)" 
          strokeWidth="2"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: [0.2, 0.8, 0.2] }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        />
        <motion.path 
          d="M 50% 50% L 80% 30%" 
          stroke="rgba(0,255,136,0.4)" 
          strokeWidth="2"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: [0.2, 0.8, 0.2] }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear", delay: 1 }}
        />
        <motion.path 
          d="M 50% 50% L 30% 80%" 
          stroke="rgba(168,85,247,0.4)" 
          strokeWidth="2"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: [0.2, 0.8, 0.2] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: "linear", delay: 0.5 }}
        />
      </svg>

      {/* Nodes */}
      <motion.div 
        className="absolute top-[20%] left-[20%] w-m bg-[#111] border border-[#ff8c00]/50 text-[#ff8c00] text-[10px] font-mono p-2 rounded-sm backdrop-blur shadow-[0_0_15px_rgba(255,140,0,0.2)]"
        animate={{ y: [-5, 5, -5] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        <Zap className="h-4 w-4 mb-1" />
        NODE_A // SENTINEL
      </motion.div>

      <motion.div 
        className="absolute top-[30%] right-[20%] w-m bg-[#111] border border-[#00ff88]/50 text-[#00ff88] text-[10px] font-mono p-2 rounded-sm backdrop-blur shadow-[0_0_15px_rgba(0,255,136,0.2)]"
        animate={{ y: [5, -5, 5] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      >
        <Activity className="h-4 w-4 mb-1" />
        NODE_B // ARCHIVIST
      </motion.div>

      <motion.div 
        className="absolute bottom-[20%] left-[30%] w-m bg-[#111] border border-purple-500/50 text-purple-500 text-[10px] font-mono p-2 rounded-sm backdrop-blur shadow-[0_0_15px_rgba(168,85,247,0.2)]"
        animate={{ y: [-3, 6, -3] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
      >
        <Radio className="h-4 w-4 mb-1" />
        NODE_C // ORCHESTRATOR
      </motion.div>

      {/* The Central Core */}
      <div className="relative z-10 w-48 h-48 flex items-center justify-center">
        {/* Glowing Rings */}
        <motion.div 
          className="absolute inset-0 rounded-full border border-[#ff8c00] opacity-20"
          animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
        />
        <motion.div 
          className="absolute inset-4 rounded-full border border-[#ff8c00] opacity-40"
          animate={{ scale: [1, 1.2], opacity: [0.8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeOut", delay: 0.5 }}
        />
        {/* Core Sphere */}
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#ff8c00] to-[#aa2200] shadow-[0_0_50px_rgba(255,140,0,0.6)] flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-dashed border-white/30 rounded-full"
          />
        </div>
      </div>
    </div>
  )
}

export default function FluxPage() {
  const [logs, setLogs] = useState<{ id: number; message: string; type: string; timestamp: string }[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const supabase = getSupabase();

    const channel = supabase.channel('forge-telemetry-feed')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'forge_events' },
        (payload) => {
          const { event_type, message } = payload.new;
          
          let type = 'info';
          if (event_type === 'SUCCESS' || event_type === 'DEPLOY') type = 'success';
          if (event_type === 'ERROR' || event_type === 'WARN') type = 'error';

          addLog(`[${event_type}] ${message}`, type);
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          addLog('CORE LINK ESTABLISHED WITH PRODUCTION FORGE DB', 'success');
        } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
          addLog('CORE LINK LOST. CHECKING CONNECTION...', 'error');
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const addLog = (message: string, type: string) => {
    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour12: true });
    
    setLogs(prev => {
      const newLogs = [...prev, {
        id: Date.now() + Math.random(),
        message,
        type,
        timestamp: `[${timeString}]`
      }];
      // Keep only last 100 logs
      if (newLogs.length > 100) return newLogs.slice(newLogs.length - 100);
      return newLogs;
    });
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="min-h-screen pt-12 pb-24 border-t border-[#2a2a2a]">
      <div className="max-w-[1920px] mx-auto px-6">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-12 border-b border-[#2a2a2a] pb-8 flex justify-between items-end"
        >
          <div>
            <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#e0e0e0] via-[#ffffff] to-[#888888] mb-4 tracking-tight uppercase">
              Real-Time Flux
            </h1>
            <p className="font-mono text-[#ff8c00] text-sm tracking-widest uppercase flex items-center gap-2">
              <Activity className="h-4 w-4" /> // Live Telemetry stream from the Forge Server
            </p>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* True 3D React Three Fiber Visualizer */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
            className="relative w-full h-[600px] bg-[#050505] rounded-xl border border-[#2a2a2a] overflow-hidden"
          >
            <Core3DVisualizer />
          </motion.div>

          {/* Terminal/Flux UI */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.4 }}
            className="brick p-1 h-[600px] flex flex-col relative group"
          >
            {/* Voxyz-style Magic Border */}
            <div className="absolute inset-0 z-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                 style={{
                   background: `radial-gradient(800px circle at center, rgba(255,140,0,0.3), transparent 40%)`,
                   maskImage: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                   WebkitMaskImage: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                   WebkitMaskComposite: 'xor',
                   maskComposite: 'exclude',
                   padding: '1px'
                 }}
            />
            
            <div className="bg-[#111] border-b border-[#2a2a2a] p-3 flex items-center gap-2 relative z-10">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-[#ff3333]"></div>
                <div className="w-3 h-3 rounded-full bg-[#ff8c00]"></div>
                <div className="w-3 h-3 rounded-full bg-[#00ff88]"></div>
              </div>
              <div className="ml-4 font-mono text-[10px] text-[#888] tracking-widest">FORGE_TERMINAL // SUPABASE_REALTIME</div>
            </div>

            <div className="bg-[#050505] p-6 flex-1 overflow-y-auto font-mono text-sm relative z-10" ref={scrollRef}>
              {logs.length === 0 ? (
                <div className="text-[#555] tracking-widest uppercase animate-pulse">
                  INITIALIZING FLUX RECEPTORS...
                </div>
              ) : (
                logs.map((log) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    key={log.id} 
                    className="mb-2 flex gap-4 opacity-90 hover:opacity-100 transition-opacity hover:bg-[#1a1a1a] p-1 -mx-1 rounded"
                  >
                    <span className="text-[#555] shrink-0">{log.timestamp}</span>
                    <span className={`
                      ${log.type === 'success' ? 'text-[#00ff88] drop-shadow-[0_0_5px_rgba(0,255,136,0.3)]' : ''}
                      ${log.type === 'error' ? 'text-[#ff3333] drop-shadow-[0_0_5px_rgba(255,51,51,0.3)]' : ''}
                      ${log.type === 'info' || !log.type ? 'text-[#e0e0e0]' : ''}
                    `}>
                      {log.message}
                    </span>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        </div>

      </div>
    </div>
  );
}
