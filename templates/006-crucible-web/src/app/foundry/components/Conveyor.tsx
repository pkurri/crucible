'use client';

import { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';

type Architect = {
  id: string;
  name: string;
  role: string;
  station: string;
  specialty: string;
  status: string;
  output: string;
};

const architects: Architect[] = [
  {
    id: 'ARC-001',
    name: 'Prasad K.',
    role: 'Lead Forge Architect',
    station: 'STATION-PRIME',
    specialty: 'Multi-Agent Orchestration',
    status: 'FORGING',
    output: 'AUTONOMOUS WORKFLOW v2.4',
  },
  {
    id: 'ARC-002',
    name: 'The Autonomous Forge',
    role: 'Swarm Intelligence Core',
    station: 'STATION-OMEGA',
    specialty: 'Self-Improving Systems',
    status: 'RUNNING',
    output: 'SKILL PACK BATCH #034',
  },
  {
    id: 'ARC-003',
    name: 'RECON-NODE-ψ',
    role: 'Intelligence Gatherer',
    station: 'STATION-ALPHA',
    specialty: 'Threat Surface Analysis',
    status: 'SCANNING',
    output: 'THREAT DELTA REPORT',
  },
];

function StationCard({ architect, index }: { architect: Architect; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.15, duration: 0.5, ease: 'easeOut' }}
      className="group relative flex-shrink-0 w-72 md:w-80 brick overflow-hidden cursor-default"
    >
      {/* Scanline overlay on hover */}
      <div className="absolute inset-0 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(255,140,0,0.03) 3px, rgba(255,140,0,0.03) 4px)',
        }}
      />

      {/* Top status strip */}
      <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-[#2a2a2a]">
        <span className="font-mono text-[10px] text-[#888] tracking-widest">{architect.station}</span>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-[#00ff88] animate-pulse shadow-[0_0_6px_#00ff88]" />
          <span className="font-mono text-[10px] text-[#00ff88] tracking-widest">{architect.status}</span>
        </div>
      </div>

      {/* Terminal screen area */}
      <div className="px-5 pt-4 pb-3 bg-[#050505] border-b border-[#2a2a2a] min-h-[60px] font-mono">
        <span className="text-[#ff8c00] text-[10px]">&gt; </span>
        <span className="text-[#e0e0e0] text-[10px] tracking-wide opacity-0 group-hover:opacity-100 transition-all duration-700">
          FORGING: {architect.output}
        </span>
        <span className="inline-block w-1.5 h-3 bg-[#ff8c00] ml-0.5 opacity-0 group-hover:opacity-100 animate-[blink_1s_infinite]" />
      </div>

      {/* Content */}
      <div className="px-5 pt-5 pb-5 flex flex-col gap-3">
        <div>
          <p className="font-mono text-[10px] text-[#888] tracking-widest mb-1">{architect.id}</p>
          <h3 className="text-xl font-black text-white group-hover:text-[#ff8c00] transition-colors duration-200">
            {architect.name}
          </h3>
          <p className="font-mono text-xs text-[#aaa] mt-1">{architect.role}</p>
        </div>

        <div className="pt-3 border-t border-[#1a1a1a]">
          <p className="font-mono text-[10px] text-[#666] tracking-widest">SPECIALTY</p>
          <p className="font-mono text-xs text-[#ff8c00]/80 mt-0.5">{architect.specialty}</p>
        </div>
      </div>

      {/* Blueprint corner cuts */}
      <div className="absolute top-0 right-0 w-5 h-5 bg-[#0a0a0a] border-b border-l border-[#2a2a2a]" />
      <div className="absolute bottom-0 left-0 w-5 h-5 bg-[#0a0a0a] border-t border-r border-[#2a2a2a]" />
    </motion.div>
  );
}

export function Conveyor() {
  const [agents, setAgents] = useState<any[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchAgents() {
      const res = await fetch('/api/agents/list');
      const data = await res.json();
      if (data.agents) setAgents(data.agents);
    }
    fetchAgents();
  }, []);

  return (
    <div className="relative">
      {/* Rail label */}
      <div className="flex items-center gap-3 mb-4 font-mono text-[10px] tracking-widest text-[#888]">
        <div className="w-4 h-[1px] bg-[#333]" />
        THE CONVEYOR — ACTIVE STATIONS
        <div className="flex-1 h-[1px] bg-gradient-to-r from-[#333] to-transparent" />
      </div>

      {/* Horizontal scroll rail */}
      <div
        ref={scrollRef}
        className="flex gap-5 overflow-x-auto pb-4 scrollbar-thin scrollbar-track-[#111] scrollbar-thumb-[#ff8c00]/30"
      >
        {agents.map((agent: any, i: number) => (
          <StationCard 
            key={agent.id} 
            architect={{
              id: `NODE-${agent.type.toUpperCase()}`,
              name: agent.name,
              role: agent.description,
              station: `STATION-${agent.type.toUpperCase()}`,
              specialty: agent.capabilities?.[0] || 'Cybernetic Forge',
              status: agent.status.toUpperCase(),
              output: `TASK_ID: ${agent.tasks_completed || 0}`
            }} 
            index={i} 
          />
        ))}
        {agents.length === 0 && (
          <div className="py-12 px-8 font-mono text-[10px] text-[#666] tracking-widest border border-dashed border-[#1a1a1a] rounded-xl">
            AWAITING DEPLOYMENT OF AUTONOMOUS NODES...
          </div>
        )}
      </div>

      {/* Rail indicator lines */}
      <div className="mt-2 flex gap-1">
        {agents.map((_: any, i: number) => (
          <div key={i} className="h-[2px] flex-1 bg-[#1a1a1a]" />
        ))}
      </div>
    </div>
  );
}
